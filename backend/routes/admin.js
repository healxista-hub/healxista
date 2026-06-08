import express from 'express';
import db from '../db.js';
import { logActivity } from '../utils/activityLogger.js';
import { formatName } from '../utils/nameFormatter.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply verifyAdmin middleware to all routes in this router
router.use(verifyAdmin);

// Helper to get role ID from type
const getRoleIdByType = async (type) => {
    let roleName = '';
    switch (type) {
        case 'doctor': roleName = 'Doctor'; break;
        case 'medicine': roleName = 'Medicine Store'; break;
        case 'physiotherapy': roleName = 'Physiotherapy'; break;
        case 'old-age': roleName = 'Old Age Home'; break;
        case 'patient': roleName = 'Patient'; break;
        case 'ambulance': roleName = 'Driver'; break;
        case 'lab-test': roleName = 'Lab Test'; break;
        case 'home-care': roleName = 'Home Care'; break;
        default: return null;
    }
    const res = await db.query('SELECT role_id FROM roles WHERE name = $1', [roleName]);
    return res.rows[0]?.role_id;
};

// GET /api/admin/stats - Overview counts for Admin Dashboard
router.get('/stats', async (req, res) => {
    try {
        const query = `
            SELECT r.name, COUNT(a.account_id) as count 
            FROM roles r 
            LEFT JOIN accounts a ON r.role_id = a.role_id 
            GROUP BY r.name
        `;
        const result = await db.query(query);

        const inquiriesQuery = `SELECT COUNT(*) as total, COALESCE(SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END), 0) as pending FROM contact_messages`;
        const inquiriesResult = await db.query(inquiriesQuery);

        const verificationQuery = `SELECT COUNT(*) as count FROM service_providers WHERE is_verified = false`;
        const verificationResult = await db.query(verificationQuery);
        
        const stats = {};
        result.rows.forEach(row => {
            const key = row.name.toLowerCase().replace(/ /g, '_');
            stats[key] = parseInt(row.count);
        });

        res.json({
            patients: stats.patient || 0,
            doctors: stats.doctor || 0,
            ambulances: stats.driver || 0,
            pharmacies: stats.medicine_store || 0,
            physiotherapy: stats.physiotherapy || 0,
            oldAgeHomes: stats.old_age_home || 0,
            labTests: stats.lab_test || 0,
            totalInquiries: parseInt(inquiriesResult.rows[0].total) || 0,
            pendingInquiries: parseInt(inquiriesResult.rows[0].pending) || 0,
            pendingVerifications: parseInt(verificationResult.rows[0].count) || 0
        });
    } catch (error) {
        console.error('Admin Stats Error:', error);
        res.status(500).json({ message: 'Server error retrieving stats' });
    }
});

// GET /api/admin/records/:type - Fetch records for specific role
router.get('/records/:type', async (req, res) => {
    const roleId = await getRoleIdByType(req.params.type);
    if (!roleId) return res.status(400).json({ message: 'Invalid record type' });

    try {
        let specializedJoin = '';
        let extraCols = '';

        switch (req.params.type) {
            case 'doctor':
                specializedJoin = 'LEFT JOIN service_providers sp ON a.account_id = sp.account_id LEFT JOIN doctors d ON sp.provider_id = d.provider_id';
                extraCols = ', sp.provider_id, sp.is_verified, sp.overall_rating, sp.license_number, d.specialization, d.experience_years, d.consultation_fee';
                break;
            case 'physiotherapy':
                specializedJoin = 'LEFT JOIN service_providers sp ON a.account_id = sp.account_id LEFT JOIN physiotherapists phys ON sp.provider_id = phys.provider_id';
                extraCols = ', sp.provider_id, sp.is_verified, sp.overall_rating, sp.license_number, phys.specialization, phys.experience_years, phys.consultation_fee';
                break;
            case 'medicine':
                specializedJoin = 'LEFT JOIN service_providers sp ON a.account_id = sp.account_id LEFT JOIN medicine_stores ms ON sp.provider_id = ms.provider_id';
                extraCols = ', sp.provider_id, sp.is_verified, sp.overall_rating, sp.license_number, ms.owner_name, ms.opening_hours';
                break;
            case 'old-age':
                specializedJoin = 'LEFT JOIN service_providers sp ON a.account_id = sp.account_id LEFT JOIN old_age_homes oah ON sp.provider_id = oah.provider_id';
                extraCols = ', sp.provider_id, sp.is_verified, sp.overall_rating, sp.license_number, oah.capacity, oah.facilities_description, oah.admin_name';
                break;
            case 'lab-test':
                specializedJoin = 'LEFT JOIN service_providers sp ON a.account_id = sp.account_id LEFT JOIN lab_tests lt ON sp.provider_id = lt.provider_id';
                extraCols = ', sp.provider_id, sp.is_verified, sp.overall_rating, sp.license_number, lt.lab_name, lt.accreditation, lt.home_sample_collection, lt.owner_name';
                break;
            case 'ambulance':
                specializedJoin = 'LEFT JOIN service_providers sp ON a.account_id = sp.account_id LEFT JOIN drivers dr ON sp.provider_id = dr.provider_id';
                extraCols = ', sp.provider_id, sp.is_verified, sp.overall_rating, sp.license_number, dr.vehicle_number, dr.vehicle_type, dr.experience_years';
                break;
            case 'home-care':
                specializedJoin = 'LEFT JOIN service_providers sp ON a.account_id = sp.account_id LEFT JOIN home_cares hc ON sp.provider_id = hc.provider_id';
                extraCols = ', sp.provider_id, sp.is_verified, sp.overall_rating, sp.license_number, hc.agency_name, hc.services_offered, hc.experience_years';
                break;
        }

        const query = `
            SELECT a.account_id as id, a.email, a.created_at, p.first_name, p.last_name, p.gender, p.mobile, p.profile_image_url, p.cover_image_url, p.document_url,
                   COALESCE(addr.street || ', ' || addr.city, addr.city, 'Location Not Specified') as address,
                   addr.city, addr.state, r.name as role_name,
                   (SELECT b2.user_document FROM bookings b2 WHERE b2.user_id = a.account_id AND b2.user_document IS NOT NULL ORDER BY b2.created_at DESC LIMIT 1) as last_user_document
            ${extraCols}
            FROM accounts a
            JOIN roles r ON a.role_id = r.role_id
            JOIN profiles p ON a.account_id = p.account_id
            LEFT JOIN addresses addr ON a.account_id = addr.account_id
            ${specializedJoin}
            WHERE a.role_id = $1 AND a.deleted_at IS NULL
            ORDER BY a.created_at DESC
        `;
        const result = await db.query(query, [roleId]);
        res.json(result.rows.map(row => ({
            ...row,
            name: formatName(row.first_name, row.last_name, row.role_name, row.gender) || 'Guest'
        })));
    } catch (error) {
        console.error('Admin Fetch Error:', error);
        res.status(500).json({ message: 'Failed to fetch records' });
    }
});

// GET /api/admin/recent - Mix of recent joins globally
router.get('/recent', async (req, res) => {
    try {
        const query = `
            SELECT a.account_id, p.first_name, p.last_name, p.gender, r.name as role, a.created_at 
            FROM accounts a
            JOIN profiles p ON a.account_id = p.account_id
            JOIN roles r ON a.role_id = r.role_id
            WHERE a.deleted_at IS NULL
            ORDER BY a.created_at DESC
            LIMIT 10
        `;
        const result = await db.query(query);
        res.json(result.rows.map(row => ({
            id: row.account_id,
            name: formatName(row.first_name, row.last_name, row.role, row.gender) || 'Guest',
            role: row.role,
            created_at: row.created_at
        })));
    } catch (error) {
        console.error('Admin Recent Error:', error);
        res.status(500).json({ message: 'Failed to fetch recent records' });
    }
});

// GET /api/admin/bookings - Fetch all bookings
router.get('/bookings', async (req, res) => {
    try {
        const query = `
            SELECT b.booking_id as id, b.*, s.name as service_name, 
                   up.first_name as user_first_name, up.last_name as user_last_name, up.gender as user_gender, ur.name as user_role,
                   pp.first_name as provider_first_name, pp.last_name as provider_last_name, pp.gender as provider_gender, pr.name as provider_role,
                   pay.amount as payment_amount, pay.payer_name as payment_payer_name, pay.payer_mobile as payment_payer_mobile
            FROM bookings b
            LEFT JOIN services s ON b.service_id = s.service_id
            LEFT JOIN accounts ua ON b.user_id = ua.account_id
            LEFT JOIN roles ur ON ua.role_id = ur.role_id
            LEFT JOIN profiles up ON b.user_id = up.account_id
            LEFT JOIN service_providers sp ON b.provider_id = sp.provider_id
            LEFT JOIN accounts pa ON sp.account_id = pa.account_id
            LEFT JOIN roles pr ON pa.role_id = pr.role_id
            LEFT JOIN profiles pp ON sp.account_id = pp.account_id
            LEFT JOIN payments pay ON b.booking_id = pay.booking_id
            ORDER BY b.created_at DESC
        `;
        const result = await db.query(query);
        res.json(result.rows.map(row => ({
            ...row,
            user_name: formatName(row.user_first_name, row.user_last_name, row.user_role, row.user_gender) || 'Guest',
            provider_name: formatName(row.provider_first_name, row.provider_last_name, row.provider_role, row.provider_gender) || 'Unassigned'
        })));
    } catch (error) {
        console.error('Admin Bookings Error:', error);
        res.status(500).json({ message: 'Failed to fetch bookings' });
    }
});

// DELETE /api/admin/records/:type/:id
router.delete('/records/:type/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE accounts SET deleted_at = CURRENT_TIMESTAMP WHERE account_id = $1', [id]);
        res.json({ message: 'Record removed successfully' });
    } catch (error) {
        console.error('Admin Delete Error:', error);
        res.status(500).json({ message: 'Failed to delete record' });
    }
});

// PUT /api/admin/records/:type/:id/verify
router.put('/records/:type/:id/verify', async (req, res) => {
    const { id } = req.params;
    const { is_verified } = req.body;
    try {
        const result = await db.query(
            'UPDATE service_providers SET is_verified = $1 WHERE account_id = $2 RETURNING is_verified',
            [is_verified, id]
        );
        res.json({ message: 'Status updated', data: result.rows[0] });
    } catch (error) {
        console.error('Admin Verify Error:', error);
        res.status(500).json({ message: 'Failed to update verification status' });
    }
});

// PUT /api/admin/bookings/:id/assign
router.put('/bookings/:id/assign', async (req, res) => {
    const { id } = req.params;
    const { assignedTo } = req.body; // account_id of the provider

    try {
        const providerRes = await db.query(
            'SELECT provider_id FROM service_providers WHERE account_id = $1',
            [assignedTo]
        );

        if (providerRes.rows.length === 0) {
            return res.status(404).json({ message: 'Selected user is not a registered service provider.' });
        }

        const providerId = providerRes.rows[0].provider_id;

        const result = await db.query(
            'UPDATE bookings SET provider_id = $1, status = $2 WHERE booking_id = $3 RETURNING *',
            [providerId, 'Assigned', id]
        );

        await logActivity(req.app.get('io'), {
            accountId: providerId,
            targetRole: 'All', 
            actionType: 'Booking Assigned',
            title: 'Booking Assigned',
            description: `Booking #${id} assigned to provider ID ${providerId}`,
            relatedId: id,
            statusTheme: 'info'
        });

        res.json({ message: 'Booking assigned successfully', booking: result.rows[0] });
    } catch (error) {
        console.error('Admin Assignment Error:', error);
        res.status(500).json({ message: 'Failed to assign booking' });
    }
});

// GET /api/admin/booking-stats - Analytical data for admin dashboard
router.get('/booking-stats', async (req, res) => {
    try {
        const statusQuery = `
            SELECT status, COUNT(*) as count 
            FROM bookings 
            GROUP BY status
        `;
        const statusResult = await db.query(statusQuery);
        
        const serviceQuery = `
            SELECT b.booking_type, s.name as service_name, COUNT(b.booking_id) as count 
            FROM bookings b
            LEFT JOIN services s ON b.service_id = s.service_id
            GROUP BY b.booking_type, s.name
        `;
        const serviceResult = await db.query(serviceQuery);
        
        const totalQuery = `SELECT COUNT(*) as count FROM bookings`;
        const totalResult = await db.query(totalQuery);

        // Day-wise trend for last 7 days
        const trendQuery = `
            SELECT DATE_TRUNC('day', created_at) as day, COUNT(*) as count 
            FROM bookings 
            WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY day 
            ORDER BY day ASC
        `;
        const trendResult = await db.query(trendQuery);

        res.json({
            total: parseInt(totalResult.rows[0].count),
            byStatus: statusResult.rows.map(r => ({ name: r.status, value: parseInt(r.count) })),
            byService: serviceResult.rows.map(r => ({ 
                name: r.service_name || r.booking_type || 'Unknown', 
                value: parseInt(r.count) 
            })),
            byDayTrend: trendResult.rows.map(r => ({
                name: new Date(r.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                count: parseInt(r.count)
            }))
        });
    } catch (error) {
        console.error('Admin Booking Stats Error:', error);
        res.status(500).json({ message: 'Server error retrieving booking stats' });
    }
});

// GET /api/admin/contacts - Fetch all contact form submissions
router.get('/contacts', async (req, res) => {
    try {
        const query = `SELECT * FROM contact_messages ORDER BY created_at DESC`;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Admin Contacts Error:', error);
        res.status(500).json({ message: 'Failed to fetch contact messages' });
    }
});

// PUT /api/admin/contacts/:id/status - Update contact message status
router.put('/contacts/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const result = await db.query(
            'UPDATE contact_messages SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );

        await logActivity(req.app.get('io'), {
            targetRole: 'All', 
            actionType: 'Inquiry Status Updated',
            title: 'Inquiry Resolved',
            description: `Contact message #${id} marked as ${status}.`,
            relatedId: id,
            statusTheme: status === 'Resolved' ? 'success' : 'info'
        });

        res.json({ message: 'Status updated', data: result.rows[0] });
    } catch (error) {
        console.error('Admin Update Contact Error:', error);
        res.status(500).json({ message: 'Failed to update contact status' });
    }
});

export default router;
