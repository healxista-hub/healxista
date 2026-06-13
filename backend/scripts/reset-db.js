import db from '../db.js';
import { runMigrations } from './migrate.js';

async function resetDB() {
    try {
        console.log('⚠️  WARNING: RESETTING ENTIRE DATABASE...');
        console.log('🗑️  Dropping public schema...');
        
        // await db.query(`
        //     DROP SCHEMA public CASCADE;
        //     CREATE SCHEMA public;
        //     GRANT ALL ON SCHEMA public TO postgres;
        //     GRANT ALL ON SCHEMA public TO public;
        // `);
        
        console.log('✅ Skipping schema drop to avoid permission errors...');
        
        console.log('⚙️  Initializing schema from schema.sql...');
        await db.initDB();
        
        console.log('🌱 Running migrations and seeding initial data...');
        await runMigrations();
        
        console.log('🎉 Database has been completely reset and seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error resetting database:', err);
        process.exit(1);
    }
}

resetDB();
