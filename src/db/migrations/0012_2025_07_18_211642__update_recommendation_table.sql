ALTER TABLE "recommendations" ALTER COLUMN "recommender_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "recommendations" ALTER COLUMN "receiver_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "recommendations" ADD COLUMN "rating" integer NOT NULL;