require('dotenv').config();
const db = require('./db');

async function migrateGA() {
  console.log("Migrating PostgreSQL for GA4 support...");
  try {
    await db.query(`ALTER TABLE campaigns ADD COLUMN ga_property_id VARCHAR(50);`);
    console.log("Added ga_property_id to campaigns fallback");
  } catch(e) { console.log(e.message); }

  try {
    await db.query(`ALTER TABLE campaign_metrics ADD COLUMN ga_users INTEGER DEFAULT 0;`);
    await db.query(`ALTER TABLE campaign_metrics ADD COLUMN ga_sessions INTEGER DEFAULT 0;`);
    await db.query(`ALTER TABLE campaign_metrics ADD COLUMN ga_bounce_rate VARCHAR(20) DEFAULT '0.00';`);
    await db.query(`ALTER TABLE campaign_metrics ADD COLUMN ga_avg_duration INTEGER DEFAULT 0;`);
    console.log("Added GA columns to campaign_metrics fallback");
  } catch(e) { console.log(e.message); }

  process.exit(0);
}

migrateGA().catch(console.error);
