const bcrypt = require('bcrypt');
const db = require('./db'); 

const run = async () => {
  try {
    const passwordHash = await bcrypt.hash('admin123', 10);
    const query = 'INSERT INTO agencies (agency_name, email, password_hash, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role';
    
    await db.query(query, ['iShack Admin', 'admin@ishack.co.za', passwordHash, 'superadmin']);
    await db.query(query, ['Wayne B.', 'wayneb@ishackventures.com', passwordHash, 'superadmin']);
    
    console.log('Superadmins seeded successfully!');
  } catch(e) {
    console.log('Error seeding:', e.message);
  } finally {
    process.exit(0);
  }
};

run();
