ALTER TABLE `chat` RENAME TO `chats`;--> statement-breakpoint
ALTER TABLE `messages` ALTER COLUMN "chat_id" TO "chat_id" integer NOT NULL REFERENCES chats(id) ON DELETE no action ON UPDATE no action;