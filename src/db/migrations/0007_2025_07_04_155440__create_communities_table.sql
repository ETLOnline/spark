CREATE TABLE IF NOT EXISTS "communities" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" varchar,
	"category" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"type" varchar DEFAULT 'public' NOT NULL,
	"created_by" varchar NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar,
	CONSTRAINT "communities_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "community_users" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"community_id" varchar NOT NULL,
	"user_id" varchar NOT NULL
);
--> statement-breakpoint
ALTER TABLE "channels" ADD COLUMN "community_id" varchar(36) NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "community_users" ADD CONSTRAINT "community_users_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "community_users" ADD CONSTRAINT "community_users_user_id_users_unique_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("unique_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "channels" ADD CONSTRAINT "channels_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
