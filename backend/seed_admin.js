const db = require('./db');
const bcrypt = require('bcrypt');

async function seedAdmin() {
  try {
    const email = 'veras@ishack.co.za';
    const password = '123456789';
    const hash = await bcrypt.hash(password, 10);
    
    // Check if the tables exist natively by querying agency table creation
    await db.query(`
      CREATE TABLE IF NOT EXISTS agencies (
        id SERIAL PRIMARY KEY,
        agency_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'free',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure superadmin doesn't exist already to avoid duplicate collisions
    const checkUser = await db.query('SELECT * FROM agencies WHERE email = $1', [email]);
    if (checkUser.rows.length === 0) {
      await db.query(
        'INSERT INTO agencies (agency_name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
        ['iShack Super Admin', email, hash, 'superadmin']
      );
      console.log('Super Admin inserted successfully!');
    } else {
      console.log('Super Admin already exists. Updating password just in case...');
      await db.query('UPDATE agencies SET password_hash = $1 WHERE email = $2', [hash, email]);
      console.log('Password updated successfully.');
    }
    
    console.log('Database operation completed. Exiting.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding Error:', err);
    process.exit(1);
  }
}

seedAdmin();
