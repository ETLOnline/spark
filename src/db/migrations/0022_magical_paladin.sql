CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_by` text NOT NULL,
	`received_by` text NOT NULL,
	`type` text NOT NULL,
	`link` text,
	`is_read` integer DEFAULT 0 NOT NULL,
	`counter` integer DEFAULT 0 NOT NULL,
	`entity_id` text,
	`entity_type` text NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text
);
--> statement-breakpoint
ALTER TABLE `user_contacts` ADD `is_followed_by` integer DEFAULT 0 NOT NULL;