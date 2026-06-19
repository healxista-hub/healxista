import db from './db.js';

async function fixConstraints() {
    try {
        console.log("Fixing bookings constraints...");
        
        // 1. Drop existing constraints
        await db.query(`
            ALTER TABLE bookings 
            DROP CONSTRAINT IF EXISTS bookings_user_id_fkey,
            DROP CONSTRAINT IF EXISTS bookings_provider_id_fkey;
        `);

        // 2. Add them back with ON DELETE SET NULL
        await db.query(`
            ALTER TABLE bookings 
            ADD CONSTRAINT bookings_user_id_fkey 
                FOREIGN KEY (user_id) REFERENCES accounts(account_id) ON DELETE SET NULL,
            ADD CONSTRAINT bookings_provider_id_fkey 
                FOREIGN KEY (provider_id) REFERENCES service_providers(provider_id) ON DELETE SET NULL;
        `);

        console.log("Constraints updated successfully.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixConstraints();
