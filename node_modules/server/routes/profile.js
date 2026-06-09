import express from 'express';
import db from '../db.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { formatName } from '../utils/nameFormatter.js';
import { verifyUser } from '../middleware/authMiddleware.js';
import { getUploadMiddleware, attachRelativePath } from '../utils/storageHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const upload = getUploadMiddleware();

// GET /api/profile/:id - Get full profile details (account_id)
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            SELECT a.email, a.role_id, a.custom_id, r.name as role_name, 
                   CONCAT(p.first_name, ' ', p.last_name) AS name, p.*, p.cover_image_url,
                   addr.street, addr.city, addr.state, addr.zip_code, addr.latitude, addr.longitude,
                   sp.license_number AS "licenseNumber",
                   COALESCE(doc.specialization, phy.specialization) AS specialization,
                   COALESCE(doc.experience_years, phy.experience_years) AS "experienceYears",
                   COALESCE(doc.consultation_fee, phy.consultation_fee) AS "consultationFee",
                   dr.vehicle_number AS "vehicleNumber",
                   dr.vehicle_type AS "vehicleType",
                   dr.experience_years AS experience,
                   COALESCE(ms.owner_name, lt.owner_name) AS "ownerName",
                   ms.opening_hours AS "operatingHours",
                   oah.capacity AS capacity,
                   oah.facilities_description AS "facilitiesAvailable",
                   oah.admin_name AS "adminName",
                   lt.lab_name AS "lab_name", lt.accreditation AS "accreditation", lt.home_sample_collection AS "home_sample_collection",
                   hc.agency_name AS "agencyName", hc.services_offered AS "servicesOffered", hc.experience_years AS "homeCareExperience",
                   addr.street AS address,
                   sp.is_online
            FROM accounts a
            JOIN roles r ON a.role_id = r.role_id
            LEFT JOIN profiles p ON a.account_id = p.account_id
            LEFT JOIN addresses addr ON a.account_id = addr.account_id
            LEFT JOIN service_providers sp ON a.account_id = sp.account_id
            LEFT JOIN doctors doc ON sp.provider_id = doc.provider_id
            LEFT JOIN physiotherapists phy ON sp.provider_id = phy.provider_id
            LEFT JOIN drivers dr ON sp.provider_id = dr.provider_id
            LEFT JOIN medicine_stores ms ON sp.provider_id = ms.provider_id
            LEFT JOIN old_age_homes oah ON sp.provider_id = oah.provider_id
            LEFT JOIN lab_tests lt ON sp.provider_id = lt.provider_id
            LEFT JOIN home_cares hc ON sp.provider_id = hc.provider_id
            WHERE a.account_id = $1 AND a.deleted_at IS NULL
        `;
        const result = await db.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.rows[0];
        user.name = formatName(user.first_name, user.last_name, user.role_name, user.gender) || user.name;
        res.json(user);
    } catch (error) {
        console.error('Fetch profile error:', error);
        res.status(500).json({ message: 'Error fetching profile details' });
    }
});

// Backward compatibility for /api/profile/:role/:id
router.get('/:role/:id', async (req, res) => {
    // Just redirect to the main GET route ignoring the role
    const { id } = req.params;
    try {
        const query = `
            SELECT a.email, a.role_id, a.custom_id, r.name as role_name, 
                   CONCAT(p.first_name, ' ', p.last_name) AS name, p.*, p.cover_image_url,
                   addr.street, addr.city, addr.state, addr.zip_code, addr.latitude, addr.longitude,
                   sp.license_number AS "licenseNumber",
                   COALESCE(doc.specialization, phy.specialization) AS specialization,
                   COALESCE(doc.experience_years, phy.experience_years) AS "experienceYears",
                   COALESCE(doc.consultation_fee, phy.consultation_fee) AS "consultationFee",
                   dr.vehicle_number AS "vehicleNumber",
                   dr.vehicle_type AS "vehicleType",
                   dr.experience_years AS experience,
                   COALESCE(ms.owner_name, lt.owner_name) AS "ownerName",
                   ms.opening_hours AS "operatingHours",
                   oah.capacity AS capacity,
                   oah.facilities_description AS "facilitiesAvailable",
                   oah.admin_name AS "adminName",
                   lt.lab_name AS "lab_name", lt.accreditation AS "accreditation", lt.home_sample_collection AS "home_sample_collection",
                   hc.agency_name AS "agencyName", hc.services_offered AS "servicesOffered", hc.experience_years AS "homeCareExperience",
                   addr.street AS address,
                   sp.is_online
            FROM accounts a
            JOIN roles r ON a.role_id = r.role_id
            LEFT JOIN profiles p ON a.account_id = p.account_id
            LEFT JOIN addresses addr ON a.account_id = addr.account_id
            LEFT JOIN service_providers sp ON a.account_id = sp.account_id
            LEFT JOIN doctors doc ON sp.provider_id = doc.provider_id
            LEFT JOIN physiotherapists phy ON sp.provider_id = phy.provider_id
            LEFT JOIN drivers dr ON sp.provider_id = dr.provider_id
            LEFT JOIN medicine_stores ms ON sp.provider_id = ms.provider_id
            LEFT JOIN old_age_homes oah ON sp.provider_id = oah.provider_id
            LEFT JOIN lab_tests lt ON sp.provider_id = lt.provider_id
            LEFT JOIN home_cares hc ON sp.provider_id = hc.provider_id
            WHERE a.account_id = $1
        `;
        const result = await db.query(query, [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
        const user = result.rows[0];
        user.name = formatName(user.first_name, user.last_name, user.role_name, user.gender) || user.name;
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile' });
    }
});

// PUT /api/profile/:id - Update profile details (with file uploads)
router.put('/:id', verifyUser, upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
    { name: 'document', maxCount: 1 }
]), attachRelativePath, async (req, res) => {
    const { id } = req.params;

    // Authorization check: User can only update their own profile unless they are an admin
    if (req.user.id !== parseInt(id) && req.user.role?.toLowerCase() !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: You can only update your own profile.' });
    }

    const updates = req.body;

    // Standardized relative paths from storageHelper
    const profilePictureUrl = req.files?.['profilePicture']?.[0]?.relative_path || null;
    const coverImageUrl = req.files?.['coverImage']?.[0]?.relative_path || null;
    const documentUrl = req.files?.['document']?.[0]?.relative_path || null;

    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Update Profile
        let profileSegments = [];
        let profileValues = [];
        let pIdx = 1;

        if (updates.name && (!updates.firstName && !updates.first_name && !updates.lastName && !updates.last_name)) {
            const parts = updates.name.split(' ');
            updates.first_name = parts[0];
            updates.last_name = parts.slice(1).join(' ');
        }

        const profileFields = {
            firstName: 'first_name',
            first_name: 'first_name',
            lastName: 'last_name',
            last_name: 'last_name',
            gender: 'gender',
            mobile: 'mobile',
            dateOfBirth: 'date_of_birth',
            date_of_birth: 'date_of_birth',
            bloodGroup: 'blood_group',
            blood_group: 'blood_group',
            bio: 'bio',
            is_sharing_location: 'is_sharing_location',
            last_latitude: 'last_latitude',
            last_longitude: 'last_longitude'
        };

        for (const [key, dbCol] of Object.entries(profileFields)) {
            if (updates[key] !== undefined) {
                profileSegments.push(`${dbCol} = $${pIdx++}`);
                profileValues.push(updates[key]);
            }
        }

        if (profilePictureUrl) {
            profileSegments.push(`profile_image_url = $${pIdx++}`);
            profileValues.push(profilePictureUrl);
        }
        if (coverImageUrl) {
            profileSegments.push(`cover_image_url = $${pIdx++}`);
            profileValues.push(coverImageUrl);
        }
        if (documentUrl) {
            profileSegments.push(`document_url = $${pIdx++}`);
            profileValues.push(documentUrl);
        }

        if (profileSegments.length > 0) {
            profileValues.push(id);
            await client.query(
                `UPDATE profiles SET ${profileSegments.join(', ')} WHERE account_id = $${pIdx}`,
                profileValues
            );
        }

        // 2. Update Address
        let addressSegments = [];
        let addressValues = [];
        let aIdx = 1;

        const addressFields = {
            street: 'street',
            address: 'street',
            city: 'city',
            state: 'state',
            zipCode: 'zip_code',
            zip_code: 'zip_code',
            latitude: 'latitude',
            longitude: 'longitude'
        };

        for (const [key, dbCol] of Object.entries(addressFields)) {
            if (updates[key] !== undefined) {
                addressSegments.push(`${dbCol} = $${aIdx++}`);
                addressValues.push(updates[key]);
            }
        }

        if (addressSegments.length > 0) {
            // Check if address exists first
            const addrExists = await client.query('SELECT address_id FROM addresses WHERE account_id = $1', [id]);
            if (addrExists.rows.length > 0) {
                addressValues.push(id);
                await client.query(
                    `UPDATE addresses SET ${addressSegments.join(', ')} WHERE account_id = $${aIdx}`,
                    addressValues
                );
            } else {
                // Insert new address
                const fields = Object.keys(addressFields).filter(k => updates[k] !== undefined).map(k => addressFields[k]);
                const placeholders = fields.map((_, i) => `$${i + 2}`);
                const values = fields.map(k => updates[Object.keys(addressFields).find(key => addressFields[key] === k)]);
                await client.query(
                    `INSERT INTO addresses (account_id, ${fields.join(', ')}) VALUES ($1, ${placeholders.join(', ')})`,
                    [id, ...values]
                );
            }
        }

        // 3. Update Service Provider & Specific Tables
        const spExists = await client.query('SELECT provider_id, provider_type FROM service_providers WHERE account_id = $1', [id]);
        if (spExists.rows.length > 0) {
            const providerId = spExists.rows[0].provider_id;
            const providerType = spExists.rows[0].provider_type;

            // Update service_providers (licenseNumber)
            if (updates.licenseNumber !== undefined) {
                await client.query('UPDATE service_providers SET license_number = $1 WHERE provider_id = $2', [updates.licenseNumber, providerId]);
            }

            // Update specific tables
            if (providerType === 'Doctor') {
                if (updates.specialization !== undefined) await client.query('UPDATE doctors SET specialization = $1 WHERE provider_id = $2', [updates.specialization, providerId]);
                if (updates.experienceYears !== undefined) await client.query('UPDATE doctors SET experience_years = $1 WHERE provider_id = $2', [updates.experienceYears, providerId]);
                if (updates.consultationFee !== undefined) await client.query('UPDATE doctors SET consultation_fee = $1 WHERE provider_id = $2', [updates.consultationFee, providerId]);
            } else if (providerType === 'Physiotherapy') {
                if (updates.specialization !== undefined) await client.query('UPDATE physiotherapists SET specialization = $1 WHERE provider_id = $2', [updates.specialization, providerId]);
                if (updates.experienceYears !== undefined) await client.query('UPDATE physiotherapists SET experience_years = $1 WHERE provider_id = $2', [updates.experienceYears, providerId]);
                if (updates.consultationFee !== undefined) await client.query('UPDATE physiotherapists SET consultation_fee = $1 WHERE provider_id = $2', [updates.consultationFee, providerId]);
            } else if (providerType === 'Driver') {
                if (updates.vehicleNumber !== undefined) await client.query('UPDATE drivers SET vehicle_number = $1 WHERE provider_id = $2', [updates.vehicleNumber, providerId]);
                if (updates.vehicleType !== undefined) await client.query('UPDATE drivers SET vehicle_type = $1 WHERE provider_id = $2', [updates.vehicleType, providerId]);
                if (updates.experience !== undefined) await client.query('UPDATE drivers SET experience_years = $1 WHERE provider_id = $2', [updates.experience, providerId]);
            } else if (providerType === 'Medicine Store') {
                if (updates.ownerName !== undefined) await client.query('UPDATE medicine_stores SET owner_name = $1 WHERE provider_id = $2', [updates.ownerName, providerId]);
                if (updates.operatingHours !== undefined) await client.query('UPDATE medicine_stores SET opening_hours = $1 WHERE provider_id = $2', [updates.operatingHours, providerId]);
            } else if (providerType === 'Old Age Home') {
                if (updates.capacity !== undefined) await client.query('UPDATE old_age_homes SET capacity = $1 WHERE provider_id = $2', [updates.capacity, providerId]);
                if (updates.facilitiesAvailable !== undefined) await client.query('UPDATE old_age_homes SET facilities_description = $1 WHERE provider_id = $2', [updates.facilitiesAvailable, providerId]);
                if (updates.adminName !== undefined) await client.query('UPDATE old_age_homes SET admin_name = $1 WHERE provider_id = $2', [updates.adminName, providerId]);
            } else if (providerType === 'Lab Test') {
                if (updates.lab_name !== undefined) await client.query('UPDATE lab_tests SET lab_name = $1 WHERE provider_id = $2', [updates.lab_name, providerId]);
                if (updates.accreditation !== undefined) await client.query('UPDATE lab_tests SET accreditation = $1 WHERE provider_id = $2', [updates.accreditation, providerId]);
                if (updates.ownerName !== undefined) await client.query('UPDATE lab_tests SET owner_name = $1 WHERE provider_id = $2', [updates.ownerName, providerId]);
                if (updates.home_sample_collection !== undefined) {
                    const hsc = updates.home_sample_collection === 'true' || updates.home_sample_collection === true;
                    await client.query('UPDATE lab_tests SET home_sample_collection = $1 WHERE provider_id = $2', [hsc, providerId]);
                }
            } else if (providerType === 'Home Care') {
                if (updates.agencyName !== undefined) await client.query('UPDATE home_cares SET agency_name = $1 WHERE provider_id = $2', [updates.agencyName, providerId]);
                if (updates.servicesOffered !== undefined) await client.query('UPDATE home_cares SET services_offered = $1 WHERE provider_id = $2', [updates.servicesOffered, providerId]);
                if (updates.experienceYears !== undefined) await client.query('UPDATE home_cares SET experience_years = $1 WHERE provider_id = $2', [updates.experienceYears, providerId]);
            }
        }

        await client.query('COMMIT');

        // Fetch updated result
        const finalResult = await db.query(
            `SELECT a.email, a.custom_id, r.name as role_name, CONCAT(p.first_name, ' ', p.last_name) AS name, p.*, addr.street, addr.city, addr.state, addr.zip_code, sp.license_number AS "licenseNumber",
             COALESCE(doc.specialization, phy.specialization) AS specialization, 
             COALESCE(doc.experience_years, phy.experience_years) AS "experienceYears",
             COALESCE(doc.consultation_fee, phy.consultation_fee) AS "consultationFee",
             dr.vehicle_number AS "vehicleNumber", dr.vehicle_type AS "vehicleType", dr.experience_years AS experience, 
             COALESCE(ms.owner_name, lt.owner_name) AS "ownerName", ms.opening_hours AS "operatingHours",
             oah.capacity AS capacity, oah.facilities_description AS "facilitiesAvailable", oah.admin_name AS "adminName", addr.street AS address,
             lt.lab_name AS "lab_name", lt.accreditation AS "accreditation", lt.home_sample_collection AS "home_sample_collection",
             hc.agency_name AS "agencyName", hc.services_offered AS "servicesOffered", hc.experience_years AS "homeCareExperience",
             p.is_sharing_location, p.last_latitude, p.last_longitude
             FROM accounts a 
             JOIN roles r ON a.role_id = r.role_id
             JOIN profiles p ON a.account_id = p.account_id 
             LEFT JOIN addresses addr ON p.account_id = addr.account_id 
             LEFT JOIN service_providers sp ON p.account_id = sp.account_id
             LEFT JOIN doctors doc ON sp.provider_id = doc.provider_id
             LEFT JOIN physiotherapists phy ON sp.provider_id = phy.provider_id
             LEFT JOIN drivers dr ON sp.provider_id = dr.provider_id
             LEFT JOIN medicine_stores ms ON sp.provider_id = ms.provider_id
             LEFT JOIN old_age_homes oah ON sp.provider_id = oah.provider_id
             LEFT JOIN lab_tests lt ON sp.provider_id = lt.provider_id
             LEFT JOIN home_cares hc ON sp.provider_id = hc.provider_id
             WHERE a.account_id = $1`, [id]
        );

        const updatedUser = finalResult.rows[0];
        updatedUser.name = formatName(updatedUser.first_name, updatedUser.last_name, updatedUser.role_name, updatedUser.gender) || updatedUser.name;
        res.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Error updating profile details' });
    } finally {
        client.release();
    }
});

// Tasks retrieval (Assigned to provider) - with and without role in path
router.get(['/:id/tasks', '/:role/:id/tasks'], async (req, res) => {
    const { id } = req.params;

    try {
        // Find provider_id for this account_id
        const providerRes = await db.query('SELECT provider_id FROM service_providers WHERE account_id = $1', [id]);
        if (providerRes.rows.length === 0) {
            return res.json([]); // Not a provider
        }
        const providerId = providerRes.rows[0].provider_id;

        const query = `
            SELECT b.*, p.first_name as user_first_name, p.last_name as user_last_name, p.gender as user_gender, p.profile_image_url as user_profile_image, p.cover_image_url as user_cover_image_url 
            FROM bookings b
            LEFT JOIN profiles p ON b.user_id = p.account_id
            WHERE b.provider_id = $1 
            ORDER BY b.created_at DESC
        `;
        const result = await db.query(query, [providerId]);

        res.json(result.rows.map(row => ({
            ...row,
            patientName: formatName(row.user_first_name, row.user_last_name, 'Patient', row.user_gender) || row.patient_name,
            profileImage: row.user_profile_image
        })));
    } catch (error) {
        console.error('Fetch tasks error:', error);
        res.status(500).json({ message: 'Error fetching assigned tasks' });
    }
});

// Update task status
router.put('/tasks/:taskId/status', verifyUser, async (req, res) => {
    const { taskId } = req.params;
    const { status } = req.body;

    try {
        // Basic authorization check: verify the task belongs to the user
        const checkRes = await db.query(`
            SELECT b.booking_id 
            FROM bookings b
            LEFT JOIN service_providers sp ON b.provider_id = sp.provider_id
            WHERE b.booking_id = $1 AND (b.user_id = $2 OR sp.account_id = $2)
        `, [taskId, req.user.id]);

        if (checkRes.rows.length === 0 && req.user.role?.toLowerCase() !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: Not authorized to update this task' });
        }

        await db.query('UPDATE bookings SET status = $1 WHERE booking_id = $2', [status, taskId]);
        res.json({ message: 'Task status updated successfully' });
    } catch (error) {
        console.error('Update task status error:', error);
        res.status(500).json({ message: 'Error updating task status' });
    }
});

// Toggle Provider Availability
router.put('/:id/availability', verifyUser, async (req, res) => {
    const { id } = req.params;
    const { is_online } = req.body;

    if (req.user.id !== parseInt(id) && req.user.role?.toLowerCase() !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: You can only update your own availability.' });
    }

    if (typeof is_online !== 'boolean') {
        return res.status(400).json({ message: 'is_online must be a boolean' });
    }

    try {
        const result = await db.query(
            'UPDATE service_providers SET is_online = $1 WHERE account_id = $2 RETURNING is_online',
            [is_online, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Provider profile not found for this user.' });
        }

        res.json({ message: 'Availability updated successfully', is_online: result.rows[0].is_online });
    } catch (error) {
        console.error('Update availability error:', error);
        res.status(500).json({ message: 'Error updating availability status' });
    }
});

// Toggle Location Sharing
router.put('/:id/location-sharing', verifyUser, async (req, res) => {
    const { id } = req.params;
    const { is_sharing_location } = req.body;

    if (req.user.id !== parseInt(id) && req.user.role?.toLowerCase() !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: You can only update your own location sharing status.' });
    }

    if (typeof is_sharing_location !== 'boolean') {
        return res.status(400).json({ message: 'is_sharing_location must be a boolean' });
    }

    try {
        const result = await db.query(
            'UPDATE profiles SET is_sharing_location = $1 WHERE account_id = $2 RETURNING is_sharing_location',
            [is_sharing_location, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json({ 
            message: 'Location sharing updated successfully', 
            is_sharing_location: result.rows[0].is_sharing_location 
        });
    } catch (error) {
        console.error('Update location sharing error:', error);
        res.status(500).json({ message: 'Error updating location sharing status' });
    }
});

export default router;
