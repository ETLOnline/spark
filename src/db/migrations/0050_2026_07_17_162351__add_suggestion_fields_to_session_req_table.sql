ALTER TABLE "session_requests" ADD COLUMN "suggestion_message" text;--> statement-breakpoint
ALTER TABLE "session_requests" ADD COLUMN "suggested_slot_ids" jsonb;