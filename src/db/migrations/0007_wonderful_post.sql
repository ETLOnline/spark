CREATE TABLE `project_comments` (
	`unique_id` text(36) PRIMARY KEY NOT NULL,
	`author_id` text NOT NULL,
	`project_id` text NOT NULL,
	`comment` text NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text
);
