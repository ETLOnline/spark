ALTER TABLE "community_requests" RENAME COLUMN "estimates_number_of_students" TO "estimated_number_of_students";--> statement-breakpoint
ALTER TABLE "community_requests" ADD COLUMN "status" varchar DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "community_requests" ADD COLUMN "invite_link" varchar;--> statement-breakpoint
ALTER TABLE "community_requests" ADD COLUMN "reason" varchar;