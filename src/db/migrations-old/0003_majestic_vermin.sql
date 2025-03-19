CREATE TABLE `post_files` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`post_id` text NOT NULL,
	`file_id` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `files` DROP COLUMN `post_id`;