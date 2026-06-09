import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../db.js';
import { fileURLToPath } from 'url';
import { logActivity } from '../utils/activityLogger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

import { getUploadMiddleware, attachRelativePath } from '../utils/storageHelper.js';

const upload = getUploadMiddleware();
const baseUploadDir = path.join(__dirname, '../uploads');

// ─── Auth Middleware ──────────────────────────────────────────────────────────
import jwt from 'jsonwebtoken';
const SECRET_KEY = process.env.JWT_SECRET || 'healxista-super-secret-key';

const authenticate = (req, res, next) => {
    let token = req.cookies ? req.cookies.token : null;

    // Fallback to Authorization header
    if (!token) {
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
    }

    // Fallback to query parameter (needed for browser downloads via <a> tag)
    if (!token && req.query.token) {
        token = req.query.token;
    }

    // Ignore placeholder token if passed incorrectly
    if (token === 'cookie-present') {
        token = req.cookies ? req.cookies.token : null;
    }

    if (!token) return res.status(401).json({ message: 'Authentication required' });

    try {
        req.user = jwt.verify(token, SECRET_KEY);
        next();
    } catch {
        res.status(403).json({ message: 'Invalid or expired token' });
    }
};

// ─── POST /api/documents/upload ───────────────────────────────────────────────
// Upload a document (optionally share with recipient_id)
router.post('/upload', authenticate, upload.single('document'), attachRelativePath, async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { description, recipient_id } = req.body;
    const uploaderId = req.user.id;

    try {
        const result = await db.query(
            `INSERT INTO documents (uploader_id, file_name, file_path, file_type, file_size, description)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING document_id`,
            [
                uploaderId,
                req.file.originalname,
                req.file.relative_path,
                req.file.mimetype,
                req.file.size,
                description || null
            ]
        );
        const documentId = result.rows[0].document_id;

        // Auto-share with recipient if provided
        if (recipient_id) {
            await db.query(
                `INSERT INTO document_shares (document_id, shared_with_id, shared_by_id)
                 VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
                [documentId, recipient_id, uploaderId]
            );
        }

        // Log activity
        await logActivity(req.app.get('io'), {
            accountId: uploaderId,
            targetRole: 'All',
            actionType: 'Document Uploaded',
            title: 'Document Uploaded',
            description: `A document "${req.file.originalname}" was uploaded.`,
            relatedId: documentId,
            statusTheme: 'info'
        });

        res.status(201).json({
            message: 'Document uploaded successfully',
            document_id: documentId,
            file_name: req.file.originalname
        });
    } catch (error) {
        console.error('Document upload error:', error);
        // Clean up file if DB insert failed
        fs.unlink(req.file.path, () => { });
        res.status(500).json({ message: 'Failed to save document' });
    }
});

// ─── POST /api/documents/:id/share ───────────────────────────────────────────
// Share an existing document with another user/provider
router.post('/:id/share', authenticate, async (req, res) => {
    const { id } = req.params;
    const { recipient_id } = req.body;
    const sharerId = req.user.id;

    if (!recipient_id) return res.status(400).json({ message: 'recipient_id is required' });

    try {
        // Verify owner
        const doc = await db.query('SELECT uploader_id FROM documents WHERE document_id = $1', [id]);
        if (!doc.rows[0]) return res.status(404).json({ message: 'Document not found' });
        if (doc.rows[0].uploader_id !== sharerId) {
            return res.status(403).json({ message: 'You can only share your own documents' });
        }

        await db.query(
            `INSERT INTO document_shares (document_id, shared_with_id, shared_by_id)
             VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
            [id, recipient_id, sharerId]
        );

        await logActivity(req.app.get('io'), {
            accountId: sharerId,
            targetRole: 'All',
            actionType: 'Document Shared',
            title: 'Document Shared',
            description: `Document #${id} was shared with a provider.`,
            relatedId: parseInt(id),
            statusTheme: 'success'
        });

        res.json({ message: 'Document shared successfully' });
    } catch (error) {
        console.error('Document share error:', error);
        res.status(500).json({ message: 'Failed to share document' });
    }
});

// ─── DELETE /api/documents/:id/share/:recipientId ────────────────────────────
// Revoke share
router.delete('/:id/share/:recipientId', authenticate, async (req, res) => {
    const { id, recipientId } = req.params;
    const userId = req.user.id;
    try {
        await db.query(
            `DELETE FROM document_shares WHERE document_id = $1 AND shared_with_id = $2 AND shared_by_id = $3`,
            [id, recipientId, userId]
        );
        res.json({ message: 'Share revoked' });
    } catch (error) {
        console.error('Revoke share error:', error);
        res.status(500).json({ message: 'Failed to revoke share' });
    }
});

// ─── GET /api/documents/my ────────────────────────────────────────────────────
// Get all documents I uploaded
router.get('/my', authenticate, async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await db.query(
            `SELECT d.document_id, d.file_name, d.file_path, d.file_type, d.file_size, d.description, d.created_at,
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'account_id', sw.account_id,
                                'custom_id', sw.custom_id,
                                'name', COALESCE(pp.first_name || ' ' || pp.last_name, sw.email),
                                'role', sr.name
                            )
                        ) FILTER (WHERE sw.account_id IS NOT NULL), '[]'
                    ) AS shared_with
             FROM documents d
             LEFT JOIN document_shares ds ON d.document_id = ds.document_id
             LEFT JOIN accounts sw ON ds.shared_with_id = sw.account_id
             LEFT JOIN profiles pp ON sw.account_id = pp.account_id
             LEFT JOIN roles sr ON sw.role_id = sr.role_id
             WHERE d.uploader_id = $1
             GROUP BY d.document_id
             ORDER BY d.created_at DESC`,
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('My documents error:', error);
        res.status(500).json({ message: 'Failed to fetch documents' });
    }
});

// ─── GET /api/documents/shared-with-me ───────────────────────────────────────
// Get documents shared with me by others
router.get('/shared-with-me', authenticate, async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await db.query(
            `SELECT d.document_id, d.file_name, d.file_path, d.file_type, d.file_size, d.description, d.created_at,
                    ds.shared_at,
                    COALESCE(p.first_name || ' ' || p.last_name, a.email) AS shared_by_name,
                    a.custom_id AS shared_by_custom_id,
                    r.name AS shared_by_role
             FROM document_shares ds
             JOIN documents d ON ds.document_id = d.document_id
             JOIN accounts a ON ds.shared_by_id = a.account_id
             LEFT JOIN profiles p ON a.account_id = p.account_id
             LEFT JOIN roles r ON a.role_id = r.role_id
             WHERE ds.shared_with_id = $1
             ORDER BY ds.shared_at DESC`,
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Shared with me error:', error);
        res.status(500).json({ message: 'Failed to fetch shared documents' });
    }
});

// ─── GET /api/documents/users-list ───────────────────────────────────────────
// Get a list of all users/providers I can share with
router.get('/users-list', authenticate, async (req, res) => {
    const myId = req.user.id;
    try {
        const result = await db.query(
            `SELECT a.account_id, a.custom_id, r.name as role,
                    COALESCE(p.first_name || ' ' || p.last_name, a.email) as name,
                    p.profile_image_url
             FROM accounts a
             JOIN roles r ON a.role_id = r.role_id
             LEFT JOIN profiles p ON a.account_id = p.account_id
             WHERE a.deleted_at IS NULL AND a.account_id != $1
               AND r.name != 'Admin'
             ORDER BY r.name, p.first_name`,
            [myId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Users list error:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

// ─── GET /api/documents/:id/download ─────────────────────────────────────────
// Download/view a document (must be owner or a recipient)
router.get('/:id/download', authenticate, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        // Check access: owner OR shared_with
        const result = await db.query(
            `SELECT d.file_path, d.file_name, d.file_type FROM documents d
             WHERE d.document_id = $1
               AND (d.uploader_id = $2 OR EXISTS (
                   SELECT 1 FROM document_shares ds
                   WHERE ds.document_id = d.document_id AND ds.shared_with_id = $2
               ))`,
            [id, userId]
        );

        if (!result.rows[0]) {
            return res.status(403).json({ message: 'Access denied or document not found' });
        }

        const doc = result.rows[0];
        // Legacy check: if filename doesn't contain a slash, it's in the old 'documents' folder
        const subDir = doc.file_path.includes('/') ? '' : 'documents';
        const filePath = path.join(baseUploadDir, subDir, doc.file_path);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found on server' });
        }

        res.setHeader('Content-Disposition', `inline; filename="${doc.file_name}"`);
        res.setHeader('Content-Type', doc.file_type);
        res.sendFile(filePath);
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ message: 'Failed to retrieve document' });
    }
});

// ─── DELETE /api/documents/:id ────────────────────────────────────────────────
// Delete a document (owner only)
router.delete('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const result = await db.query(
            'SELECT file_path FROM documents WHERE document_id = $1 AND uploader_id = $2',
            [id, userId]
        );

        if (!result.rows[0]) {
            return res.status(403).json({ message: 'Not found or access denied' });
        }

        const fileName = result.rows[0].file_path;
        const subDir = fileName.includes('/') ? '' : 'documents';
        const filePath = path.join(baseUploadDir, subDir, fileName);
        await db.query('DELETE FROM documents WHERE document_id = $1', [id]);

        // Delete physical file
        if (fs.existsSync(filePath)) fs.unlink(filePath, () => { });

        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Failed to delete document' });
    }
});

export default router;
