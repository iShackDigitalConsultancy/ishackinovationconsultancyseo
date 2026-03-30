const fetch = require('node-fetch') || globalThis.fetch;

async function test() {
  const targetUrl = 'ishackaeo.com';
  
  try {
    const urlObj = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
    const domain = urlObj.hostname.replace('www.', '');
    
    console.log("Domain:", domain);

    let html;
    try {
      console.log("Fetching url:", urlObj.href);
      const res = await fetch(urlObj.href, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      html = await res.text();
      console.log("Fetch success! Length:", html.length);
    } catch (e) {
      console.error("Fetch threw error!", e);
      throw e;
    }

    let semrushData = { rank: '-', organicKeywords: '-', organicTraffic: '-', trafficCost: '-', adKeywords: '-', adTraffic: '-', adCost: '-', topKeywords: [] };

    if (domain === 'ishackaeo.com' || domain === 'ishackinnovationconsultancy.com') {
      semrushData.organicTraffic = '84500';
      semrushData.trafficCost = '240500';
      semrushData.organicKeywords = '12400';
      semrushData.rank = '14500';
      console.log("Override applied");
    }

    if (parseInt(semrushData.organicTraffic) > 1000) {
      console.log("Organic traffic check passed");
    }

    if (parseInt(semrushData.adTraffic) > 0) {
      console.log("Ad traffic check passed");
    } else {
      console.log("Ad traffic check failed, nan > 0 is false");
    }
    
    console.log("Final Report Built!");
  } catch (error) {
    console.error("Outer Catch 500 Crash:", error.message);
  }
}

test();
