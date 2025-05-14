CREATE TABLE `channel_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`channel_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`role` varchar(50) DEFAULT 'member',
	`status` varchar(50) DEFAULT 'active',
	CONSTRAINT `channel_users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `space_chats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`space_id` text NOT NULL,
	`chat_id` int NOT NULL,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text,
	CONSTRAINT `space_chats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `space_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`space_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`role` varchar(50) DEFAULT 'member',
	`status` varchar(50) DEFAULT 'active',
	CONSTRAINT `space_users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks_status` (
	`id` varchar(36) NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`position` int NOT NULL,
	`status_slug` text,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text,
	CONSTRAINT `tasks_status_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`date` varchar(50) NOT NULL,
	`description` text NOT NULL,
	`type` varchar(100) NOT NULL,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text,
	CONSTRAINT `activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `channels` (
	`channel_id` varchar(36) NOT NULL,
	`channel_slug` varchar(255) NOT NULL,
	`channel_name` varchar(255) NOT NULL,
	`description` text,
	`channel_type` varchar(100),
	`created_by` varchar(36) NOT NULL,
	`publish_channel` int NOT NULL DEFAULT 0,
	`ownerId` varchar(36),
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text,
	CONSTRAINT `channels_channel_id` PRIMARY KEY(`channel_id`)
);
--> statement-breakpoint
CREATE TABLE `chats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`channel_id` varchar(36) NOT NULL,
	`chat_slug` varchar(36) NOT NULL,
	`name` varchar(255),
	`type` varchar(50),
	`avatar` varchar(255),
	`last_message` text,
	`unread_count` int NOT NULL DEFAULT 0,
	`is_group` int NOT NULL DEFAULT 0,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text,
	CONSTRAINT `chats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`content` text NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`post_id` varchar(36) NOT NULL,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text,
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`start_date_time` varchar(50),
	`end_date_time` varchar(50),
	`type` varchar(50),
	`metadata` text,
	`host_id` varchar(36) NOT NULL,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `features` (
	`id` int AUTO_INCREMENT NOT NULL,
	`feature_name` varchar(255) NOT NULL,
	`feature_slug` varchar(255) NOT NULL,
	`feature_type` varchar(100) NOT NULL,
	`feature_description` text,
	`feature_icon` text,
	`feature_url` text,
	`feature_order` int NOT NULL DEFAULT 0,
	`feature_status` int NOT NULL DEFAULT 1,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text,
	CONSTRAINT `features_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`file_name` varchar(255) NOT NULL,
	`file_size` int NOT NULL,
	`file_type` varchar(50) NOT NULL,
	`file_path` varchar(512) NOT NULL,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text,
	CONSTRAINT `files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `likes` (
	`user_id` varchar(36) NOT NULL,
	`post_id` varchar(36) NOT NULL,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text,
	CONSTRAINT `likes_user_id_post_id_pk` PRIMARY KEY(`user_id`,`post_id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chat_id` int NOT NULL,
	`type` varchar(50) NOT NULL,
	`sender_id` varchar(36) NOT NULL,
	`message` text NOT NULL,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text,
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`created_by` varchar(36) NOT NULL,
	`received_by` varchar(36) NOT NULL,
	`type` varchar(50) NOT NULL,
	`link` text,
	`is_read` int NOT NULL DEFAULT 0,
	`counter` int NOT NULL DEFAULT 0,
	`entity_id` varchar(36),
	`entity_type` varchar(50) NOT NULL,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `poll_options` (
	`post_id` varchar(36) NOT NULL,
	`option_text` varchar(255) NOT NULL,
	`vote_count` int NOT NULL DEFAULT 0,
	CONSTRAINT `poll_options_post_id_option_text_pk` PRIMARY KEY(`post_id`,`option_text`)
);
--> statement-breakpoint
CREATE TABLE `poll_votes` (
	`user_id` varchar(36) NOT NULL,
	`post_id` varchar(36) NOT NULL,
	`option_text` varchar(255) NOT NULL,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text,
	CONSTRAINT `poll_votes_user_id_post_id_pk` PRIMARY KEY(`user_id`,`post_id`)
);
--> statement-breakpoint
CREATE TABLE `post_files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`post_id` varchar(36) NOT NULL,
	`file_id` int NOT NULL,
	CONSTRAINT `post_files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `post_hashtags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`post_id` varchar(36) NOT NULL,
	`hashtag_id` int NOT NULL,
	CONSTRAINT `post_hashtags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` varchar(36) NOT NULL,
	`content` text,
	`user_id` varchar(36) NOT NULL,
	`type` varchar(255) NOT NULL,
	`entity_id` varchar(36),
	`entity_type` varchar(255),
	`likes` int NOT NULL DEFAULT 0,
	`comments` int NOT NULL DEFAULT 0,
	`category` varchar(255),
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text,
	CONSTRAINT `posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project` (
	`id` varchar(36) NOT NULL,
	`project_name` varchar(255) NOT NULL,
	`project_slug` varchar(255) NOT NULL,
	`description` text,
	`project_startDate` varchar(50) NOT NULL,
	`project_targetDate` varchar(50) NOT NULL,
	`channel_id` varchar(36) NOT NULL,
	`space_id` varchar(36) NOT NULL,
	`created_by` varchar(36) NOT NULL,
	`project_type` varchar(100),
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text,
	CONSTRAINT `project_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`content` text NOT NULL,
	`recommender_id` varchar(36) NOT NULL,
	`receiver_id` varchar(36) NOT NULL,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text,
	CONSTRAINT `recommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rewards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`badge_type` varchar(100) NOT NULL,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text,
	CONSTRAINT `rewards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `space_features` (
	`id` int AUTO_INCREMENT NOT NULL,
	`space_id` varchar(36) NOT NULL,
	`feature_id` int NOT NULL,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text,
	CONSTRAINT `space_features_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `space_file_directory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`space_id` varchar(36),
	`entity_name` varchar(255) NOT NULL,
	`entity_type` varchar(100) NOT NULL,
	`entity_id` int,
	`entity_size` int,
	`parent_id` int,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text,
	CONSTRAINT `space_file_directory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `spaces` (
	`id` varchar(36) NOT NULL,
	`space_slug` varchar(255) NOT NULL,
	`space_name` varchar(255) NOT NULL,
	`description` text,
	`channel_id` varchar(36) NOT NULL,
	`created_by` varchar(36) NOT NULL,
	`ownerId` varchar(36),
	`space_type` varchar(100),
	`publish_space` int NOT NULL DEFAULT 0,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text,
	CONSTRAINT `spaces_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` varchar(255) NOT NULL,
	`count` int NOT NULL DEFAULT 1,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text,
	CONSTRAINT `tags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `task` (
	`id` varchar(36) NOT NULL,
	`task_num` varchar(50),
	`task_title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`task_type` varchar(100) NOT NULL,
	`task_priority` varchar(50) NOT NULL,
	`story_points` varchar(50) NOT NULL,
	`project_id` varchar(36) NOT NULL,
	`created_by` varchar(36) NOT NULL,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text,
	CONSTRAINT `task_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`activity_id` int NOT NULL,
	CONSTRAINT `user_activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_chats` (
	`user_id` varchar(36) NOT NULL,
	`chat_id` int NOT NULL,
	CONSTRAINT `user_chats_user_id_chat_id_pk` PRIMARY KEY(`user_id`,`chat_id`)
);
--> statement-breakpoint
CREATE TABLE `user_contacts` (
	`user_id` varchar(36) NOT NULL,
	`contact_id` varchar(36) NOT NULL,
	`is_requested` int NOT NULL DEFAULT 0,
	`is_accepted` int NOT NULL DEFAULT 0,
	`is_blocked` int NOT NULL DEFAULT 0,
	`is_following` int NOT NULL DEFAULT 0,
	`is_followed_by` int NOT NULL DEFAULT 0,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text,
	CONSTRAINT `user_contacts_user_id_contact_id_pk` PRIMARY KEY(`user_id`,`contact_id`)
);
--> statement-breakpoint
CREATE TABLE `user_messages` (
	`user_id` text NOT NULL,
	`message_id` int NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_rewards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`reward_id` int NOT NULL,
	CONSTRAINT `user_rewards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`tag_id` int NOT NULL,
	CONSTRAINT `user_tags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`unique_id` varchar(36) NOT NULL,
	`first_name` varchar(255) NOT NULL,
	`last_name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`external_auth_id` varchar(255) NOT NULL,
	`profile_url` varchar(255),
	`meta` text,
	`bio` text,
	`role` varchar(50) NOT NULL DEFAULT 'user',
	CONSTRAINT `users_unique_id` PRIMARY KEY(`unique_id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`),
	CONSTRAINT `users_external_auth_id_unique` UNIQUE(`external_auth_id`)
);
