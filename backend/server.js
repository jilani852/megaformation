const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const adminRoutes = require('./routes/admin');
const sessionRoutes = require('./routes/sessions');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true }));
app.use(express.json());

app.use('/api/admin', adminRoutes);
app.use('/api', sessionRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'MegaFormation API is running' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
