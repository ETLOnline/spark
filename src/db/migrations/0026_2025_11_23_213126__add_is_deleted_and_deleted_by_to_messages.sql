ALTER TABLE "messages" ADD COLUMN "is_deleted" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "deleted_by" varchar;