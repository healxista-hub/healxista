import db from './db.js';

async function checkRoles() {
    try {
        const res = await db.query('SELECT * FROM roles');
        console.log("Roles in DB:", res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

checkRoles();
