import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from server directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

// PostgreSQL Connection Configuration
const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      user: process.env.PGUSER || 'postgres',
      host: process.env.PGHOST || 'localhost',
      database: process.env.PGDATABASE || 'sgcs_db',
      password: process.env.PGPASSWORD || '1102003',
      port: parseInt(process.env.PGPORT || '5432', 10),
    };

export const pool = new Pool(poolConfig);

// Test database connectivity
pool.on('connect', () => {
  console.log('PostgreSQL database pool connected!');
});

pool.on('error', (err) => {
  console.error('[SGCS DB Error] Unexpected PostgreSQL client pool error:', err);
});

export const query = (text, params) => pool.query(text, params);
