PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`chat_id` integer NOT NULL,
	`type` text NOT NULL,
	`sender_id` integer NOT NULL,
	`message` text NOT NULL,
	`timestamp` integer NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text
);
--> statement-breakpoint
INSERT INTO `__new_messages`("id", "chat_id", "type", "sender_id", "message", "timestamp", "updated_at", "created_at", "deleted_at") SELECT "id", "chat_id", "type", "sender_id", "message", "timestamp", "updated_at", "created_at", "deleted_at" FROM `messages`;--> statement-breakpoint
DROP TABLE `messages`;--> statement-breakpoint
ALTER TABLE `__new_messages` RENAME TO `messages`;--> statement-breakpoint
PRAGMA foreign_keys=ON;