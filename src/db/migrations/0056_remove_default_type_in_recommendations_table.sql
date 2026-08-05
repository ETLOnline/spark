ALTER TABLE "recommendations" ALTER COLUMN "type" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "recommendations" ALTER COLUMN "type" DROP NOT NULL;--> statement-breakpoint
UPDATE "recommendations" SET "type" = NULL WHERE "type" = 'manual';