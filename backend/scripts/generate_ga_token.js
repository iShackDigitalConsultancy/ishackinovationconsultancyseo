const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const path = require('path');

// If modifying these scopes, delete token.json.
// The primary scope required to read GA4 data:
const SCOPES = ['https://www.googleapis.com/auth/analytics.readonly'];
const CREDENTIALS_PATH = path.join(__dirname, '../credentials.json');
const TOKEN_PATH = path.join(__dirname, '../token.json');

// Load client secrets from a local file.
fs.readFile(CREDENTIALS_PATH, (err, content) => {
  if (err) {
    console.log('Error loading client secret file:', err);
    console.log('CRITICAL: Please ensure you downloaded the OAuth 2.0 Client credentials from Google and saved them as backend/credentials.json');
    return;
  }
  // Authorize a client with credentials, then call the Google Analytics API.
  authorize(JSON.parse(content), () => {
    console.log('\n[SUCCESS] token.json has been created and verified!');
    console.log('You can now restart your backend server. Vera will use her direct access to pull GA metrics.');
    process.exit(0);
  });
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  // Fallback to urn:ietf:wg:oauth:2.0:oob if redirect_uris does not contain valid Desktop flow URIs
  const redirectUri = (redirect_uris && redirect_uris[0]) || 'urn:ietf:wg:oauth:2.0:oob';
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirectUri);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // Forces a refresh token to be issued
  });
  console.log('==============================================');
  console.log('AUTHORIZE GOOGLE ANALYTICS ACCESS FOR VERA');
  console.log('==============================================\n');
  console.log('1. Open Chrome/Safari and visit this Google URL:');
  console.log(`\n${authUrl}\n`);
  console.log('2. Sign in specifically as: veras@ishack.co.za');
  console.log('3. Click "Allow" or "Continue" to grant permissions.');
  console.log('4. Google will give you an Authorization Code (or string of text). Copy it.\n');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Paste the authorization code here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        console.error('Error retrieving access token', err);
        return;
      }
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      try {
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
        console.log('\n[SAVED] Token securely saved to ->', TOKEN_PATH);
      } catch (err) {
        console.error(err);
      }
      callback(oAuth2Client);
    });
  });
}
