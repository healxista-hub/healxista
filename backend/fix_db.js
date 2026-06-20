import db from './db.js';

async function fixDatabase() {
    console.log('Adding missing reset_token columns to accounts table...');
    try {
        await db.query(`
            ALTER TABLE accounts 
            ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
            ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;
        `);
        console.log('✅ SUCCESS! The database is now ready for Forgot Password.');
    } catch (error) {
        console.error('❌ Failed to update database:', error.message);
    } finally {
        process.exit(0);
    }
}

fixDatabase();
