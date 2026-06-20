import express from 'express';
import db from '../db.js';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { logActivity } from '../utils/activityLogger.js';
import { formatName } from '../utils/nameFormatter.js';
import { verifyUser, verifyOptionalUser, verifyAdmin } from '../middleware/authMiddleware.js';
import { getUploadMiddleware, attachRelativePath } from '../utils/storageHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || 'healxista-super-secret-key';

// ─── Multer Setup for Booking Documents (Unified Storage) ────────────────────
const upload = getUploadMiddleware();
const baseUploadDir = path.join(__dirname, '../uploads');

// Helper to get service ID by name
const getServiceIdByName = async (name) => {
    const result = await db.query('SELECT service_id FROM services WHERE name = $1', [name]);
    return result.rows[0]?.service_id;
};

// Create a new booking (with optional user document)
router.post('/', verifyOptionalUser, upload.single('user_document'), attachRelativePath, async (req, res) => {
    const { 
        userId: providedUserId, 
        providerId, 
        serviceName, 
        bookingType, 
        scheduledAt, 
        totalAmount, 
        patientName, 
        contactNumber, 
        pickupLocation, 
        dropLocation, 
        emergencyLevel, 
        additionalNotes 
    } = req.body;

    let userId = providedUserId || null;

    // Try to get userId from token if not provided
    const token = req.cookies.token || (req.headers.authorization?.split(' ')[1]);
    if (!userId && token) {
        try {
            let decoded;
        try { decoded = jwt.verify(token, SECRET_KEY); } catch(e) { return res.status(401).json({ message: 'Unauthorized: Token expired or invalid' }); }
            userId = decoded.id;
        } catch (err) {
            console.log('User not authenticated, proceeding as guest or provided ID');
        }
    }

    try {
        let actualProviderId = providerId || null;
        if (actualProviderId) {
            // Handle case where frontend might send account_id instead of provider_id
            const spCheck = await db.query('SELECT provider_id FROM service_providers WHERE provider_id = $1 OR account_id = $1 LIMIT 1', [actualProviderId]);
            if (spCheck.rows.length > 0) {
                actualProviderId = spCheck.rows[0].provider_id;
            }
        }

        const serviceId = await getServiceIdByName(serviceName || 'Ambulance Ride');
        
        const userDocument = req.file ? req.file.relative_path : null;

        const query = `
            INSERT INTO bookings (
                user_id, provider_id, service_id, booking_type, scheduled_at, 
                patient_name, contact_number, pickup_location, drop_location, 
                emergency_level, additional_notes, total_amount, status, user_document
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *
        `;
        
        const values = [
            userId, 
            actualProviderId, 
            serviceId || null, 
            bookingType || (serviceName === 'Ambulance Ride' ? 'Ride' : 'Appointment'), 
            scheduledAt || new Date(), 
            patientName,
            contactNumber,
            pickupLocation,
            dropLocation,
            emergencyLevel,
            additionalNotes,
            totalAmount || 0, 
            'Pending',
            userDocument
        ];

        const result = await db.query(query, values);
        const booking = result.rows[0];

        // Create initial payment record if amount > 0
        if (totalAmount > 0) {
            await db.query(
                'INSERT INTO payments (booking_id, amount, payment_status) VALUES ($1, $2, $3)',
                [booking.booking_id, totalAmount, 'Pending']
            );
        }

        // Log the booking creation
        await logActivity(req.app.get('io'), {
            accountId: userId,
            targetRole: 'All', // visible to user, and broadcasted to admin
            actionType: 'New Booking',
            title: `${serviceName || 'Service'} Requested`,
            description: `New booking submitted for patient ${patientName}.`,
            relatedId: booking.booking_id,
            statusTheme: 'active'
        });

        res.status(201).json({ message: 'Booking successful', booking });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ message: 'Error creating booking', error: error.message });
    }
});

// Get user's own bookings
router.get('/', async (req, res) => {
    const token = req.cookies.token || (req.headers.authorization?.split(' ')[1]);
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        let decoded;
        try { decoded = jwt.verify(token, SECRET_KEY); } catch(e) { return res.status(401).json({ message: 'Unauthorized: Token expired or invalid' }); }
        const userId = decoded.id;

        const query = `
            SELECT b.*, s.name as service_name, p.first_name as provider_first_name, p.last_name as provider_last_name, p.gender as provider_gender, p.profile_image_url as provider_profile_image, r.name as provider_role, pa.account_id as provider_account_id
            FROM bookings b
            LEFT JOIN services s ON b.service_id = s.service_id
            LEFT JOIN service_providers sp ON b.provider_id = sp.provider_id
            LEFT JOIN accounts pa ON sp.account_id = pa.account_id
            LEFT JOIN roles r ON pa.role_id = r.role_id
            LEFT JOIN profiles p ON sp.account_id = p.account_id
            WHERE b.user_id = $1
            ORDER BY b.created_at DESC
        `;
        const result = await db.query(query, [userId]);
        res.json(result.rows.map(row => ({
            ...row,
            provider_account_id: row.provider_account_id,
            provider_name: formatName(row.provider_first_name, row.provider_last_name, row.provider_role, row.provider_gender) || 'Unassigned'
        })));
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Error fetching bookings' });
    }
});

// Get assigned bookings (for providers)
router.get('/assigned', async (req, res) => {
    const token = req.cookies.token || (req.headers.authorization?.split(' ')[1]);
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        let decoded;
        try { decoded = jwt.verify(token, SECRET_KEY); } catch(e) { return res.status(401).json({ message: 'Unauthorized: Token expired or invalid' }); }
        const accountId = decoded.id;

        // First find provider_id
        const pRes = await db.query('SELECT provider_id FROM service_providers WHERE account_id = $1', [accountId]);
        if (pRes.rows.length === 0) return res.json([]);

        const providerId = pRes.rows[0].provider_id;

        const query = `
            SELECT b.*, s.name as service_name, p.first_name as user_first_name, p.last_name as user_last_name, p.gender as user_gender, p.profile_image_url as user_profile_image, r.name as user_role
            FROM bookings b
            LEFT JOIN services s ON b.service_id = s.service_id
            LEFT JOIN accounts ua ON b.user_id = ua.account_id
            LEFT JOIN roles r ON ua.role_id = r.role_id
            LEFT JOIN profiles p ON b.user_id = p.account_id
            WHERE b.provider_id = $1
            ORDER BY b.created_at DESC
        `;
        const result = await db.query(query, [providerId]);
        res.json(result.rows.map(row => ({
            ...row,
            userName: formatName(row.user_first_name, row.user_last_name, row.user_role, row.user_gender) || row.patient_name
        })));
    } catch (error) {
        console.error('Error fetching assigned bookings:', error);
        res.status(500).json({ message: 'Error fetching assigned bookings' });
    }
});

// Get unique patients who have booked this provider
router.get('/my-patients', async (req, res) => {
    const token = req.cookies.token || (req.headers.authorization?.split(' ')[1]);
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        let decoded;
        try { decoded = jwt.verify(token, SECRET_KEY); } catch(e) { return res.status(401).json({ message: 'Unauthorized: Token expired or invalid' }); }
        const accountId = decoded.id;

        // Find provider_id
        const pRes = await db.query('SELECT provider_id FROM service_providers WHERE account_id = $1', [accountId]);
        if (pRes.rows.length === 0) return res.json([]);

        const providerId = pRes.rows[0].provider_id;

        const query = `
            SELECT DISTINCT p.account_id as id, p.first_name, p.last_name, p.profile_image_url as profile_picture, p.mobile, p.gender, r.name as role, MAX(b.created_at) as last_booking,
            (SELECT b2.user_document FROM bookings b2 WHERE b2.user_id = p.account_id AND b2.provider_id = $1 AND b2.user_document IS NOT NULL ORDER BY b2.created_at DESC LIMIT 1) as last_user_document
            FROM bookings b
            JOIN accounts a ON b.user_id = a.account_id
            JOIN roles r ON a.role_id = r.role_id
            JOIN profiles p ON b.user_id = p.account_id
            WHERE b.provider_id = $1
            GROUP BY p.account_id, p.first_name, p.last_name, p.profile_image_url, p.mobile, p.gender, r.name
            ORDER BY last_booking DESC
        `;
        const result = await db.query(query, [providerId]);
        res.json(result.rows.map(row => ({
            ...row,
            name: formatName(row.first_name, row.last_name, row.role, row.gender) || 'Patient'
        })));
    } catch (error) {
        console.error('Error fetching my-patients:', error);
        res.status(500).json({ message: 'Error fetching patients list' });
    }
});

// PUT /api/bookings/:id/status - Update booking status (providers and users)
router.put('/:id/status', async (req, res) => {
    const token = req.cookies.token || (req.headers.authorization?.split(' ')[1]);
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        let decoded;
        try { decoded = jwt.verify(token, SECRET_KEY); } catch(e) { return res.status(401).json({ message: 'Unauthorized: Token expired or invalid' }); }
        const accountId = decoded.id;
        const { id } = req.params;
        const { status, slot_number, consultation_time } = req.body;

        const validStatuses = ['Pending', 'Accepted', 'Arriving', 'Completed', 'Rejected', 'Cancelled', 'On the Way', 'Sample Collected', 'Report Ready', 'Booking Accepted', 'Slot and Time Given', 'Consultation Completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        // Check the booking exists and the user is authorized (must be user_id or provider)
        const bookingRes = await db.query(`
            SELECT b.booking_id, b.user_id, b.provider_id, b.status,
                   sp.account_id as provider_account_id
            FROM bookings b
            LEFT JOIN service_providers sp ON b.provider_id = sp.provider_id
            WHERE b.booking_id = $1
        `, [id]);

        if (bookingRes.rows.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const booking = bookingRes.rows[0];

        // Allow: user who made the booking, or the assigned provider
        const isUser = booking.user_id === accountId;
        const isProvider = booking.provider_account_id === accountId;

        if (!isUser && !isProvider) {
            return res.status(403).json({ message: 'You are not authorized to update this booking' });
        }

        let queryParams = [status, id];
        let setClauses = ['status = $1', 'updated_at = NOW()'];
        if (slot_number !== undefined) {
            queryParams.push(slot_number);
            setClauses.push(`slot_number = $${queryParams.length}`);
        }
        if (consultation_time !== undefined) {
            queryParams.push(consultation_time);
            setClauses.push(`consultation_time = $${queryParams.length}`);
        }

        const queryStr = `UPDATE bookings SET ${setClauses.join(', ')} WHERE booking_id = $2 RETURNING *`;
        const result = await db.query(queryStr, queryParams);

        // Log the activity
        await logActivity(req.app.get('io'), {
            accountId,
            targetRole: 'All',
            actionType: 'Booking Status Updated',
            title: `Booking #${id} → ${status}`,
            description: `Booking status changed to ${status}.`,
            relatedId: parseInt(id),
            statusTheme: status === 'Completed' ? 'success' : status === 'Rejected' || status === 'Cancelled' ? 'warning' : 'info'
        });

        res.json({ message: 'Booking status updated', booking: result.rows[0] });
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ message: 'Error updating booking status' });
    }
});

// GET /api/bookings/my-stats - Aggregated stats for current user/provider
router.get('/my-stats', async (req, res) => {
    const token = req.cookies.token || (req.headers.authorization?.split(' ')[1]);
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        let decoded;
        try { decoded = jwt.verify(token, SECRET_KEY); } catch(e) { return res.status(401).json({ message: 'Unauthorized: Token expired or invalid' }); }
        const accountId = decoded.id;
        const userRole = (decoded.role || '').toLowerCase();

        let whereClause = '';
        let params = [];

        if (userRole === 'patient' || userRole === 'user') {
            whereClause = 'WHERE user_id = $1';
            params = [accountId];
        } else {
            // Provider roles
            const pRes = await db.query('SELECT provider_id FROM service_providers WHERE account_id = $1', [accountId]);
            if (pRes.rows.length === 0) return res.json({ total: 0, accepted: 0, cancelled: 0, byDayTrend: [] });
            const providerId = pRes.rows[0].provider_id;
            whereClause = 'WHERE provider_id = $1';
            params = [providerId];
        }

        const statsQuery = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status IN ('Accepted', 'Booking Accepted', 'Slot and Time Given', 'Consultation Completed', 'Completed') THEN 1 ELSE 0 END) as accepted,
                SUM(CASE WHEN status IN ('Cancelled', 'Rejected') THEN 1 ELSE 0 END) as cancelled,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending
            FROM bookings 
            ${whereClause}
        `;
        const statsResult = await db.query(statsQuery, params);

        const trendQuery = `
            SELECT DATE_TRUNC('day', created_at) as day, COUNT(*) as count 
            FROM bookings 
            ${whereClause} AND created_at >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY day 
            ORDER BY day ASC
        `;
        const trendResult = await db.query(trendQuery, params);

        const row = statsResult.rows[0];
        res.json({
            total: parseInt(row.total) || 0,
            accepted: parseInt(row.accepted) || 0,
            cancelled: parseInt(row.cancelled) || 0,
            pending: parseInt(row.pending) || 0,
            byDayTrend: trendResult.rows.map(r => ({
                name: new Date(r.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                count: parseInt(r.count)
            }))
        });
    } catch (error) {
        console.error('Error fetching my-stats:', error);
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

// PUT /api/bookings/:id/provider-document - Provider uploads a report/document
router.put('/:id/provider-document', verifyUser, upload.single('provider_document'), attachRelativePath, async (req, res) => {
    const token = req.cookies.token || (req.headers.authorization?.split(' ')[1]);
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        let decoded;
        try { decoded = jwt.verify(token, SECRET_KEY); } catch(e) { return res.status(401).json({ message: 'Unauthorized: Token expired or invalid' }); }
        const accountId = decoded.id;
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({ message: 'No document uploaded' });
        }

        // Verify that the person uploading is indeed the assigned provider
        const checkRes = await db.query(`
            SELECT b.booking_id, sp.account_id as provider_account_id
            FROM bookings b
            JOIN service_providers sp ON b.provider_id = sp.provider_id
            WHERE b.booking_id = $1
        `, [id]);

        if (checkRes.rows.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (checkRes.rows[0].provider_account_id !== accountId) {
            return res.status(403).json({ message: 'You are not authorized to upload documents for this booking' });
        }

        const fileName = req.file.relative_path;
        await db.query('UPDATE bookings SET provider_document = $1, updated_at = NOW() WHERE booking_id = $2', [fileName, id]);

        // Log activity
        await logActivity(req.app.get('io'), {
            accountId,
            targetRole: 'All',
            actionType: 'Document Uploaded',
            title: 'Medical Report Uploaded',
            description: `Provider uploaded a report for booking #${id}.`,
            relatedId: parseInt(id),
            statusTheme: 'success'
        });

        res.json({ message: 'Document uploaded successfully', fileName });
    } catch (error) {
        console.error('Error uploading provider document:', error);
        res.status(500).json({ message: 'Error uploading document' });
    }
});

// DELETE /api/bookings/:id/document/:type - Delete a document
router.delete('/:id/document/:type', async (req, res) => {
    const token = req.cookies.token || (req.headers.authorization?.split(' ')[1]);
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        let decoded;
        try { decoded = jwt.verify(token, SECRET_KEY); } catch(e) { return res.status(401).json({ message: 'Unauthorized: Token expired or invalid' }); }
        const accountId = decoded.id;
        const { id, type } = req.params;

        if (type !== 'user' && type !== 'provider') {
            return res.status(400).json({ message: 'Invalid document type' });
        }

        // Check authentication and existence
        const bookingRes = await db.query(`
            SELECT b.*, sp.account_id as provider_account_id
            FROM bookings b
            LEFT JOIN service_providers sp ON b.provider_id = sp.provider_id
            WHERE b.booking_id = $1
        `, [id]);

        if (bookingRes.rows.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const booking = bookingRes.rows[0];
        const isUser = booking.user_id === accountId;
        const isProvider = booking.provider_account_id === accountId;

        // Restriction: User can delete user_doc, Provider can delete provider_doc
        if (type === 'user' && !isUser) return res.status(403).json({ message: 'Access denied' });
        if (type === 'provider' && !isProvider) return res.status(403).json({ message: 'Access denied' });

        const columnName = type === 'user' ? 'user_document' : 'provider_document';
        const fileName = booking[columnName];

        if (fileName) {
            // Legacy check: if filename doesn't contain a slash, it's in the old 'documents' folder
            const subDir = fileName.includes('/') ? '' : 'documents';
            const filePath = path.join(baseUploadDir, subDir, fileName);
            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                    if (err) console.error('Error deleting file:', err);
                });
            }
        }

        await db.query(`UPDATE bookings SET ${columnName} = NULL, updated_at = NOW() WHERE booking_id = $1`, [id]);

        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ message: 'Error deleting document' });
    }
});

// POST /api/bookings/:id/pay - Submit manual payment details
router.post('/:id/pay', async (req, res) => {
    const token = req.cookies.token || (req.headers.authorization?.split(' ')[1]);
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        let decoded;
        try { decoded = jwt.verify(token, SECRET_KEY); } catch(e) { return res.status(401).json({ message: 'Unauthorized: Token expired or invalid' }); }
        
        const { id } = req.params;
        const { payerName, payerMobile, amount } = req.body;

        // Check if payment record exists
        const paymentRes = await db.query('SELECT payment_id FROM payments WHERE booking_id = $1', [id]);
        
        if (paymentRes.rows.length === 0) {
            await db.query(
                'INSERT INTO payments (booking_id, amount, payment_status, payer_name, payer_mobile) VALUES ($1, $2, $3, $4, $5)',
                [id, amount || 0, 'Pending', payerName, payerMobile]
            );
        } else {
            await db.query(
                'UPDATE payments SET payer_name = $1, payer_mobile = $2, amount = $3 WHERE booking_id = $4',
                [payerName, payerMobile, amount || 0, id]
            );
        }

        // Update booking status
        const result = await db.query(
            "UPDATE bookings SET status = 'Payment Verification Pending', updated_at = NOW() WHERE booking_id = $1 RETURNING *",
            [id]
        );

        // Log the activity
        await logActivity(req.app.get('io'), {
            accountId: decoded.id,
            targetRole: 'Admin',
            actionType: 'Payment Submitted',
            title: `Payment Submitted for Booking #${id}`,
            description: `${payerName} submitted payment of ₹${amount}. Awaiting verification.`,
            relatedId: parseInt(id),
            statusTheme: 'info'
        });

        res.json({ message: 'Payment details submitted successfully', booking: result.rows[0] });
    } catch (error) {
        console.error('Error submitting payment:', error);
        res.status(500).json({ message: 'Error submitting payment' });
    }
});

// PUT /api/bookings/:id/verify-payment - Verify payment (Admin only)
router.put('/:id/verify-payment', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        await db.query("UPDATE payments SET payment_status = 'Confirmed' WHERE booking_id = $1", [id]);
        
        const result = await db.query(
            "UPDATE bookings SET status = 'Payment Confirmed', updated_at = NOW() WHERE booking_id = $1 RETURNING *",
            [id]
        );

        // Log the activity
        await logActivity(req.app.get('io'), {
            accountId: req.user.id, // from verifyAdmin
            targetRole: 'All',
            actionType: 'Payment Verified',
            title: `Payment Confirmed for Booking #${id}`,
            description: `Admin verified the payment. Providers can now proceed.`,
            relatedId: parseInt(id),
            statusTheme: 'success'
        });

        res.json({ message: 'Payment verified successfully', booking: result.rows[0] });
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: 'Error verifying payment' });
    }
});

export default router;
