import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get all products
router.get('/products', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM products ORDER BY name ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Fetch products error:', error);
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// Get inventory for a specific account (mappings account -> provider -> store)
router.get('/store/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Find store_id for this account_id
        const storeRes = await db.query(`
            SELECT ms.store_id 
            FROM medicine_stores ms
            JOIN service_providers sp ON ms.provider_id = sp.provider_id
            WHERE sp.account_id = $1
        `, [id]);

        if (storeRes.rowCount === 0) {
            return res.status(404).json({ message: 'Medicine store not found for this account' });
        }

        const storeId = storeRes.rows[0].store_id;

        const query = `
            SELECT i.*, p.name, p.description, p.manufacturer, p.is_prescription_required
            FROM inventory i
            JOIN products p ON i.product_id = p.product_id
            WHERE i.store_id = $1
        `;
        const result = await db.query(query, [storeId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Fetch inventory error:', error);
        res.status(500).json({ message: 'Error fetching inventory' });
    }
});

// Add new medicine to inventory
router.post('/add', async (req, res) => {
    const { accountId, name, description, manufacturer, price, stock, isPrescriptionRequired } = req.body;

    try {
        // 1. Find store_id
        const storeRes = await db.query(`
            SELECT ms.store_id 
            FROM medicine_stores ms
            JOIN service_providers sp ON ms.provider_id = sp.provider_id
            WHERE sp.account_id = $1
        `, [accountId]);

        if (storeRes.rowCount === 0) {
            return res.status(404).json({ message: 'Medicine store not found' });
        }
        const storeId = storeRes.rows[0].store_id;

        // 2. Find or Create Product
        let productRes = await db.query('SELECT product_id FROM products WHERE name = $1', [name]);
        let productId;

        if (productRes.rowCount === 0) {
            const newProduct = await db.query(
                'INSERT INTO products (name, description, manufacturer, base_price, is_prescription_required) VALUES ($1, $2, $3, $4, $5) RETURNING product_id',
                [name, description, manufacturer, price, isPrescriptionRequired || false]
            );
            productId = newProduct.rows[0].product_id;
        } else {
            productId = productRes.rows[0].product_id;
        }

        // 3. Add to Inventory
        const inventoryRes = await db.query(
            'INSERT INTO inventory (store_id, product_id, stock_level, store_price) VALUES ($1, $2, $3, $4) RETURNING *',
            [storeId, productId, stock, price]
        );

        res.status(201).json({ message: 'Medicine added to inventory', item: inventoryRes.rows[0] });
    } catch (error) {
        console.error('Add medicine error:', error);
        res.status(500).json({ message: 'Error adding medicine to inventory' });
    }
});

export default router;
