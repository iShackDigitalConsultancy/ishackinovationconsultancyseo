require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const authRouter = require('./auth');
const widgetRouter = require('./widget');

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

// Widget Routes
app.use('/api/widget', widgetRouter);

// Protected Sites API
const sitesRouter = require('./sites');
app.use('/api/sites', sitesRouter);

// Superadmin API
const adminRouter = require('./admin');
app.use('/api/admin', adminRouter);

// B2B White-Label Client Portal API
const clientRouter = require('./client');
app.use('/api/client', clientRouter);

// Payment Gateways & Promos
const paymentsRouter = require('./payments');
app.use('/api/payments', paymentsRouter);

// Real SEMRush & HTML Audit Integration
app.post('/api/openclaw/trigger', async (req, res) => {
  const { eventType, payload } = req.body;
  const targetUrl = payload?.website;
  const competitorUrl = payload?.competitor;
  const region = payload?.region || 'us';
  const targetKeyword = payload?.targetKeyword || '';
  
  let keywordOpt = { provided: false, inTitle: false, inH1: false, inMeta: false, inBody: false };
  let extractedSchemas = [];

  if (!targetUrl) {
    return res.status(400).json({ success: false, error: 'No website provided' });
  }
  
  try {
    const urlObj = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
    const domain = urlObj.hostname.replace('www.', '');
    
    // 1. Structural HTML Scraping & Value Areas
    let score = 100;
    const issues = [];
    let loadSpeedMs = 0;
    let wordCount = 0;
    let hasViewport = false;
    let hasOpenGraph = false;
    
    try {
      const startTime = Date.now();
      let html = '';
      let browser;
      
      try {
        browser = await puppeteer.launch({
          headless: 'new',
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
          executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0');
        await page.goto(urlObj.href, { waitUntil: 'networkidle2', timeout: 15000 });
        html = await page.content();
      } catch (scrapingErr) {
        console.warn('Puppeteer failed, falling back to fetch:', scrapingErr.message);
        const response = await fetch(urlObj.href, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        html = await response.text();
      } finally {
        if (browser) await browser.close();
      }
      
      loadSpeedMs = Date.now() - startTime;
      
      const $ = cheerio.load(html);
      
      const title = $('title').text();
      const metaDesc = $('meta[name="description"]').attr('content');
      const h1Count = $('h1').length;
      
      hasViewport = $('meta[name="viewport"]').length > 0;
      hasOpenGraph = $('meta[property^="og:"]').length > 0;
      
      const pageText = $('body').text().replace(/\s+/g, ' ').trim();
      wordCount = pageText ? pageText.split(' ').length : 0;

      // Schema Extraction
      $('script[type="application/ld+json"]').each((i, el) => {
        try { 
          extractedSchemas.push(JSON.parse($(el).html())); 
        } catch(e) {}
      });
      hasSchema = extractedSchemas.length > 0;
      
      if (!title || title.length < 10) { issues.push('Title tag is missing or too short.'); score -= 15; }
      if (!metaDesc || metaDesc.length < 50) { issues.push('Meta description is missing or too short.'); score -= 20; }
      if (h1Count === 0) { issues.push('No H1 tag detected.'); score -= 15; }
      else if (h1Count > 1) { issues.push('Multiple H1 tags detected (should be unique per page).'); score -= 10; }
      if (!hasViewport) { issues.push('Missing Mobile Viewport meta tag. Site is not mobile-responsive.'); score -= 15; }
      if (!hasOpenGraph) { issues.push('Missing Social OpenGraph tags. Links shared on LinkedIn/Twitter will look broken.'); score -= 10; }
      
      $('img').each((i, el) => {
        if (!$(el).attr('alt')) {
          if (i === 0) { issues.push('Images are missing alt-text descriptions.'); score -= 10; }
        }
      });
      
      if (loadSpeedMs > 2000) { issues.push(`Poor server response time (${loadSpeedMs}ms). Goal is < 800ms.`); score -= 10; }
      
      const isSPA = wordCount < 50 && $('script[src]').length > 0;
      if (isSPA) {
        issues.push(`This website appears to be a Client-Side Rendered app (e.g. Angular/React). Without Server-Side Rendering (SSR), search engines will struggle to index your content, which explains the 0 content depth.`);
        score -= 25;
      } else if (wordCount < 400) { 
        issues.push(`Thin Content detected (${wordCount} words). Minimum viable lengths range from 1,200+ words.`); 
        score -= 10; 
      }
      
      // 1B. Target Keyword Optimization Analysis
      if (targetKeyword) {
        keywordOpt.provided = true;
        const kw = targetKeyword.toLowerCase().trim();
        
        keywordOpt.inTitle = title.toLowerCase().includes(kw);
        keywordOpt.inMeta = metaDesc ? metaDesc.toLowerCase().includes(kw) : false;
        
        $('h1').each((i, el) => {
          if ($(el).text().toLowerCase().includes(kw)) keywordOpt.inH1 = true;
        });
        
        keywordOpt.inBody = pageText.toLowerCase().includes(kw);

        if (!keywordOpt.inTitle) { issues.push(`Your Target Keyword ("${targetKeyword}") is missing from the Title Tag! This is a severe ranking signal leak.`); score -= 15; }
        if (!keywordOpt.inH1) { issues.push(`Target Keyword ("${targetKeyword}") is missing from your primary H1 heading.`); score -= 10; }
        if (!keywordOpt.inMeta) { issues.push(`Consider adding your Target Keyword to the Meta Description for better Click-Through-Rate (CTR).`); }
        if (!keywordOpt.inBody) { issues.push(`Your Target Keyword does not appear naturally in the body content!`); score -= 20; }
      }

    } catch (scrapeErr) {
      issues.push(`Failed to analyze HTML structure: ${scrapeErr.message}`);
      score -= 30;
    }

    // AI Schema Audit & Project Manager Plan
    let schemaAudit = {
      hasSchema,
      verdict: '',
      missingPriority: [],
      generatedJsonLd: '',
      projectManagerPlan: []
    };

    try {
      if (process.env.OPENAI_API_KEY) {
          const schemaPrompt = `
          Analyze this website's current JSON-LD schema AND their list of critical SEO Technical Issues.
          
          Current Schema: ${JSON.stringify(extractedSchemas)}
          SEO Issues Detected: ${JSON.stringify(issues)}
          
          Tasks:
          1. Provide a blunt verdict on the existing schema's usefulness.
          2. List missing/weak schemas with priority (HIGH/MED/LOW). Specially check for LocalBusiness, Organization, or FAQPage.
          3. Generate exact, clean JSON-LD code for the most HIGH priority missing schema using placeholders.
          4. Act as a Project Manager: Create a step-by-step manual action plan to fix the "SEO Issues Detected". Provide a clear "task" name and detailed "instruction" on how a non-technical user or developer should fix it.
          
          Respond in strict JSON format: 
          {
            "verdict": "string",
            "missingPriority": ["list of strings"],
            "generatedJsonLd": "string containing code",
            "projectManagerPlan": [
              { "task": "Task Name", "instruction": "Step by step manual instruction to fix the issue" }
            ]
          }
        `;

        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            response_format: { type: "json_object" },
            messages: [{ role: 'user', content: schemaPrompt }]
          })
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const parsedContent = JSON.parse(aiData.choices[0].message.content);
          schemaAudit.verdict = parsedContent.verdict;
          schemaAudit.missingPriority = parsedContent.missingPriority || [];
          schemaAudit.generatedJsonLd = parsedContent.generatedJsonLd || '';
          schemaAudit.projectManagerPlan = parsedContent.projectManagerPlan || [];
        }
      }
    } catch (e) {
      console.error("Schema AI generation failed", e);
    }
    
    // Fallback if AI fails or no key
    if (!schemaAudit.verdict) {
      let fallbackMsg = process.env.OPENAI_API_KEY ? "AI Generation API Error." : "OPENAI_API_KEY is missing.";
      if (hasSchema) {
        schemaAudit.verdict = `${fallbackMsg} Fallback checking: Schema detected but lacks JSON-LD map.`;
        schemaAudit.missingPriority = ["LocalBusiness (HIGH)", "FAQPage (MED)", "BreadcrumbList (LOW)"];
      } else {
        schemaAudit.verdict = "CRITICAL: No JSON-LD schema detected. Search engines cannot easily categorize this business.";
        schemaAudit.missingPriority = ["LocalBusiness (HIGH)", "Organization (HIGH)", "WebSite (MED)"];
        schemaAudit.generatedJsonLd = "{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"LocalBusiness\",\n  \"name\": \"[Your Business Name]\",\n  \"image\": \"[Your Image URL]\",\n  \"url\": \"[Your Website URL]\",\n  \"telephone\": \"[Your Phone]\",\n  \"address\": {\n    \"@type\": \"PostalAddress\",\n    \"streetAddress\": \"[Street]\",\n    \"addressLocality\": \"[City]\",\n    \"addressRegion\": \"[State]\",\n    \"postalCode\": \"[Zip]\",\n    \"addressCountry\": \"[Country]\"\n  }\n}";
      }
      
      if (!schemaAudit.projectManagerPlan || schemaAudit.projectManagerPlan.length === 0) {
        schemaAudit.projectManagerPlan = issues.map(iss => ({
          task: "Resolve Technical Flag",
          instruction: `Manual Fix Required: ${iss}`
        }));
      }
    }

    // 2. Fetch Live SEMRush Data
    let semrushData = { rank: '-', organicKeywords: '-', organicTraffic: '-', trafficCost: '-', adKeywords: '-', adTraffic: '-', adCost: '-', topKeywords: [] };
    const semrushKey = process.env.SEMRUSH_API_KEY || '77a0242d2998078e52b1a2d4ec514613';
    
    try {
      const srUrl = `https://api.semrush.com/?type=domain_ranks&key=${semrushKey}&export_columns=Dn,Rk,Or,Ot,Oc,Ad,At,Ac&domain=${domain}&database=${region}`;
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
          semrushData.adKeywords = values[5] ? values[5].trim() : '0';
          semrushData.adTraffic = values[6] ? values[6].trim() : '0';
          semrushData.adCost = values[7] ? values[7].trim() : '0';
        }
      }

      const kwUrl = `https://api.semrush.com/?type=domain_organic&key=${semrushKey}&display_limit=5&export_columns=Ph,Po,Nq,Cp&domain=${domain}&database=${region}`;
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

      // Competitor SEMrush Analysis
      if (competitorUrl) {
        try {
          const compUrlObj = new URL(competitorUrl.startsWith('http') ? competitorUrl : `https://${competitorUrl}`);
          const compDomain = compUrlObj.hostname.replace('www.', '');
          
          semrushData.competitorData = { domain: compDomain, keywords: [] };
          
          const compApiUrl = `https://api.semrush.com/?type=domain_organic&key=${semrushKey}&display_limit=10&export_columns=Ph,Po,Nq,Cp,Kd&domain=${compDomain}&database=${region}`;
          const compRes = await fetch(compApiUrl);
          const compCsv = await compRes.text();
          
          if (compCsv && !compCsv.startsWith('ERROR')) {
            const compLines = compCsv.trim().split('\n');
            for (let i = 1; i < compLines.length; i++) {
              if (compLines[i]) {
                const vals = compLines[i].split(';');
                semrushData.competitorData.keywords.push({
                  phrase: vals[0] ? vals[0].trim() : '',
                  position: vals[1] ? vals[1].trim() : '',
                  volume: vals[2] ? vals[2].trim() : '',
                  cpc: vals[3] ? vals[3].trim() : '',
                  difficulty: vals[4] ? vals[4].trim() : '-'
                });
              }
            }
          }
        } catch (compErr) {
          console.error('Competitor SEMRush fetch error:', compErr.message);
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

    // Link Deficit Projector Algorithm
    let linkDeficit = 45; // baseline High-DR links needed to move needles
    let primaryTarget = 'Niche Keyword';
    if (semrushData.topKeywords.length > 0) {
      primaryTarget = semrushData.topKeywords[0].phrase;
      let topVol = parseInt(semrushData.topKeywords[0].volume) || 1000;
      linkDeficit = Math.max(15, Math.floor(topVol / 400)); // Dynamic heuristic: 1 high-DR link per 400 search volume
    }

    // 3. AI Consulting Advice Synthesis
    const advice = [];
    if (parseInt(semrushData.organicTraffic) > 1000) {
      advice.push(`Your organic traffic is estimated at ${semrushData.organicTraffic}/mo holding a commercial value of $${semrushData.trafficCost}. To scale this sustainably to a $100k asset, identify your pages ranking #11-#20 and inject thematic LSI semantic clusters to push them to Page 1.`);
    } else {
      advice.push(`Your domain lacks a strong establishing organic footprint. You must initiate a foundational Link Building and Content Marketing campaign targeting low-competition, high-intent keywords immediately.`);
    }

    if (semrushData.topKeywords.length > 0) {
      advice.push(`Based on your top performing keyword cluster ("${primaryTarget}"), we strongly recommend architecting 3 authoritative pillar pages. Since your homepage exhibits a structural density of ${wordCount} words, ensure all new pillar guides exceed 1,500+ words to dominate search engine topical graphs.`);
    } else {
      advice.push(`Without organic keyword leverage, your immediate strategy should be producing localized or highly-niche blog hubs. Google heavily punishes "Thin Content" (under 1,000 words). Your scanned page came in at ${wordCount} words.`);
    }

    if (parseInt(semrushData.adTraffic) > 0) {
      advice.push(`We detected your competitors or you are heavily investing ~$${semrushData.adCost}/mo acquiring ${semrushData.adTraffic} ad clicks. We can consult on reallocating 20% of this budget into equivalent organic assets to permanently lower your Blended Customer Acquisition Cost.`);
    } else {
      advice.push(`We found zero Paid Search (AdWords) momentum surrounding this domain profile. This is highly risky as competitors can easily bid on your exact brand terms. Expanding into a dual Organic & Paid SEO strategy is advised.`);
    }

    res.status(200).json({ 
      success: true, 
      report: {
        domain,
        score,
        issuesFound: issues.length,
        criticalErrors: issues.length,
        suggestions: issues.length > 0 ? issues : ['Your website is well optimized!'],
        metrics: semrushData,
        schemaAudit,
        keywordOptimization: keywordOpt,
        technicalValuation: {
          loadSpeedMs,
          wordCount,
          hasViewport,
          hasOpenGraph,
          hasSchema,
          linkDeficit,
          primaryTarget,
          adCost: semrushData.adCost,
          adKeywords: semrushData.adKeywords
        },
        consultingAdvice: advice
      }
    });
  } catch (error) {
    console.error("[Analysis Error]", error);
    res.status(500).json({ success: false, error: 'Failed to analyze website' });
  }
});

// Initialize AI CRON background agents
require('./cron/scheduler').initSchedulers();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
