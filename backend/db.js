import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const { Pool } = pg;

// Diagnostic log for production troubleshooting
console.log('📡 Database Connection Status:', process.env.DATABASE_URL ? '✅ Using DATABASE_URL' : '⚠️ DATABASE_URL not found, falling back to localhost');

const dbConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    }
    : {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'healxista',
        password: process.env.DB_PASSWORD || 'postgres',
        port: process.env.DB_PORT || 5432,
    };

const pool = new Pool({
    ...dbConfig,
    max: 20, 
    idleTimeoutMillis: 30000, 
    connectionTimeoutMillis: 10000, 
    keepAlive: true, // Keep-alive active to auto-heal from Wi-Fi/network dropouts
    keepAliveInitialDelayMillis: 10000
});

pool.on('connect', (client) => {
    client.query('SET search_path TO public;');
    console.log('✅ PostgreSQL Database connected successfully');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected DB connection error:', err);
});

// Initialize Schema
const initDB = async () => {
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        if (fs.existsSync(schemaPath)) {
            console.log('🚀 Running database schema initialization...');
            const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
            // Split by semicolon and run individually to pinpoint errors, 
            // or just run as a block and handle the error gracefully.
            try {
                await pool.query(schemaSql);
                console.log('✅ PostgreSQL Schema initialized successfully');
            } catch (queryErr) {
                console.warn('⚠️ Schema initialization partial success or error:', queryErr.message);
                // We don't crash here because migrate.js will handle repair
            }
        } else {
            console.warn('⚠️ Warning: schema.sql not found at', schemaPath);
        }
    } catch (err) {
        console.error('❌ Error reading or processing database schema:', err.message);
    }
};

export default {
  query: (text, params) => pool.query(text, params),
  pool,
  initDB 
};
