CREATE TABLE IF NOT EXISTS "mentor_ratings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "mentor_ratings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"mentor_id" varchar NOT NULL,
	"reviewer_id" varchar NOT NULL,
	"rating" varchar NOT NULL,
	"review_text" varchar,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mentor_relationships" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "mentor_relationships_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"mentor_id" varchar NOT NULL,
	"mentee_id" varchar NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"request_message" varchar,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "company" varchar;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "job_title" varchar;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "location" varchar;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "years_experience" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "languages" json DEFAULT '["English"]'::json;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "availability_status" varchar DEFAULT 'true';--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "response_time" varchar DEFAULT '< 24 hours';--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "mentee_count" integer DEFAULT 0;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mentor_ratings" ADD CONSTRAINT "mentor_ratings_mentor_id_users_unique_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "public"."users"("unique_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mentor_ratings" ADD CONSTRAINT "mentor_ratings_reviewer_id_users_unique_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("unique_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mentor_relationships" ADD CONSTRAINT "mentor_relationships_mentor_id_users_unique_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "public"."users"("unique_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mentor_relationships" ADD CONSTRAINT "mentor_relationships_mentee_id_users_unique_id_fk" FOREIGN KEY ("mentee_id") REFERENCES "public"."users"("unique_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
