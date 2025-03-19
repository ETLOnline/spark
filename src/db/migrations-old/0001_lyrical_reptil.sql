CREATE TABLE `channels` (
	`channel_id` text(36) PRIMARY KEY NOT NULL,
	`channel_name` text NOT NULL,
	`description` text,
	`channel_type` text,
	`created_by` text NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text
);
--> statement-breakpoint
CREATE TABLE `spaces` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`space_name` text NOT NULL,
	`description` text,
	`channel_id` text NOT NULL,
	`created_by` text NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text
);
