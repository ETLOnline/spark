CREATE TABLE IF NOT EXISTS "feature_flags" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "feature_flags_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"key" varchar NOT NULL,
	"label" varchar NOT NULL,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"description" text,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar,
	CONSTRAINT "feature_flags_key_unique" UNIQUE("key")
);
