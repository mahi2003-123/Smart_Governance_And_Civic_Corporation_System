import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

async function initDb() {
  const dbName = process.env.PGDATABASE || 'sgcs_db';
  const dbUser = process.env.PGUSER || 'postgres';
  const dbPassword = process.env.PGPASSWORD || 'postgres';
  const dbHost = process.env.PGHOST || 'localhost';
  const dbPort = parseInt(process.env.PGPORT || '5432', 10);

  console.log(`Connecting to PostgreSQL at ${dbHost}:${dbPort} as user "${dbUser}"...`);

  // Step 1: Connect to default 'postgres' db to check if sgcs_db exists, create if missing
  const rootClient = new Client({
    user: dbUser,
    host: dbHost,
    database: 'postgres',
    password: dbPassword,
    port: dbPort,
  });

  try {
    await rootClient.connect();
    const checkDbRes = await rootClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (checkDbRes.rowCount === 0) {
      console.log(`Database "${dbName}" does not exist. Creating database...`);
      await rootClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created successfully!`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } catch (err) {
    console.error('Error connecting to root postgres database:', err.message);
    console.log('Ensure your PostgreSQL service is running and credentials in server/.env are correct.');
    process.exit(1);
  } finally {
    await rootClient.end();
  }

  // Step 2: Connect to sgcs_db and execute schema.sql + seed.sql
  const targetClient = new Client({
    user: dbUser,
    host: dbHost,
    database: dbName,
    password: dbPassword,
    port: dbPort,
  });

  try {
    await targetClient.connect();

    console.log('Executing schema.sql...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await targetClient.query(schemaSql);
    console.log('Tables and indexes created successfully!');

    console.log('Executing seed.sql...');
    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
    await targetClient.query(seedSql);
    console.log('Seed data inserted successfully!');

    console.log('\n✅ SGCS PostgreSQL Database Initialization Complete!');
  } catch (err) {
    console.error('Error initializing schema/seed data:', err);
    process.exit(1);
  } finally {
    await targetClient.end();
  }
}

initDb();
