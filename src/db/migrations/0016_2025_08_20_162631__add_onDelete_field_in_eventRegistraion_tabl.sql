ALTER TABLE "event_users" DROP CONSTRAINT "event_users_event_id_events_id_fk";
--> statement-breakpoint
ALTER TABLE "event_users" DROP CONSTRAINT "event_users_user_id_users_unique_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_users" ADD CONSTRAINT "event_users_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_users" ADD CONSTRAINT "event_users_user_id_users_unique_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("unique_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_host_id_users_unique_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."users"("unique_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
