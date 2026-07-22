CREATE TABLE IF NOT EXISTS "mentorship_feedback" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "mentorship_feedback_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"session_request_id" integer NOT NULL,
	"submitted_by" varchar NOT NULL,
	"rating" integer NOT NULL,
	"comment" varchar,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
ALTER TABLE "session_requests" ADD COLUMN "space_id" varchar;--> statement-breakpoint
ALTER TABLE "session_requests" ADD COLUMN "attendee_confirmations" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "session_requests" ADD COLUMN "is_space_archived" boolean DEFAULT false;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mentorship_feedback" ADD CONSTRAINT "mentorship_feedback_session_request_id_session_requests_id_fk" FOREIGN KEY ("session_request_id") REFERENCES "public"."session_requests"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mentorship_feedback" ADD CONSTRAINT "mentorship_feedback_submitted_by_users_unique_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("unique_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session_requests" ADD CONSTRAINT "session_requests_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
