CREATE TABLE `space_file_directory` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`space_id` text,
	`entity_name` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` integer,
	`entity_size` integer,
	`parent_id` integer,
	`updated_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text
);
