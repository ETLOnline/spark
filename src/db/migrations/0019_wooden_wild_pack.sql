ALTER TABLE `notifications` RENAME COLUMN "user_id" TO "created_by";--> statement-breakpoint
ALTER TABLE `notifications` RENAME COLUMN "receiver_id" TO "received_by";--> statement-breakpoint
DROP INDEX IF EXISTS "users_email_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "users_external_auth_id_unique";--> statement-breakpoint
ALTER TABLE `notifications` ALTER COLUMN "type" TO "type" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_external_auth_id_unique` ON `users` (`external_auth_id`);--> statement-breakpoint
ALTER TABLE `notifications` ADD `entity_type` text;