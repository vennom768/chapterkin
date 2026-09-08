ALTER TABLE child_profile ADD COLUMN IF NOT EXISTS selected_portrait_id text;
ALTER TABLE child_profile ADD COLUMN IF NOT EXISTS portrait_packs integer DEFAULT 0 NOT NULL;
ALTER TABLE story ADD COLUMN IF NOT EXISTS last_read_at timestamp DEFAULT now();
UPDATE story SET last_read_at = created_at WHERE last_read_at IS NULL;
ALTER TABLE story ALTER COLUMN last_read_at SET DEFAULT now();
ALTER TABLE story ALTER COLUMN last_read_at SET NOT NULL;
ALTER TABLE story ADD COLUMN IF NOT EXISTS share_token text;
CREATE UNIQUE INDEX IF NOT EXISTS story_share_token_idx ON story (share_token);

CREATE TABLE IF NOT EXISTS child_portrait (
  id text PRIMARY KEY NOT NULL,
  child_id text NOT NULL REFERENCES child_profile(id) ON DELETE cascade,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE cascade,
  image_path text NOT NULL,
  source text NOT NULL,
  note text,
  created_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS portrait_pack_purchase (
  id text PRIMARY KEY NOT NULL,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE cascade,
  child_id text NOT NULL REFERENCES child_profile(id) ON DELETE cascade,
  amount_cents integer NOT NULL,
  stripe_session_id text UNIQUE,
  status text DEFAULT 'pending' NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS analytics_event (
  id text PRIMARY KEY NOT NULL,
  user_id text,
  name text NOT NULL,
  properties text,
  created_at timestamp DEFAULT now() NOT NULL
);
