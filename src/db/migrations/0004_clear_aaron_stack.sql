CREATE TABLE `chat` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`channel_id` text NOT NULL,
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
CREATE TABLE `messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`chat_id` integer NOT NULL,
	`type` text NOT NULL,
	`sender_id` integer NOT NULL,
	`message` text NOT NULL,
	`timestamp` integer NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text
);
--> statement-breakpoint
CREATE TABLE `user_chats` (
	`user_id` text NOT NULL,
	`chat_id` integer NOT NULL,
	PRIMARY KEY(`user_id`, `chat_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`unique_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`chat_id`) REFERENCES `chat`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_contacts` (
	`user_id` text NOT NULL,
	`contact_id` text NOT NULL,
	`is_requested` integer DEFAULT 0 NOT NULL,
	`is_accepted` integer DEFAULT 0 NOT NULL,
	`is_blocked` integer DEFAULT 0 NOT NULL,
	`is_following` integer DEFAULT 0 NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text
);
--> statement-breakpoint
CREATE TABLE `user_messages` (
	`user_id` text NOT NULL,
	`message_id` integer NOT NULL
);
