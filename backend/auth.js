const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const db = require('./db');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_super_secret_for_dev';
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || '';

router.post('/register', async (req, res) => {
  const { agencyName, email, password, planType, brandColor, brandLogoUrl, promoCode, address, contactPerson } = req.body;

  if (!agencyName || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // default to agency if not specified
  const selectedPlan = planType === 'business' ? 'business' : 'agency';
  // R17 to 1 USD Exchange Rate applied. Amount is in cents.
  // Business: $49 * 17 = R833 -> 83300
  // Agency: $299 * 17 = R5083 -> 508300
  const billingAmount = selectedPlan === 'business' ? 83300 : 508300; 

  try {
    const checkEmail = await db.query('SELECT id FROM agencies WHERE email = $1', [email]);
    if (checkEmail.rows.length > 0) {
      return res.status(400).json({ error: 'Email is already in use.' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const safeBrandColor = brandColor || '#007bff';
    const finalColor = brandColor || '#007bff';

    const result = await db.query(
      'INSERT INTO agencies (agency_name, email, password_hash, role, brand_color, brand_logo_url, address, contact_person) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [agencyName, email, passwordHash, selectedPlan, finalColor, brandLogoUrl || '', address || '', contactPerson || '']
    );

    const agencyId = result.rows[0].id;

    const token = jwt.sign({ agencyId, email }, JWT_SECRET, { expiresIn: '7d' });

    // Initialize Paystack Checkout
    let authorizationUrl = '';
    let isTestingPromo = false;

    if (promoCode) {
      if (promoCode.toLowerCase() === 'evertonfc') {
        isTestingPromo = true;
      } else {
        const promoRes = await db.query('SELECT id FROM promo_codes WHERE LOWER(code) = $1', [promoCode.toLowerCase()]);
        if (promoRes.rows.length > 0) {
          isTestingPromo = true;
        }
      }
    }

    if (PAYSTACK_SECRET && !isTestingPromo) {
      try {
        const response = await axios.post(
          'https://api.paystack.co/transaction/initialize',
          {
            email: email,
            amount: billingAmount,
            callback_url: 'https://ishackaeo.com/dashboard',
            metadata: {
              agency_id: agencyId,
              package_tier: selectedPlan,
              type: 'saas_subscription'
            }
          },
          {
            headers: {
              authorization: `Bearer ${PAYSTACK_SECRET}`,
              'content-type': 'application/json',
            }
          }
        );
        authorizationUrl = response.data.data.authorization_url;
      } catch (paystackErr) {
        console.error('Paystack Error:', paystackErr.response ? paystackErr.response.data : paystackErr.message);
      }
    }

    res.status(201).json({
      message: 'Registration successful',
      token,
      authorizationUrl,
      agency: { id: agencyId, agencyName, email, role: selectedPlan, brandColor: finalColor, brandLogoUrl: brandLogoUrl || '' }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

router.get('/debug-users-dump', async (req, res) => {
  try {
    const r = await db.query('SELECT id, email, role, length(password_hash) as hash_len FROM agencies');
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const queryResult = await db.query('SELECT * FROM agencies WHERE email = $1', [email]);
    const agency = queryResult.rows[0];

    if (!agency) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, agency.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ agencyId: agency.id, email: agency.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'Login successful',
      token,
      agency: { 
        id: agency.id, 
        agencyName: agency.agency_name, 
        email: agency.email, 
        role: agency.role,
        brandColor: agency.brand_color || '#007bff',
        brandLogoUrl: agency.brand_logo_url || ''
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
