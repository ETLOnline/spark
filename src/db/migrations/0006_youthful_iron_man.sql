CREATE TABLE `space_chats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`space_id` text NOT NULL,
	`chat_id` integer NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text
);
--> statement-breakpoint
CREATE TABLE `project` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`project_name` text NOT NULL,
	`project_slug` text NOT NULL,
	`description` text,
	`project_startDate` text NOT NULL,
	`project_targetDate` text NOT NULL,
	`channel_id` text NOT NULL,
	`space_id` text NOT NULL,
	`created_by` text NOT NULL,
	`project_type` text,
	`updated_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text
);
--> statement-breakpoint
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
