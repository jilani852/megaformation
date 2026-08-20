const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const storedAdmin = await db.getAdmin();

    let valid = false;

    if (storedAdmin) {
      valid = username === storedAdmin.username &&
        await bcrypt.compare(password, storedAdmin.password);
    } else {
      valid = username === process.env.ADMIN_USERNAME &&
        password === process.env.ADMIN_PASSWORD;
    }

    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    return res.json({ token, username });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/credentials', authMiddleware, async (req, res) => {
  try {
    const { currentUsername, currentPassword, newPassword } = req.body;

    if (!currentUsername || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const storedAdmin = await db.getAdmin();

    let oldValid = false;

    if (storedAdmin) {
      oldValid = currentUsername === storedAdmin.username &&
        await bcrypt.compare(currentPassword, storedAdmin.password);
    } else {
      oldValid = currentUsername === process.env.ADMIN_USERNAME &&
        currentPassword === process.env.ADMIN_PASSWORD;
    }

    if (!oldValid) {
      return res.status(401).json({ error: 'Current username or password is incorrect' });
    }

    const newUsername = (req.body.newUsername || '').trim() || currentUsername;

    if (newUsername.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.updateAdmin(newUsername, hashedPassword);

    res.json({ message: 'Credentials updated successfully' });
  } catch (error) {
    console.error('POST /credentials error:', error);
    res.status(500).json({ error: 'Failed to update credentials' });
  }
});

router.get('/verify', authMiddleware, (req, res) => {
  res.json({ valid: true, admin: req.admin });
});

module.exports = router;
