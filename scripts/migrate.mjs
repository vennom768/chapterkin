import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set");
}

const client = postgres(url, { max: 1, prepare: false });

try {
  await migrate(drizzle(client), { migrationsFolder: "./drizzle" });
  console.log("Drizzle journal migrations are up to date.");
} catch (error) {
  console.warn(
    "Drizzle journal migrate did not finish:",
    error instanceof Error ? error.message : error,
  );
}

await client.unsafe(`
  ALTER TABLE child_profile ADD COLUMN IF NOT EXISTS age_months integer;
  ALTER TABLE story ADD COLUMN IF NOT EXISTS illustration_style text DEFAULT 'watercolor';
  ALTER TABLE story_page ADD COLUMN IF NOT EXISTS kind text DEFAULT 'page';
  ALTER TABLE household_member ADD COLUMN IF NOT EXISTS hair text;
  ALTER TABLE household_member ADD COLUMN IF NOT EXISTS eyes text;
  ALTER TABLE household_member ADD COLUMN IF NOT EXISTS skin text;
  ALTER TABLE household_member ADD COLUMN IF NOT EXISTS usual_clothes text;
`);

await client.unsafe(`
  CREATE TABLE IF NOT EXISTS site_setting (
    key text PRIMARY KEY NOT NULL,
    value text NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
  );
`);

await client.unsafe(`
  CREATE TABLE IF NOT EXISTS page_revision (
    id text PRIMARY KEY NOT NULL,
    user_id text NOT NULL REFERENCES "user"(id) ON DELETE cascade,
    story_id text NOT NULL REFERENCES story(id) ON DELETE cascade,
    page_ids text NOT NULL,
    instruction text NOT NULL,
    amount_cents integer NOT NULL,
    stripe_session_id text UNIQUE,
    status text DEFAULT 'pending' NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
  );
`);

await client.end();
console.log("Database schema is ready.");
