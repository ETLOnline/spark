ALTER TABLE "session_requests" ADD COLUMN "repeat_type" varchar DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "session_requests" ADD COLUMN "repeat_end_date" varchar;