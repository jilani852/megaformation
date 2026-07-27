const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase;

if (supabaseUrl && supabaseKey && supabaseUrl !== 'your_supabase_url_here') {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.log('Supabase not configured. Using in-memory storage.');
  supabase = null;
}

const sessions = [];
const sessionLogs = [];

const db = {
  supabase,

  async createSession(name, code) {
    if (supabase) {
      const { data, error } = await supabase
        .from('sessions')
        .insert([{ name, code }])
        .select();
      if (error) throw error;
      return data[0];
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
    if (supabase) {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
    return [...sessions].reverse();
  },

  async getSessionByCode(code) {
    if (supabase) {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();
      if (error) return null;
      return data;
    }
    return sessions.find(s => s.code === code && s.is_active) || null;
  },

  async deleteSession(id) {
    if (supabase) {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    }
    const index = sessions.findIndex(s => s.id === id);
    if (index !== -1) {
      sessions.splice(index, 1);
      return true;
    }
    return false;
  },

  async logJoin(sessionId, userName) {
    if (supabase) {
      const { data, error } = await supabase
        .from('session_logs')
        .insert([{ session_id: sessionId, user_name: userName }]);
      if (error) console.error('Log error:', error);
      return;
    }
    sessionLogs.push({
      id: sessionLogs.length + 1,
      session_id: sessionId,
      user_name: userName,
      joined_at: new Date().toISOString()
    });
  }
};

module.exports = db;
