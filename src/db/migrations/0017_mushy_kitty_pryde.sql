CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`date` text NOT NULL,
	`location` text NOT NULL,
	`host_id` integer NOT NULL
);
