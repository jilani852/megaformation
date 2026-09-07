const serverless = require('serverless-http');
const { createApp } = require('../../../backend/app');

// Netlify strips the /api prefix (see netlify.toml redirect),
// so the function's Express app must mount routes at the root.
exports.handler = serverless(createApp({ apiPrefix: '' }));