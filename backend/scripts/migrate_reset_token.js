import db from '../db.js';

async function migrate() {
    try {
        console.log('Starting migration to add reset token columns...');
        await db.query(`
            ALTER TABLE accounts 
            ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
            ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;
        `);
        console.log('Migration successful: Columns added.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit();
    }
}

migrate();
