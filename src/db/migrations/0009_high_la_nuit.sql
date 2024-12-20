PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user_chats` (
	`user_id` text NOT NULL,
	`chat_id` integer NOT NULL,
	PRIMARY KEY(`user_id`, `chat_id`)
);
--> statement-breakpoint
INSERT INTO `__new_user_chats`("user_id", "chat_id") SELECT "user_id", "chat_id" FROM `user_chats`;--> statement-breakpoint
DROP TABLE `user_chats`;--> statement-breakpoint
ALTER TABLE `__new_user_chats` RENAME TO `user_chats`;--> statement-breakpoint
PRAGMA foreign_keys=ON;