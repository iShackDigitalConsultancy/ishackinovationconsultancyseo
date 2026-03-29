const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('./db');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_super_secret_for_dev';

const authenticateSuperadmin = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    
    try {
      const userResult = await db.query('SELECT role FROM agencies WHERE id = $1', [decoded.agencyId]);
      const user = userResult.rows[0];
      
      if (!user || user.role !== 'superadmin') {
        return res.status(403).json({ error: 'Forbidden. Superadmin access required.' });
      }

      req.user = decoded;
      next();
    } catch(dbErr) {
      return res.status(500).json({ error: 'Database verification failed' });
    }
  });
};

router.get('/metrics', authenticateSuperadmin, async (req, res) => {
  try {
    const totalAgenciesResult = await db.query("SELECT COUNT(*) as count FROM agencies WHERE role != 'superadmin'");
    const totalAgencies = parseInt(totalAgenciesResult.rows[0].count, 10);

    const paidAgenciesResult = await db.query("SELECT COUNT(*) as count FROM agencies WHERE role = 'paid'");
    const paidAgencies = parseInt(paidAgenciesResult.rows[0].count, 10);

    const totalSitesResult = await db.query('SELECT COUNT(*) as count FROM client_sites');
    const totalSites = parseInt(totalSitesResult.rows[0].count, 10);
    
    const mrr = paidAgencies * 299;

    const recentAgenciesResult = await db.query("SELECT id, agency_name, email, role, created_at FROM agencies WHERE role != 'superadmin' ORDER BY created_at DESC LIMIT 10");

    res.json({
      metrics: {
        totalAgencies,
        paidAgencies,
        totalSites,
        mrr
      },
      recentAgencies: recentAgenciesResult.rows
    });
  } catch (error) {
    console.error('Admin metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch admin metrics' });
  }
});

// AI Observation Deck Endpoints
router.get('/agent-logs', authenticateSuperadmin, async (req, res) => {
  try {
    const logs = await db.query("SELECT * FROM agent_logs ORDER BY created_at DESC LIMIT 100");
    res.json(logs.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch agent logs' });
  }
});

router.get('/campaigns', authenticateSuperadmin, async (req, res) => {
  try {
    const campaigns = await db.query(`
      SELECT c.*, a.agency_name 
      FROM campaigns c 
      JOIN agencies a ON c.agency_id = a.id 
      ORDER BY c.created_at DESC
    `);
    res.json(campaigns.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

router.get('/agent-tasks', authenticateSuperadmin, async (req, res) => {
  try {
    const tasks = await db.query("SELECT * FROM agent_tasks ORDER BY created_at DESC LIMIT 50");
    res.json(tasks.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch agent tasks' });
  }
});

const pmAgent = require('./agents/pmAgent');
const veraAgent = require('./agents/veraAgent');

// Sandbox Triggers for Multi-Agent Network (Admin Only)
router.post('/sandbox/trigger-pm', authenticateSuperadmin, async (req, res) => {
  try {
    await pmAgent.tick();
    res.json({ success: true, message: 'Project Management Agent execution cycle manually triggered.' });
  } catch (error) {
    res.status(500).json({ error: 'PM Agent sandbox execution failed.', details: error.message });
  }
});

router.post('/sandbox/trigger-vera', authenticateSuperadmin, async (req, res) => {
  try {
    await veraAgent.runDailyReport();
    res.json({ success: true, message: 'Vera Sharp (Reporting Agent) manually forced to dispatch the daily aggregate email.' });
  } catch (error) {
    res.status(500).json({ error: 'Vera Sharp sandbox execution failed.', details: error.message });
  }
});

router.post('/sandbox/start-campaign', authenticateSuperadmin, async (req, res) => {
  try {
    const { domain } = req.body;
    if (!domain) return res.status(400).json({ error: 'Domain is required.' });
    
    const { rows } = await db.query('SELECT id FROM agencies LIMIT 1');
    if (rows.length === 0) return res.status(400).json({ error: 'No agencies found in database.' });
    
    await db.query("INSERT INTO campaigns (agency_id, client_domain) VALUES ($1, $2)", [rows[0].id, domain]);
    
    // Automatically trigger the PM agent heartbeat to pick up the brand new campaign immediately!
    await pmAgent.tick();
    
    res.json({ success: true, message: `The PM Agent has officially picked up the SEO campaign for ${domain}.` });
  } catch (error) {
    res.status(500).json({ error: 'Campaign start failed.', details: error.message });
  }
});

module.exports = router;
