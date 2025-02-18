ALTER TABLE `events` ADD `type` text;--> statement-breakpoint
ALTER TABLE `events` ADD `metadata` text;--> statement-breakpoint
ALTER TABLE `events` DROP COLUMN `location`;