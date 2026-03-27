const bcrypt = require('bcrypt');
const db = require('./backend/db'); // relative to project root

const run = async () => {
  try {
    const passwordHash = await bcrypt.hash('admin123', 10);
    const insert = db.prepare('INSERT INTO agencies (agency_name, email, password_hash, role) VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING');
    insert.run('iShack Admin', 'admin@ishack.co.za', passwordHash, 'superadmin');
    console.log('Superadmin seeded!');
  } catch(e) {
    console.log('Error seeding:', e.message);
  }
};

run();
