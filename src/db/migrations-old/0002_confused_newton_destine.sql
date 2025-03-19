PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_spaces` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`space_name` text NOT NULL,
	`description` text,
	`channel_id` text NOT NULL,
	`created_by` text NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text
);
--> statement-breakpoint
INSERT INTO `__new_spaces`("id", "space_name", "description", "channel_id", "created_by", "updated_at", "created_at", "deleted_at") SELECT "id", "space_name", "description", "channel_id", "created_by", "updated_at", "created_at", "deleted_at" FROM `spaces`;--> statement-breakpoint
DROP TABLE `spaces`;--> statement-breakpoint
ALTER TABLE `__new_spaces` RENAME TO `spaces`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `posts` ADD `entity_id` text;--> statement-breakpoint
ALTER TABLE `posts` ADD `entity_type` text;--> statement-breakpoint
ALTER TABLE `posts` DROP COLUMN `channel_id`;