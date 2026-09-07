const connectionString = process.env.DATABASE_URL;

// Neon free-tier tip: serverless environments must NOT keep a permanent
// connection open, otherwise the 100 CU-hours/month quota will run out.
// So instead of a long-lived Pool, we create a short-lived client per
// operation and close it as soon as the query finishes. This lets Neon
// scale down to zero (and saves free hours).
const getClient = async () => {
  const { Client } = require('pg');
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await ensureSchema();
  return client;
};

// Auto-create the tables on the first connection (Neon has no Row Level
// Security, so no RLS/Grants/Policies are needed here). This keeps the
// app working even if the SQL was never run manually.
let schemaReady = null;
const ensureSchema = () => {
  if (schemaReady) return schemaReady;
  schemaReady = (async () => {
    const { Client } = require('pg');
    const init = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    await init.connect();
    try {
      await init.query(`
        CREATE TABLE IF NOT EXISTS sessions (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          code VARCHAR(20) UNIQUE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          is_active BOOLEAN DEFAULT TRUE
        );
        CREATE TABLE IF NOT EXISTS session_logs (
          id SERIAL PRIMARY KEY,
          session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
          user_name VARCHAR(100),
          joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS teachers (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) UNIQUE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS admin_users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_sessions_code ON sessions(code);
        CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(is_active);
        CREATE INDEX IF NOT EXISTS idx_session_logs_session ON session_logs(session_id);
      `);
    } finally {
      await init.end();
    }
  })().catch((err) => {
    schemaReady = null;
    throw err;
  });
  return schemaReady;
};

// In-memory fallback used only when DATABASE_URL is not configured
// (e.g. running locally without a .env).
const sessions = [];
const sessionLogs = [];
const teachers = [];
let currentAdmin = null;
const useMemory = !connectionString || connectionString === 'your_database_url_here';

const db = {
  async createSession(name, code) {
    if (!useMemory) {
      const client = await getClient();
      try {
        const { rows } = await client.query(
          'INSERT INTO sessions (name, code) VALUES ($1, $2) RETURNING *',
          [name, code]
        );
        return rows[0];
      } finally {
        await client.end();
      }
    }
    const session = {
      id: sessions.length + 1,
      name,
      code,
      created_at: new Date().toISOString(),
      is_active: true
    };
    sessions.push(session);
    return session;
  },

  async getSessions() {
    if (!useMemory) {
      const client = await getClient();
      try {
        const { rows } = await client.query(
          'SELECT * FROM sessions ORDER BY created_at DESC'
        );
        return rows;
      } finally {
        await client.end();
      }
    }
    return [...sessions].reverse();
  },

  async getSessionByCode(code) {
    if (!useMemory) {
      const client = await getClient();
      try {
        const { rows } = await client.query(
          'SELECT * FROM sessions WHERE code = $1 AND is_active = true LIMIT 1',
          [code]
        );
        return rows.length ? rows[0] : null;
      } finally {
        await client.end();
      }
    }
    return sessions.find(s => s.code === code && s.is_active) || null;
  },

  async deleteSession(id) {
    if (!useMemory) {
      const client = await getClient();
      try {
        await client.query('DELETE FROM sessions WHERE id = $1', [id]);
        return true;
      } finally {
        await client.end();
      }
    }
    const index = sessions.findIndex(s => s.id === id);
    if (index !== -1) {
      sessions.splice(index, 1);
      return true;
    }
    return false;
  },

  async logJoin(sessionId, userName) {
    if (!useMemory) {
      const client = await getClient();
      try {
        await client.query(
          'INSERT INTO session_logs (session_id, user_name) VALUES ($1, $2)',
          [sessionId, userName]
        );
      } catch (e) {
        console.error('Log error:', e);
      } finally {
        await client.end();
      }
      return;
    }
    sessionLogs.push({
      id: sessionLogs.length + 1,
      session_id: sessionId,
      user_name: userName,
      joined_at: new Date().toISOString()
    });
  },

  async addTeacher(name) {
    if (!useMemory) {
      const client = await getClient();
      try {
        const { rows } = await client.query(
          'INSERT INTO teachers (name) VALUES ($1) RETURNING *',
          [name]
        );
        return rows[0];
      } finally {
        await client.end();
      }
    }
    const teacher = {
      id: teachers.length + 1,
      name,
      created_at: new Date().toISOString()
    };
    teachers.push(teacher);
    return teacher;
  },

  async getTeachers() {
    if (!useMemory) {
      const client = await getClient();
      try {
        const { rows } = await client.query(
          'SELECT * FROM teachers ORDER BY created_at DESC'
        );
        return rows;
      } finally {
        await client.end();
      }
    }
    return [...teachers].reverse();
  },

  async deleteTeacher(id) {
    if (!useMemory) {
      const client = await getClient();
      try {
        await client.query('DELETE FROM teachers WHERE id = $1', [id]);
        return true;
      } finally {
        await client.end();
      }
    }
    const index = teachers.findIndex(t => t.id === id);
    if (index !== -1) {
      teachers.splice(index, 1);
      return true;
    }
    return false;
  },

  async verifyTeacher(name) {
    if (!useMemory) {
      const client = await getClient();
      try {
        const { rows } = await client.query(
          'SELECT * FROM teachers WHERE LOWER(name) = LOWER($1) LIMIT 1',
          [name]
        );
        return rows.length > 0;
      } finally {
        await client.end();
      }
    }
    return teachers.some(t => t.name.toLowerCase() === name.toLowerCase());
  },

  async getAdmin() {
    if (!useMemory) {
      const client = await getClient();
      try {
        const { rows } = await client.query('SELECT * FROM admin_users LIMIT 1');
        return rows.length ? rows[0] : null;
      } finally {
        await client.end();
      }
    }
    return currentAdmin;
  },

  async updateAdmin(username, hashedPassword) {
    if (!useMemory) {
      const client = await getClient();
      try {
        const existing = await client.query('SELECT * FROM admin_users LIMIT 1');
        if (existing.rows.length) {
          await client.query(
            'UPDATE admin_users SET username = $1, password = $2 WHERE id = $3',
            [username, hashedPassword, existing.rows[0].id]
          );
        } else {
          await client.query(
            'INSERT INTO admin_users (username, password) VALUES ($1, $2)',
            [username, hashedPassword]
          );
        }
        return { username, password: hashedPassword };
      } finally {
        await client.end();
      }
    }
    currentAdmin = { id: 1, username, password: hashedPassword };
    return currentAdmin;
  }
};

module.exports = db;
