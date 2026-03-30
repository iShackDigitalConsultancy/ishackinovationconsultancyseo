const autoQA = require('./agents/autoQAAgent');

(async () => {
    try {
        console.log("==================================================");
        console.log("🧠 INITIATING AUTORESEARCH QA SANDBOX TEST 🧠");
        console.log("==================================================");
        
        // Run evaluating loop acting on payments.js
        await autoQA.executeTask('sandbox', null, { 
            targetFile: 'payments.js' 
        });
        
        console.log("✅ SANDBOX COMPLETE ✅");
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
})();
