CREATE TABLE IF NOT EXISTS "email_otps" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "email_otps_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"email" varchar NOT NULL,
	"otp" varchar NOT NULL,
	"expires_at" varchar NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar,
	CONSTRAINT "email_otps_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "recommendations" ALTER COLUMN "type" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "recommendations" ALTER COLUMN "type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "email" varchar;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "verified" boolean DEFAULT false NOT NULL;