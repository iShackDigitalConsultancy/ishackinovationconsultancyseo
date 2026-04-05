require('dotenv').config();
const db = require('./db');

async function fixDuplicates() {
  console.log("Auditing existing database payload metrics...");
  const metrics = await db.query("SELECT * FROM campaign_metrics");
  
  for (let m of metrics.rows) {
      if (!m.top_keywords) continue;
      
      let parsed = [];
      try {
          parsed = typeof m.top_keywords === 'string' ? JSON.parse(m.top_keywords) : m.top_keywords;
      } catch (e) {
          continue; // corrupted JSON skip
      }
      
      if (!Array.isArray(parsed) || parsed.length === 0) continue;
      
      const uniqueKwMap = new Map();
      parsed.forEach(ck => {
          if (!ck.keyword) return;
          const kw = ck.keyword.toLowerCase();
          const pos = parseInt(ck.position) || 100;
          if (!uniqueKwMap.has(kw) || uniqueKwMap.get(kw).position > pos) {
              uniqueKwMap.set(kw, ck);
          }
      });
      
      const sanitizedArray = Array.from(uniqueKwMap.values());
      const sanitizedJSON = JSON.stringify(sanitizedArray);
      
      await db.query("UPDATE campaign_metrics SET top_keywords = $1 WHERE id = $2", [sanitizedJSON, m.id]);
      console.log(`[Campaign Metric Row ${m.id}] Deduplicated array length: ${parsed.length} -> ${sanitizedArray.length}`);
  }
  
  console.log("Database payload sanitization total success.");
  process.exit(0);
}

fixDuplicates().catch(e => {
  console.error("Deduplication error:", e);
  process.exit(1);
});
