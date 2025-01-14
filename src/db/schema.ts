import { randomUUID } from "crypto"
import { InferSelectModel, relations, sql } from "drizzle-orm"
import { int, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core"

const timestamps = {
  updated_at: text("updated_at").$onUpdateFn(() => sql`CURRENT_TIMESTAMP`),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  deleted_at: text("deleted_at")
}

export const usersTable = sqliteTable(
  "users",
  {
    unique_id: text("unique_id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    first_name: text().notNull(),
    last_name: text().notNull(),
    email: text().notNull().unique(),
    external_auth_id: text().notNull().unique(),
    profile_url: text(),
    meta: text(),
    bio: text()
  },
  (t) => ({
    pk: primaryKey({ columns: [t.unique_id] })
  })
)

export const usersRelations = relations(usersTable, ({ many }) => ({
  chats: many(userChatsTable, {
    relationName: "UserChats"
  }),
  contacts: many(userContactsTable, {
    relationName: "userToContact"
  }),
  userActivities: many(userActivitiesTable, {
    relationName: "userActivitiesToUser"
  }),
  userRewards: many(userRewardsTable, {
    relationName: "userRewardsToUser"
  }),
  userTags: many(userTagsTable, {
    relationName: "userTagsToUser"
  }),
  recommendations: many(recommendationsTable, {
    relationName: "recommendationToReceiver"
  })
}))

export type InsertUser = typeof usersTable.$inferInsert
export type SelectUser = Omit<typeof usersTable.$inferSelect, "meta">

export const chatsTable = sqliteTable("chats", {
  id: int().primaryKey({ autoIncrement: true }),
  channel_id: text().notNull(),
  chat_slug: text()
    .notNull()
    .$defaultFn(() => randomUUID()),
  name: text(),
  type: text(),
  avatar: text(),
  last_message: text(),
  unread_count: int().notNull().default(0),
  is_group: int().notNull().default(0),
  ...timestamps
})

export const chatsRelations = relations(chatsTable, ({ many }) => ({
  messages: many(messagesTable, {
    relationName: "messageToChat"
  }),
  users: many(userChatsTable, {
    relationName: "ChatUsers"
  })
}))

export type InsertChat = typeof chatsTable.$inferInsert
export type SelectChat = InferSelectModel<typeof chatsTable> & {
  messages?: SelectMessage[]
  users?: SelectUserChat[]
}
export type SelectChatWithRelation = typeof chatsRelations

export const messagesTable = sqliteTable(
  "messages",
  {
    id: int().primaryKey({ autoIncrement: true }),
    chat_id: int().notNull(),
    type: text().notNull(),
    sender_id: text().notNull(),
    message: text().notNull(),
    ...timestamps
  },
  (t) => ({
    pk: primaryKey({ columns: [t.id] })
  })
)

export const messagesRelations = relations(messagesTable, ({ one }) => ({
  chat: one(chatsTable, {
    fields: [messagesTable.chat_id],
    references: [chatsTable.id],
    relationName: "messageToChat"
  }),
  sender: one(usersTable, {
    fields: [messagesTable.sender_id],
    references: [usersTable.unique_id],
    relationName: "messageToUser"
  })
}))

export type InsertMessage = typeof messagesTable.$inferInsert
export type SelectMessage = typeof messagesTable.$inferSelect

export const userChatsTable = sqliteTable(
  "user_chats",
  {
    user_id: text().notNull(),
    chat_id: int().notNull()
  },
  (t) => ({
    pk: primaryKey({ columns: [t.user_id, t.chat_id] })
  })
)

export const userChatsRelations = relations(userChatsTable, ({ one }) => ({
  chat: one(chatsTable, {
    fields: [userChatsTable.chat_id],
    references: [chatsTable.id],
    relationName: "ChatUsers"
  }),
  user: one(usersTable, {
    fields: [userChatsTable.user_id],
    references: [usersTable.unique_id],
    relationName: "UserChats"
  })
}))

export type InsertUserChat = typeof userChatsTable.$inferInsert
export type SelectUserChat = typeof userChatsTable.$inferSelect & {
  user?: SelectUser
  chat?: SelectChat
}

export const userMessagesTable = sqliteTable("user_messages", {
  user_id: text().notNull(),
  message_id: int().notNull()
})

export type InsertUserMessage = typeof userMessagesTable.$inferInsert
export type SelectUserMessage = typeof userMessagesTable.$inferSelect

export const userContactsTable = sqliteTable(
  "user_contacts",
  {
    user_id: text().notNull(),
    contact_id: text().notNull(),
    is_requested: int().notNull().default(0),
    is_accepted: int().notNull().default(0),
    is_blocked: int().notNull().default(0),
    is_following: int().notNull().default(0),
    ...timestamps
  },
  (t) => ({
    pk: primaryKey({ columns: [t.user_id, t.contact_id] })
  })
)

export const userContactsRelations = relations(
  userContactsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [userContactsTable.user_id],
      references: [usersTable.unique_id],
      relationName: "userToUser"
    }),
    contact: one(usersTable, {
      fields: [userContactsTable.contact_id],
      references: [usersTable.unique_id],
      relationName: "userToContact"
    })
  })
)

export type InsertUserContact = typeof userContactsTable.$inferInsert
export type SelectUserContact = typeof userContactsTable.$inferSelect

export const tagsTable = sqliteTable("tags", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  type: text().notNull(),
  ...timestamps
})

export const tagsRelations = relations(tagsTable, ({ many }) => ({
  tags: many(userTagsTable, {
    relationName: "userTagsToActivity"
  })
}))

export type InsertTag = typeof tagsTable.$inferInsert
export type SelectTag = typeof tagsTable.$inferSelect

export const userTagsTable = sqliteTable("user_tags", {
  id: int().primaryKey({ autoIncrement: true }),
  user_id: text().notNull(),
  tag_id: int().notNull()
})

export const userTagsRelations = relations(userTagsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [userTagsTable.user_id],
    references: [usersTable.unique_id],
    relationName: "userTagsToUser"
  }),
  tag: one(tagsTable, {
    fields: [userTagsTable.tag_id],
    references: [tagsTable.id],
    relationName: "userTagsToTag"
  })
}))

export type InsertUserTag = typeof userTagsTable.$inferInsert
export type SelectUserTag = typeof userTagsTable.$inferSelect

export const rewardsTable = sqliteTable("rewards", {
  id: int().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  description: text().notNull(),
  badge_type: text().notNull(),
  ...timestamps
})

export const rewardsRelations = relations(rewardsTable, ({ many }) => ({
  rewards: many(userRewardsTable, {
    relationName: "userRewardsToRewards"
  })
}))

export type InsertReward = typeof rewardsTable.$inferInsert
export type SelectReward = typeof rewardsTable.$inferSelect

export const userRewardsTable = sqliteTable("user_rewards", {
  id: int().primaryKey({ autoIncrement: true }),
  user_id: text().notNull(),
  reward_id: int().notNull()
})

export const userRewardsRelations = relations(userRewardsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [userRewardsTable.user_id],
    references: [usersTable.unique_id],
    relationName: "userRewardsToUser"
  }),
  reward: one(rewardsTable, {
    fields: [userRewardsTable.reward_id],
    references: [rewardsTable.id],
    relationName: "userRewardsToReward"
  })
}))

export type InsertUserReward = typeof userRewardsTable.$inferInsert
export type SelectUserReward = typeof userRewardsTable.$inferSelect

export const activitiesTable = sqliteTable("activities", {
  id: int().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  date: text().notNull(),
  description: text().notNull(),
  type: text().notNull(),
  ...timestamps
})

export const activitiesRelations = relations(activitiesTable, ({ many }) => ({
  activities: many(userActivitiesTable, {
    relationName: "userActivitiesToActivity"
  })
}))

export type InsertActivity = typeof activitiesTable.$inferInsert
export type SelectActivity = typeof activitiesTable.$inferSelect

export const userActivitiesTable = sqliteTable("user_activities", {
  id: int().primaryKey({ autoIncrement: true }),
  user_id: text().notNull(),
  activity_id: int().notNull()
})

export const userActivitiesRelations = relations(
  userActivitiesTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [userActivitiesTable.user_id],
      references: [usersTable.unique_id],
      relationName: "userActivitiesToUser"
    }),
    activity: one(activitiesTable, {
      fields: [userActivitiesTable.activity_id],
      references: [activitiesTable.id],
      relationName: "userActivitiesToActivity"
    })
  })
)

export type InsertUserActivity = typeof userActivitiesTable.$inferInsert
export type SelectUserActivity = typeof userActivitiesTable.$inferSelect

export const recommendationsTable = sqliteTable("recommendations", {
  id: int().primaryKey({ autoIncrement: true }),
  content: text().notNull(),
  recommender_id: text().notNull(),
  receiver_id: text().notNull(),
  ...timestamps
})

export const recommendationsRelations = relations(recommendationsTable, ({ one }) => ({
  recommender: one(usersTable, {
    fields: [recommendationsTable.recommender_id],
    references: [usersTable.unique_id],
    relationName: "recommendationToUser"
  }),
  receiver: one(usersTable, {
    fields: [recommendationsTable.receiver_id],
    references: [usersTable.unique_id],
    relationName: "recommendationToReceiver"
  })
}))

export type InsertRecommendation = typeof recommendationsTable.$inferInsert
export type SelectRecommendation = typeof recommendationsTable.$inferSelect
