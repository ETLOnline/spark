ALTER TABLE "user_chats" ADD COLUMN "unread_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN IF EXISTS "unread_count";