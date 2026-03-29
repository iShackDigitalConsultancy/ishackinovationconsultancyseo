const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('./db');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_super_secret_for_dev';

// Middleware to protect routes
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    
    // Fetch user role from DB to attach to context
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

// GET all sites for the authenticated agency
router.get('/', authenticateToken, async (req, res) => {
  try {
    const sitesResult = await db.query('SELECT * FROM client_sites WHERE agency_id = $1 ORDER BY created_at DESC', [req.user.agencyId]);
    const campaignsResult = await db.query('SELECT * FROM campaigns WHERE agency_id = $1 ORDER BY created_at DESC', [req.user.agencyId]);
    res.json({ sites: sitesResult.rows, campaigns: campaignsResult.rows });
  } catch (error) {
    console.error('Fetch sites error:', error);
    res.status(500).json({ error: 'Failed to fetch sites' });
  }
});

// POST to add a new client site
router.post('/', authenticateToken, async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Website URL is required.' });
  }

  try {
    // Role logic check
    const countResult = await db.query('SELECT COUNT(*) as count FROM client_sites WHERE agency_id = $1', [req.user.agencyId]);
    const existingSitesCount = parseInt(countResult.rows[0].count, 10);

    if (req.user.role === 'free' && existingSitesCount >= 1) {
      return res.status(403).json({ error: 'Free limit reached. Upgrade to $299/mo to add unlimited sites.' });
    }

    const insertResult = await db.query(
      'INSERT INTO client_sites (agency_id, url) VALUES ($1, $2) RETURNING id',
      [req.user.agencyId, url]
    );

    res.status(201).json({
      message: 'Site added successfully',
      site: { id: insertResult.rows[0].id, url, status: 'pending' }
    });
  } catch (error) {
    console.error('Add site error:', error);
    res.status(500).json({ error: 'Failed to add site' });
  }
});

module.exports = router;
