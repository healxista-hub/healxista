import express from 'express';
import db from '../db.js';
import { verifyUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/activity
// Fetches the activity logs relevant to the requester
router.get('/', verifyUser, async (req, res) => {
    try {
        const { role, id: accountId } = req.user; 
        
        let logs;

        if (role.toLowerCase() === 'admin') {
            // Admins see everything, with user context joined
            const result = await db.query(`
                SELECT a.*, p.first_name, p.last_name, r.name as role_name 
                FROM activity_logs a
                LEFT JOIN accounts acc ON a.account_id = acc.account_id
                LEFT JOIN profiles p ON a.account_id = p.account_id
                LEFT JOIN roles r ON acc.role_id = r.role_id
                ORDER BY a.created_at DESC 
                LIMIT 100
            `);
            logs = result.rows;
        } else {
            // Users/Providers see strictly their own logs to ensure absolute privacy
            const result = await db.query(`
                SELECT * FROM activity_logs 
                WHERE account_id = $1 
                ORDER BY created_at DESC 
                LIMIT 50
            `, [accountId]);
            logs = result.rows;
        }

        res.json(logs);
    } catch (err) {
        console.error("Error fetching activity logs:", err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
