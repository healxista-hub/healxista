import express from 'express';
import db from '../db.js';
import { logActivity } from '../utils/activityLogger.js';

const router = express.Router();

// GET /notifications/:accountId
router.get('/notifications/:accountId', async (req, res) => {
    const { accountId } = req.params;
    try {
        const result = await db.query(
            'SELECT * FROM notifications WHERE account_id = $1 ORDER BY created_at DESC',
            [accountId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Fetch notifications error:', error);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
});

// POST /reviews
router.post('/reviews', async (req, res) => {
    const { bookingId, reviewerId, revieweeId, rating, comment } = req.body;
    try {
        const query = `
            INSERT INTO reviews (booking_id, reviewer_id, reviewee_id, rating, comment)
            VALUES ($1, $2, $3, $4, $5) RETURNING *
        `;
        const result = await db.query(query, [bookingId, reviewerId, revieweeId, rating, comment]);
        res.status(201).json({ message: 'Review submitted', review: result.rows[0] });
    } catch (error) {
        console.error('Review submission error:', error);
        res.status(500).json({ message: 'Error submitting review' });
    }
});

// GET /reviews/:accountId (Reviews for a specific provider)
router.get('/reviews/:accountId', async (req, res) => {
    const { accountId } = req.params;
    try {
        const query = `
            SELECT r.*, p.first_name, p.last_name 
            FROM reviews r
            JOIN profiles p ON r.reviewer_id = p.account_id
            WHERE r.reviewee_id = $1 ORDER BY r.created_at DESC
        `;
        const result = await db.query(query, [accountId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Fetch reviews error:', error);
        res.status(500).json({ message: 'Error fetching reviews' });
    }
});

// POST /verification-requests
router.post('/verification', async (req, res) => {
    const { providerId, documentType, documentUrl } = req.body;
    try {
        const query = `
            INSERT INTO verification_requests (provider_id, document_type, document_url)
            VALUES ($1, $2, $3) RETURNING *
        `;
        const result = await db.query(query, [providerId, documentType, documentUrl]);
        res.status(201).json({ message: 'Verification request submitted', request: result.rows[0] });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ message: 'Error submitting verification request' });
    }
});

// POST /contact (Public Contact Form)
router.post('/contact', async (req, res) => {
    const { first_name, last_name, email, phone, subject, message } = req.body;
    try {
        if (!email || !message) {
            return res.status(400).json({ message: 'Email and message are required.' });
        }
        const query = `
            INSERT INTO contact_messages (first_name, last_name, email, phone, subject, message)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
        `;
        const result = await db.query(query, [first_name, last_name, email, phone, subject, message]);
        
        await logActivity(req.app.get('io'), {
            targetRole: 'Admin',
            actionType: 'New Inquiry',
            title: 'New Support Inquiry',
            description: `${first_name} ${last_name} sent a message regarding: ${subject || 'No Subject'}`,
            statusTheme: 'warning'
        });

        res.status(201).json({ message: 'Message sent successfully', id: result.rows[0].id });
    } catch (error) {
        console.error('Contact submission error:', error);
        res.status(500).json({ message: 'Error submitting contact message' });
    }
});

export default router;
