require('dotenv').config();
const db = require('./db');

async function migrateWP() {
  console.log("Migrating PostgreSQL for WordPress support...");
  try {
    await db.query(`ALTER TABLE campaigns ADD COLUMN wp_url VARCHAR(255);`);
    await db.query(`ALTER TABLE campaigns ADD COLUMN wp_username VARCHAR(255);`);
    await db.query(`ALTER TABLE campaigns ADD COLUMN wp_password VARCHAR(255);`);
    await db.query(`ALTER TABLE campaigns ADD COLUMN wp_publish_status VARCHAR(50) DEFAULT 'publish';`);
    console.log("Successfully appended WP Credentials columns to campaigns tracking table.");
  } catch(e) { console.log(e.message); }
  process.exit(0);
}

migrateWP().catch(console.error);
