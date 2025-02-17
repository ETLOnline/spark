DROP INDEX IF EXISTS "users_email_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "users_external_auth_id_unique";--> statement-breakpoint
ALTER TABLE `poll_votes` ALTER COLUMN "option_id" TO "option_id" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_external_auth_id_unique` ON `users` (`external_auth_id`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_poll_options` (
	`post_id` integer NOT NULL,
	`option_text` text NOT NULL,
	`vote_count` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`post_id`, `option_text`)
);
--> statement-breakpoint
INSERT INTO `__new_poll_options`("post_id", "option_text", "vote_count") SELECT "post_id", "option_text", "vote_count" FROM `poll_options`;--> statement-breakpoint
DROP TABLE `poll_options`;--> statement-breakpoint
ALTER TABLE `__new_poll_options` RENAME TO `poll_options`;--> statement-breakpoint
PRAGMA foreign_keys=ON;