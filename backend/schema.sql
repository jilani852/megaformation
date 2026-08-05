-- MegaFormation Database Schema
-- Run this in the Supabase SQL Editor.
-- The script is safe to re-run.

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Session logs table
CREATE TABLE IF NOT EXISTS session_logs (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
  user_name VARCHAR(100),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_code ON sessions(code);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_session_logs_session ON session_logs(session_id);

-- Enable Row Level Security on all tables
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

-- Policies: the backend uses the Supabase key server-side only
-- (it is never exposed to the browser). These policies let the app
-- read and write the data it needs.

-- sessions: full access for the app (admin CRUD + code verification)
DROP POLICY IF EXISTS sessions_all ON sessions;
CREATE POLICY sessions_all ON sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- session_logs: insert when a student/teacher joins + read access
DROP POLICY IF EXISTS session_logs_insert ON session_logs;
CREATE POLICY session_logs_insert ON session_logs
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS session_logs_select ON session_logs;
CREATE POLICY session_logs_select ON session_logs
  FOR SELECT
  USING (true);

-- teachers: full access for the app (admin manages the list, teacher verify reads it)
DROP POLICY IF EXISTS teachers_all ON teachers;
CREATE POLICY teachers_all ON teachers
  FOR ALL
  USING (true)
  WITH CHECK (true);
