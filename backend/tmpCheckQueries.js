const db = require('./db');

async function testQuery() {
  try {
    await db.query("SELECT COUNT(*) as count FROM agencies WHERE role != 'superadmin'");
    console.log("totalAgencies ok");
    await db.query("SELECT COUNT(*) as count FROM agencies WHERE role = 'paid'");
    console.log("paidAgencies ok");
    await db.query('SELECT COUNT(*) as count FROM client_sites');
    console.log("totalSites ok");
    await db.query("SELECT id, agency_name, email, role, contact_person, address, brand_color, brand_logo_url, cms_url, cms_username, cms_password, created_at FROM agencies WHERE role != 'superadmin' ORDER BY created_at DESC");
    console.log("recentAgencies ok");
  } catch (error) {
    console.error("DB Error:", error.message);
  } finally {
    process.exit(0);
  }
}

testQuery();
