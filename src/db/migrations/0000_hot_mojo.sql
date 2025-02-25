CREATE TABLE `activities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`date` text NOT NULL,
	`description` text NOT NULL,
	`type` text NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text
);
--> statement-breakpoint
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
CREATE TABLE `comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content` text NOT NULL,
	`user_id` text NOT NULL,
	`post_id` text NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`start_date_time` text,
	`end_date_time` text,
	`type` text,
	`metadata` text,
	`host_id` text NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text
);
--> statement-breakpoint
CREATE TABLE `files` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
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
CREATE TABLE `likes` (
	`user_id` text NOT NULL,
	`post_id` text NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text,
	PRIMARY KEY(`user_id`, `post_id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`chat_id` integer NOT NULL,
	`type` text NOT NULL,
	`sender_id` text NOT NULL,
	`message` text NOT NULL,
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
CREATE TABLE `poll_options` (
	`post_id` text NOT NULL,
	`option_text` text NOT NULL,
	`vote_count` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`post_id`, `option_text`)
);
--> statement-breakpoint
CREATE TABLE `poll_votes` (
	`user_id` text NOT NULL,
	`post_id` text NOT NULL,
	`option_text` text NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text,
	PRIMARY KEY(`user_id`, `post_id`)
);
--> statement-breakpoint
CREATE TABLE `post_hashtags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`post_id` text NOT NULL,
	`hashtag_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text,
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
CREATE TABLE `recommendations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content` text NOT NULL,
	`recommender_id` text NOT NULL,
	`receiver_id` text NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text
);
--> statement-breakpoint
CREATE TABLE `rewards` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`badge_type` text NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`count` integer DEFAULT 1 NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text
);
--> statement-breakpoint
CREATE TABLE `user_activities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`activity_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_chats` (
	`user_id` text NOT NULL,
	`chat_id` integer NOT NULL,
	PRIMARY KEY(`user_id`, `chat_id`)
);
--> statement-breakpoint
CREATE TABLE `user_contacts` (
	`user_id` text NOT NULL,
	`contact_id` text NOT NULL,
	`is_requested` integer DEFAULT 0 NOT NULL,
	`is_accepted` integer DEFAULT 0 NOT NULL,
	`is_blocked` integer DEFAULT 0 NOT NULL,
	`is_following` integer DEFAULT 0 NOT NULL,
	`is_followed_by` integer DEFAULT 0 NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text,
	PRIMARY KEY(`user_id`, `contact_id`)
);
--> statement-breakpoint
CREATE TABLE `user_messages` (
	`user_id` text NOT NULL,
	`message_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_rewards` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`reward_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`tag_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`unique_id` text(36) PRIMARY KEY NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text NOT NULL,
	`external_auth_id` text NOT NULL,
	`profile_url` text,
	`meta` text,
	`bio` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_external_auth_id_unique` ON `users` (`external_auth_id`);