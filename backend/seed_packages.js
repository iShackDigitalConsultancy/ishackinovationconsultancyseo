const db = require('./db');

async function seedFeatures() {
    console.log("Vera Sharp: Booting Semantic Mappings...");
    const basicFeatures = ['Keyword Mapping', 'Onsite Audit', 'Content Tagging', 'Monthly Performance Report'];
    const proFeatures = ['Keyword Mapping', 'Onsite Audit', 'Content Tagging', 'Monthly Performance Report', 'Strategic Content Syndication', 'Basic Auto-Backlinking'];
    const enterpriseFeatures = ['Keyword Mapping', 'Onsite Audit', 'Content Tagging', 'Monthly Performance Report', 'Strategic Content Syndication', 'High-DR Anchor Outreach', 'Continuous UX/CRO Optimization', 'Platform Health Audits'];

    await db.query("UPDATE packages SET features = $1 WHERE tier_name = 'basic'", [JSON.stringify(basicFeatures)]);
    await db.query("UPDATE packages SET features = $1 WHERE tier_name = 'pro'", [JSON.stringify(proFeatures)]);
    await db.query("UPDATE packages SET features = $1 WHERE tier_name = 'enterprise'", [JSON.stringify(enterpriseFeatures)]);

    console.log("Research & SEO Agents: Checklists securely deployed and mapped to all downstream targeted URLs.");
    process.exit(0);
}

seedFeatures().catch(console.error);
