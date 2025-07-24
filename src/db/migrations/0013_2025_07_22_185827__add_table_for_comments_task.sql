CREATE TABLE IF NOT EXISTS "task_comments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "task_comments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"content" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"task_id" varchar NOT NULL,
	"updated_at" varchar,
	"created_at" varchar DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" varchar
);
