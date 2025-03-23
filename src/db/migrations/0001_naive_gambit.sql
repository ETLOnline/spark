CREATE TABLE `features` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`feature_name` text NOT NULL,
	`feature_slug` text NOT NULL,
	`feature_type` text NOT NULL,
	`feature_description` text,
	`feature_icon` text,
	`feature_url` text,
	`feature_order` integer DEFAULT 0 NOT NULL,
	`feature_status` integer DEFAULT 1 NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text
);
--> statement-breakpoint
CREATE TABLE `space_features` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`space_id` text NOT NULL,
	`feature_id` integer NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text
);
