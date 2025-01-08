CREATE TABLE `chats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`channel_id` text NOT NULL,
	`chat_slug` text NOT NULL,
	`name` text,
	`type` text,
	`avatar` text,
	`last_message` text,
	`unread_count` integer DEFAULT 0 NOT NULL,
	`is_group` integer DEFAULT 0 NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text
);
--> statement-breakpoint
CREATE TABLE `user_messages` (
	`user_id` text NOT NULL,
	`message_id` integer NOT NULL
);
--> statement-breakpoint
DROP TABLE `chat`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user_chats` (
	`user_id` text NOT NULL,
	`chat_id` integer NOT NULL,
	PRIMARY KEY(`user_id`, `chat_id`)
);
--> statement-breakpoint
INSERT INTO `__new_user_chats`("user_id", "chat_id") SELECT "user_id", "chat_id" FROM `user_chats`;--> statement-breakpoint
DROP TABLE `user_chats`;--> statement-breakpoint
ALTER TABLE `__new_user_chats` RENAME TO `user_chats`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
DROP INDEX IF EXISTS "users_email_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "users_external_auth_id_unique";--> statement-breakpoint
ALTER TABLE `messages` ALTER COLUMN "sender_id" TO "sender_id" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_external_auth_id_unique` ON `users` (`external_auth_id`);--> statement-breakpoint
ALTER TABLE `messages` DROP COLUMN `timestamp`;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`unique_id` text(36) PRIMARY KEY NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text NOT NULL,
	`external_auth_id` text NOT NULL,
	`profile_url` text,
	`meta` text
);
--> statement-breakpoint
INSERT INTO `__new_users`("unique_id", "first_name", "last_name", "email", "external_auth_id", "profile_url", "meta") SELECT "unique_id", "first_name", "last_name", "email", "external_auth_id", "profile_url", "meta" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;