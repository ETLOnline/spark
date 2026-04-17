CREATE TABLE IF NOT EXISTS "leaderboard_snapshots" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "leaderboard_snapshots_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"community_id" varchar(36) NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"reward_id" integer NOT NULL,
	"rank" integer NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"points_gained" integer DEFAULT 0 NOT NULL,
	"trend" varchar DEFAULT 'neutral',
	"rank_change" integer DEFAULT 0,
	"snapshot_date" varchar NOT NULL,
	"snapshot_datetime" varchar NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
ALTER TABLE "tasks_status" ALTER COLUMN "defination_of_completion" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "tasks_status" ALTER COLUMN "defination_of_completion" DROP NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "leaderboard_snapshots" ADD CONSTRAINT "leaderboard_snapshots_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "leaderboard_snapshots" ADD CONSTRAINT "leaderboard_snapshots_user_id_users_unique_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("unique_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
