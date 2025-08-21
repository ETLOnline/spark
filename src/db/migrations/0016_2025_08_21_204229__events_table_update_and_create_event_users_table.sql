CREATE TABLE IF NOT EXISTS "event_users" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "coverImage" varchar DEFAULT '/images/profile/background.svg' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "tags" varchar[];--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_users" ADD CONSTRAINT "event_users_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_users" ADD CONSTRAINT "event_users_user_id_users_unique_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("unique_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_host_id_users_unique_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."users"("unique_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
