CREATE TABLE `project` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`project_name` text NOT NULL,
	`project_slug` text NOT NULL,
	`description` text,
	`channel_id` text NOT NULL,
	`space_id` text NOT NULL,
	`created_by` text NOT NULL,
	`project_type` text,
	`updated_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text
);
