CREATE TABLE IF NOT EXISTS "mentor_favorites" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "mentor_favorites_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar NOT NULL,
	"mentor_id" varchar NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar,
	CONSTRAINT "mentor_favorites_user_id_mentor_id_unique" UNIQUE("user_id","mentor_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mentor_ratings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "mentor_ratings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"mentor_id" varchar NOT NULL,
	"reviewer_id" varchar NOT NULL,
	"rating" numeric(2, 1) NOT NULL,
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
DO $$ BEGIN
 ALTER TABLE "mentor_favorites" ADD CONSTRAINT "mentor_favorites_user_id_users_unique_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("unique_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mentor_favorites" ADD CONSTRAINT "mentor_favorites_mentor_id_users_unique_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "public"."users"("unique_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
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
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_mentor_favorites_user_id" ON "mentor_favorites" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_mentor_favorites_mentor_id" ON "mentor_favorites" USING btree ("mentor_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_mentor_ratings_mentor_id" ON "mentor_ratings" USING btree ("mentor_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_mentor_ratings_reviewer_id" ON "mentor_ratings" USING btree ("reviewer_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_mentor_relationships_mentor_id" ON "mentor_relationships" USING btree ("mentor_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_mentor_relationships_mentee_id" ON "mentor_relationships" USING btree ("mentee_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_mentor_relationships_status" ON "mentor_relationships" USING btree ("status");