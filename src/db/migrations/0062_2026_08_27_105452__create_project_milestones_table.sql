CREATE TABLE IF NOT EXISTS "project_milestones" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"space_id" varchar(36) NOT NULL,
	"name" varchar NOT NULL,
	"status" varchar DEFAULT 'incomplete' NOT NULL,
	"start_date" varchar,
	"end_date" varchar,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_by" varchar NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_milestones" ADD CONSTRAINT "project_milestones_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
