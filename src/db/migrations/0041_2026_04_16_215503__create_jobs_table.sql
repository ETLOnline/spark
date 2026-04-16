CREATE TABLE IF NOT EXISTS "jobs" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"queue" varchar NOT NULL,
	"name" varchar NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"error" text,
	"run_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tasks_status" ALTER COLUMN "defination_of_completion" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "tasks_status" ALTER COLUMN "defination_of_completion" DROP NOT NULL;