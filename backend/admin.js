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

module.exports = router;
