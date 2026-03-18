CREATE TABLE IF NOT EXISTS "activity_rules" (
	"rule_id" integer PRIMARY KEY NOT NULL,
	"action_type" varchar NOT NULL,
	"reward_id" integer NOT NULL,
	"base_points" integer NOT NULL,
	"category_group" varchar NOT NULL,
	"required_verification" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"description" varchar NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "point_ledger" (
	"transection_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "point_ledger_transection_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar NOT NULL,
	"reward_id" integer NOT NULL,
	"rule_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"source_system" varchar NOT NULL,
	"external_ref_id" varchar NOT NULL,
	"metadata" jsonb NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rewards_metadata" (
	"reward_id" integer PRIMARY KEY NOT NULL,
	"internal_name" varchar NOT NULL,
	"display_name" varchar NOT NULL,
	"is_soulbound" boolean DEFAULT true NOT NULL,
	"has_decay" boolean DEFAULT false NOT NULL,
	"decay_period" integer NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trust_verification" (
	"verification_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "trust_verification_verification_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar NOT NULL,
	"rule_id" integer NOT NULL,
	"advisor_id" varchar NOT NULL,
	"status" varchar NOT NULL,
	"proof_url" varchar NOT NULL,
	"points_awarded" integer NOT NULL,
	"verified_at" varchar DEFAULT now() NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_reward_balance" (
	"user_id" varchar NOT NULL,
	"reward_id" integer NOT NULL,
	"current_balance" integer NOT NULL,
	"last_updated_at" varchar DEFAULT now() NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
