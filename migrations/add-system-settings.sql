-- System settings table for super admin: feature flags and moderation config
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
