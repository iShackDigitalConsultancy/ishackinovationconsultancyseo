const bcrypt = require('bcrypt');
const db = require('./db.js');

(async () => {
   try {
     const hash = await bcrypt.hash('admin123', 10);
     const res = await db.query(`
       INSERT INTO agencies (agency_name, email, password_hash, role)
       VALUES ('iShack Super Admin', 'admin@ishack.co.za', $1, 'superadmin')
       ON CONFLICT (email) DO UPDATE SET password_hash = $1
       RETURNING *;
     `, [hash]);
     console.log('Successfully seeded superadmin into production PG database:', res.rows[0].email);
   } catch(e) {
     console.error('Failed to seed:', e);
   }
   process.exit();
})();
