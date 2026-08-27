CREATE TABLE IF NOT EXISTS "advisor_requests" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"space_id" varchar(36) NOT NULL,
	"requested_by" varchar NOT NULL,
	"group_members" jsonb NOT NULL,
	"supervisor_name" varchar NOT NULL,
	"fyp_title" varchar NOT NULL,
	"abstract" text NOT NULL,
	"problem_statement" text NOT NULL,
	"tech_stack" varchar NOT NULL,
	"domain_tag_id" integer NOT NULL,
	"proposal_file_id" integer,
	"proposal_link" varchar,
	"status" varchar DEFAULT 'active' NOT NULL,
	"accepted_by" varchar,
	"rejected_by" jsonb DEFAULT '[]'::jsonb,
	"advisor_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"rejection_reason" varchar,
	"expiry_date" varchar NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "advisor_requests" ADD CONSTRAINT "advisor_requests_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "advisor_requests" ADD CONSTRAINT "advisor_requests_domain_tag_id_tags_id_fk" FOREIGN KEY ("domain_tag_id") REFERENCES "public"."tags"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "advisor_requests" ADD CONSTRAINT "advisor_requests_proposal_file_id_files_id_fk" FOREIGN KEY ("proposal_file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
