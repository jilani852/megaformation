const express = require('express');
const { nanoid } = require('nanoid');
const authMiddleware = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

router.get('/sessions', authMiddleware, async (req, res) => {
  try {
    const sessions = await db.getSessions();
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

router.post('/sessions', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Session name is required' });
    }
    const code = nanoid(8).toUpperCase();
    const session = await db.createSession(name, code);
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create session' });
  }
});

router.delete('/sessions/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteSession(parseInt(id));
    res.json({ message: 'Session deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

router.post('/session/verify', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }
    const session = await db.getSessionByCode(code.toUpperCase());
    if (!session) {
      return res.status(404).json({ error: 'Invalid or inactive session code' });
    }
    res.json({ valid: true, session: { id: session.id, name: session.name } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/session/join', async (req, res) => {
  try {
    const { code, userName } = req.body;
    if (!code || !userName) {
      return res.status(400).json({ error: 'Code and name are required' });
    }
    const session = await db.getSessionByCode(code.toUpperCase());
    if (!session) {
      return res.status(404).json({ error: 'Invalid session code' });
    }
    await db.logJoin(session.id, userName);
    res.json({ session: { id: session.id, name: session.name } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
