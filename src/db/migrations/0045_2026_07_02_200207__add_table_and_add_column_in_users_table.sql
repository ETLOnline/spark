CREATE TABLE IF NOT EXISTS "mentor_availability" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "mentor_availability_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"mentor_id" varchar NOT NULL,
	"date" varchar NOT NULL,
	"start_time" varchar NOT NULL,
	"end_time" varchar NOT NULL,
	"session_type" varchar DEFAULT '1:1' NOT NULL,
	"repeat_type" varchar DEFAULT 'none' NOT NULL,
	"repeat_end_date" varchar,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "professional_title" varchar;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "company" varchar;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "is_mentor_active" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "total_completed_sessions" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mentor_availability" ADD CONSTRAINT "mentor_availability_mentor_id_users_unique_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "public"."users"("unique_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
