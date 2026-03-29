const bcrypt = require('bcrypt');
const db = require('./db.js');

(async () => {
   try {
     const hash = await bcrypt.hash('123456789', 10);
     const res = await db.query(`
       INSERT INTO agencies (agency_name, email, password_hash, role)
       VALUES ('Vera Sharp - OpenClaw', 'veras@ishack.co.za', $1, 'superadmin')
       ON CONFLICT (email) DO UPDATE SET password_hash = $1, role = 'superadmin'
       RETURNING *;
     `, [hash]);
     console.log('Successfully seeded Superadmin into production PG database:', res.rows[0].email);
   } catch(e) {
     console.error('Failed to seed:', e);
   }
   process.exit();
})();
