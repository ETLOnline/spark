ALTER TABLE "channel_users" ADD COLUMN "community_user_id" varchar;--> statement-breakpoint
ALTER TABLE "space_users" ADD COLUMN "channel_user_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "channel_users" ADD CONSTRAINT "channel_users_community_user_id_community_users_id_fk" FOREIGN KEY ("community_user_id") REFERENCES "public"."community_users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "space_users" ADD CONSTRAINT "space_users_channel_user_id_channel_users_id_fk" FOREIGN KEY ("channel_user_id") REFERENCES "public"."channel_users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
