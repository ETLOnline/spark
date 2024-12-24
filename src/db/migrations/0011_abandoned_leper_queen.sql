CREATE TABLE `user_tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`tag_id` integer NOT NULL
);
