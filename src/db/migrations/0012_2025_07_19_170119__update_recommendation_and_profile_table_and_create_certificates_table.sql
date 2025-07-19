CREATE TABLE IF NOT EXISTS "certificates" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "certificates_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar NOT NULL,
	"title" varchar,
	"institute" varchar,
	"year" varchar,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
ALTER TABLE "recommendations" ALTER COLUMN "recommender_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "recommendations" ALTER COLUMN "receiver_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "sum_of_ratings" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "number_of_ratings" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "total_average_rating" varchar DEFAULT '0';--> statement-breakpoint
ALTER TABLE "recommendations" ADD COLUMN "rating" integer NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "certificates" ADD CONSTRAINT "certificates_user_id_users_unique_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("unique_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
