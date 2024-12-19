PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user_contacts` (
	`user_id` text NOT NULL,
	`contact_id` text NOT NULL,
	`is_requested` integer DEFAULT 0 NOT NULL,
	`is_accepted` integer DEFAULT 0 NOT NULL,
	`is_blocked` integer DEFAULT 0 NOT NULL,
	`is_following` integer DEFAULT 0 NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text,
	PRIMARY KEY(`user_id`, `contact_id`)
);
--> statement-breakpoint
INSERT INTO `__new_user_contacts`("user_id", "contact_id", "is_requested", "is_accepted", "is_blocked", "is_following", "updated_at", "created_at", "deleted_at") SELECT "user_id", "contact_id", "is_requested", "is_accepted", "is_blocked", "is_following", "updated_at", "created_at", "deleted_at" FROM `user_contacts`;--> statement-breakpoint
DROP TABLE `user_contacts`;--> statement-breakpoint
ALTER TABLE `__new_user_contacts` RENAME TO `user_contacts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;