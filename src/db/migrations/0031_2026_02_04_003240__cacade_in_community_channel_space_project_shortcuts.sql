ALTER TABLE "channels" DROP CONSTRAINT "channels_community_id_communities_id_fk";
--> statement-breakpoint
ALTER TABLE "project" ALTER COLUMN "space_id" SET DATA TYPE varchar(36);--> statement-breakpoint
ALTER TABLE "project" ALTER COLUMN "space_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "spaces" ALTER COLUMN "channel_id" SET DATA TYPE varchar(36);--> statement-breakpoint
ALTER TABLE "shortcuts" ADD COLUMN "community_id" varchar(36);--> statement-breakpoint
ALTER TABLE "shortcuts" ADD COLUMN "channelid" varchar(36);--> statement-breakpoint
ALTER TABLE "shortcuts" ADD COLUMN "space_id" varchar(36);--> statement-breakpoint
ALTER TABLE "shortcuts" ADD COLUMN "project_id" varchar(36);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "channels" ADD CONSTRAINT "channels_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project" ADD CONSTRAINT "project_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shortcuts" ADD CONSTRAINT "shortcuts_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shortcuts" ADD CONSTRAINT "shortcuts_channelid_channels_channel_id_fk" FOREIGN KEY ("channelid") REFERENCES "public"."channels"("channel_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shortcuts" ADD CONSTRAINT "shortcuts_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shortcuts" ADD CONSTRAINT "shortcuts_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "spaces" ADD CONSTRAINT "spaces_channel_id_channels_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("channel_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
