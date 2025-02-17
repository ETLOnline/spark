DROP INDEX IF EXISTS "users_email_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "users_external_auth_id_unique";--> statement-breakpoint
ALTER TABLE `notifications` ALTER COLUMN "entity_type" TO "entity_type" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_external_auth_id_unique` ON `users` (`external_auth_id`);