CREATE TABLE IF NOT EXISTS "moms" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"space_id" varchar(36) NOT NULL,
	"created_by" varchar NOT NULL,
	"meeting_date" varchar NOT NULL,
	"meeting_start_time" varchar NOT NULL,
	"meeting_end_time" varchar NOT NULL,
	"participants" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"discussion_summary" text NOT NULL,
	"action_items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "moms" ADD CONSTRAINT "moms_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
