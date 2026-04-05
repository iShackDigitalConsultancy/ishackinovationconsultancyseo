const axios = require('axios');

class WordPressService {

  /**
   * Pushes an HTML content payload to a target WordPress website via REST API.
   * @param {Object} credentials - The WP target parameters.
   * @param {string} credentials.wp_url - e.g. "https://ishackaeo.com"
   * @param {string} credentials.wp_username - The WP Admin username
   * @param {string} credentials.wp_password - The App Password
   * @param {string} title - The generated Article Title
   * @param {string} htmlContent - The beautifully designed HTML body
   * @param {string} status - 'publish' | 'draft' 
   */
  async uploadArticle(credentials, title, htmlContent, status = 'publish') {
    if (!credentials || !credentials.wp_url || !credentials.wp_username || !credentials.wp_password) {
      throw new Error("Missing partial WordPress targeting constraints.");
    }

    const { wp_url, wp_username, wp_password } = credentials;

    // Clean URL
    const sanitizedUrl = wp_url.replace(/\/$/, "");
    const apiUrl = `${sanitizedUrl}/wp-json/wp/v2/posts`;

    // Construct Basic Auth Base64 Hash
    const base64Auth = Buffer.from(`${wp_username}:${wp_password}`).toString('base64');

    try {
      const response = await axios.post(apiUrl, {
        title: title,
        content: htmlContent,
        status: status
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${base64Auth}`
        }
      });

      if (response && response.data && response.data.id) {
         return {
           success: true,
           postId: response.data.id,
           postLink: response.data.link
         };
      } else {
         throw new Error("Unexpected API response structure.");
      }

    } catch (e) {
      console.error(`[WordPressService] REST push failed for ${wp_url}:`, e.response?.data || e.message);
      throw new Error(`WordPress API rejection: ${e.response?.data?.message || e.message}`);
    }
  }

}

module.exports = new WordPressService();
