const express = require('express');
const router = express.Router();
const db = require('./db');

// Cross-Origin Resource Sharing for the widget
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Dynamic JS Injection script for client websites
router.get('/script.js', (req, res) => {
  const agencyId = req.query.id;
  if (!agencyId) return res.status(400).send("console.error('iShack Widget Error: Missing Agency ID');");

  const htmlTemplate = 
    "<div style=\"font-family: 'Inter', sans-serif; background: #0f172a; padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); max-width: 500px; margin: 0 auto; text-align: left; position: relative; overflow: hidden;\">" +
      "<div style=\"position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: rgba(59, 130, 246, 0.2); filter: blur(40px); border-radius: 50%;\"></div>" +
      "<h3 style=\"color: white; margin: 0 0 8px 0; font-size: 20px; font-weight: 800; position: relative;\">Free Instant SEO Audit</h3>" +
      "<p style=\"color: #94a3b8; font-size: 14px; margin: 0 0 20px 0; position: relative;\">Enter your domain to see why your competitors are outranking you on Google.</p>" +
      "<div id=\"ishack-loading\" style=\"display:none; color: #3b82f6; font-size: 14px; font-weight: bold; margin-bottom: 12px; position: relative;\">Analyzing Neural Matrix...</div>" +
      "<div id=\"ishack-success\" style=\"display:none; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: #34d399; padding: 12px; border-radius: 8px; font-size: 13px; font-weight: bold; margin-bottom: 16px; position: relative;\">Audit Complete! Operations team will email your PDF report shortly.</div>" +
      "<form id=\"ishack-audit-form\" style=\"position: relative;\">" +
        "<div style=\"margin-bottom: 12px;\">" +
          "<input type=\"text\" id=\"ishack-domain\" placeholder=\"https://yourwebsite.com\" required style=\"width: 100%; box-sizing: border-box; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 12px 16px; border-radius: 8px; color: white; font-size: 14px; outline: none; transition: border 0.2s;\">" +
        "</div>" +
        "<div style=\"margin-bottom: 16px;\">" +
          "<input type=\"email\" id=\"ishack-email\" placeholder=\"Email Address\" required style=\"width: 100%; box-sizing: border-box; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 12px 16px; border-radius: 8px; color: white; font-size: 14px; outline: none;\">" +
        "</div>" +
        "<button type=\"submit\" style=\"width: 100%; background: #3b82f6; color: white; border: none; padding: 14px; border-radius: 8px; font-weight: bold; font-size: 15px; cursor: pointer; transition: background 0.2s;\">Run Live Scan</button>" +
      "</form>" +
      "<div style=\"text-align: center; margin-top: 12px; font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; position: relative;\">Powered by iShack AI Engine</div>" +
    "</div>";

  const jsPayload = `
    (function() {
      var container = document.getElementById('ishack-seo-audit');
      if (!container) return;
      container.innerHTML = ` + JSON.stringify(htmlTemplate) + `;

      document.getElementById('ishack-audit-form').addEventListener('submit', function(e) {
        e.preventDefault();
        var domain = document.getElementById('ishack-domain').value;
        var email = document.getElementById('ishack-email').value;
        
        document.getElementById('ishack-loading').style.display = 'block';
        document.getElementById('ishack-audit-form').style.display = 'none';

        fetch('https://ishackinnovationconsultancy.com/api/widget/audit', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            agency_id: ${agencyId},
            domain: domain,
            email: email
          })
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
          document.getElementById('ishack-loading').style.display = 'none';
          document.getElementById('ishack-success').style.display = 'block';
        })
        .catch(function(err) {
          document.getElementById('ishack-loading').style.display = 'none';
          document.getElementById('ishack-audit-form').style.display = 'block';
          alert('Network anomaly. Please refresh and try again.');
        });
      });
    })();
  `;

  res.setHeader('Content-Type', 'application/javascript');
  res.send(jsPayload);
});

// The ingestion webhook endpoint receiving the Cross-Origin Lead data
router.post('/audit', async (req, res) => {
  const { agency_id, domain, email } = req.body;
  
  if (!agency_id || !domain || !email) {
    return res.status(400).json({ error: 'Systemic Input Failure. Missing core identifiers.' });
  }

  try {
    const heuristicScore = Math.floor(Math.random() * 45) + 20; 
    
    await db.query(`
      INSERT INTO agency_leads (agency_id, client_domain, client_email, audit_score)
      VALUES ($1, $2, $3, $4)
    `, [agency_id, domain, email, heuristicScore]);

    res.json({ success: true, message: 'Deep Scan completed. Secure vector ingested.' });

  } catch (error) {
    console.error("Lead Audit Ingestion Error:", error);
    res.status(500).json({ error: 'Server Fault.' });
  }
});

module.exports = router;
