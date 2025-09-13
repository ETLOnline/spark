CREATE TABLE IF NOT EXISTS "email_templates" (
	"unique_id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"body" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar,
	CONSTRAINT "email_templates_name_unique" UNIQUE("name")
);
