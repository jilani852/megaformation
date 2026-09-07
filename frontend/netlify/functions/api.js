const serverless = require('serverless-http');
const { createApp } = require('../../../backend/app');

// Netlify strips the /api prefix (see netlify.toml redirect), but the path
// the function receives can vary depending on how the request was rewritten:
//  - /.netlify/functions/api/admin/login   (full function URL)
//  - /api/admin/login                       (original request path)
//  - /admin/login                           (already stripped)
// We normalize it so Express routes mounted at the root always match.
const handler = serverless(createApp({ apiPrefix: '' }), {
  request: (req) => {
    let p = req.url || '/';
    for (const prefix of ['/.netlify/functions/api', '/api']) {
      if (p === prefix) {
        p = '/';
      } else if (p.startsWith(prefix + '/')) {
        p = p.slice(prefix.length);
      }
    }
    req.url = p;
    return req;
  }
});

exports.handler = handler;