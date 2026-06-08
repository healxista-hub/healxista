import express from 'express';
import db from '../db.js';
import { verifyUser, verifyAdmin } from '../middleware/authMiddleware.js';
import { getUploadMiddleware, attachRelativePath } from '../utils/storageHelper.js';

const router = express.Router();

// Configure upload for residents
const upload = getUploadMiddleware({ folder: 'residents' });

// Middleware to set req.uploadFolder for attachRelativePath
const setUploadFolder = (req, res, next) => {
    req.uploadFolder = 'residents';
    next();
};

// Helper to get provider_id from account_id
const getProviderId = async (accountId) => {
    const result = await db.query('SELECT provider_id FROM service_providers WHERE account_id = $1', [accountId]);
    return result.rows[0]?.provider_id;
};

// GET /api/residents - List all residents for the current provider
router.get('/', verifyUser, async (req, res) => {
    try {
        console.log('GET /api/residents - Account ID:', req.user.id);
        const providerId = await getProviderId(req.user.id);
        if (!providerId) return res.status(403).json({ message: 'Not a service provider' });

        const result = await db.query(
            'SELECT * FROM residents WHERE provider_id = $1 ORDER BY created_at DESC',
            [providerId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching residents:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/residents/admin/all - GLOBAL View for Admins
router.get('/admin/all', verifyAdmin, async (req, res) => {
    try {
        console.log('GET /api/residents/admin/all - Admin access verified');
        const query = `
            SELECT r.*, 
                   p.first_name AS provider_first_name, 
                   p.last_name AS provider_last_name, 
                   a.email AS provider_email
            FROM residents r
            JOIN service_providers sp ON r.provider_id = sp.provider_id
            JOIN profiles p ON sp.account_id = p.account_id
            JOIN accounts a ON sp.account_id = a.account_id
            ORDER BY r.created_at DESC
        `;
        const result = await db.query(query);
        console.log('Global residents fetched:', result.rowCount);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching global residents:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// POST /api/residents - Add a new resident with files
router.post('/', verifyUser, setUploadFolder, upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'document', maxCount: 1 }
]), attachRelativePath, async (req, res) => {
    const { name, age, room_number, condition, emergency_contact } = req.body;
    const photoUrl = req.files?.['photo']?.[0]?.relative_path || null;
    const documentUrl = req.files?.['document']?.[0]?.relative_path || null;

    try {
        const providerId = await getProviderId(req.user.id);
        if (!providerId) return res.status(403).json({ message: 'Not a service provider' });

        const result = await db.query(
            `INSERT INTO residents (provider_id, name, age, room_number, condition, emergency_contact, photo_url, document_url) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [providerId, name, age, room_number, condition, emergency_contact, photoUrl, documentUrl]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding resident:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// PUT /api/residents/:id - Update resident info with files
router.put('/:id', verifyUser, setUploadFolder, upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'document', maxCount: 1 }
]), attachRelativePath, async (req, res) => {
    const { id } = req.params;
    const { name, age, room_number, condition, emergency_contact, is_active } = req.body;
    
    const photoUrl = req.files?.['photo']?.[0]?.relative_path || null;
    const documentUrl = req.files?.['document']?.[0]?.relative_path || null;

    try {
        const providerId = await getProviderId(req.user.id);
        const isAdmin = req.user.role?.toLowerCase() === 'admin';
        
        // Admins can update any resident, providers can only update their own
        const checkQuery = isAdmin 
            ? 'SELECT * FROM residents WHERE resident_id = $1'
            : 'SELECT * FROM residents WHERE resident_id = $1 AND provider_id = $2';
        const checkValues = isAdmin ? [id] : [id, providerId];
        
        const checkRes = await db.query(checkQuery, checkValues);
        if (checkRes.rows.length === 0) return res.status(404).json({ message: 'Resident not found' });

        // Dynamic update query
        const fields = [];
        const values = [];
        let idx = 1;

        if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
        if (age !== undefined) { fields.push(`age = $${idx++}`); values.push(age); }
        if (room_number !== undefined) { fields.push(`room_number = $${idx++}`); values.push(room_number); }
        if (condition !== undefined) { fields.push(`condition = $${idx++}`); values.push(condition); }
        if (emergency_contact !== undefined) { fields.push(`emergency_contact = $${idx++}`); values.push(emergency_contact); }
        if (is_active !== undefined) { fields.push(`is_active = $${idx++}`); values.push(is_active); }
        if (photoUrl) { fields.push(`photo_url = $${idx++}`); values.push(photoUrl); }
        if (documentUrl) { fields.push(`document_url = $${idx++}`); values.push(documentUrl); }

        if (fields.length === 0) return res.status(400).json({ message: 'Nothing to update' });

        values.push(id);
        const query = `
            UPDATE residents 
            SET ${fields.join(', ')}, updated_at = NOW() 
            WHERE resident_id = $${idx++} 
            RETURNING *
        `;

        const result = await db.query(query, values);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating resident:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/residents/:id - Get details of a resident
router.get('/:id', verifyUser, async (req, res) => {
    const { id } = req.params;
    try {
        const providerId = await getProviderId(req.user.id);
        const isAdmin = req.user.role?.toLowerCase() === 'admin';

        const query = isAdmin
            ? 'SELECT * FROM residents WHERE resident_id = $1'
            : 'SELECT * FROM residents WHERE resident_id = $1 AND provider_id = $2';
        const values = isAdmin ? [id] : [id, providerId];

        const result = await db.query(query, values);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Resident not found' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching resident:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// DELETE /api/residents/:id - Delete a resident
router.delete('/:id', verifyUser, async (req, res) => {
    const { id } = req.params;
    try {
        const providerId = await getProviderId(req.user.id);
        const isAdmin = req.user.role?.toLowerCase() === 'admin';

        const query = isAdmin
            ? 'DELETE FROM residents WHERE resident_id = $1 RETURNING *'
            : 'DELETE FROM residents WHERE resident_id = $1 AND provider_id = $2 RETURNING *';
        const values = isAdmin ? [id] : [id, providerId];

        const result = await db.query(query, values);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Resident not found' });
        res.json({ message: 'Resident deleted successfully' });
    } catch (error) {
        console.error('Error deleting resident:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
