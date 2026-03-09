CREATE TABLE IF NOT EXISTS "invitations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"key" varchar NOT NULL,
	"invite_email" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"joined_email" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"invited_by" varchar(36) NOT NULL,
	"entity_id" varchar NOT NULL,
	"entity_type" varchar NOT NULL,
	"role_offer_id" integer NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar,
	CONSTRAINT "invitations_key_unique" UNIQUE("key")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_users_unique_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("unique_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invitations" ADD CONSTRAINT "invitations_role_offer_id_roles_id_fk" FOREIGN KEY ("role_offer_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
