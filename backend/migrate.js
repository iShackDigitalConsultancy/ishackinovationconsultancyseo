const db = require('./db');

try {
  // DB Migrations for CRM
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      target_domain VARCHAR(255) NOT NULL,
      target_keyword VARCHAR(255),
      seo_score INTEGER,
      status VARCHAR(50) DEFAULT 'new',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('Migration successful: Created leads table');
} catch(e) {
  console.log('Migration error:', e.message);
}
