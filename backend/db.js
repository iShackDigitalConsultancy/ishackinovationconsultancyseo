require('dotenv').config();
const { Pool } = require('pg');

// If DATABASE_URL is not provided, we will fall back to local dev or just wait for Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const initSchema = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS agencies (
        id SERIAL PRIMARY KEY,
        agency_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'free',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS client_sites (
        id SERIAL PRIMARY KEY,
        agency_id INTEGER NOT NULL REFERENCES agencies(id),
        url VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS seo_reports (
        id SERIAL PRIMARY KEY,
        site_id INTEGER NOT NULL REFERENCES client_sites(id),
        score INTEGER,
        report_json TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('PostgreSQL Database schema initialized');
  } catch(err) {
    console.error('Error creating PostgreSQL tables:', err);
  } finally {
    client.release();
  }
};

// Run schema initialization on connect
if (process.env.DATABASE_URL) {
  initSchema();
} else {
  console.log('No DATABASE_URL found. Skipping PostgreSQL initialization. (Add DATABASE_URL to your .env)');
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
