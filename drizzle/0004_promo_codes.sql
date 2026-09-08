CREATE TABLE "promo_code" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"code_key" text NOT NULL,
	"benefit" text DEFAULT 'unlimited' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"max_redemptions" integer,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "promo_code_code_key_unique" UNIQUE("code_key")
);
--> statement-breakpoint
CREATE TABLE "promo_redemption" (
	"id" text PRIMARY KEY NOT NULL,
	"promo_code_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "promo_redemption_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "promo_redemption" ADD CONSTRAINT "promo_redemption_promo_code_id_promo_code_id_fk" FOREIGN KEY ("promo_code_id") REFERENCES "public"."promo_code"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promo_redemption" ADD CONSTRAINT "promo_redemption_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
