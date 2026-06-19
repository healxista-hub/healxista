import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import db from '../db.js';
import { logActivity } from '../utils/activityLogger.js';
import { formatName } from '../utils/nameFormatter.js';
import crypto from 'crypto';
import { verifyUser } from '../middleware/authMiddleware.js';
import { sendPasswordResetEmail, sendWelcomeEmail, sendRegistrationOtp } from '../utils/emailService.js';

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET;

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 10,
    message: { message: 'Too many authentication attempts. Please try again after 15 minutes.' }
});

// Helper to get role ID from name
const getRoleIdByName = async (name) => {
    const result = await db.query('SELECT role_id FROM roles WHERE name = $1', [name]);
    return result.rows[0]?.role_id;
};

// Map role string to a standardized Role table name
const standardizeRole = (role) => {
    switch (role?.toLowerCase()) {
        case 'super_admin':
        case 'super admin': return 'Super Admin';
        case 'admin': return 'Admin';
        case 'patient':
        case 'user': return 'Patient';
        case 'doctor': return 'Doctor';
        case 'driver': return 'Driver';
        case 'medicine_store': return 'Medicine Store';
        case 'physiotherapy': return 'Physiotherapy';
        case 'old_age_home': return 'Old Age Home';
        case 'lab_test': return 'Lab Test';
        case 'home_care': return 'Home Care';
        default: return 'Patient';
    }
};

// Send OTP for Registration
router.post('/send-registration-otp', authLimiter, [
    body('email').isEmail().normalizeEmail(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Invalid email', errors: errors.array() });

    const { email } = req.body;
    
    try {
        // Check if email already registered
        const checkUser = await db.query('SELECT * FROM accounts WHERE email = $1', [email]);
        if (checkUser.rows.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes

        // Store OTP
        await db.query(`
            INSERT INTO otp_verifications (email, otp, expires_at) 
            VALUES ($1, $2, $3) 
            ON CONFLICT (email) 
            DO UPDATE SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at
        `, [email, otp, expiresAt]);

        // Send Email
        const emailSent = await sendRegistrationOtp(email, otp);
        if (!emailSent) {
            return res.status(500).json({ message: 'Failed to send OTP email. Please try again.' });
        }

        res.status(200).json({ message: 'OTP sent to your email successfully.' });
    } catch (err) {
        console.error('OTP Generation Error:', err);
        res.status(500).json({ message: 'Server error generating OTP' });
    }
});

// Register
router.post('/register', authLimiter, [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().escape().optional()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation error. Check your email or ensure password is at least 6 characters.', errors: errors.array() });
    }

    const {
        name, email, password, role, mobile, specialization, licenseNumber,
        address, street, city, state, zipCode, latitude, longitude,
        ownerName, adminName, vehicleNumber, vehicleType, experience,
        gender, dateOfBirth, bloodGroup, experienceYears, consultationFee,
        operatingHours, facilitiesAvailable, capacity,
        labName, accreditation, homeSampleCollection, agencyName, servicesOffered,
        otp
    } = req.body;

    if (!role) {
        return res.status(400).json({ message: 'Role is required' });
    }

    if (!otp) {
        return res.status(400).json({ message: 'OTP is required' });
    }

    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Check if email exists
        const checkUser = await client.query('SELECT * FROM accounts WHERE email = $1', [email]);
        if (checkUser.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Email already exists' });
        }

        // 1.5 Verify OTP
        const otpCheck = await client.query('SELECT * FROM otp_verifications WHERE email = $1 AND otp = $2 AND expires_at > NOW()', [email, otp]);
        if (otpCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Invalid or expired OTP. Please request a new one.' });
        }

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // 3. Get Role ID
        const roleName = standardizeRole(role);
        const roleId = await getRoleIdByName(roleName);
        if (!roleId) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Invalid role specified' });
        }

        // 4. Create Account and Generate Custom ID
        const accountResult = await client.query(
            'INSERT INTO accounts (email, password, role_id) VALUES ($1, $2, $3) RETURNING account_id',
            [email, hashedPassword, roleId]
        );
        const accountId = accountResult.rows[0].account_id;

        // Generate Custom ID (e.g., Guest-1001 or DOC-1001)
        let rolePrefix = roleName.substring(0, 3).toUpperCase();
        if (roleName === 'Patient') {
            rolePrefix = 'Guest';
        }
        const customId = `${rolePrefix}-${1000 + accountId}`;
        await client.query('UPDATE accounts SET custom_id = $1 WHERE account_id = $2', [customId, accountId]);

        // 5. Create Profile
        const [firstName, ...lastNameParts] = (name || '').split(' ');
        const lastName = lastNameParts.join(' ');
        
        await client.query(
            'INSERT INTO profiles (account_id, first_name, last_name, gender, date_of_birth, mobile, blood_group) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [accountId, firstName, lastName, gender, dateOfBirth || null, mobile, bloodGroup]
        );

        // 6. Create Address if provided
        if (address || street || city) {
            await client.query(
                'INSERT INTO addresses (account_id, street, city, state, zip_code, latitude, longitude) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [accountId, street || address, city, state, zipCode, latitude, longitude]
            );
        }

        // 7. specialized Provider logic
        if (['Doctor', 'Physiotherapy', 'Medicine Store', 'Old Age Home', 'Driver', 'Lab Test', 'Home Care'].includes(roleName)) {
            const spResult = await client.query(
                'INSERT INTO service_providers (account_id, provider_type, license_number) VALUES ($1, $2, $3) RETURNING provider_id',
                [accountId, roleName, licenseNumber]
            );
            const providerId = spResult.rows[0].provider_id;

            if (roleName === 'Doctor') {
                await client.query(
                    'INSERT INTO doctors (provider_id, specialization, experience_years, consultation_fee) VALUES ($1, $2, $3, $4)',
                    [providerId, specialization, experienceYears, consultationFee]
                );
            } else if (roleName === 'Physiotherapy') {
                await client.query(
                    'INSERT INTO physiotherapists (provider_id, specialization, experience_years, consultation_fee) VALUES ($1, $2, $3, $4)',
                    [providerId, specialization, experienceYears, consultationFee]
                );
            } else if (roleName === 'Medicine Store') {
                await client.query(
                    'INSERT INTO medicine_stores (provider_id, owner_name, opening_hours) VALUES ($1, $2, $3)',
                    [providerId, ownerName, operatingHours]
                );
            } else if (roleName === 'Old Age Home') {
                await client.query(
                    'INSERT INTO old_age_homes (provider_id, capacity, facilities_description, admin_name) VALUES ($1, $2, $3, $4)',
                    [providerId, capacity, facilitiesAvailable, adminName]
                );
            } else if (roleName === 'Driver') {
                await client.query(
                    'INSERT INTO drivers (provider_id, license_number, vehicle_number, vehicle_type, experience_years) VALUES ($1, $2, $3, $4, $5)',
                    [providerId, licenseNumber, vehicleNumber, vehicleType, experience]
                );
            } else if (roleName === 'Lab Test') {
                await client.query(
                    'INSERT INTO lab_tests (provider_id, lab_name, accreditation, home_sample_collection, owner_name) VALUES ($1, $2, $3, $4, $5)',
                    [providerId, labName, accreditation, homeSampleCollection === true || homeSampleCollection === 'true', ownerName]
                );
            } else if (roleName === 'Home Care') {
                await client.query(
                    'INSERT INTO home_cares (provider_id, agency_name, services_offered, experience_years) VALUES ($1, $2, $3, $4)',
                    [providerId, agencyName, servicesOffered, experienceYears]
                );
            }
        }

        // 8. Assign Role in user_roles
        await client.query('INSERT INTO user_roles (account_id, role_id) VALUES ($1, $2)', [accountId, roleId]);

        await client.query('DELETE FROM otp_verifications WHERE email = $1', [email]);

        await client.query('COMMIT');

        const token = jwt.sign({ id: accountId, email, role: roleName, customId: customId }, SECRET_KEY, { expiresIn: '2h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 2 * 60 * 60 * 1000,
            path: '/'
        });

        // Log the new registration
        await logActivity(req.app.get('io'), {
            accountId,
            targetRole: 'Admin',
            actionType: 'New Registration',
            title: 'New Platform Member',
            description: `${name} has joined Healxista as a ${roleName}.`,
            statusTheme: 'success'
        });

        const formattedName = formatName(firstName, lastName, roleName, gender) || name;

        // Send Welcome Email asynchronously so it doesn't block the response
        sendWelcomeEmail(email, name || formattedName || 'User', roleName).catch(err => console.error("Welcome email failed", err));

        res.status(201).json({ 
            message: 'User registered successfully', 
            user: { id: accountId, name: formattedName, email, role: roleName, customId } 
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    } finally {
        client.release();
    }
});

// Login
router.post('/login', authLimiter, [
    body('email').isEmail().normalizeEmail(),
    body('password').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Valid email and password required.' });
    }

    const { email, password, role } = req.body;

    try {
        const result = await db.query(
            `SELECT a.*, r.name as role_name, p.first_name, p.last_name, p.profile_image_url, p.gender, p.is_sharing_location,
                    d.vehicle_number 
             FROM accounts a 
             JOIN roles r ON a.role_id = r.role_id 
             LEFT JOIN profiles p ON a.account_id = p.account_id 
             LEFT JOIN service_providers sp ON a.account_id = sp.account_id
             LEFT JOIN drivers d ON sp.provider_id = d.provider_id
             WHERE a.email = $1 AND a.deleted_at IS NULL`,
            [email]
        );

        const account = result.rows[0];

        if (!account) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Restrict login to the designated role portal
        if (role) {
            const expectedRole = standardizeRole(role);
            const actualRole = standardizeRole(account.role_name);

            if (expectedRole !== actualRole) {
                return res.status(403).json({ 
                    message: `Unauthorized access: You are registered as a ${actualRole}. Please use the correct login portal.` 
                });
            }
        }

        const isMatch = await bcrypt.compare(password, account.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: account.account_id, email: account.email, role: account.role_name, customId: account.custom_id }, 
            SECRET_KEY, 
            { expiresIn: '2h' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 2 * 60 * 60 * 1000,
            path: '/'
        });

        res.json({ 
            message: 'Login successful', 
            user: { 
                id: account.account_id, 
                name: formatName(account.first_name, account.last_name, account.role_name, account.gender) || account.email, 
                email: account.email, 
                role: account.role_name,
                customId: account.custom_id,
                profilePicture: account.profile_image_url,
                isSharingLocation: account.is_sharing_location,
                vehicleNumber: account.vehicle_number
            } 
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    res.clearCookie('token', { path: '/' });
    res.json({ message: 'Logged out successfully' });
});

// Change Password
router.put('/change-password', verifyUser, [
    body('currentPassword').exists(),
    body('newPassword').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation error. New password must be at least 6 characters.', errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const accountId = req.user.id;

    try {
        const result = await db.query('SELECT password FROM accounts WHERE account_id = $1', [accountId]);
        const account = result.rows[0];

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, account.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await db.query('UPDATE accounts SET password = $1 WHERE account_id = $2', [hashedPassword, accountId]);

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change Password Error:', error);
        res.status(500).json({ message: 'Server error during password change' });
    }
});

// Forgot Password
router.post('/forgot-password', authLimiter, [
    body('email').isEmail().normalizeEmail()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Valid email required.' });
    }

    const { email } = req.body;

    try {
        const result = await db.query('SELECT accounts.account_id, accounts.email, profiles.first_name FROM accounts LEFT JOIN profiles ON accounts.account_id = profiles.account_id WHERE accounts.email = $1', [email]);
        const account = result.rows[0];

        if (!account) {
            return res.status(404).json({ message: 'You are not a registered user.' });
        }

        // Generate token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = await bcrypt.hash(resetToken, 12);
        
        // Expiry (1 hour)
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 1);

        // Update DB
        await db.query(
            'UPDATE accounts SET reset_token = $1, reset_token_expires = $2 WHERE account_id = $3',
            [hashedToken, expiry, account.account_id]
        );

        // Send Email
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
        
        const emailSent = await sendPasswordResetEmail(email, resetUrl);

        if (!emailSent) {
            // Revert DB change if email failed
            await db.query('UPDATE accounts SET reset_token = NULL, reset_token_expires = NULL WHERE account_id = $1', [account.account_id]);
            return res.status(500).json({ message: 'Failed to send password reset email. Please try again later.' });
        }

        res.json({ message: 'Password reset link has been sent to your email.' });
    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ message: 'Server error during password reset request' });
    }
});

// Reset Password
router.post('/reset-password', authLimiter, [
    body('email').isEmail().normalizeEmail(),
    body('token').exists(),
    body('newPassword').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation error. Check token and new password length.', errors: errors.array() });
    }

    const { email, token, newPassword } = req.body;

    try {
        const result = await db.query('SELECT account_id, reset_token, reset_token_expires FROM accounts WHERE email = $1', [email]);
        const account = result.rows[0];

        if (!account || !account.reset_token || !account.reset_token_expires) {
            return res.status(400).json({ message: 'Invalid or expired password reset token' });
        }

        // Check expiry
        if (new Date() > new Date(account.reset_token_expires)) {
            return res.status(400).json({ message: 'Password reset token has expired' });
        }

        // Verify token
        const isMatch = await bcrypt.compare(token, account.reset_token);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid or expired password reset token' });
        }

        // Update password
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await db.query(
            'UPDATE accounts SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE account_id = $2',
            [hashedPassword, account.account_id]
        );

        res.json({ message: 'Password has been reset successfully. You can now log in.' });
    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ message: 'Server error during password reset' });
    }
});

export default router;

