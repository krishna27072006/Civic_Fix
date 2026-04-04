CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS issue_votes CASCADE;
DROP TABLE IF EXISTS issue_reviews CASCADE;
DROP TABLE IF EXISTS issue_upvotes CASCADE;
DROP TABLE IF EXISTS issue_updates CASCADE;
DROP TABLE IF EXISTS issue_resolution_requests CASCADE;
DROP TABLE IF EXISTS issues CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin')),
  avatar_text TEXT,
  area TEXT,
  city TEXT DEFAULT 'Bengaluru',
  lat NUMERIC(9, 6),
  lng NUMERIC(9, 6),
  notify_upvote BOOLEAN NOT NULL DEFAULT TRUE,
  notify_progress BOOLEAN NOT NULL DEFAULT TRUE,
  notify_resolved BOOLEAN NOT NULL DEFAULT TRUE,
  notify_nearby BOOLEAN NOT NULL DEFAULT TRUE,
  anonymous_reports BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX users_email_lower_key ON users (LOWER(email));

CREATE TABLE issues (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (
    category IN ('pothole', 'garbage', 'water', 'streetlight', 'sewage', 'encroachment', 'noise', 'road', 'drainage', 'other')
  ),
  location_text TEXT NOT NULL,
  area TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Bengaluru',
  lat NUMERIC(9, 6) NOT NULL,
  lng NUMERIC(9, 6) NOT NULL,
  image_url TEXT,
  urgency TEXT NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (
    status IN ('open', 'escalated', 'resolved', 'pending', 'progress', 'awaiting_review', 'unsolved')
  ),
  heat_score INTEGER NOT NULL DEFAULT 25 CHECK (heat_score BETWEEN 0 AND 100),
  comments_count INTEGER NOT NULL DEFAULT 0,
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reporter_name TEXT NOT NULL,
  reporter_is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE issue_updates (
  id BIGSERIAL PRIMARY KEY,
  issue_id BIGINT NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  admin_name TEXT NOT NULL,
  update_type TEXT NOT NULL CHECK (update_type IN ('progress', 'escalated', 'system')),
  message TEXT NOT NULL,
  eta_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE issue_resolution_requests (
  id BIGSERIAL PRIMARY KEY,
  issue_id BIGINT NOT NULL UNIQUE REFERENCES issues(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  admin_name TEXT NOT NULL,
  summary TEXT NOT NULL,
  proof_image_url TEXT NOT NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  decided_at TIMESTAMPTZ,
  outcome_status TEXT CHECK (outcome_status IN ('resolved', 'unsolved'))
);

CREATE TABLE issue_upvotes (
  issue_id BIGINT NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (issue_id, user_id)
);

CREATE TABLE issue_reviews (
  id BIGSERIAL PRIMARY KEY,
  issue_id BIGINT NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (issue_id, user_id)
);

CREATE TABLE issue_votes (
  issue_id BIGINT NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  satisfied BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (issue_id, user_id)
);

CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  issue_id BIGINT REFERENCES issues(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (
    type IN ('progress', 'upvote', 'escalated', 'resolved', 'nearby', 'review', 'submitted', 'vote_request')
  ),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_category ON issues(category);
CREATE INDEX idx_issues_reported_at ON issues(reported_at DESC);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read, created_at DESC);
