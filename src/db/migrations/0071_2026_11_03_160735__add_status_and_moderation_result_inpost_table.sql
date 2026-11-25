ALTER TABLE "posts" ADD COLUMN "status" varchar DEFAULT 'published' NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "moderation_result" jsonb;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "reviewed_by" varchar;