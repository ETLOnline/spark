import { relations } from "drizzle-orm/relations";
import { users, profile, mentorRatings, mentorRelationships } from "./schema";

export const profileRelations = relations(profile, ({one}) => ({
	user: one(users, {
		fields: [profile.userId],
		references: [users.uniqueId]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	profiles: many(profile),
	mentorRatings_mentorId: many(mentorRatings, {
		relationName: "mentorRatings_mentorId_users_uniqueId"
	}),
	mentorRatings_reviewerId: many(mentorRatings, {
		relationName: "mentorRatings_reviewerId_users_uniqueId"
	}),
	mentorRelationships_mentorId: many(mentorRelationships, {
		relationName: "mentorRelationships_mentorId_users_uniqueId"
	}),
	mentorRelationships_menteeId: many(mentorRelationships, {
		relationName: "mentorRelationships_menteeId_users_uniqueId"
	}),
}));

export const mentorRatingsRelations = relations(mentorRatings, ({one}) => ({
	user_mentorId: one(users, {
		fields: [mentorRatings.mentorId],
		references: [users.uniqueId],
		relationName: "mentorRatings_mentorId_users_uniqueId"
	}),
	user_reviewerId: one(users, {
		fields: [mentorRatings.reviewerId],
		references: [users.uniqueId],
		relationName: "mentorRatings_reviewerId_users_uniqueId"
	}),
}));

export const mentorRelationshipsRelations = relations(mentorRelationships, ({one}) => ({
	user_mentorId: one(users, {
		fields: [mentorRelationships.mentorId],
		references: [users.uniqueId],
		relationName: "mentorRelationships_mentorId_users_uniqueId"
	}),
	user_menteeId: one(users, {
		fields: [mentorRelationships.menteeId],
		references: [users.uniqueId],
		relationName: "mentorRelationships_menteeId_users_uniqueId"
	}),
}));