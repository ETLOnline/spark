CREATE TABLE IF NOT EXISTS "session_requests" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "session_requests_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"mentor_id" varchar NOT NULL,
	"mentee_id" varchar NOT NULL,
	"availability_slot_id" integer,
	"session_date" varchar NOT NULL,
	"start_time" varchar NOT NULL,
	"end_time" varchar NOT NULL,
	"session_type" varchar NOT NULL,
	"topic" varchar NOT NULL,
	"description" varchar,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session_requests" ADD CONSTRAINT "session_requests_mentor_id_users_unique_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "public"."users"("unique_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session_requests" ADD CONSTRAINT "session_requests_mentee_id_users_unique_id_fk" FOREIGN KEY ("mentee_id") REFERENCES "public"."users"("unique_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
