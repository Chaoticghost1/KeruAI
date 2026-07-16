-- Add moderation columns for class chat groups (teacher controls)
-- classes: status, blockedUntil
ALTER TABLE classes
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE classes
  ADD COLUMN IF NOT EXISTS blocked_until TIMESTAMP;

-- class_members: canChat (mute), isBanned, accessRevoked
ALTER TABLE class_members
  ADD COLUMN IF NOT EXISTS can_chat BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE class_members
  ADD COLUMN IF NOT EXISTS is_banned BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE class_members
  ADD COLUMN IF NOT EXISTS access_revoked BOOLEAN NOT NULL DEFAULT false;
