require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { Pool } = require('pg');

// If DATABASE_URL is not provided, we will fall back to local dev or just wait for Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const initSchema = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS agencies (
        id SERIAL PRIMARY KEY,
        agency_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'free',
        cms_url VARCHAR(255),
        cms_username VARCHAR(255),
        cms_password VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS client_sites (
        id SERIAL PRIMARY KEY,
        agency_id INTEGER NOT NULL REFERENCES agencies(id),
        url VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS seo_reports (
        id SERIAL PRIMARY KEY,
        site_id INTEGER NOT NULL REFERENCES client_sites(id),
        score INTEGER,
        report_json TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS packages (
        tier_name VARCHAR(50) PRIMARY KEY,
        mrr_price INTEGER NOT NULL DEFAULT 499,
        max_ai_phase INTEGER NOT NULL DEFAULT 2,
        features JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );



      CREATE TABLE IF NOT EXISTS campaigns (
        id SERIAL PRIMARY KEY,
        agency_id INTEGER NOT NULL REFERENCES agencies(id),
        client_domain VARCHAR(255) NOT NULL,
        package_tier VARCHAR(50) DEFAULT 'basic',
        status VARCHAR(50) DEFAULT 'active',
        asana_project_id VARCHAR(255),
        ga_property_id VARCHAR(50),
        wp_url VARCHAR(255),
        wp_username VARCHAR(255),
        wp_password VARCHAR(255),
        wp_publish_status VARCHAR(50) DEFAULT 'publish',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS agent_tasks (
        id SERIAL PRIMARY KEY,
        campaign_id INTEGER NOT NULL REFERENCES campaigns(id),
        assigned_agent VARCHAR(100) NOT NULL,
        task_type VARCHAR(100) NOT NULL,
        payload JSONB,
        status VARCHAR(50) DEFAULT 'pending',
        result_payload JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS agent_logs (
        id SERIAL PRIMARY KEY,
        campaign_id INTEGER NOT NULL REFERENCES campaigns(id),
        agent_name VARCHAR(100) NOT NULL,
        thought_process TEXT,
        action_taken TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS promo_codes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS campaign_metrics (
        id SERIAL PRIMARY KEY,
        campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
        snapshot_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        organic_traffic INTEGER DEFAULT 0,
        organic_keywords INTEGER DEFAULT 0,
        domain_rating INTEGER DEFAULT 0,
        top_keywords JSONB,
        ga_users INTEGER DEFAULT 0,
        ga_sessions INTEGER DEFAULT 0,
        ga_bounce_rate VARCHAR(20) DEFAULT '0.00',
        ga_avg_duration INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS platform_health (
        id SERIAL PRIMARY KEY,
        snapshot_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        latency_ms INTEGER DEFAULT 0,
        broken_links INTEGER DEFAULT 0,
        ux_score INTEGER DEFAULT 100,
        console_errors JSONB
      );

      CREATE TABLE IF NOT EXISTS agency_leads (
        id SERIAL PRIMARY KEY,
        agency_id INTEGER REFERENCES agencies(id) ON DELETE CASCADE,
        client_domain VARCHAR(255) NOT NULL,
        client_email VARCHAR(255) NOT NULL,
        audit_score INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

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
    
    try {
      await client.query("ALTER TABLE agencies ADD COLUMN brand_color VARCHAR(20) DEFAULT '#007bff'");
    } catch(e) {}
    
    try {
      await client.query("ALTER TABLE agencies ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending'");
    } catch(e) {}
    
    try {
      await client.query("ALTER TABLE agencies ADD COLUMN brand_logo_url TEXT");
    } catch(e) {}

    try {
      await client.query("ALTER TABLE agencies ADD COLUMN address VARCHAR(255)");
    } catch(e) {}
    
    try {
      await client.query("ALTER TABLE agencies ADD COLUMN contact_person VARCHAR(255)");
    } catch(e) {}

    try {
      await client.query("ALTER TABLE agencies ADD COLUMN cms_url VARCHAR(255)");
    } catch(e) {}

    try {
      await client.query("ALTER TABLE agencies ADD COLUMN cms_username VARCHAR(255)");
    } catch(e) {}

    try {
      await client.query("ALTER TABLE agencies ADD COLUMN cms_password VARCHAR(255)");
    } catch(e) {}

    try {
      await client.query("ALTER TABLE campaigns ADD COLUMN package_tier VARCHAR(50) DEFAULT 'basic'");
    } catch(e) {}
    
    try {
      await client.query("ALTER TABLE campaigns ADD COLUMN backlink_keywords TEXT");
    } catch(e) {}
    
    try {
      await client.query("ALTER TABLE campaigns ADD COLUMN target_territory VARCHAR(10) DEFAULT 'us'");
    } catch(e) {}
    
    // Auto-migrate any dormant campaigns locked into the wrong initial phase
    try {
      await client.query("UPDATE campaigns SET status = 'active' WHERE status = 'new'");
    } catch(e) {}

    console.log('PostgreSQL Database schema initialized');
  } catch(err) {
    console.error('Error creating PostgreSQL tables:', err);
  } finally {
    client.release();
  }
};

// Run schema initialization on connect
if (process.env.DATABASE_URL) {
  initSchema();
} else {
  console.log('No DATABASE_URL found. Skipping PostgreSQL initialization. (Add DATABASE_URL to your .env)');
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
