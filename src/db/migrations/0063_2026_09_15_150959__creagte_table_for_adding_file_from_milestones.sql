CREATE TABLE IF NOT EXISTS "fyp_artifact_files" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "fyp_artifact_files_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"milestone_id" varchar(36) NOT NULL,
	"type" varchar NOT NULL,
	"file_id" integer,
	"url" varchar,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fyp_artifact_files" ADD CONSTRAINT "fyp_artifact_files_milestone_id_fyp_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."fyp_milestones"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fyp_artifact_files" ADD CONSTRAINT "fyp_artifact_files_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "fyp_milestones" DROP COLUMN IF EXISTS "artifacts";