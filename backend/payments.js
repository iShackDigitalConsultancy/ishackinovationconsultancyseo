const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('./db');
const router = express.Router();
const pmAgent = require('./agents/pmAgent');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_super_secret_for_dev';
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_fallback';

// Common Auth Middleware for internal routes
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    req.user = decoded;
    next();
  });
};

router.post('/initialize', authenticateToken, async (req, res) => {
  try {
    const { domain, tier } = req.body;
    if (!domain || !tier) return res.status(400).json({ error: 'Domain and tier are required.' });

    let amountInUsd = 499; // Basic
    if (tier === 'pro') amountInUsd = 899;
    if (tier === 'enterprise') amountInUsd = 1499;

    // Convert to ZAR for South African integration (x18 baseline peg)
    const amountInCents = amountInUsd * 18 * 100;

    // Verify User Email from DB using agency_id
    const userResult = await db.query('SELECT email FROM agencies WHERE id = $1', [req.user.agencyId]);
    if (userResult.rowCount === 0) return res.status(404).json({ error: 'Agency record not found.' });

    const email = userResult.rows[0].email;

    // Hit Paystack API natively
    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        amount: amountInCents,
        metadata: {
          agency_id: req.user.agencyId,
          domain: domain,
          package_tier: tier
        }
      })
    });

    const pstkData = await paystackRes.json();
    if (!pstkData.status) {
      throw new Error(pstkData.message);
    }

    res.json({ success: true, authorization_url: pstkData.data.authorization_url });
  } catch (error) {
    console.error('Paystack Initialization Error:', error.message);
    res.status(500).json({ error: 'Failed to initialize payment gateway.' });
  }
});

router.post('/promo-redeem', authenticateToken, async (req, res) => {
  try {
    const { domain, tier, promoCode } = req.body;
    if (!domain || !promoCode) return res.status(400).json({ error: 'Domain and Promo Code required.' });

    // Validate Code
    const promoCheck = await db.query('SELECT * FROM promo_codes WHERE code = $1', [promoCode]);
    if (promoCheck.rowCount === 0) {
      return res.status(400).json({ error: 'Invalid or expired Promo Code.' });
    }

    // Insert Campaign directly
    const packageTier = tier || 'pro';
    await db.query(
      "INSERT INTO campaigns (agency_id, client_domain, package_tier, status) VALUES ($1, $2, $3, 'active')",
      [req.user.agencyId, domain, packageTier]
    );

    // Track it as a scanned client site automatically as requested by user ("if we have the url built in openclaw")
    await db.query("INSERT INTO client_sites (agency_id, url, status) VALUES ($1, $2, 'pending')", [req.user.agencyId, domain]);

    // Wake the Execution Engine
    await pmAgent.tick();

    res.json({ success: true, message: 'VIP Promo Code applied. Campaign active.' });
  } catch (err) {
    console.error('Promo Redemption Error:', err);
    res.status(500).json({ error: 'Failed to process promotional upgrade.' });
  }
});

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // Validate Paystack HMAC SHA512 signature
    const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(JSON.stringify(req.body)).digest('hex');
    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(400).send('Invalid Signature');
    }

    const event = req.body;
    if (event.event === 'charge.success') {
      const metadata = event.data.metadata;
      const agencyId = metadata.agency_id;
      const domain = metadata.domain;
      const tier = metadata.package_tier;

      // Ensure the payment hasn't already been processed
      const existing = await db.query('SELECT id FROM campaigns WHERE agency_id = $1 AND client_domain = $2', [agencyId, domain]);
      if (existing.rowCount === 0) {
        
        // Insert Paid Campaign
        await db.query(
          "INSERT INTO campaigns (agency_id, client_domain, package_tier, status) VALUES ($1, $2, $3, 'active')",
          [agencyId, domain, tier]
        );

        // Map over to OCR Scans as well natively 
        await db.query("INSERT INTO client_sites (agency_id, url, status) VALUES ($1, $2, 'pending')", [agencyId, domain]);
        
        // Unleash PM Robotics!
        await pmAgent.tick();
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook Error:', error);
    res.sendStatus(500);
  }
});

module.exports = router;
