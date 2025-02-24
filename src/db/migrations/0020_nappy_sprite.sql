CREATE TABLE `comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content` text NOT NULL,
	`user_id` text NOT NULL,
	`post_id` integer NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text
);
--> statement-breakpoint
CREATE TABLE `hashtags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text
);
--> statement-breakpoint
CREATE TABLE `poll_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`post_id` integer NOT NULL,
	`option_text` text NOT NULL,
	`vote_count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `post_hashtags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`post_id` integer NOT NULL,
	`hashtag_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content` text NOT NULL,
	`user_id` text NOT NULL,
	`is_private` integer DEFAULT 0 NOT NULL,
	`type` text NOT NULL,
	`channel_id` text,
	`link` text,
	`likes` integer DEFAULT 0 NOT NULL,
	`comments` integer DEFAULT 0 NOT NULL,
	`fileSize` text,
	`fileName` text,
	`updated_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text
);
--> statement-breakpoint
ALTER TABLE `user_contacts` ADD `is_followed_by` integer DEFAULT 0 NOT NULL;