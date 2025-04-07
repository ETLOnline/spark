CREATE TABLE `channel_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`channel_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member',
	`status` text DEFAULT 'active'
);
--> statement-breakpoint
CREATE TABLE `space_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`space_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member',
	`status` text DEFAULT 'active'
);
