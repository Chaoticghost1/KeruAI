-- Add show_on_landing to blog_posts for landing page featured section
-- Run this if you already have blog_posts and are not using drizzle-kit push

ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS show_on_landing boolean NOT NULL DEFAULT false;
