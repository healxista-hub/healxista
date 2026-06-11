import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware to ensure specifically Super Admin access
const requireSuperAdmin = (req, res, next) => {
    if (req.user.role?.toLowerCase() !== 'super admin' && req.user.role?.toLowerCase() !== 'super_admin') {
        return res.status(403).json({ message: 'Forbidden: Super Admin access required' });
    }
    next();
};

// Apply verifyAdmin (which now checks for both admin and super admin) and then requireSuperAdmin
router.use(verifyAdmin, requireSuperAdmin);

// GET all users
router.get('/users', async (req, res) => {
    try {
        const query = `
            SELECT a.account_id, a.email, a.custom_id, a.created_at, r.name as role_name, p.first_name, p.last_name, p.mobile
            FROM accounts a
            JOIN roles r ON a.role_id = r.role_id
            LEFT JOIN profiles p ON a.account_id = p.account_id
            WHERE a.deleted_at IS NULL
            ORDER BY a.created_at DESC
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('SuperAdmin Get Users Error:', err);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// PUT update user info
router.put('/users/:id', async (req, res) => {
    const accountId = req.params.id;
    const { first_name, last_name, email, mobile, role_name } = req.body;
    
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // Update Account details (email)
        if (email) {
            await client.query('UPDATE accounts SET email = $1 WHERE account_id = $2', [email, accountId]);
        }

        // Update Profile details
        if (first_name || last_name || mobile) {
            // Check if profile exists
            const profCheck = await client.query('SELECT 1 FROM profiles WHERE account_id = $1', [accountId]);
            if (profCheck.rows.length > 0) {
                let updates = [];
                let values = [];
                let idx = 1;
                if (first_name) { updates.push(`first_name = $${idx++}`); values.push(first_name); }
                if (last_name) { updates.push(`last_name = $${idx++}`); values.push(last_name); }
                if (mobile) { updates.push(`mobile = $${idx++}`); values.push(mobile); }
                
                values.push(accountId);
                const query = `UPDATE profiles SET ${updates.join(', ')} WHERE account_id = $${idx}`;
                await client.query(query, values);
            } else {
                await client.query('INSERT INTO profiles (account_id, first_name, last_name, mobile) VALUES ($1, $2, $3, $4)', 
                    [accountId, first_name || '', last_name || '', mobile || '']);
            }
        }

        // Update Role
        if (role_name) {
            const roleRes = await client.query('SELECT role_id FROM roles WHERE name = $1', [role_name]);
            if (roleRes.rows.length > 0) {
                const roleId = roleRes.rows[0].role_id;
                await client.query('UPDATE accounts SET role_id = $1 WHERE account_id = $2', [roleId, accountId]);
                // update user_roles
                await client.query('UPDATE user_roles SET role_id = $1 WHERE account_id = $2', [roleId, accountId]);
            }
        }

        await client.query('COMMIT');
        res.json({ message: 'User updated successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('SuperAdmin Update User Error:', err);
        res.status(500).json({ message: 'Error updating user' });
    } finally {
        client.release();
    }
});

// PUT force reset password
router.put('/users/:id/password', async (req, res) => {
    const accountId = req.params.id;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await db.query('UPDATE accounts SET password = $1 WHERE account_id = $2', [hashedPassword, accountId]);
        res.json({ message: 'Password forcefully reset' });
    } catch (err) {
        console.error('SuperAdmin Reset Password Error:', err);
        res.status(500).json({ message: 'Error resetting password' });
    }
});

// GET full user profile across all joined tables
router.get('/users/:id/full-profile', async (req, res) => {
    const accountId = req.params.id;
    try {
        const query = `
            SELECT 
                a.account_id, a.email, a.custom_id, a.created_at, r.name as role_name,
                p.first_name, p.last_name, p.gender, p.date_of_birth, p.mobile, p.blood_group, p.profile_image_url,
                addr.street, addr.city, addr.state, addr.zip_code, addr.latitude, addr.longitude,
                sp.provider_id, sp.provider_type, sp.is_verified, sp.overall_rating, sp.status, sp.license_number,
                doc.specialization as doc_spec, doc.experience_years as doc_exp, doc.consultation_fee as doc_fee,
                drv.vehicle_number, drv.vehicle_type, drv.experience_years as drv_exp,
                ms.owner_name as ms_owner, ms.opening_hours as ms_hours,
                phy.specialization as phy_spec, phy.experience_years as phy_exp, phy.consultation_fee as phy_fee,
                oah.capacity as oah_cap, oah.facilities_description as oah_fac, oah.admin_name as oah_admin,
                lt.lab_name, lt.accreditation as lt_acc, lt.home_sample_collection as lt_home, lt.owner_name as lt_owner,
                hc.agency_name as hc_agency, hc.services_offered as hc_serv, hc.experience_years as hc_exp
            FROM accounts a
            JOIN roles r ON a.role_id = r.role_id
            LEFT JOIN profiles p ON a.account_id = p.account_id
            LEFT JOIN addresses addr ON a.account_id = addr.account_id
            LEFT JOIN service_providers sp ON a.account_id = sp.account_id
            LEFT JOIN doctors doc ON sp.provider_id = doc.provider_id
            LEFT JOIN drivers drv ON sp.provider_id = drv.provider_id
            LEFT JOIN medicine_stores ms ON sp.provider_id = ms.provider_id
            LEFT JOIN physiotherapists phy ON sp.provider_id = phy.provider_id
            LEFT JOIN old_age_homes oah ON sp.provider_id = oah.provider_id
            LEFT JOIN lab_tests lt ON sp.provider_id = lt.provider_id
            LEFT JOIN home_cares hc ON sp.provider_id = hc.provider_id
            WHERE a.account_id = $1 AND a.deleted_at IS NULL
        `;
        const result = await db.query(query, [accountId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('SuperAdmin Get Full Profile Error:', err);
        res.status(500).json({ message: 'Error fetching full profile' });
    }
});

// PUT update full user profile
router.put('/users/:id/full-profile', async (req, res) => {
    const accountId = req.params.id;
    const data = req.body;
    
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // Update Account details
        if (data.email) {
            await client.query('UPDATE accounts SET email = $1 WHERE account_id = $2', [data.email, accountId]);
        }

        // Update Role
        if (data.role_name) {
            const roleRes = await client.query('SELECT role_id FROM roles WHERE name = $1', [data.role_name]);
            if (roleRes.rows.length > 0) {
                const roleId = roleRes.rows[0].role_id;
                await client.query('UPDATE accounts SET role_id = $1 WHERE account_id = $2', [roleId, accountId]);
                await client.query('UPDATE user_roles SET role_id = $1 WHERE account_id = $2', [roleId, accountId]);
            }
        }

        // Profile Table
        const profCheck = await client.query('SELECT 1 FROM profiles WHERE account_id = $1', [accountId]);
        if (profCheck.rows.length > 0) {
            await client.query(
                'UPDATE profiles SET first_name=$1, last_name=$2, gender=$3, date_of_birth=$4, mobile=$5, blood_group=$6 WHERE account_id=$7',
                [data.first_name, data.last_name, data.gender, data.date_of_birth, data.mobile, data.blood_group, accountId]
            );
        } else {
            await client.query(
                'INSERT INTO profiles (account_id, first_name, last_name, gender, date_of_birth, mobile, blood_group) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [accountId, data.first_name, data.last_name, data.gender, data.date_of_birth, data.mobile, data.blood_group]
            );
        }

        // Addresses Table
        const addrCheck = await client.query('SELECT 1 FROM addresses WHERE account_id = $1', [accountId]);
        if (addrCheck.rows.length > 0) {
            await client.query(
                'UPDATE addresses SET street=$1, city=$2, state=$3, zip_code=$4 WHERE account_id=$5',
                [data.street, data.city, data.state, data.zip_code, accountId]
            );
        } else if (data.street || data.city || data.state || data.zip_code) {
            await client.query(
                'INSERT INTO addresses (account_id, street, city, state, zip_code) VALUES ($1, $2, $3, $4, $5)',
                [accountId, data.street, data.city, data.state, data.zip_code]
            );
        }

        // Service Providers Table
        const spCheck = await client.query('SELECT provider_id FROM service_providers WHERE account_id = $1', [accountId]);
        let providerId = null;
        if (spCheck.rows.length > 0) {
            providerId = spCheck.rows[0].provider_id;
            await client.query(
                'UPDATE service_providers SET license_number=$1, status=$2, is_verified=$3 WHERE account_id=$4',
                [data.license_number, data.status, data.is_verified, accountId]
            );
        } else if (data.role_name && ['Doctor', 'Driver', 'Medicine Store', 'Physiotherapy', 'Old Age Home', 'Lab Test', 'Home Care'].includes(data.role_name)) {
            const spRes = await client.query(
                'INSERT INTO service_providers (account_id, provider_type, license_number, status, is_verified) VALUES ($1, $2, $3, $4, $5) RETURNING provider_id',
                [accountId, data.role_name, data.license_number, data.status || 'Active', data.is_verified || false]
            );
            providerId = spRes.rows[0].provider_id;
        }

        // Specialized tables
        if (providerId) {
            const role = data.role_name;
            if (role === 'Doctor') {
                const docCheck = await client.query('SELECT 1 FROM doctors WHERE provider_id = $1', [providerId]);
                if (docCheck.rows.length > 0) {
                    await client.query('UPDATE doctors SET specialization=$1, experience_years=$2, consultation_fee=$3 WHERE provider_id=$4', [data.doc_spec, data.doc_exp, data.doc_fee, providerId]);
                } else {
                    await client.query('INSERT INTO doctors (provider_id, specialization, experience_years, consultation_fee) VALUES ($1, $2, $3, $4)', [providerId, data.doc_spec, data.doc_exp, data.doc_fee]);
                }
            } else if (role === 'Driver') {
                const drvCheck = await client.query('SELECT 1 FROM drivers WHERE provider_id = $1', [providerId]);
                if (drvCheck.rows.length > 0) {
                    await client.query('UPDATE drivers SET vehicle_number=$1, vehicle_type=$2, experience_years=$3 WHERE provider_id=$4', [data.vehicle_number, data.vehicle_type, data.drv_exp, providerId]);
                } else {
                    await client.query('INSERT INTO drivers (provider_id, vehicle_number, vehicle_type, experience_years) VALUES ($1, $2, $3, $4)', [providerId, data.vehicle_number, data.vehicle_type, data.drv_exp]);
                }
            } else if (role === 'Medicine Store') {
                const msCheck = await client.query('SELECT 1 FROM medicine_stores WHERE provider_id = $1', [providerId]);
                if (msCheck.rows.length > 0) {
                    await client.query('UPDATE medicine_stores SET owner_name=$1, opening_hours=$2 WHERE provider_id=$3', [data.ms_owner, data.ms_hours, providerId]);
                } else {
                    await client.query('INSERT INTO medicine_stores (provider_id, owner_name, opening_hours) VALUES ($1, $2, $3)', [providerId, data.ms_owner, data.ms_hours]);
                }
            } else if (role === 'Physiotherapy') {
                const phyCheck = await client.query('SELECT 1 FROM physiotherapists WHERE provider_id = $1', [providerId]);
                if (phyCheck.rows.length > 0) {
                    await client.query('UPDATE physiotherapists SET specialization=$1, experience_years=$2, consultation_fee=$3 WHERE provider_id=$4', [data.phy_spec, data.phy_exp, data.phy_fee, providerId]);
                } else {
                    await client.query('INSERT INTO physiotherapists (provider_id, specialization, experience_years, consultation_fee) VALUES ($1, $2, $3, $4)', [providerId, data.phy_spec, data.phy_exp, data.phy_fee]);
                }
            } else if (role === 'Old Age Home') {
                const oahCheck = await client.query('SELECT 1 FROM old_age_homes WHERE provider_id = $1', [providerId]);
                if (oahCheck.rows.length > 0) {
                    await client.query('UPDATE old_age_homes SET capacity=$1, facilities_description=$2, admin_name=$3 WHERE provider_id=$4', [data.oah_cap, data.oah_fac, data.oah_admin, providerId]);
                } else {
                    await client.query('INSERT INTO old_age_homes (provider_id, capacity, facilities_description, admin_name) VALUES ($1, $2, $3, $4)', [providerId, data.oah_cap, data.oah_fac, data.oah_admin]);
                }
            } else if (role === 'Lab Test') {
                const ltCheck = await client.query('SELECT 1 FROM lab_tests WHERE provider_id = $1', [providerId]);
                if (ltCheck.rows.length > 0) {
                    await client.query('UPDATE lab_tests SET lab_name=$1, accreditation=$2, home_sample_collection=$3, owner_name=$4 WHERE provider_id=$5', [data.lab_name, data.lt_acc, data.lt_home, data.lt_owner, providerId]);
                } else {
                    await client.query('INSERT INTO lab_tests (provider_id, lab_name, accreditation, home_sample_collection, owner_name) VALUES ($1, $2, $3, $4, $5)', [providerId, data.lab_name, data.lt_acc, data.lt_home, data.lt_owner]);
                }
            } else if (role === 'Home Care') {
                const hcCheck = await client.query('SELECT 1 FROM home_cares WHERE provider_id = $1', [providerId]);
                if (hcCheck.rows.length > 0) {
                    await client.query('UPDATE home_cares SET agency_name=$1, services_offered=$2, experience_years=$3 WHERE provider_id=$4', [data.hc_agency, data.hc_serv, data.hc_exp, providerId]);
                } else {
                    await client.query('INSERT INTO home_cares (provider_id, agency_name, services_offered, experience_years) VALUES ($1, $2, $3, $4)', [providerId, data.hc_agency, data.hc_serv, data.hc_exp]);
                }
            }
        }

        await client.query('COMMIT');
        res.json({ message: 'Full profile updated successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('SuperAdmin Update Full Profile Error:', err);
        res.status(500).json({ message: 'Error updating full profile' });
    } finally {
        client.release();
    }
});

export default router;
