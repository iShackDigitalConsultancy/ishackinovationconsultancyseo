const bcrypt = require('bcrypt');
const db = require('./db');
const run = async () => {
  try {
    const hash = await bcrypt.hash('admin123', 10);
    const res1 = await db.query("UPDATE agencies SET password_hash = $1 WHERE email = 'wayneb@ishackventures.com' RETURNING *", [hash]);
    const res2 = await db.query("UPDATE agencies SET password_hash = $1 WHERE email = 'admin@ishack.co.za' RETURNING *", [hash]);
    console.log('wayneb updated:', res1.rowCount);
    console.log('admin updated:', res2.rowCount);
  } catch(e) {
    console.log(e);
  } finally {
    process.exit(0);
  }
};
run();
