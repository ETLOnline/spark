ALTER TABLE "session_requests" ADD COLUMN "space_id" varchar(36);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session_requests" ADD CONSTRAINT "session_requests_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
