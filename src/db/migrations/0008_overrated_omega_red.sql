PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text NOT NULL,
	`external_auth_id` text NOT NULL,
	`profile_url` text,
	`unique_id` text(36) PRIMARY KEY NOT NULL,
	`meta` text
);
--> statement-breakpoint
INSERT INTO `__new_users`("first_name", "last_name", "email", "external_auth_id", "profile_url", "unique_id", "meta") SELECT "first_name", "last_name", "email", "external_auth_id", "profile_url", "unique_id", "meta" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_external_auth_id_unique` ON `users` (`external_auth_id`);