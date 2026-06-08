import express from 'express';
import db from '../db.js';
import jwt from 'jsonwebtoken';
import { logActivity } from '../utils/activityLogger.js';

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || 'healxista-super-secret-key';

// Middleware to check for admin privileges (optional if you want to protect GET/PATCH)
const verifyAdmin = (req, res, next) => {
    const token = req.cookies.token || (req.headers.authorization?.split(' ')[1]);
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        let decoded;
        try { decoded = jwt.verify(token, SECRET_KEY); } catch(e) { return res.status(401).json({ message: 'Unauthorized: Token expired or invalid' }); }
        if (decoded.role !== 'Admin') {
            return res.status(403).json({ message: 'Forbidden: Admin access required' });
        }
        req.user = decoded;
        next();
    } catch(err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Create a new Quick Booking (Public endpoint)
router.post('/', async (req, res) => {
    const { serviceType, name, phone, location, destination, details } = req.body;

    // Basic validation
    if (!name || !phone) {
        return res.status(400).json({ message: 'Name and Phone are required' });
    }

    try {
        const query = `
            INSERT INTO quick_bookings (service_type, name, phone, location, destination, details)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
        `;
        const values = [serviceType || 'General', name, phone, location || '', destination || '', details || ''];
        
        const result = await db.query(query, values);
        
        // Log the activity to alert admins
        await logActivity(req.app.get('io'), {
            accountId: null, // Guest user
            targetRole: 'Admin',
            actionType: 'Quick Booking',
            title: `New Quick Booking: ${serviceType || 'General'}`,
            description: `${name} requested service at ${location || 'N/A'}. Contact: ${phone}`,
            relatedId: result.rows[0].id,
            statusTheme: 'active'
        });

        res.status(201).json({ message: 'Quick booking successful', quickBooking: result.rows[0] });
    } catch (error) {
        console.error('Error creating quick booking:', error);
        res.status(500).json({ message: 'Server error creating quick booking', error: error.message });
    }
});

// Get all Quick Bookings (Admin only)
router.get('/', verifyAdmin, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM quick_bookings ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching quick bookings:', error);
        res.status(500).json({ message: 'Server error fetching quick bookings' });
    }
});

// Update Quick Booking status (Admin only)
router.patch('/:id/status', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { status, status_note } = req.body;

    try {
        const query = `
            UPDATE quick_bookings 
            SET status = COALESCE($1, status), 
                status_note = COALESCE($2, status_note)
            WHERE id = $3 RETURNING *;
        `;
        const result = await db.query(query, [status, status_note, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Quick booking not found' });
        }
        
        res.status(200).json({ message: 'Status updated successfully', quickBooking: result.rows[0] });
    } catch (error) {
        console.error('Error updating quick booking status:', error);
        res.status(500).json({ message: 'Server error updating status' });
    }
});

// Delete a Quick Booking (Admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM quick_bookings WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Quick booking not found' });
        }
        res.status(200).json({ message: 'Quick booking deleted successfully' });
    } catch (error) {
        console.error('Error deleting quick booking:', error);
        res.status(500).json({ message: 'Server error deleting quick booking' });
    }
});

export default router;
