const express = require('express');
const router = express.Router();
const db = require('./db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_super_secret_for_dev';

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    
    try {
      const userResult = await db.query('SELECT role FROM agencies WHERE id = $1', [decoded.agencyId]);
      req.user = {
        ...decoded,
        role: userResult.rows[0] ? userResult.rows[0].role : 'free'
      };
      next();
    } catch(dbErr) {
      return res.status(500).json({ error: 'Database check failed' });
    }
  });
};

router.get('/portal-data', authenticateToken, async (req, res) => {
  try {
    const agencyId = req.user.agencyId;
    
    // Fetch their linked campaigns
    const { rows: campaigns } = await db.query('SELECT * FROM campaigns WHERE agency_id = $1 ORDER BY created_at DESC', [agencyId]);
    
    for (const c of campaigns) {
      // Fetch ONLY completed tasks (Proof of work) and sanitize AI log leaks
      const { rows: tasks } = await db.query(
        "SELECT task_type, result_payload, completed_at FROM agent_tasks WHERE campaign_id = $1 AND status = 'completed' ORDER BY created_at ASC", 
        [c.id]
      );
      c.completed_tasks = tasks;
      
      // Fetch Live SEMrush Epoch Data
      const { rows: metrics } = await db.query(
        "SELECT organic_traffic, organic_keywords, domain_rating, top_keywords FROM campaign_metrics WHERE campaign_id = $1 ORDER BY snapshot_date DESC LIMIT 1", 
        [c.id]
      );
      c.live_metrics = metrics.length > 0 ? metrics[0] : null;
    }
    
    // Also fetch Agency Profile data to White-Label the UI colors & logos
    const { rows: agencyData } = await db.query('SELECT brand_color, brand_logo_url FROM agencies WHERE id = $1', [agencyId]);
    const branding = agencyData.length > 0 ? agencyData[0] : { brand_color: '#007bff' };

    res.json({ campaigns, branding });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to lock into B2B telemetry block' });
  }
});

module.exports = router;
