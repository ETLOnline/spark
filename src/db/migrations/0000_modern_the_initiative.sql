CREATE TABLE IF NOT EXISTS "channel_users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "channel_users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"channel_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"role" varchar DEFAULT 'member',
	"status" varchar DEFAULT 'active'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "space_chats" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "space_chats_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"space_id" varchar NOT NULL,
	"chat_id" integer NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "space_users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "space_users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"space_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"role" varchar DEFAULT 'member',
	"status" varchar DEFAULT 'active'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tasks_status" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"project_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"position" integer NOT NULL,
	"status_slug" varchar,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "activities" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "activities_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar NOT NULL,
	"date" varchar NOT NULL,
	"description" varchar NOT NULL,
	"type" varchar NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "channels" (
	"channel_id" varchar(36) PRIMARY KEY NOT NULL,
	"channel_slug" varchar NOT NULL,
	"channel_name" varchar NOT NULL,
	"description" varchar,
	"channel_type" varchar,
	"created_by" varchar NOT NULL,
	"publish_channel" integer DEFAULT 0 NOT NULL,
	"ownerId" varchar,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chats" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "chats_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"channel_id" varchar NOT NULL,
	"chat_slug" varchar NOT NULL,
	"name" varchar,
	"type" varchar,
	"avatar" varchar,
	"last_message" varchar,
	"unread_count" integer DEFAULT 0 NOT NULL,
	"is_group" integer DEFAULT 0 NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "comments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "comments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"content" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"post_id" varchar NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar NOT NULL,
	"description" varchar,
	"start_date_time" varchar,
	"end_date_time" varchar,
	"type" varchar,
	"metadata" varchar,
	"host_id" varchar NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "features" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "features_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"feature_name" varchar NOT NULL,
	"feature_slug" varchar NOT NULL,
	"feature_type" varchar NOT NULL,
	"feature_description" varchar,
	"feature_icon" varchar,
	"feature_url" varchar,
	"feature_order" integer DEFAULT 0 NOT NULL,
	"feature_status" integer DEFAULT 1 NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "files" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "files_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"file_name" varchar NOT NULL,
	"file_size" integer NOT NULL,
	"file_type" varchar NOT NULL,
	"file_path" varchar NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "likes" (
	"user_id" varchar NOT NULL,
	"post_id" varchar NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "messages" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "messages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"chat_id" integer NOT NULL,
	"type" varchar NOT NULL,
	"sender_id" varchar NOT NULL,
	"message" varchar NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "notifications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_by" varchar NOT NULL,
	"received_by" varchar NOT NULL,
	"type" varchar NOT NULL,
	"link" varchar,
	"is_read" integer DEFAULT 0 NOT NULL,
	"counter" integer DEFAULT 0 NOT NULL,
	"entity_id" varchar,
	"entity_type" varchar NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "personas" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "personas_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" varchar(255) NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar,
	CONSTRAINT "personas_slug_unique" UNIQUE("slug"),
	CONSTRAINT "personas_description_unique" UNIQUE("description")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "poll_options" (
	"post_id" varchar NOT NULL,
	"option_text" varchar NOT NULL,
	"vote_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "poll_votes" (
	"user_id" varchar NOT NULL,
	"post_id" varchar NOT NULL,
	"option_text" varchar NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_files" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "post_files_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"post_id" varchar NOT NULL,
	"file_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_hashtags" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "post_hashtags_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"post_id" varchar NOT NULL,
	"hashtag_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "posts" (
	"id" varchar PRIMARY KEY NOT NULL,
	"content" varchar,
	"user_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"entity_id" varchar,
	"entity_type" varchar,
	"likes" integer DEFAULT 0 NOT NULL,
	"comments" integer DEFAULT 0 NOT NULL,
	"category" varchar,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"project_name" varchar NOT NULL,
	"project_slug" varchar NOT NULL,
	"description" varchar,
	"project_startDate" varchar NOT NULL,
	"project_targetDate" varchar NOT NULL,
	"channel_id" varchar NOT NULL,
	"space_id" varchar NOT NULL,
	"created_by" varchar NOT NULL,
	"project_type" varchar,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recommendations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "recommendations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"content" varchar NOT NULL,
	"recommender_id" varchar NOT NULL,
	"receiver_id" varchar NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rewards" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "rewards_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar NOT NULL,
	"description" varchar NOT NULL,
	"badge_type" varchar NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "space_features" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "space_features_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"space_id" varchar NOT NULL,
	"feature_id" integer NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "space_file_directory" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "space_file_directory_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"space_id" varchar,
	"entity_name" varchar NOT NULL,
	"entity_type" varchar NOT NULL,
	"entity_id" integer,
	"entity_size" integer,
	"parent_id" integer,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "spaces" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"space_slug" varchar NOT NULL,
	"space_name" varchar NOT NULL,
	"description" varchar,
	"channel_id" varchar NOT NULL,
	"created_by" varchar NOT NULL,
	"ownerId" varchar,
	"space_type" varchar,
	"publish_space" integer DEFAULT 0 NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tags" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tags_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar NOT NULL,
	"type" varchar NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "task" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"task_num" varchar,
	"task_title" varchar NOT NULL,
	"description" varchar NOT NULL,
	"task_type" varchar NOT NULL,
	"task_priority" varchar NOT NULL,
	"story_points" varchar NOT NULL,
	"project_id" varchar NOT NULL,
	"created_by" varchar NOT NULL,
	"status_id" varchar,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_activities" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_activities_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar NOT NULL,
	"activity_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_chats" (
	"user_id" varchar NOT NULL,
	"chat_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_contacts" (
	"user_id" varchar NOT NULL,
	"contact_id" varchar NOT NULL,
	"is_requested" integer DEFAULT 0 NOT NULL,
	"is_accepted" integer DEFAULT 0 NOT NULL,
	"is_blocked" integer DEFAULT 0 NOT NULL,
	"is_following" integer DEFAULT 0 NOT NULL,
	"is_followed_by" integer DEFAULT 0 NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_messages" (
	"user_id" varchar NOT NULL,
	"message_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_rewards" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_rewards_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar NOT NULL,
	"reward_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_tags" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_tags_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar NOT NULL,
	"tag_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"unique_id" varchar(36) PRIMARY KEY NOT NULL,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"external_auth_id" varchar NOT NULL,
	"profile_url" varchar,
	"meta" varchar,
	"bio" varchar,
	"role" varchar DEFAULT 'user' NOT NULL,
	"persona_id" integer,
	"meta_profile" json DEFAULT '{"profile_picture_uploaded":false,"bio_written":false,"persona_selected":false}'::json,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_external_auth_id_unique" UNIQUE("external_auth_id")
);
