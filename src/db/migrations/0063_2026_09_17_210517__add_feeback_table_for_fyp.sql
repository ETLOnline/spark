CREATE TABLE IF NOT EXISTS "program_feedback" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "program_feedback_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"space_id" varchar(36) NOT NULL,
	"submitted_by" varchar NOT NULL,
	"overall_program_rating" integer NOT NULL,
	"spark_overall_rating" integer NOT NULL,
	"partner_rating" integer NOT NULL,
	"answers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "program_feedback" ADD CONSTRAINT "program_feedback_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "program_feedback" ADD CONSTRAINT "program_feedback_submitted_by_users_unique_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("unique_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
