const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

class GoogleAnalyticsService {
  constructor() {
    this.propertyId = process.env.GA_PROPERTY_ID;
    
    const tokenPath = path.join(__dirname, '../token.json');
    const credsPath = path.join(__dirname, '../credentials.json');

    if (this.propertyId && fs.existsSync(tokenPath) && fs.existsSync(credsPath)) {
      try {
        const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
        const { client_secret, client_id, redirect_uris } = creds.installed || creds.web;
        const redirectUri = (redirect_uris && redirect_uris[0]) || 'urn:ietf:wg:oauth:2.0:oob';
        
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirectUri);
        oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(tokenPath, 'utf8')));

        this.analyticsDataClient = new BetaAnalyticsDataClient({ authClient: oAuth2Client });
        this.isMock = false;
        console.log("Vera Sharp is authenticated via OAuth2 to fetch Google Analytics.");
      } catch (err) {
        console.log("Error loading OAuth credentials for GA:", err);
        this.isMock = true;
      }
    } else {
      this.isMock = true;
      console.warn("Google Analytics OAuth credentials (token.json/credentials.json) or GA_PROPERTY_ID missing. Falling back to mock data.");
    }
  }

  async getDashboardMetrics(dynamicPropertyId = null) {
    const targetPropertyId = dynamicPropertyId || this.propertyId;
    if (this.isMock || !targetPropertyId) {
      // Return plausible looking mock data for the dashboard until credentials are provided.
      return {
        isMock: true,
        activeUsers: Math.floor(Math.random() * 5000) + 1000,
        pageViews: Math.floor(Math.random() * 20000) + 5000,
        bounceRate: (Math.random() * 20 + 30).toFixed(2), // 30% to 50%
        averageSessionDuration: Math.floor(Math.random() * 120) + 60, // 60s to 180s
      };
    }

    try {
      const [response] = await this.analyticsDataClient.runReport({
        property: `properties/${targetPropertyId}`,
        dateRanges: [
          {
            startDate: '30daysAgo',
            endDate: 'today',
          },
        ],
        metrics: [
          { name: 'activeUsers' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' }
        ],
      });

      if (response && response.rows && response.rows.length > 0) {
        const row = response.rows[0];
        return {
          isMock: false,
          activeUsers: parseInt(row.metricValues[0].value) || 0,
          pageViews: parseInt(row.metricValues[1].value) || 0,
          bounceRate: parseFloat(row.metricValues[2].value).toFixed(2) || "0.00",
          averageSessionDuration: parseInt(row.metricValues[3].value) || 0,
        };
      }

      return {
        isMock: false,
        activeUsers: 0,
        pageViews: 0,
        bounceRate: "0.00",
        averageSessionDuration: 0
      };

    } catch (error) {
      console.error('Failed to fetch Google Analytics metrics:', error.message);
      // Fallback to zeros or specific error states if API fails
      return {
        isMock: false,
        activeUsers: 0,
        pageViews: 0,
        bounceRate: "0.00",
        averageSessionDuration: 0,
        error: "API credentials valid but fetch failed. Check Property ID permissions."
      };
    }
  }
}

module.exports = new GoogleAnalyticsService();
