ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id");--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "slug" varchar;