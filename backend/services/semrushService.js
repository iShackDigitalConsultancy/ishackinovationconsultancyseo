// Using native Node 18+ fetch

class SemrushService {
  constructor() {
    // Rely on environment variable loaded early in the app lifecycle
    this.apiKey = process.env.SEMRUSH_API_KEY;
  }

  /**
   * Fetch Organic Search Keywords for a given domain
   * @param {string} domain - Target domain (e.g. 'google.com')
   * @param {string} database - SEMRush territory database (default 'us')
   * @param {number} limit - Number of keywords to extract (default 10)
   * @returns {Promise<string>} CSV string of data
   */
  async getDomainOrganicKeywords(domain, database = 'us', limit = 10) {
    if (!this.apiKey) {
      console.warn("[SEMRUSH] API Key missing. Falling back to Simulation CSV.");
      return "Keyword,Position,Search Volume,CPC,URL,Traffic (%)\nsimulation-keyword-1,1,1000,1.5,/,10\nsimulation-keyword-2,2,500,2.0,/about,5";
    }

    try {
      const url = `https://api.semrush.com/?type=domain_organic&key=${this.apiKey}&display_limit=${limit}&export_columns=Ph,Po,Nq,Cp,Ur,Tr&domain=${domain}&database=${database}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`SEMRush API Error: ${response.statusText}`);
      }

      const rawCsv = await response.text();
      
      // if SEMrush returns ERROR... it's usually formatted as ERROR :: Message inside the text
      if (rawCsv.includes('ERROR 50')) {
        return "Keyword;Position;Search Volume;CPC;URL;Traffic\n";
      } else if (rawCsv.includes('ERROR')) {
        throw new Error(`SEMRush API returned an error payload: ${rawCsv}`);
      }

      return rawCsv;
    } catch (e) {
      console.error("[SEMRUSH] Service Integration Error:", e.message);
      throw e;
    }
  }
  /**
   * Fetch Organic Traffic Analytics (Organic Traffic, Organic Keywords, etc.)
   * @param {string} domain - Target domain
   * @param {string} database - SEMRush territory database (default 'us')
   * @returns {Promise<Object>} Formatted metrics object
   */
  async getDomainAnalytics(domain, database = 'us') {
    if (!this.apiKey) {
      console.warn("[SEMRUSH] API Key missing. Falling back to Simulation Analytics.");
      return { organic_traffic: 12500, organic_keywords: 850, organic_cost: 4500 };
    }

    try {
      // export_columns: Or (Organic Keywords), Ot (Organic Traffic), Oc (Organic Cost)
      const url = `https://api.semrush.com/?type=domain_ranks&key=${this.apiKey}&export_columns=Or,Ot,Oc&domain=${domain}&database=${database}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`SEMRush API Error: ${response.statusText}`);
      }

      const rawCsv = await response.text();
      if (rawCsv.includes('ERROR')) {
        throw new Error(`SEMRush API returned an error payload: ${rawCsv}`);
      }

      // Parse CSV: expected header "Organic Keywords;Organic Traffic;Organic Cost" -> lines are separated by \n, columns by ;
      const lines = rawCsv.trim().split('\n');
      if (lines.length < 2) return { organic_traffic: 0, organic_keywords: 0, organic_cost: 0 };
      
      const values = lines[1].split(';');
      return {
        organic_keywords: parseInt(values[0]) || 0,
        organic_traffic: parseInt(values[1]) || 0,
        organic_cost: parseInt(values[2]) || 0
      };
    } catch (e) {
      console.error("[SEMRUSH] Domain Analytics Error:", e.message);
      return { organic_traffic: 0, organic_keywords: 0, organic_cost: 0 }; // Fail safely
    }
  }
}

module.exports = new SemrushService();
