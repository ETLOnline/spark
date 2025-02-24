DROP TABLE `hashtags`;--> statement-breakpoint
ALTER TABLE `events` ADD `type` text;--> statement-breakpoint
ALTER TABLE `events` ADD `metadata` text;--> statement-breakpoint
ALTER TABLE `events` DROP COLUMN `location`;--> statement-breakpoint
ALTER TABLE `tags` ADD `count` integer DEFAULT 1 NOT NULL;