CREATE TABLE `poll_votes` (
	`user_id` text NOT NULL,
	`post_id` integer NOT NULL,
	`option_id` integer NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text,
	PRIMARY KEY(`user_id`, `post_id`)
);
