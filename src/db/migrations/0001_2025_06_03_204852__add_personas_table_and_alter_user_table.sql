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
ALTER TABLE "users" ADD COLUMN "persona_id" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "meta_profile" json DEFAULT '{"bio_written":false,"persona_selected":false,"profile_picture_uploaded":false}'::json;