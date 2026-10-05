ALTER TABLE "advisor_requests" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "advisor_requests" ALTER COLUMN "advisor_ids" DROP NOT NULL;