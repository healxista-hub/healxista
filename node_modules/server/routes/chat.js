import express from 'express';
import db from '../db.js';
import { verifyUser as authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all messages for a specific booking
router.get('/:bookingId', authenticateToken, async (req, res) => {
    try {
        const { bookingId } = req.params;
        const accountId = req.user.id;

        // Verify the user is part of this booking (either patient or provider)
        const bookingCheck = await db.query(`
            SELECT b.user_id, b.provider_id, sp.account_id as provider_account_id, b.status
            FROM bookings b
            LEFT JOIN service_providers sp ON b.provider_id = sp.provider_id
            WHERE b.booking_id = $1
        `, [bookingId]);

        if (bookingCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const booking = bookingCheck.rows[0];
        const isAuthorized = (booking.user_id === accountId) || (booking.provider_account_id === accountId);

        if (!isAuthorized && req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Not authorized to view this chat' });
        }

        // Fetch messages with sender details
        const messages = await db.query(`
            SELECT m.*, p.first_name, p.last_name, p.profile_image_url
            FROM messages m
            LEFT JOIN profiles p ON m.sender_id = p.account_id
            WHERE m.booking_id = $1
            ORDER BY m.created_at ASC
        `, [bookingId]);

        res.json({
            messages: messages.rows,
            bookingStatus: booking.status
        });

    } catch (err) {
        console.error('Error fetching chat history:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Send a new message
router.post('/:bookingId', authenticateToken, async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { message } = req.body;
        const accountId = req.user.id;

        if (!message || message.trim() === '') {
            return res.status(400).json({ error: 'Message cannot be empty' });
        }

        // Verify authorization and status
        const bookingCheck = await db.query(`
            SELECT b.status, b.user_id, sp.account_id as provider_account_id
            FROM bookings b
            LEFT JOIN service_providers sp ON b.provider_id = sp.provider_id
            WHERE b.booking_id = $1
        `, [bookingId]);

        if (bookingCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const booking = bookingCheck.rows[0];
        const isAuthorized = (booking.user_id === accountId) || (booking.provider_account_id === accountId);

        if (!isAuthorized && req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Not authorized to send messages' });
        }

        if (['Completed', 'Cancelled'].includes(booking.status)) {
            return res.status(403).json({ error: 'Chat is locked. This task is no longer active.' });
        }

        // Insert message
        const result = await db.query(`
            INSERT INTO messages (booking_id, sender_id, message)
            VALUES ($1, $2, $3)
            RETURNING message_id, booking_id, sender_id, message, is_read, created_at
        `, [bookingId, accountId, message]);

        const newMessage = result.rows[0];

        // Fetch sender profile info to attach to the emitted message
        const senderProfile = await db.query(`
            SELECT first_name, last_name, profile_image_url 
            FROM profiles WHERE account_id = $1
        `, [accountId]);

        if (senderProfile.rows.length > 0) {
             newMessage.first_name = senderProfile.rows[0].first_name;
             newMessage.last_name = senderProfile.rows[0].last_name;
             newMessage.profile_image_url = senderProfile.rows[0].profile_image_url;
        }

        // Emit via socket io
        const io = req.app.get('io');
        if (io) {
            io.to(`booking_${bookingId}`).emit('receive_message', newMessage);
        }

        res.status(201).json(newMessage);

    } catch (err) {
        console.error('Error sending message:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Mark messages as read
router.put('/:bookingId/read', authenticateToken, async (req, res) => {
    try {
        const { bookingId } = req.params;
        const accountId = req.user.id;

        await db.query(`
            UPDATE messages 
            SET is_read = true 
            WHERE booking_id = $1 AND sender_id != $2 AND is_read = false
        `, [bookingId, accountId]);

        res.json({ message: 'Marked as read' });

    } catch (err) {
         console.error('Error updating read status:', err);
         res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
