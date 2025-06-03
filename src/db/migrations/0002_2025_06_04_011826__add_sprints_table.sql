CREATE TABLE IF NOT EXISTS "sprints" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"start_date" varchar NOT NULL,
	"end_date" varchar NOT NULL,
	"projectId" varchar NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "sprint_id" varchar;