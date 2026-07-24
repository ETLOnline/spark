ALTER TABLE "mentorship_feedback" ADD COLUMN "recipient_id" varchar;--> statement-breakpoint
ALTER TABLE "mentorship_feedback" ADD COLUMN "visibility" varchar DEFAULT 'public' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mentorship_feedback" ADD CONSTRAINT "mentorship_feedback_recipient_id_users_unique_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("unique_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
