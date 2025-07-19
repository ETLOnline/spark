CREATE TABLE IF NOT EXISTS "shortcuts" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"url" varchar NOT NULL,
	"type" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
