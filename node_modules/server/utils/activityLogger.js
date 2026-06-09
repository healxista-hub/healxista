import db from '../db.js';

/**
 * Logs an activity to the database and emits it via Socket.IO
 * 
 * @param {Object} io - Socket.io instance
 * @param {Object} logData - The data to log
 * @param {number|null} logData.accountId - The ID of the account related to the event
 * @param {string} logData.targetRole - 'Admin', 'User', or 'All'
 * @param {string} logData.actionType - Type of action
 * @param {string} logData.title - Summary title
 * @param {string} logData.description - Detailed description
 * @param {number|null} logData.relatedId - ID of related entity (booking_id etc)
 * @param {string} logData.statusTheme - 'info', 'success', 'warning', 'active'
 */
export const logActivity = async (io, { 
    accountId = null, 
    targetRole, 
    actionType, 
    title, 
    description, 
    relatedId = null, 
    statusTheme = 'info' 
}) => {
    try {
        const result = await db.query(`
            INSERT INTO activity_logs (
                account_id, target_role, action_type, title, description, related_id, status_theme
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [accountId, targetRole, actionType, title, description, relatedId, statusTheme]);

        const newLog = result.rows[0];

        // Emit via Socket.IO to specific roles
        if (io) {
            // If it's targeted at Admin, emit to the admin room
            // In index.js `io.on('join_role', role => socket.join(role))` handles rooms
            if (targetRole === 'All') {
                io.emit('new_activity', newLog);
            } else {
                // E.g. 'admin' room
                io.to(targetRole.toLowerCase()).emit('new_activity', newLog);
                
                // If it's linked to a specific account, also emit to that unique account room
                // Note: Ensure users join a room with their account_id on frontend
                if (accountId) {
                    io.to(`account_${accountId}`).emit('new_activity', newLog);
                }
            }
        }

        return newLog;
    } catch (error) {
        console.error("Failed to log activity:", error);
        return null;
    }
};
