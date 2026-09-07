ALTER TABLE "story" ADD COLUMN "illustration_style" text DEFAULT 'watercolor' NOT NULL;--> statement-breakpoint
ALTER TABLE "story_page" ADD COLUMN "kind" text DEFAULT 'page' NOT NULL;