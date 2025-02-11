ALTER TABLE `events` ADD `start_date_time` text;--> statement-breakpoint
ALTER TABLE `events` ADD `end_date_time` text;--> statement-breakpoint
ALTER TABLE `events` DROP COLUMN `date`;