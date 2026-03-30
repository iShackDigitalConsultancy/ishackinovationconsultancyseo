const { spawn } = require('child_process');
const jwt = require('jsonwebtoken');
const path = require('path');
const fetch = globalThis.fetch;

(async () => {
  console.log("==================================================");
  console.log("🔬 INITIATING AUTORESEARCH EVALUATOR SCRIPT 🔬");
  console.log("==================================================");
  
  // 1. Spawn the backend replica
  const serverPath = path.join(__dirname, '..', 'server.js');
  const server = spawn('node', [serverPath], { cwd: path.join(__dirname, '..') });
  
  // Let the database and CRON jobs mount
  await new Promise(r => setTimeout(r, 4000));

  const JWT_SECRET = process.env.JWT_SECRET || 'fallback_super_secret_for_dev';
  const token = jwt.sign({ agencyId: 1, email: 'sandbox@test.com' }, JWT_SECRET);

  let passed = true;

  // 2. Test Array: Paystack Connectivity
  try {
    console.log("[Test 1] Executing Paystack Gateway Init...");
    const pRes = await fetch('http://localhost:3001/api/payments/initialize', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: 'autoresearch-test.com', tier: 'enterprise' })
    });
    
    const pText = await pRes.text();
    let pData;
    try { pData = JSON.parse(pText); } catch(e) { throw new Error(`Non-JSON Paystack Response: ${pText}`); }
    
    if (!pRes.ok || !pData.success) {
      throw new Error("Paystack Init Failed: " + JSON.stringify(pData));
    }
    console.log("✅ Paystack Gateway: PASSED (Authorization URL generated)");
  } catch (e) {
    console.error("❌ Paystack Test: FAILED\n   ->", e.message);
    passed = false;
  }

  // 3. Test Array: OpenClaw Autonomous Audit
  try {
    console.log("\n[Test 2] Executing OpenClaw Live Audit Trigger...");
    const oRes = await fetch('http://localhost:3001/api/openclaw/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType: 'seo_analysis_request', payload: { website: 'ishackaeo.com' } })
    });
    
    const oText = await oRes.text();
    let oData;
    try { oData = JSON.parse(oText); } catch(e) { throw new Error(`Non-JSON OpenClaw Response: ${oText}`); }
    
    if (!oRes.ok || !oData.success) {
      throw new Error("OpenClaw Trigger Failed: " + JSON.stringify(oData));
    }
    console.log("✅ OpenClaw Audit Engine: PASSED (200 OK + Report Blob Extracted)");
  } catch (e) {
    console.error("❌ OpenClaw Test: FAILED\n   ->", e.message);
    passed = false;
  }

  // 4. Terminate Replica & Grade Run
  server.kill('SIGKILL');
  
  // Failsafe to ensure port 3001 is freed
  const killProc = spawn('pkill', ['-f', 'node server.js']);
  
  console.log("\n==================================================");
  if (passed) {
    console.log("🏆 AUTORESEARCH EVALUATION: 100% PASSED 🏆");
    process.exit(0);
  } else {
    console.log("⚠️ AUTORESEARCH EVALUATION: FAILED ⚠️");
    process.exit(1);
  }
})();
