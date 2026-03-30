const puppeteer = require('puppeteer');
const db = require('../db');

class QAAgent {
  constructor() {
    this.name = 'QAAgent';
  }

  async runHealthCheck(targetUrl = 'https://ishackaeo.com') {
    console.log(`🛡️ [QA Agent] Initializing Structural Health Sweep for ${targetUrl}`);
    let browser;
    try {
      browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors', '--incognito']
      });

      const page = await browser.newPage();
      
      const errors = [];
      page.on('pageerror', err => errors.push(err.toString()));
      page.on('console', msg => {
        if(msg.type() === 'error') errors.push(msg.text());
      });

      const startMs = Date.now();
      
      const response = await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      const latencyMs = Date.now() - startMs;
      
      // Calculate missing assets or 404s dynamically captured on load
      let brokenLinks = 0;
      if (response && response.status() >= 400) {
        brokenLinks++;
        errors.push(`HTTP ${response.status()} encountered on root.`);
      }

      // Check all visible hrefs
      const links = await page.$$eval('a', anchors => anchors.map(a => a.href));
      const validLinks = links.filter(l => l && l.startsWith('http'));
      
      // We won't crawl all links to save thread blocking, but we will heuristically punish high load times.
      let uxScore = 100;
      if (latencyMs > 2000) uxScore -= Math.floor((latencyMs - 2000) / 100);
      uxScore -= (errors.length * 5);
      uxScore = Math.max(10, Math.min(uxScore, 100));

      await db.query(`
        INSERT INTO platform_health (latency_ms, broken_links, ux_score, console_errors)
        VALUES ($1, $2, $3, $4)
      `, [latencyMs, brokenLinks, uxScore, JSON.stringify(errors)]);

      console.log(`🛡️ [QA Agent] Sweep Complete. Latency: ${latencyMs}ms | UX Score: ${uxScore}. Logs secured.`);
      
    } catch (e) {
      console.error(`[QA Agent] Fatal Crash during health check:`, e);
      // Log emergency failure
      await db.query(`
        INSERT INTO platform_health (latency_ms, broken_links, ux_score, console_errors)
        VALUES ($1, $2, $3, $4)
      `, [0, 1, 0, JSON.stringify(["FATAL PUPPETEER THREAD FAILURE: " + e.message])]);
    } finally {
      if (browser) await browser.close();
    }
  }
}

module.exports = new QAAgent();
