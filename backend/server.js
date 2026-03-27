require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cheerio = require('cheerio');
const authRouter = require('./auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Auth Routes
app.use('/api/auth', authRouter);

// Protected Sites API
const sitesRouter = require('./sites');
app.use('/api/sites', sitesRouter);

// Superadmin API
const adminRouter = require('./admin');
app.use('/api/admin', adminRouter);

// Real SEMRush & HTML Audit Integration
app.post('/api/openclaw/trigger', async (req, res) => {
  const { eventType, payload } = req.body;
  const targetUrl = payload?.website;
  
  if (!targetUrl) {
    return res.status(400).json({ success: false, error: 'No website provided' });
  }
  
  try {
    const urlObj = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
    const domain = urlObj.hostname.replace('www.', '');
    
    // 1. Structural HTML Scraping
    let score = 100;
    const issues = [];
    
    try {
      const response = await fetch(urlObj.href, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const html = await response.text();
      const $ = cheerio.load(html);
      
      const title = $('title').text();
      const metaDesc = $('meta[name="description"]').attr('content');
      const h1Count = $('h1').length;
      
      if (!title || title.length < 10) { issues.push('Title tag is missing or too short.'); score -= 15; }
      if (!metaDesc || metaDesc.length < 50) { issues.push('Meta description is missing or too short.'); score -= 20; }
      if (h1Count === 0) { issues.push('No H1 tag detected.'); score -= 15; }
      else if (h1Count > 1) { issues.push('Multiple H1 tags detected (should be unique per page).'); score -= 10; }
      
      $('img').each((i, el) => {
        if (!$(el).attr('alt')) {
          if (i === 0) { issues.push('Images are missing alt-text descriptions.'); score -= 10; }
        }
      });
    } catch (scrapeErr) {
      issues.push(`Failed to analyze HTML structure: ${scrapeErr.message}`);
      score -= 30;
    }

    // 2. Fetch Live SEMRush Data
    let semrushData = { rank: '-', organicKeywords: '-', organicTraffic: '-', trafficCost: '-', topKeywords: [] };
    const semrushKey = process.env.SEMRUSH_API_KEY || '77a0242d2998078e52b1a2d4ec514613';
    
    try {
      const srUrl = `https://api.semrush.com/?type=domain_ranks&key=${semrushKey}&export_columns=Dn,Rk,Or,Ot,Oc&domain=${domain}&database=us`;
      const srRes = await fetch(srUrl);
      const csvData = await srRes.text();
      
      if (csvData && !csvData.startsWith('ERROR')) {
        const lines = csvData.trim().split('\n');
        if (lines.length > 1) {
          const values = lines[1].split(';');
          semrushData.rank = values[1] ? values[1].trim() : 'N/A';
          semrushData.organicKeywords = values[2] ? values[2].trim() : '0';
          semrushData.organicTraffic = values[3] ? values[3].trim() : '0';
          semrushData.trafficCost = values[4] ? values[4].trim() : '0';
        }
      }

      const kwUrl = `https://api.semrush.com/?type=domain_organic&key=${semrushKey}&display_limit=5&export_columns=Ph,Po,Nq,Cp&domain=${domain}&database=us`;
      const kwRes = await fetch(kwUrl);
      const kwCsv = await kwRes.text();

      if (kwCsv && !kwCsv.startsWith('ERROR')) {
        const kwLines = kwCsv.trim().split('\n');
        for (let i = 1; i < kwLines.length; i++) {
          if (kwLines[i]) {
            const vals = kwLines[i].split(';');
            semrushData.topKeywords.push({
              phrase: vals[0] ? vals[0].trim() : '',
              position: vals[1] ? vals[1].trim() : '',
              volume: vals[2] ? vals[2].trim() : '',
              cpc: vals[3] ? vals[3].trim() : ''
            });
          }
        }
      }
    } catch (semErr) {
      console.error('SEMRush fetch error:', semErr.message);
    }
    
    if (semrushData.organicTraffic === '0' || semrushData.organicTraffic === '-') {
      issues.push('SEMRush reports practically zero organic traffic. Major SEO campaign required.');
      score -= 15;
    }
    if (score < 15) score = 15; // floor

    res.status(200).json({ 
      success: true, 
      report: {
        domain,
        score,
        issuesFound: issues.length,
        criticalErrors: issues.length > 2 ? 2 : issues.length,
        suggestions: issues.length > 0 ? issues : ['Your website is well optimized!'],
        metrics: semrushData || { rank: '-', organicKeywords: '-', organicTraffic: '-', trafficCost: '-' }
      }
    });
  } catch (error) {
    console.error("[Analysis Error]", error);
    res.status(500).json({ success: false, error: 'Failed to analyze website' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
