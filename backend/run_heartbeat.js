require('dotenv').config();
const pmAgent = require('./agents/pmAgent');

(async () => {
    try {
        console.log("Forcing Multi-Agent SEO Execution Wave...");
        await pmAgent.tick();
        console.log("Wave Completed Successfully.");
        process.exit(0);
    } catch (e) {
        console.error("Agent Wave Crashed:", e);
        process.exit(1);
    }
})();
