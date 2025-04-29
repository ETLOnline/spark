CREATE TABLE `task` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`task_num` text,
	`task_title` text NOT NULL,
	`description` text NOT NULL,
	`task_type` text NOT NULL,
	`task_priority` text NOT NULL,
	`story_points` text NOT NULL,
	`project_id` text NOT NULL,
	`created_by` text NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text
);
