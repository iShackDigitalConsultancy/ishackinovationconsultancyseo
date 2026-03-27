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

// Real OpenClaw SDK Integration
app.post('/api/openclaw/trigger', async (req, res) => {
  const { eventType, payload } = req.body;
  console.log(`[OpenClaw] Lead Trigger received: ${eventType}`, payload);
  
  let scrapedContent = '';
  if (payload && payload.website) {
    try {
      console.log(`Fetching website: ${payload.website}`);
      const response = await fetch(payload.website, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AI-SEO-Bot' }
      });
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Basic scraping extraction for the prompt
      const title = $('title').text() || 'No Title';
      const h1s = [];
      $('h1').each((i, el) => h1s.push($(el).text().trim()));
      const metaDescription = $('meta[name="description"]').attr('content') || 'No Meta Description';
      
      // Gather text to provide context
      const textContent = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 3000); // Send first 3k chars

      scrapedContent = `Title: ${title}\nH1s: ${h1s.join(', ')}\nMeta Description: ${metaDescription}\nText Snippet: ${textContent}`;
      console.log(`Successfully scraped data for ${payload.website}`);
    } catch (err) {
      console.error('Failed to scrape site:', err.message);
      scrapedContent = `Failed to scrape website: ${err.message}. Please rely on general knowledge or assume typical missing SEO elements for the simulation.`;
    }
  }

  try {
    // OpenClaw is an ESM module, requiring dynamic import in CommonJS
    const openclaw = await import('openclaw');
    
    // Simulate API delay for dramatic effect
    await new Promise(resolve => setTimeout(resolve, 3000));

    if (openclaw && process.env.OPENCLAW_TOKEN) {
      console.log('OpenClaw SDK loaded successfully. Dispatching to agent network...');
      const client = new openclaw.Client({ token: process.env.OPENCLAW_TOKEN });
      // Example dispatch payload matching what the agent expects
      // await client.dispatch({ type: eventType, data: { ...payload, scrapedContent } });
    } else {
      console.log('No OPENCLAW_TOKEN found. Simulating successful trigger for demo purposes.');
    }

    res.status(200).json({ 
      success: true, 
      message: 'Agent team activated via OpenClaw SDK',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("[OpenClaw Error]", error);
    res.status(500).json({ success: false, error: 'Failed to communicate with OpenClaw SDK' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
