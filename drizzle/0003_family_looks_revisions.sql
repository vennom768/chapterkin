CREATE TABLE "page_revision" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"story_id" text NOT NULL,
	"page_ids" text NOT NULL,
	"instruction" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"stripe_session_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "page_revision_stripe_session_id_unique" UNIQUE("stripe_session_id")
);
--> statement-breakpoint
ALTER TABLE "child_profile" ADD COLUMN "age_months" integer;--> statement-breakpoint
ALTER TABLE "household_member" ADD COLUMN "hair" text;--> statement-breakpoint
ALTER TABLE "household_member" ADD COLUMN "eyes" text;--> statement-breakpoint
ALTER TABLE "household_member" ADD COLUMN "skin" text;--> statement-breakpoint
ALTER TABLE "household_member" ADD COLUMN "usual_clothes" text;--> statement-breakpoint
ALTER TABLE "page_revision" ADD CONSTRAINT "page_revision_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_revision" ADD CONSTRAINT "page_revision_story_id_story_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."story"("id") ON DELETE cascade ON UPDATE no action;