ALTER TABLE `channels` ADD `channel_slug` text NOT NULL;--> statement-breakpoint
ALTER TABLE `spaces` ADD `space_slug` text NOT NULL;--> statement-breakpoint
ALTER TABLE `spaces` ADD `channel_slug` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `role` text DEFAULT 'user' NOT NULL;