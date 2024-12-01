DROP INDEX IF EXISTS `users_externalAuthID_unique`;--> statement-breakpoint
ALTER TABLE `users` ADD `external_auth_id` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `users_external_auth_id_unique` ON `users` (`external_auth_id`);--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `externalAuthID`;