const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const db = require('./db');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_super_secret_for_dev';
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || '';

router.post('/register', async (req, res) => {
  const { agencyName, email, password } = req.body;

  if (!agencyName || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const checkEmail = await db.query('SELECT id FROM agencies WHERE email = $1', [email]);
    if (checkEmail.rows.length > 0) {
      return res.status(400).json({ error: 'Email is already in use.' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const insertResult = await db.query(
      'INSERT INTO agencies (agency_name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
      [agencyName, email, passwordHash]
    );
    const agencyId = insertResult.rows[0].id;

    const token = jwt.sign({ agencyId, email }, JWT_SECRET, { expiresIn: '7d' });

    // Initialize Paystack Checkout
    let authorizationUrl = '';
    if (PAYSTACK_SECRET) {
      try {
        const response = await axios.post(
          'https://api.paystack.co/transaction/initialize',
          {
            email: email,
            amount: 29900, // ZAR 299.00
            callback_url: 'http://localhost:4200/dashboard'
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
      agency: { id: agencyId, agencyName, email, role: 'free' } // defaults to free
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
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
      agency: { id: agency.id, agencyName: agency.agency_name, email: agency.email, role: agency.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
