ALTER TABLE "session_requests" DROP CONSTRAINT IF EXISTS "session_requests_availability_slot_id_mentor_availability_id_fk";
--> statement-breakpoint
ALTER TABLE "session_requests" ALTER COLUMN "availability_slot_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "session_requests" DROP COLUMN IF EXISTS "suggestion_expires_at";