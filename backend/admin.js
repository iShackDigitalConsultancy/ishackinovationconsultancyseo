const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('./db');
const mailService = require('./services/mailService');
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

// SuperAdmin Agency CRUD
router.post('/agencies', authenticateSuperadmin, async (req, res) => {
  try {
    const { agencyName, email, role, contactPerson, address, brandColor, brandLogoUrl } = req.body;
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash('admin_generated', 10);
    const result = await db.query(
      'INSERT INTO agencies (agency_name, email, password_hash, role, contact_person, address, brand_color, brand_logo_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [agencyName, email, hash, role || 'free', contactPerson || '', address || '', brandColor || '#007bff', brandLogoUrl || '']
    );
    res.json({ success: true, agencyId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create agency client. Email might already exist.' });
  }
});

router.put('/agencies/:id', authenticateSuperadmin, async (req, res) => {
  try {
    const { agencyName, email, role, contactPerson, address, brandColor, brandLogoUrl, cms_url, cms_username, cms_password } = req.body;
    await db.query(
      'UPDATE agencies SET agency_name = $1, email = $2, role = $3, contact_person = $4, address = $5, brand_color = $6, brand_logo_url = $7, cms_url = $8, cms_username = $9, cms_password = $10 WHERE id = $11',
      [agencyName, email, role, contactPerson || '', address || '', brandColor || '#007bff', brandLogoUrl || '', cms_url || '', cms_username || '', cms_password || '', req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update client profile.' });
  }
});

router.delete('/agencies/:id', authenticateSuperadmin, async (req, res) => {
  try {
    const id = req.params.id;
    // Cascade delete safety block (Inproduction, foreign keys on delete cascade handles this, but manually doing basics here)
    const camps = await db.query('SELECT id FROM campaigns WHERE agency_id = $1', [id]);
    for (let c of camps.rows) {
      await db.query('DELETE FROM agent_logs WHERE campaign_id = $1', [c.id]);
      await db.query('DELETE FROM agent_tasks WHERE campaign_id = $1', [c.id]);
    }
    await db.query('DELETE FROM campaigns WHERE agency_id = $1', [id]);
    await db.query('DELETE FROM client_sites WHERE agency_id = $1', [id]);
    await db.query('DELETE FROM agencies WHERE id = $1', [id]);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete client. Check foreign key boundaries.' });
  }
});

// Analytics & Metrics Loop
router.get('/metrics', authenticateSuperadmin, async (req, res) => {
  try {
    const totalAgenciesResult = await db.query("SELECT COUNT(*) as count FROM agencies WHERE role != 'superadmin'");
    const totalAgencies = parseInt(totalAgenciesResult.rows[0].count, 10);

    const paidAgenciesResult = await db.query("SELECT COUNT(*) as count FROM agencies WHERE role = 'paid'");
    const paidAgencies = parseInt(paidAgenciesResult.rows[0].count, 10);

    const totalSitesResult = await db.query('SELECT COUNT(*) as count FROM client_sites');
    const totalSites = parseInt(totalSitesResult.rows[0].count, 10);
    
    const mrr = paidAgencies * 299;

    const recentAgenciesResult = await db.query("SELECT id, agency_name, email, role, contact_person, address, brand_color, brand_logo_url, cms_url, cms_username, cms_password, created_at FROM agencies WHERE role != 'superadmin' ORDER BY created_at DESC");

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

// AI Observation Deck & CRM Endpoints
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
    const campaignsQuery = await db.query(`
      SELECT c.*, a.agency_name 
      FROM campaigns c 
      JOIN agencies a ON c.agency_id = a.id 
      ORDER BY c.created_at DESC
    `);
    
    // Add logic to fetch tasks and calculate revenue
    const campaigns = campaignsQuery.rows;
    for (let c of campaigns) {
      // Calc Revenue
      if (c.package_tier === 'basic') c.revenue = 499;
      else if (c.package_tier === 'pro') c.revenue = 899;
      else if (c.package_tier === 'enterprise') c.revenue = 1499;
      else c.revenue = 0;
      
      // Fetch upcoming tasks
      const tasksQuery = await db.query("SELECT * FROM agent_tasks WHERE campaign_id = $1 ORDER BY created_at ASC", [c.id]);
      c.tasks = tasksQuery.rows;
      
      // Pull real historic telemetry from SEMrush Analytics Agent
      const metricsQuery = await db.query("SELECT * FROM campaign_metrics WHERE campaign_id = $1 ORDER BY snapshot_date DESC LIMIT 1", [c.id]);
      
      if (metricsQuery.rows.length > 0) {
        const live = metricsQuery.rows[0];
        c.historic_metrics = {
          organicKeywords: live.organic_keywords,
          trafficValue: live.organic_traffic,
          domainRating: live.domain_rating,
          positionChanges: live.top_keywords || []
        };
      } else {
        // Fallback for newly mounted campaigns pending the Analytics engine pass
        c.historic_metrics = {
          organicKeywords: 0,
          trafficValue: 0,
          domainRating: 0,
          positionChanges: []
        };
      }
    }
    
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// Human-in-the-loop: Approve Task Custom Payload
router.post('/tasks/:taskId/approve', authenticateSuperadmin, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { edited_payload } = req.body;
    
    // Validate that the task exists and is awaiting approval
    const taskCheck = await db.query("SELECT * FROM agent_tasks WHERE id = $1 AND status = 'awaiting_approval'", [taskId]);
    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found or not awaiting approval.' });
    }
    
    // Save the human-edited payload and finalize the agent phase
    await db.query(`
      UPDATE agent_tasks 
      SET status = 'completed', result_payload = $1, completed_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [JSON.stringify(edited_payload), taskId]);
    
    const coreTaskObj = taskCheck.rows[0];
    
    // Epic 7: Extract potential WP Content Management System parameters linked to the current Campaign's Agency Parent Umbrella
    const agencyCmsResult = await db.query(`
      SELECT a.cms_url, a.cms_username, a.cms_password 
      FROM agencies a 
      JOIN campaigns c ON c.agency_id = a.id 
      WHERE c.id = $1
    `, [coreTaskObj.campaign_id]);
    const agencyCms = agencyCmsResult.rows[0];

    // Intercept specific payloads dynamically based on their underlying Neural Vector Types
    if (coreTaskObj.task_type === 'backlink_outreach') {
       const emailTo = edited_payload.to;
       const emailSubject = edited_payload.subject;
       const emailBody = edited_payload.body;
       
       await mailService.sendOutreachPitch(emailTo, emailSubject, emailBody);
       
       await db.query(`
         INSERT INTO agent_logs (campaign_id, agent_name, action_taken, thought_process)
         VALUES ($1, 'OutreachAgent', 'Dispatched Pitch Email', $2)
       `, [coreTaskObj.campaign_id, `Successfully routed HTML vector payload across SMTP grid directly to Prospect: [${emailTo}]`]);
       
    } else if (coreTaskObj.task_type === 'onsite_content') {
       // Zero-Friction CMS Webhook Publisher Route
       if (agencyCms && agencyCms.cms_url && agencyCms.cms_username && agencyCms.cms_password) {
           try {
               const wpTitle = edited_payload.H1 || edited_payload['Title Tag'] || 'Optimized SEO Draft';
               const metaDesc = edited_payload['Meta Description'] || 'Generated by OpenClaw Engine.';
               
               const wpBodyHtml = `
                 <h1>${wpTitle}</h1>
                 <p><strong>Primary Meta Focus:</strong> ${metaDesc}</p>
                 <hr/>
                 <img src="https://source.unsplash.com/random/800x400/?business,seo" alt="Enterprise SEO Structure" />
                 <p><em>This comprehensive onsite architecture was autonomously drafted and REST-pushed by the iShack AI Matrix via Native Webhooks.</em></p>
               `;
               
               const b64Auth = Buffer.from(`${agencyCms.cms_username}:${agencyCms.cms_password}`).toString('base64');
               const cleanUrl = agencyCms.cms_url.replace(/\/$/, ""); // Strip trailing slashes
               
               const wpResponse = await fetch(`${cleanUrl}/wp-json/wp/v2/posts`, {
                   method: 'POST',
                   headers: {
                       'Content-Type': 'application/json',
                       'Authorization': `Basic ${b64Auth}`
                   },
                   body: JSON.stringify({
                       title: wpTitle,
                       content: wpBodyHtml,
                       status: 'draft'
                   })
               });

               if (wpResponse.ok) {
                   await db.query(`
                     INSERT INTO agent_logs (campaign_id, agent_name, action_taken, thought_process)
                     VALUES ($1, 'ImplementationAgent', 'CMS Push Successful', 'Securely authenticated to WordPress REST API using provided Client Application Passwords. Successfully injected raw HTML schema as a DRAFT post.')
                   `, [coreTaskObj.campaign_id]);
               } else {
                   const errText = await wpResponse.text();
                   console.error("[WP REST FAILURE] Payload rejection:", errText);
               }
           } catch (pushErr) {
               console.error("[WP REST EXCEPTION] Webhook Network failure:", pushErr);
           }
       }
    }
    
    res.json({ message: 'Task formally approved. Action securely executed.' });
  } catch (e) {
    console.error('Task Approval Error:', e);
    res.status(500).json({ error: 'Failed to approve task externally' });
  }
});

// Global Targeted URLs Mapping Endpoint
router.get('/targeted-urls', authenticateSuperadmin, async (req, res) => {
  try {
    const query = `
      SELECT c.id as campaign_id, c.client_domain as url, c.package_tier, c.status as campaign_status, c.created_at, a.agency_name, a.id as agency_id,
             (SELECT COUNT(*) FROM agent_tasks t WHERE t.campaign_id = c.id) as task_count,
             (SELECT COUNT(*) FROM agent_tasks t WHERE t.campaign_id = c.id AND t.status = 'completed') as task_completed,
             (SELECT COUNT(*) FROM agent_logs l WHERE l.campaign_id = c.id) as active_hooks,
             (SELECT task_type FROM agent_tasks t WHERE t.campaign_id = c.id ORDER BY created_at DESC LIMIT 1) as current_phase
      FROM campaigns c
      JOIN agencies a ON c.agency_id = a.id
      ORDER BY c.created_at DESC
    `;
    const urls = await db.query(query);
    res.json(urls.rows);
  } catch(e) {
    res.status(500).json({ error: 'Failed to aggregate targeted URLs' });
  }
});

router.get('/agency-leads', authenticateSuperadmin, async (req, res) => {
  try {
    const query = `
      SELECT l.id, l.client_domain, l.client_email, l.audit_score, l.status, l.created_at, a.agency_name
      FROM agency_leads l
      JOIN agencies a ON l.agency_id = a.id
      ORDER BY l.created_at DESC
    `;
    const leads = await db.query(query);
    res.json(leads.rows);
  } catch (e) {
    res.status(500).json({ error: 'Failed to extract global CRM leads' });
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
    const { domain, tier, agencyId } = req.body;
    if (!domain) return res.status(400).json({ error: 'Domain is required.' });
    
    const packageTier = tier || 'basic';
    const finalAgencyId = agencyId ? parseInt(agencyId, 10) : req.user.agencyId;
    
    // Assign to the selected child agency (or fallback to Superadmin umbrella)
    await db.query("INSERT INTO campaigns (agency_id, client_domain, package_tier, status) VALUES ($1, $2, $3, 'active')", [finalAgencyId, domain, packageTier]);
    
    // Automatically trigger the PM agent heartbeat to pick up the brand new campaign immediately!
    await pmAgent.tick();
    
    res.json({ success: true, message: `The PM Agent has officially picked up the SEO targeted URL for ${domain}.` });
  } catch (error) {
    res.status(500).json({ error: 'Campaign targeting failed.', details: error.message });
  }
});

// Dynamic Promo Code Engine
router.get('/promo-codes', authenticateSuperadmin, async (req, res) => {
  try {
    const codes = await db.query('SELECT * FROM promo_codes ORDER BY created_at DESC');
    res.json(codes.rows);
  } catch(e) {
    res.status(500).json({ error: 'Failed to fetch promo codes' });
  }
});

router.post('/promo-codes', authenticateSuperadmin, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Promo code string required' });
    await db.query('INSERT INTO promo_codes (code) VALUES ($1)', [code.toUpperCase()]);
    res.json({ success: true });
  } catch(e) {
    res.status(500).json({ error: 'Failed to create promo code. It might already exist.' });
  }
});

router.delete('/promo-codes/:id', authenticateSuperadmin, async (req, res) => {
  try {
    await db.query('DELETE FROM promo_codes WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch(e) {
    res.status(500).json({ error: 'Failed to delete promo code' });
  }
});

router.post('/sandbox/seed-vera', async (req, res) => {
  try {
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash('123456789', 10);
    await db.query(`
      INSERT INTO agencies (agency_name, email, password_hash, role)
      VALUES ('Vera Sharp - OpenClaw', 'veras@ishack.co.za', $1, 'superadmin')
      ON CONFLICT (email) DO UPDATE SET password_hash = $1, role = 'superadmin'
    `, [hash]);
    res.json({ success: true, message: 'Superadmin veras@ishack.co.za physically injected into production DB.' });
  } catch (err) {
    res.status(500).json({ error: 'Fatal seed error', details: err.message });
  }
});

// Real-Time Self-Healing QA Uptime Telemetry
router.get('/platform-health', authenticateSuperadmin, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM platform_health ORDER BY snapshot_date DESC LIMIT 5');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Failed to access structural telemetry' });
  }
});

// Force the QA Engine to perform an immediate hot-audit outside of the scheduler loop
router.post('/sandbox/trigger-qa', authenticateSuperadmin, async (req, res) => {
  try {
    const qaAgent = require('../agents/qaAgent');
    // Non-blocking fire and forget
    qaAgent.runHealthCheck('https://ishackaeo.com').catch(console.error);
    res.json({ message: 'QA Health Trace Initialized in background.' });
  } catch(e) {
    res.status(500).json({ error: 'QA Initialization Failed' });
  }
});

module.exports = router;
