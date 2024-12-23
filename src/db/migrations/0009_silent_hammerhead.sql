CREATE TABLE `interests` (
	`name` text NOT NULL,
	`user` text NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text
);
--> statement-breakpoint
CREATE TABLE `skills` (
	`name` text NOT NULL,
	`user` text NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text
);
--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `skills`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `interests`;