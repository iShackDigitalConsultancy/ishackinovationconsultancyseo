const db = require('./db');

async function testQuery() {
  try {
    const res = await db.query('SELECT id, email, role FROM agencies');
    console.log("USERS:", res.rows);
  } catch (error) {
    console.error("DB Error:", error.message);
  } finally {
    process.exit(0);
  }
}

testQuery();
