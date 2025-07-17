import { pgTable, integer, varchar, unique, json, serial, timestamp, foreignKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const channelUsers = pgTable("channel_users", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "channel_users_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	channelId: varchar("channel_id").notNull(),
	userId: varchar("user_id").notNull(),
	role: varchar().default('member'),
	status: varchar().default('active'),
});

export const projectUsers = pgTable("project_users", {
	id: varchar({ length: 36 }).primaryKey().notNull(),
	projectId: varchar("project_id").notNull(),
	userId: varchar("user_id").notNull(),
	role: varchar().default('member'),
	status: varchar().default('active'),
	updatedAt: varchar("updated_at"),
	createdAt: varchar("created_at").default(sql`CURRENT_TIMESTAMP`),
	deletedAt: varchar("deleted_at"),
});

export const spaceChats = pgTable("space_chats", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "space_chats_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	spaceId: varchar("space_id").notNull(),
	chatId: integer("chat_id").notNull(),
	updatedAt: varchar("updated_at"),
	createdAt: varchar("created_at").default(sql`CURRENT_TIMESTAMP`),
	deletedAt: varchar("deleted_at"),
});

export const spaceUsers = pgTable("space_users", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "space_users_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	spaceId: varchar("space_id").notNull(),
	userId: varchar("user_id").notNull(),
	role: varchar().default('member'),
	status: varchar().default('active'),
});

export const tasksStatus = pgTable("tasks_status", {
	id: varchar({ length: 36 }).primaryKey().notNull(),
	projectId: varchar("project_id").notNull(),
	name: varchar().notNull(),
	position: integer().notNull(),
	statusSlug: varchar("status_slug"),
	updatedAt: varchar("updated_at"),
	createdAt: varchar("created_at").default(sql`CURRENT_TIMESTAMP`),
	deletedAt: varchar("deleted_at"),
});

export const activities = pgTable("activities", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "activities_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	title: varchar().notNull(),
	date: varchar().notNull(),
	description: varchar().notNull(),
	type: varchar().notNull(),
	updatedAt: varchar("updated_at"),
	createdAt: varchar("created_at").default(sql`CURRENT_TIMESTAMP`),
	deletedAt: varchar("deleted_at"),
});

export const channels = pgTable("channels", {
	channelId: varchar("channel_id", { length: 36 }).primaryKey().notNull(),
	channelSlug: varchar("channel_slug").notNull(),
	channelName: varchar("channel_name").notNull(),
	description: varchar(),
	channelType: varchar("channel_type"),
	createdBy: varchar("created_by").notNull(),
	publishChannel: integer("publish_channel").default(0).notNull(),
	ownerId: varchar(),
	updatedAt: varchar("updated_at"),
	createdAt: varchar("created_at").default(sql`CURRENT_TIMESTAMP`),
	deletedAt: varchar("deleted_at"),
});

export const chats = pgTable("chats", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "chats_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	channelId: varchar("channel_id").notNull(),
	chatSlug: varchar("chat_slug").notNull(),
	name: varchar(),
	type: varchar(),
	avatar: varchar(),
	lastMessage: varchar("last_message"),
	unreadCount: integer("unread_count").default(0).notNull(),
	isGroup: integer("is_group").default(0).notNull(),
	updatedAt: varchar("updated_at"),
	createdAt: varchar("created_at").default(sql`CURRENT_TIMESTAMP`),
	deletedAt: varchar("deleted_at"),
});

export const comments = pgTable("comments", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "comments_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	content: varchar().notNull(),
	userId: varchar("user_id").notNull(),
	postId: varchar("post_id").notNull(),
	updatedAt: varchar("updated_at"),
	createdAt: varchar("created_at").default(sql`CURRENT_TIMESTAMP`),
	deletedAt: varchar("deleted_at"),
});

export const events = pgTable("events", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "events_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	title: varchar().notNull(),
	description: varchar(),
	startDateTime: varchar("start_date_time"),
	endDateTime: varchar("end_date_time"),
	type: varchar(),
	metadata: varchar(),
	hostId: varchar("host_id").notNull(),
	updatedAt: varchar("updated_at"),
	createdAt: varchar("created_at").default(sql`CURRENT_TIMESTAMP`),
	deletedAt: varchar("deleted_at"),
});

export const features = pgTable("features", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "features_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	featureName: varchar("feature_name").notNull(),
	featureSlug: varchar("feature_slug").notNull(),
	featureType: varchar("feature_type").notNull(),
	featureDescription: varchar("feature_description"),
	featureIcon: varchar("feature_icon"),
	featureUrl: varchar("feature_url"),
	featureOrder: integer("feature_order").default(0).notNull(),
	featureStatus: integer("feature_status").default(1).notNull(),
	updatedAt: varchar("updated_at"),
	createdAt: varchar("created_at").default(sql`CURRENT_TIMESTAMP`),
	deletedAt: varchar("deleted_at"),
});

export const files = pgTable("files", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "files_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	fileName: varchar("file_name").notNull(),
	fileSize: integer("file_size").notNull(),
	fileType: varchar("file_type").notNull(),
	filePath: varchar("file_path").notNull(),
	updatedAt: varchar("updated_at"),
	createdAt: varchar("created_at").default(sql`CURRENT_TIMESTAMP`),
	deletedAt: varchar("deleted_at"),
});

export const likes = pgTable("likes", {
	userId: varchar("user_id").notNull(),
	postId: varchar("post_id").notNull(),
	updatedAt: varchar("updated_at"),
	createdAt: varchar("created_at").default(sql`CURRENT_TIMESTAMP`),
	deletedAt: varchar("deleted_at"),
});

export const messages = pgTable("messages", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "messages_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	chatId: integer("chat_id").notNull(),
	type: varchar().notNull(),
	senderId: varchar("sender_id").notNull(),
	message: varchar().notNull(),
	updatedAt: varchar("updated_at"),
	createdAt: varchar("created_at").default(sql`CURRENT_TIMESTAMP`),
	deletedAt: varchar("deleted_at"),
});

export const notifications = pgTable("notifications", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "notifications_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	createdBy: varchar("created_by").notNull(),
	receivedBy: varchar("received_by").notNull(),
	type: varchar().notNull(),
	link: varchar(),
	isRead: integer("is_read").default(0).notNull(),
	counter: integer().default(0).notNull(),
	entityId: varchar("entity_id"),
	entityType: varchar("entity_type").notNull(),
	updatedAt: varchar("updated_at"),
	createdAt: varchar("created_at").default(sql`CURRENT_TIMESTAMP`),
	deletedAt: varchar("deleted_at"),
});

export const pollOptions = pgTable("poll_options", {
	postId: varchar("post_id").notNull(),
	optionText: varchar("option_text").notNull(),
	voteCount: integer("vote_count").default(0).notNull(),
});

export const pollVotes = pgTable("poll_votes", {
	userId: varchar("user_id").notNull(),
	postId: varchar("post_id").notNull(),
	optionText: varchar("option_text").notNull(),
	updatedAt: varchar("updated_at"),
	createdAt: varchar("created_at").default(sql`CURRENT_TIMESTAMP`),
	deletedAt: varchar("deleted_at"),
});

export const postFiles = pgTable("post_files", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "post_files_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	postId: varchar("post_id").notNull(),
	fileId: integer("file_id").notNull(),
});

export const postHashtags = pgTable("post_hashtags", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "post_hashtags_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	postId: varchar("post_id").notNull(),
	hashtagId: integer("hashtag_id").notNull(),
});

export const posts = pgTable("posts", {
	id: varchar().primaryKey().notNull(),
	content: varchar(),
	userId: varchar("user_id").notNull(),
	type: varchar().notNull(),
	entityId: varchar("entity_id"),
	entityType: varchar("entity_type"),
	likes: integer().default(0).notNull(),
	comments: integer().default(0).notNull(),
	category: varchar(),
	updatedAt: varchar("updated_at"),
	createdAt: varchar("created_at").default(sql`CURRENT_TIMESTAMP`),
	deletedAt: varchar("deleted_at"),
});

export const project = pgTable("project", {
	id: varchar({ length: 36 }).primaryKey().notNull(),
	projectName: varchar("project_name").notNull(),
	projectSlug: varchar("project_slug").notNull(),
	description: varchar(),
	projectStartDate: varchar("project_startDate").notNull(),
	projectTargetDate: varchar("project_targetDate").notNull(),
	channelId: varchar("channel_id").notNull(),
	spaceId: varchar("space_id").notNull(),
	createdBy: varchar("created_by").notNull(),
	projectType: varchar("project_type"),
	updatedAt: varchar("updated_at"),
	createdAt: varchar("created_at").default(sql`CURRENT_TIMESTAMP`),
	deletedAt: varchar("deleted_at"),
});

export const recommendations = pgTable("recommendations", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "recommendations_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	content: varchar().notNull(),
	recommenderId: varchar("recommender_id").notNull(),
	receiverId: varchar("receiver_id").notNull(),
	updatedAt: varchar("updated_at"),
	createdAt: varchar("created_at").default(sql`CURRENT_TIMESTAMP`),
	deletedAt: varchar("deleted_at"),
});

export const rewards = pgTable("rewards", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "rewards_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	title: varchar().notNull(),
	description: varchar().notNull(),
	badgeType: varchar("badge_type").notNull(),
	updatedAt: varchar("updated_at"),
	createdAt: varchar("created_at").default(sql`CURRENT_TIMESTAMP`),
	deletedAt: varchar("deleted_at"),
});

export const spaceFeatures = pgTable("space_features", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "space_features_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	spaceId: varchar("space_id").notNull(),
	featureId: integer("feature_id").notNull(),
	updatedAt: varchar("updated_at"),
	createdAt: varchar("created_at").default(sql`CURRENT_TIMESTAMP`),
	deletedAt: varchar("deleted_at"),
});

export const tags = pgTable("tags", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "tags_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar().notNull(),
	type: varchar().notNull(),
	count: integer().default(1).notNull(),
	updatedAt: varchar("updated_at"),
	createdAt: varchar("created_at").default(sql`CURRENT_TIMESTAMP`),
	deletedAt: varchar("deleted_at"),
});

export const userActivities = pgTable("user_activities", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "user_activities_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	userId: varchar("user_id").notNull(),
	activityId: integer("activity_id").notNull(),
});

export const userChats = pgTable("user_chats", {
	userId: varchar("user_id").notNull(),
	chatId: integer("chat_id").notNull(),
});

export const userContacts = pgTable("user_contacts", {
	userId: varchar("user_id").notNull(),
	contactId: varchar("contact_id").notNull(),
	isRequested: integer("is_requested").default(0).notNull(),
	isAccepted: integer("is_accepted").default(0).notNull(),
	isBlocked: integer("is_blocked").default(0).notNull(),
	isFollowing: integer("is_following").default(0).notNull(),
	isFollowedBy: integer("is_followed_by").default(0).notNull(),
	updatedAt: varchar("updated_at"),
	createdAt: varchar("created_at").default(sql`CURRENT_TIMESTAMP`),
	deletedAt: varchar("deleted_at"),
});

export const userMessages = pgTable("user_messages", {
	userId: varchar("user_id").notNull(),
	messageId: integer("message_id").notNull(),
});

export const userRewards = pgTable("user_rewards", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "user_rewards_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	userId: varchar("user_id").notNull(),
	rewardId: integer("reward_id").notNull(),
});

export const userTags = pgTable("user_tags", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "user_tags_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	userId: varchar("user_id").notNull(),
	tagId: integer("tag_id").notNull(),
});

export const sprints = pgTable("sprints", {
	id: varchar({ length: 36 }).primaryKey().notNull(),
	title: varchar().notNull(),
	startDate: varchar("start_date").notNull(),
	endDate: varchar("end_date").notNull(),
	projectId: varchar().notNull(),
	updatedAt: varchar("updated_at"),
	createdAt: varchar("created_at").default(sql`CURRENT_TIMESTAMP`),
	deletedAt: varchar("deleted_at"),
});

export const task = pgTable("task", {
	id: varchar({ length: 36 }).primaryKey().notNull(),
	taskNum: varchar("task_num"),
	taskTitle: varchar("task_title").notNull(),
	description: varchar().notNull(),
	taskType: varchar("task_type").notNull(),
	taskPriority: varchar("task_priority").notNull(),
	storyPoints: varchar("story_points").notNull(),
	projectId: varchar("project_id").notNull(),
	createdBy: varchar("created_by").notNull(),
	statusId: varchar("status_id"),
	updatedAt: varchar("updated_at"),
	createdAt: varchar("created_at").default(sql`CURRENT_TIMESTAMP`),
	deletedAt: varchar("deleted_at"),
	sprintId: varchar("sprint_id"),
});

export const permissions = pgTable("permissions", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "permissions_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	namespace: varchar().notNull(),
	action: varchar().notNull(),
});

export const roles = pgTable("roles", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "roles_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar().notNull(),
	roleType: varchar("role_type").notNull(),
	slug: varchar(),
	entityType: varchar("entity_type"),
	entityId: varchar("entity_id"),
});

export const spaceFileDirectory = pgTable("space_file_directory", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "space_file_directory_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	spaceId: varchar("space_id"),
	entityName: varchar("entity_name").notNull(),
	entityType: varchar("entity_type").notNull(),
	entityId: integer("entity_id"),
	entitySize: integer("entity_size"),
	parentId: integer("parent_id"),
	updatedAt: varchar("updated_at"),
	createdAt: varchar("created_at").default(sql`CURRENT_TIMESTAMP`),
	deletedAt: varchar("deleted_at"),
	createdBy: varchar("created_by"),
});

export const spaces = pgTable("spaces", {
	id: varchar({ length: 36 }).primaryKey().notNull(),
	spaceSlug: varchar("space_slug").notNull(),
	spaceName: varchar("space_name").notNull(),
	description: varchar(),
	channelId: varchar("channel_id").notNull(),
	createdBy: varchar("created_by").notNull(),
	ownerId: varchar(),
	spaceType: varchar("space_type"),
	publishSpace: integer("publish_space").default(0).notNull(),
	updatedAt: varchar("updated_at"),
	createdAt: varchar("created_at").default(sql`CURRENT_TIMESTAMP`),
	deletedAt: varchar("deleted_at"),
	overview: varchar(),
});

export const users = pgTable("users", {
	uniqueId: varchar("unique_id", { length: 36 }).primaryKey().notNull(),
	firstName: varchar("first_name").notNull(),
	lastName: varchar("last_name").notNull(),
	email: varchar().notNull(),
	externalAuthId: varchar("external_auth_id").notNull(),
	profileUrl: varchar("profile_url"),
	meta: varchar(),
	role: varchar().default('user').notNull(),
	metaProfile: json("meta_profile").default({"bio_written":false,"persona_selected":false,"profile_picture_uploaded":false}),
}, (table) => {
	return {
		usersEmailUnique: unique("users_email_unique").on(table.email),
		usersExternalAuthIdUnique: unique("users_external_auth_id_unique").on(table.externalAuthId),
	}
});

export const userRoles = pgTable("user_roles", {
	userId: varchar("user_id").notNull(),
	roleId: integer("role_id").notNull(),
});

export const rolePermissions = pgTable("role_permissions", {
	roleId: integer("role_id").notNull(),
	permissionId: integer("permission_id").notNull(),
});

export const mentorFavorites = pgTable("mentor_favorites", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	mentorId: varchar("mentor_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
});

export const profile = pgTable("profile", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "profile_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	userId: varchar("user_id").notNull(),
	bio: varchar(),
	degree: varchar(),
	institute: varchar(),
	educationStartDate: varchar("education_start_date"),
	educationEndDate: varchar("education_end_date"),
	linkedinUrl: varchar("linkedin_url"),
	githubUrl: varchar("github_url"),
	instagramUrl: varchar("instagram_url"),
	twitterUrl: varchar("twitter_url"),
	personalWebsiteUrl: varchar("personal_website_url"),
	updatedAt: varchar("updated_at"),
	createdAt: varchar("created_at").default(sql`CURRENT_TIMESTAMP`),
	deletedAt: varchar("deleted_at"),
	company: varchar(),
	jobTitle: varchar("job_title"),
	location: varchar(),
	yearsExperience: integer("years_experience").default(0),
	languages: json().default(["English"]),
	availabilityStatus: varchar("availability_status").default('true'),
	responseTime: varchar("response_time").default('< 24 hours'),
	menteeCount: integer("mentee_count").default(0),
}, (table) => {
	return {
		profileUserIdUsersUniqueIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.uniqueId],
			name: "profile_user_id_users_unique_id_fk"
		}),
	}
});

export const mentorRatings = pgTable("mentor_ratings", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "mentor_ratings_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	mentorId: varchar("mentor_id").notNull(),
	reviewerId: varchar("reviewer_id").notNull(),
	rating: varchar().notNull(),
	reviewText: varchar("review_text"),
	updatedAt: varchar("updated_at"),
	createdAt: varchar("created_at").default(sql`CURRENT_TIMESTAMP`),
	deletedAt: varchar("deleted_at"),
}, (table) => {
	return {
		mentorRatingsMentorIdUsersUniqueIdFk: foreignKey({
			columns: [table.mentorId],
			foreignColumns: [users.uniqueId],
			name: "mentor_ratings_mentor_id_users_unique_id_fk"
		}),
		mentorRatingsReviewerIdUsersUniqueIdFk: foreignKey({
			columns: [table.reviewerId],
			foreignColumns: [users.uniqueId],
			name: "mentor_ratings_reviewer_id_users_unique_id_fk"
		}),
	}
});

export const mentorRelationships = pgTable("mentor_relationships", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "mentor_relationships_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	mentorId: varchar("mentor_id").notNull(),
	menteeId: varchar("mentee_id").notNull(),
	status: varchar().default('pending').notNull(),
	requestMessage: varchar("request_message"),
	updatedAt: varchar("updated_at"),
	createdAt: varchar("created_at").default(sql`CURRENT_TIMESTAMP`),
	deletedAt: varchar("deleted_at"),
}, (table) => {
	return {
		mentorRelationshipsMentorIdUsersUniqueIdFk: foreignKey({
			columns: [table.mentorId],
			foreignColumns: [users.uniqueId],
			name: "mentor_relationships_mentor_id_users_unique_id_fk"
		}),
		mentorRelationshipsMenteeIdUsersUniqueIdFk: foreignKey({
			columns: [table.menteeId],
			foreignColumns: [users.uniqueId],
			name: "mentor_relationships_mentee_id_users_unique_id_fk"
		}),
	}
});

export const communities = pgTable("communities", {
	id: varchar({ length: 36 }).primaryKey().notNull(),
	title: varchar().notNull(),
	description: varchar(),
	categoryId: varchar("category_id").notNull(),
	slug: varchar().notNull(),
	type: varchar().default('public').notNull(),
	createdBy: varchar("created_by").notNull(),
	updatedAt: varchar("updated_at"),
	createdAt: varchar("created_at").default(sql`CURRENT_TIMESTAMP`),
	deletedAt: varchar("deleted_at"),
}, (table) => {
	return {
		communitiesSlugUnique: unique("communities_slug_unique").on(table.slug),
	}
});

export const communityUsers = pgTable("community_users", {
	id: varchar({ length: 36 }).primaryKey().notNull(),
	communityId: varchar("community_id").notNull(),
	userId: varchar("user_id").notNull(),
});

export const communityCategories = pgTable("community_categories", {
	id: varchar({ length: 36 }).primaryKey().notNull(),
	name: varchar().notNull(),
	slug: varchar().notNull(),
	updatedAt: varchar("updated_at"),
	createdAt: varchar("created_at").default(sql`CURRENT_TIMESTAMP`),
	deletedAt: varchar("deleted_at"),
}, (table) => {
	return {
		communityCategoriesSlugUnique: unique("community_categories_slug_unique").on(table.slug),
	}
});
