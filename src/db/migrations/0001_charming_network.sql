DROP INDEX IF EXISTS "users_email_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "users_external_auth_id_unique";--> statement-breakpoint
ALTER TABLE `files` ALTER COLUMN "file_size" TO "file_size" integer NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_external_auth_id_unique` ON `users` (`external_auth_id`);