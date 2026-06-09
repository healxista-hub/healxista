import express from 'express';
import db from '../db.js';
import { formatName } from '../utils/nameFormatter.js';

const router = express.Router();

// Helper to get providers by type
const getProvidersByType = async (type) => {
    let specializedJoin = '';
    let extraCols = '';

    switch (type) {
        case 'Doctor':
            specializedJoin = 'LEFT JOIN doctors d ON sp.provider_id = d.provider_id';
            extraCols = ', d.specialization, d.consultation_fee';
            break;
        case 'Physiotherapy':
            specializedJoin = 'LEFT JOIN physiotherapists d ON sp.provider_id = d.provider_id';
            extraCols = ', d.specialization, d.consultation_fee';
            break;
        case 'Medicine Store':
            specializedJoin = 'LEFT JOIN medicine_stores d ON sp.provider_id = d.provider_id';
            extraCols = ', d.owner_name, d.opening_hours';
            break;
        case 'Old Age Home':
            specializedJoin = 'LEFT JOIN old_age_homes d ON sp.provider_id = d.provider_id';
            extraCols = ', d.capacity, d.facilities_description';
            break;
        case 'Driver':
            specializedJoin = 'LEFT JOIN drivers d ON sp.provider_id = d.provider_id';
            extraCols = ', d.vehicle_number, d.vehicle_type, d.experience_years as experience';
            break;
        case 'Lab Test':
            specializedJoin = 'LEFT JOIN lab_tests d ON sp.provider_id = d.provider_id';
            extraCols = ', d.lab_name, d.accreditation, d.home_sample_collection, d.owner_name';
            break;
        case 'Home Care':
            specializedJoin = 'LEFT JOIN home_cares d ON sp.provider_id = d.provider_id';
            extraCols = ', d.agency_name, d.services_offered, d.experience_years';
            break;
    }

    const query = `
        SELECT sp.provider_id, a.account_id, p.first_name, p.last_name, p.gender, r.name as role_name, p.profile_image_url, p.cover_image_url, p.bio, p.document_url, p.mobile, a.custom_id,
               COALESCE(addr.street || ', ' || addr.city, addr.city, addr.street) as address,
               sp.license_number, sp.overall_rating, sp.is_verified, sp.is_online
               ${extraCols}
        FROM service_providers sp
        JOIN accounts a ON sp.account_id = a.account_id
        JOIN roles r ON a.role_id = r.role_id
        JOIN profiles p ON sp.account_id = p.account_id
        LEFT JOIN addresses addr ON sp.account_id = addr.account_id
        ${specializedJoin}
        WHERE sp.provider_type = $1 AND sp.status = 'Active' AND sp.is_verified = true
    `;
    const res = await db.query(query, [type]);
    return res.rows.map(row => ({
        ...row,
        name: formatName(row.first_name, row.last_name, row.role_name, row.gender) || 'Provider'
    }));
};

// GET /api/public/doctors
router.get('/doctors', async (req, res) => {
    try {
        const doctors = await getProvidersByType('Doctor');
        res.json(doctors);
    } catch (error) {
        console.error('Public doctors error:', error);
        res.status(500).json({ message: 'Error fetching doctors' });
    }
});

// GET /api/public/ambulances
router.get('/ambulances', async (req, res) => {
    try {
        const ambulances = await getProvidersByType('Driver');
        res.json(ambulances);
    } catch (error) {
        console.error('Public ambulances error:', error);
        res.status(500).json({ message: 'Error fetching ambulances' });
    }
});

// GET /api/public/medicines
router.get('/medicines', async (req, res) => {
    try {
        const stores = await getProvidersByType('Medicine Store');
        res.json(stores);
    } catch (error) {
        console.error('Public medicines error:', error);
        res.status(500).json({ message: 'Error fetching medicine stores' });
    }
});

// GET /api/public/medicines/all (Aggregate products from all stores)
router.get('/medicines/all', async (req, res) => {
    try {
        const query = `
            SELECT i.inventory_id, i.stock_level, i.store_price as price, 
                   p.name, p.description, p.manufacturer, p.is_prescription_required,
                   ms.store_id, prof.first_name as store_name
            FROM inventory i
            JOIN products p ON i.product_id = p.product_id
            JOIN medicine_stores ms ON i.store_id = ms.store_id
            JOIN service_providers sp ON ms.provider_id = sp.provider_id
            JOIN profiles prof ON sp.account_id = prof.account_id
            WHERE sp.is_verified = true AND sp.status = 'Active'
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Public all medicines error:', error);
        res.status(500).json({ message: 'Error fetching medicines' });
    }
});

// GET /api/public/physiotherapy
router.get('/physiotherapy', async (req, res) => {
    try {
        const physios = await getProvidersByType('Physiotherapy');
        res.json(physios);
    } catch (error) {
        console.error('Public physio error:', error);
        res.status(500).json({ message: 'Error fetching physiotherapy' });
    }
});

// GET /api/public/old-age-homes
router.get('/old-age-homes', async (req, res) => {
    try {
        const homes = await getProvidersByType('Old Age Home');
        res.json(homes);
    } catch (error) {
        console.error('Public homes error:', error);
        res.status(500).json({ message: 'Error fetching old age homes' });
    }
});

// GET /api/public/lab-tests
router.get('/lab-tests', async (req, res) => {
    try {
        const labs = await getProvidersByType('Lab Test');
        res.json(labs);
    } catch (error) {
        console.error('Public lab tests error:', error);
        res.status(500).json({ message: 'Error fetching lab tests' });
    }
});

// GET /api/public/home-cares
router.get('/home-cares', async (req, res) => {
    try {
        const cares = await getProvidersByType('Home Care');
        res.json(cares);
    } catch (error) {
        console.error('Public home cares error:', error);
        res.status(500).json({ message: 'Error fetching home cares' });
    }
});


// GET /api/public/users (Actually Patients)
router.get('/users', async (req, res) => {
    try {
        const query = `
            SELECT a.account_id, a.custom_id, p.first_name, p.last_name, p.profile_image_url, p.cover_image_url, p.gender, r.name as role_name, p.bio
            FROM accounts a
            JOIN profiles p ON a.account_id = p.account_id
            JOIN roles r ON a.role_id = r.role_id
            WHERE r.name = 'Patient' AND a.deleted_at IS NULL
        `;
        const result = await db.query(query);
        res.json(result.rows.map(row => ({
            ...row,
            name: formatName(row.first_name, row.last_name, row.role_name, row.gender) || 'Patient'
        })));
    } catch (error) {
        console.error('Public users error:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

export default router;
