CREATE TABLE IF NOT EXISTS "project_users" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"project_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"role" varchar DEFAULT 'member',
	"status" varchar DEFAULT 'active',
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"updated_at" varchar
);
