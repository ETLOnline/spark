CREATE TABLE IF NOT EXISTS "project_recent_activity" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "project_recent_activity_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"project_id" varchar NOT NULL,
	"icon" varchar NOT NULL,
	"activity" varchar NOT NULL,
	"deep_link" varchar NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sprint_burndown" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sprint_burndown_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"sprint_id" varchar NOT NULL,
	"task_id" varchar,
	"total_tasks" integer DEFAULT 0 NOT NULL,
	"completed_tasks" integer DEFAULT 0 NOT NULL,
	"total_story_points" integer DEFAULT 0 NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
