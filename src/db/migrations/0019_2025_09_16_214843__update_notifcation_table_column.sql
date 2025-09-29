ALTER TABLE "notifications" ADD COLUMN "title" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "body" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "deep_link" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "icon" varchar;--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN IF EXISTS "type";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN IF EXISTS "link";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN IF EXISTS "counter";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN IF EXISTS "entity_id";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN IF EXISTS "entity_type";