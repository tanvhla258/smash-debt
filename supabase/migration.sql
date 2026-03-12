-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============ USERS TABLE ============
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============ SESSIONS TABLE ============
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============ PARTICIPANTS TABLE ============
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_per_person DECIMAL(10, 2) NOT NULL,
  is_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_participants_session_id ON participants(session_id);
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_is_paid ON participants(is_paid);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);

-- ============ ROW LEVEL SECURITY (RLS) ============
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- For development, allow public access
-- TODO: Configure proper RLS policies for production

-- Users table policies
CREATE POLICY "Enable read access for all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON users
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users" ON users;
CREATE POLICY "Enable delete for all users" ON users
  FOR DELETE USING (true);

-- Sessions table policies
CREATE POLICY "Enable read access for all sessions" ON sessions
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all sessions" ON sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all sessions" ON sessions
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all sessions" ON sessions;
CREATE POLICY "Enable delete for all sessions" ON sessions
  FOR DELETE USING (true);

-- Participants table policies
CREATE POLICY "Enable read access for all participants" ON participants
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all participants" ON participants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all participants" ON participants
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all participants" ON participants;
CREATE POLICY "Enable delete for all participants" ON participants
  FOR DELETE USING (true);
