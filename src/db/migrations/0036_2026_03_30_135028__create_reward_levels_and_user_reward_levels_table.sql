CREATE TABLE IF NOT EXISTS "reward_level" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar,
	"key" varchar NOT NULL,
	"min_points" integer NOT NULL,
	"max_points" integer,
	"reward_id" integer NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_rewards_level" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_rewards_level_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar NOT NULL,
	"level_id" integer NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
