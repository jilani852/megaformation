const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const adminRoutes = require('./routes/admin');
const sessionRoutes = require('./routes/sessions');

dotenv.config();

// createApp builds the Express app with a configurable API prefix.
//  - Local dev / standalone server: apiPrefix = '/api'  (paths keep /api/...)
//  - Netlify function: apiPrefix = ''  (Netlify strips /api before the function)
function createApp({ apiPrefix = '/api' } = {}) {
  const app = express();

  app.use(cors({ origin: true }));
  app.use(express.json());

  app.use(`${apiPrefix}/admin`, adminRoutes);
  app.use(apiPrefix || '/', sessionRoutes);

  app.get(`${apiPrefix || '/'}`, (req, res) => {
    res.json({ message: 'MegaFormation API is running' });
  });

  if (apiPrefix) {
    app.get('/', (req, res) => {
      res.json({ message: 'MegaFormation API is running' });
    });
  }

  return app;
}

module.exports = { app: createApp(), createApp };