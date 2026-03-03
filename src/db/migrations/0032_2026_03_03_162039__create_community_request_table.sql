CREATE TABLE IF NOT EXISTS "community_requests" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"university_name" varchar NOT NULL,
	"official_university_name" varchar NOT NULL,
	"contact_person_id" varchar NOT NULL,
	"contact_person_name" varchar NOT NULL,
	"contact_number" varchar NOT NULL,
	"designation" varchar NOT NULL,
	"university_website" varchar,
	"city" varchar NOT NULL,
	"description" varchar,
	"estimates_number_of_students" integer,
	"intended_usage" varchar,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
