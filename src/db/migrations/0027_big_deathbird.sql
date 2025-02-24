CREATE TABLE `files` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`file_name` text NOT NULL,
	`file_size` text NOT NULL,
	`file_type` text NOT NULL,
	`file_path` text NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_by` text NOT NULL,
	`received_by` text NOT NULL,
	`type` text NOT NULL,
	`link` text,
	`is_read` integer DEFAULT 0 NOT NULL,
	`counter` integer DEFAULT 0 NOT NULL,
	`entity_id` text,
	`entity_type` text NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text
);
--> statement-breakpoint
DROP INDEX IF EXISTS "users_email_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "users_external_auth_id_unique";--> statement-breakpoint
ALTER TABLE `comments` ALTER COLUMN "post_id" TO "post_id" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_external_auth_id_unique` ON `users` (`external_auth_id`);--> statement-breakpoint
ALTER TABLE `likes` ALTER COLUMN "post_id" TO "post_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE `poll_options` ALTER COLUMN "post_id" TO "post_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE `poll_votes` ALTER COLUMN "post_id" TO "post_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE `post_hashtags` ALTER COLUMN "post_id" TO "post_id" text NOT NULL;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`user_id` text NOT NULL,
	`is_private` integer DEFAULT 0 NOT NULL,
	`type` text NOT NULL,
	`channel_id` text,
	`likes` integer DEFAULT 0 NOT NULL,
	`comments` integer DEFAULT 0 NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text
);
--> statement-breakpoint
INSERT INTO `__new_posts`("id", "content", "user_id", "is_private", "type", "channel_id", "likes", "comments", "updated_at", "created_at", "deleted_at") SELECT "id", "content", "user_id", "is_private", "type", "channel_id", "likes", "comments", "updated_at", "created_at", "deleted_at" FROM `posts`;--> statement-breakpoint
DROP TABLE `posts`;--> statement-breakpoint
ALTER TABLE `__new_posts` RENAME TO `posts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;