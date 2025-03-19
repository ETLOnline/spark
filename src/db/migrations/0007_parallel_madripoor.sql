ALTER TABLE `channels` ADD `ownerId` text;--> statement-breakpoint
ALTER TABLE `posts` DROP COLUMN `is_private`;