ALTER TABLE "community_users" ADD COLUMN "role" varchar DEFAULT 'member';--> statement-breakpoint
ALTER TABLE "community_users" ADD COLUMN "status" varchar DEFAULT 'active';