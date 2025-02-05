ALTER TABLE `events` ADD `updated_at` text;--> statement-breakpoint
ALTER TABLE `events` ADD `created_at` text DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `events` ADD `deleted_at` text;