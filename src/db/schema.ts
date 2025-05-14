import { randomUUID } from "crypto"
import { InferSelectModel, relations, sql } from "drizzle-orm"
import { int,varchar,timestamp, primaryKey, mysqlTable, text } from "drizzle-orm/mysql-core"

const timestamps = {
  updated_at: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
  created_at: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`), 
  deleted_at: text("deleted_at")
}

export const usersTable = mysqlTable(
  "users",
  {
    unique_id: varchar("unique_id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    first_name: varchar("first_name", { length: 255 }).notNull(),
    last_name: varchar("last_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    external_auth_id: varchar("external_auth_id", { length: 255 }).notNull().unique(),
    profile_url: varchar("profile_url", { length: 255 }),
    meta: text("meta"),
    bio: text("bio"),
    role: varchar("role", { length: 50 }).notNull().default("user"),
  },
  (t) => ({
    pk: primaryKey(t.unique_id),
  })
)

export const usersRelations = relations(usersTable, ({ many }) => ({
  chats: many(userChatsTable, {
    relationName: "UserChats"
  }),
  contacts: many(userContactsTable, {
    relationName: "userToContact"
  }),
  users: many(userContactsTable, {
    relationName: "userToUser"
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
  }),
  notifications: many(notificationsTable, {
    relationName: "notificationToUser"
  }),
  posts: many(postsTable, {
    relationName: "postToUser"
  }),
  comments: many(commentsTable, {
    relationName: "commentToUser"
  }),
  // spaces: many(spacesTable, {
  //   relationName: "spaceToOwner"
  // }),
  spaces: many(SpaceUsersTable, {
    relationName: "spaceUserToUser",
  }),
  channels: many(ChannelUsersTable, {
    relationName: "channelUserToUser"
  })

}))

export type InsertUser = typeof usersTable.$inferInsert
export type SelectUser = Omit<typeof usersTable.$inferSelect, "meta"> &{
  // meta?: string
  chats?: SelectChat[]
  contacts?: SelectUserContact[]
  users?: SelectUserContact[]
  userActivities?: SelectUserActivity[]
  userRewards?: SelectUserReward[]
  userTags?: SelectUserTag[]
  recommendations?: SelectRecommendation[]
  notifications?: SelectNotification[]
  posts?: SelectPost[]
  comments?: SelectComment[]
  // spaces?: SelectSpace[]
  spaces?: SelectSpaceUser[]
  channels?: SelectChannelUser[]
}

export const chatsTable = mysqlTable("chats", {
  id: int("id").primaryKey().autoincrement(),
  channel_id: varchar("channel_id", { length: 36 }).notNull(),
  chat_slug: varchar("chat_slug", { length: 36 })
    .notNull()
    .$defaultFn(() => randomUUID()),
  name: varchar("name", { length: 255 }),
  type: varchar("type", { length: 50 }),
  avatar: varchar("avatar", { length: 255 }),
  last_message: text("last_message"),
  unread_count: int("unread_count").notNull().default(0),
  is_group: int("is_group").notNull().default(0),
  ...timestamps,
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

export const messagesTable = mysqlTable(
  "messages",
  {
    id: int("id").primaryKey().autoincrement(),
    chat_id: int("chat_id").notNull(),
    type: varchar("type", { length: 50 }).notNull(),
    sender_id: varchar("sender_id", { length: 36 }).notNull(),
    message: text("message").notNull(),
    ...timestamps,
  },
  (t) => ({
    pk: primaryKey(t.id),
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
export type SelectMessage = typeof messagesTable.$inferSelect & {
  chat?: SelectChat
  sender?: SelectUser
}

export const userChatsTable = mysqlTable(
  "user_chats",
  {
    user_id: varchar("user_id", { length: 36 }).notNull(),
    chat_id: int("chat_id").notNull(),
  },
  (t) => ({
    pk: primaryKey(t.user_id, t.chat_id)
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

export const userMessagesTable = mysqlTable("user_messages", {
  user_id: text().notNull(),
  message_id: int().notNull()
})

export type InsertUserMessage = typeof userMessagesTable.$inferInsert
export type SelectUserMessage = typeof userMessagesTable.$inferSelect

export const userContactsTable = mysqlTable(
  "user_contacts",
  {
    user_id: varchar("user_id", { length: 36 }).notNull(),
    contact_id: varchar("contact_id", { length: 36 }).notNull(),
    is_requested: int("is_requested").notNull().default(0),
    is_accepted: int("is_accepted").notNull().default(0),
    is_blocked: int("is_blocked").notNull().default(0),
    is_following: int("is_following").notNull().default(0),
    is_followed_by: int("is_followed_by").notNull().default(0),
    ...timestamps,
  },
  (t) => ({
    pk: primaryKey(t.user_id, t.contact_id),
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

export const tagsTable = mysqlTable("tags", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 255 }).notNull(),
  count: int("count").notNull().default(1),
  ...timestamps
})

export const tagsRelations = relations(tagsTable, ({ many }) => ({
  tags: many(userTagsTable, {
    relationName: "userTagsToTag"
  }),
  hashtags: many(postHashtagsTable, {
    relationName: "postHashtagToHashTag"
  })
}))

export type InsertTag = typeof tagsTable.$inferInsert
export type SelectTag = typeof tagsTable.$inferSelect

export const userTagsTable = mysqlTable("user_tags", {
  id: int("id").primaryKey().autoincrement(),
  user_id: varchar("user_id", { length: 36 }).notNull(),
  tag_id: int("tag_id").notNull(),
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

export const rewardsTable = mysqlTable("rewards", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  badge_type: varchar("badge_type", { length: 100 }).notNull(),
  ...timestamps
})

export const rewardsRelations = relations(rewardsTable, ({ many }) => ({
  rewards: many(userRewardsTable, {
    relationName: "userRewardsToReward"
  })
}))

export type InsertReward = typeof rewardsTable.$inferInsert
export type SelectReward = typeof rewardsTable.$inferSelect

export const userRewardsTable = mysqlTable("user_rewards", {
  id: int("id").primaryKey().autoincrement(),
  user_id: varchar("user_id", { length: 36 }).notNull(),
  reward_id: int("reward_id").notNull()
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

export const activitiesTable = mysqlTable("activities", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  date: varchar("date", { length: 50 }).notNull(),
  description: text("description").notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  ...timestamps
})

export const activitiesRelations = relations(activitiesTable, ({ many }) => ({
  activities: many(userActivitiesTable, {
    relationName: "userActivitiesToActivity"
  })
}))

export type InsertActivity = typeof activitiesTable.$inferInsert
export type SelectActivity = typeof activitiesTable.$inferSelect

export const userActivitiesTable = mysqlTable("user_activities", {
  id: int("id").primaryKey().autoincrement(),
  user_id: varchar("user_id", { length: 36 }).notNull(),
  activity_id: int("activity_id").notNull()
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

export const recommendationsTable = mysqlTable("recommendations", {
  id: int("id").primaryKey().autoincrement(),
  content: text("content").notNull(),
  recommender_id: varchar("recommender_id", { length: 36 }).notNull(),
  receiver_id: varchar("receiver_id", { length: 36 }).notNull(),
  ...timestamps
})

export const recommendationsRelations = relations(
  recommendationsTable,
  ({ one }) => ({
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
  })
)

export type InsertRecommendation = typeof recommendationsTable.$inferInsert
export type SelectRecommendation = typeof recommendationsTable.$inferSelect

export const notificationsTable = mysqlTable("notifications", {
  id: int("id").primaryKey().autoincrement(),
  created_by: varchar("created_by", { length: 36 }).notNull(),
  received_by: varchar("received_by", { length: 36 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  link: text("link"),
  is_read: int("is_read").notNull().default(0),
  counter: int("counter").notNull().default(0),
  entity_id: varchar("entity_id", { length: 36 }),
  entity_type: varchar("entity_type", { length: 50 }).notNull(),
  ...timestamps
})

export const notificationsRelations = relations(
  notificationsTable,
  ({ one }) => ({
    creator: one(usersTable, {
      fields: [notificationsTable.created_by],
      references: [usersTable.unique_id],
      relationName: "notificationToUser"
    })
  })
)

export type InsertNotification = typeof notificationsTable.$inferInsert
export type SelectNotification = InferSelectModel<typeof notificationsTable> & {
  creator: SelectUser
}

export const eventsTable = mysqlTable("events", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  start_date_time: varchar("start_date_time", { length: 50 }),
  end_date_time: varchar("end_date_time", { length: 50 }),
  type: varchar("type", { length: 50 }),
  metadata: text("metadata"),
  host_id: varchar("host_id", { length: 36 }).notNull(),
  ...timestamps
})

export type InsertEvent = typeof eventsTable.$inferInsert
export type SelectEvent = typeof eventsTable.$inferSelect

export const postsTable = mysqlTable("posts", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  content: text("content"),
  user_id: varchar("user_id", { length: 36 }).notNull(),
  type: varchar("type", { length: 255 }).notNull(),
  entity_id: varchar("entity_id", { length: 36 }),
  entity_type: varchar("entity_type", { length: 255 }),
  likes: int("likes").notNull().default(0),
  comments: int("comments").notNull().default(0),
  category: varchar("category", { length: 255 }),
  ...timestamps
})

export const postsRelations = relations(postsTable, ({ one, many }) => ({
  author: one(usersTable, {
    fields: [postsTable.user_id],
    references: [usersTable.unique_id],
    relationName: "postToUser"
  }),
  postComments: many(commentsTable, {
    relationName: "commentToPost"
  }),
  postLikes: many(likesTable, {
    relationName: "likeToPost"
  }),
  hashtags: many(postHashtagsTable, {
    relationName: "postHashtagToPost"
  }),
  options: many(pollOptionsTable, {
    relationName: "pollToPost"
  }),
  file: one(postFilesTable, {
    fields: [postsTable.id],
    references: [postFilesTable.post_id],
    relationName: "postToFile"
  }),
  space: one(spacesTable, {
    fields: [postsTable.entity_id],
    references: [spacesTable.id],
    relationName: "spaceToPosts"
  })
}))

export type InsertPost = typeof postsTable.$inferInsert
export type SelectPost = typeof postsTable.$inferSelect & {
  author: SelectUser
  postComments?: SelectComment[]
  hashtags?: SelectTag[]
  postLikes?: SelectLike[]
}
export type SelectFilePost = SelectPost & {
  file: SelectFile
}
export type SelectPollPost = SelectPost & {
  options: SelectPollOption[]
}

export const commentsTable = mysqlTable("comments", {
  id: int("id").primaryKey().autoincrement(),
  content: text("content").notNull(),
  user_id: varchar("user_id", { length: 36 }).notNull(),
  post_id: varchar("post_id", { length: 36 }).notNull(),
  ...timestamps
})

export const commentsRelations = relations(commentsTable, ({ one }) => ({
  commentor: one(usersTable, {
    fields: [commentsTable.user_id],
    references: [usersTable.unique_id],
    relationName: "commentToUser"
  }),
  post: one(postsTable, {
    fields: [commentsTable.post_id],
    references: [postsTable.id],
    relationName: "commentToPost"
  })
}))

export type InsertComment = typeof commentsTable.$inferInsert
export type SelectComment = typeof commentsTable.$inferSelect & {
  commentor: SelectUser
}

export const postHashtagsTable = mysqlTable("post_hashtags", {
  id: int("id").primaryKey().autoincrement(),
  post_id: varchar("post_id", { length: 36 }).notNull(),
  hashtag_id: int("hashtag_id").notNull()
})

export const postHashtagsRelations = relations(
  postHashtagsTable,
  ({ one }) => ({
    post: one(postsTable, {
      fields: [postHashtagsTable.post_id],
      references: [postsTable.id],
      relationName: "postHashtagToPost"
    }),
    hashtag: one(tagsTable, {
      fields: [postHashtagsTable.hashtag_id],
      references: [tagsTable.id],
      relationName: "postHashtagToHashTag"
    })
  })
)

export type InsertPostHashtag = typeof postHashtagsTable.$inferInsert
export type SelectPostHashtag = typeof postHashtagsTable.$inferSelect

export const likesTable = mysqlTable(
  "likes",
  {
    user_id: varchar("user_id", { length: 36 }).notNull(),
    post_id: varchar("post_id", { length: 36 }).notNull(),
    ...timestamps
  },
  (t) => ({
     pk: primaryKey(t.user_id, t.post_id),  
  })
)

export const likesRelations = relations(likesTable, ({ one }) => ({
  interactor: one(usersTable, {
    fields: [likesTable.user_id],
    references: [usersTable.unique_id],
    relationName: "likeToUser"
  }),
  post: one(postsTable, {
    fields: [likesTable.post_id],
    references: [postsTable.id],
    relationName: "likeToPost"
  })
}))

export type InsertLike = typeof likesTable.$inferInsert
export type SelectLike = typeof likesTable.$inferSelect

export const pollOptionsTable = mysqlTable(
  "poll_options",
  {
    post_id: varchar("post_id", { length: 36 }).notNull(),
    option_text: varchar("option_text", { length: 255 }).notNull(),
    vote_count: int("vote_count").notNull().default(0),
  },
  (t) => ({
    pk: primaryKey(t.post_id, t.option_text),
  })
)

export const pollOptionsRelations = relations(
  pollOptionsTable,
  ({ one, many }) => ({
    post: one(postsTable, {
      fields: [pollOptionsTable.post_id],
      references: [postsTable.id],
      relationName: "pollToPost"
    }),
    votes: many(pollVotesTable, {
      relationName: "voteToOption"
    })
  })
)

export type InsertPollOption = typeof pollOptionsTable.$inferInsert
export type SelectPollOption = typeof pollOptionsTable.$inferSelect & {
  votes?: SelectPollVote[]
}

export const pollVotesTable = mysqlTable(
  "poll_votes",
  {
    user_id: varchar("user_id", { length: 36 }).notNull(),
    post_id: varchar("post_id", { length: 36 }).notNull(),
    option_text: varchar("option_text", { length: 255 }).notNull(),
    ...timestamps,
  },
  (t) => ({
    pk: primaryKey(t.user_id, t.post_id),
  })
)

export const pollVotesRelations = relations(pollVotesTable, ({ one }) => ({
  option: one(pollOptionsTable, {
    fields: [pollVotesTable.post_id, pollVotesTable.option_text],
    references: [pollOptionsTable.post_id, pollOptionsTable.option_text],
    relationName: "voteToOption"
  })
}))

export type InsertPollVote = typeof pollVotesTable.$inferInsert
export type SelectPollVote = typeof pollVotesTable.$inferSelect

export const filesTable = mysqlTable("files", {
  id: int("id").primaryKey().autoincrement(),
  file_name: varchar("file_name", { length: 255 }).notNull(),
  file_size: int("file_size").notNull(),
  file_type: varchar("file_type", { length: 50 }).notNull(),
  file_path: varchar("file_path", { length: 512 }).notNull(),
  ...timestamps
})

export const filesRelations = relations(filesTable, ({ one }) => ({
  post: one(postFilesTable, {
    fields: [filesTable.id],
    references: [postFilesTable.file_id],
    relationName: "fileToPost"
  }),
  directory: one(spaceFileDirectoryTable, {
    fields: [filesTable.id],
    references: [spaceFileDirectoryTable.entity_id],
    relationName: "spaceFileDirectoryToFile"
  })
}))

export type InsertFile = typeof filesTable.$inferInsert
export type SelectFile = typeof filesTable.$inferSelect

export const postFilesTable = mysqlTable("post_files", {
  id: int("id").primaryKey().autoincrement(),
  post_id: varchar("post_id", { length: 36 }).notNull(),
  file_id: int("file_id").notNull(),
})

export const postFilesRelations = relations(postFilesTable, ({ one }) => ({
  post: one(postsTable, {
    fields: [postFilesTable.post_id],
    references: [postsTable.id],
    relationName: "postToFile"
  }),
  postFile: one(filesTable, {
    fields: [postFilesTable.file_id],
    references: [filesTable.id],
    relationName: "fileToPost"
  })
}))

export type InsertPostFile = typeof postFilesTable.$inferInsert
export type SelectPostFile = typeof postFilesTable.$inferSelect

export const channelsTable = mysqlTable("channels", {
  id: varchar("channel_id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  channel_slug: varchar("channel_slug", { length: 255 }).notNull(),
  channel_name: varchar("channel_name", { length: 255 }).notNull(),
  description: text("description"),
  channel_type: varchar("channel_type", { length: 100 }),
  created_by: varchar("created_by", { length: 36 }).notNull(),
  publish_channel: int("publish_channel").notNull().default(0),
  ownerId: varchar("ownerId", { length: 36 }),
  ...timestamps
})

export const channelsRelations = relations(channelsTable, ({ many }) => ({
  spaces: many(spacesTable, {
    relationName: "spaceToChannel"
  }),
  users: many(ChannelUsersTable, {
    relationName: "channelToChannelUser"
  }),
}))

export type InsertChannel = typeof channelsTable.$inferInsert
export type SelectChannel = typeof channelsTable.$inferSelect & {
  spaces?: SelectSpace[]
  users?: SelectChannelUser[]
}

export const spacesTable = mysqlTable("spaces", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  space_slug: varchar("space_slug", { length: 255 }).notNull(),
  space_name: varchar("space_name", { length: 255 }).notNull(),
  description: text("description"),
  channel_id: varchar("channel_id", { length: 36 }).notNull(),
  created_by: varchar("created_by", { length: 36 }).notNull(),
  ownerId: varchar("ownerId", { length: 36 }),
  space_type: varchar("space_type", { length: 100 }),
  publish_space: int("publish_space").notNull().default(0),
  ...timestamps
})

export const spacesRelations = relations(spacesTable, ({ one, many }) => ({
  channel: one(channelsTable, {
    fields: [spacesTable.channel_id],
    references: [channelsTable.id],
    relationName: "spaceToChannel"
  }),
  owner: one(usersTable, {
    fields: [spacesTable.ownerId],
    references: [usersTable.unique_id],
    relationName: "spaceToOwner"
  }),
  posts: many(postsTable, { relationName: "spaceToPosts" }),
  features: many(spaceFeaturesTable, {
    relationName: "spaceFeaturesToSpace"
  }),
  users: many(SpaceUsersTable, {
    relationName: "spaceToSpaceUser"
  }),
  chats: many(SpaceChatsTable, {
    relationName: "spaceToSpaceChat"
  }),
}))

export type InsertSpace = typeof spacesTable.$inferInsert
export type SelectSpace = InferSelectModel<typeof spacesTable> & {
  posts?: SelectPost[]
  features?: SelectSpaceFeature[]
  owner?: SelectUser | null
  channel?: SelectChannel
  users?: SelectSpaceUser[]
}

export const featuresTable = mysqlTable("features", {
  id: int("id").primaryKey().autoincrement(),
  feature_name: varchar("feature_name", { length: 255 }).notNull(),
  feature_slug: varchar("feature_slug", { length: 255 }).notNull(),
  feature_type: varchar("feature_type", { length: 100 }).notNull(),
  feature_description: text("feature_description"),
  feature_icon: text("feature_icon"),
  feature_url: text("feature_url"),
  feature_order: int("feature_order").notNull().default(0),
  feature_status: int("feature_status").notNull().default(1),
  ...timestamps
})

export type InsertFeature = typeof featuresTable.$inferInsert
export type SelectFeature = typeof featuresTable.$inferSelect

export const featuresTableRelations = relations(featuresTable, ({ many }) => ({
  spaces: many(spaceFeaturesTable, {
    relationName: "spaceFeaturesToFeature"
  })
}))

export const spaceFeaturesTable = mysqlTable("space_features", {
  id: int("id").primaryKey().autoincrement(),
  space_id: varchar("space_id", { length: 36 }).notNull(),
  feature_id: int("feature_id").notNull(),
  ...timestamps
})

export type InsertSpaceFeature = typeof spaceFeaturesTable.$inferInsert
export type SelectSpaceFeature = typeof spaceFeaturesTable.$inferSelect & {
  space?: SelectSpace
  feature?: SelectFeature
}

export const spaceFeaturesTableRelations = relations(
  spaceFeaturesTable,
  ({ one }) => ({
    space: one(spacesTable, {
      fields: [spaceFeaturesTable.space_id],
      references: [spacesTable.id],
      relationName: "spaceFeaturesToSpace"
    }),
    feature: one(featuresTable, {
      fields: [spaceFeaturesTable.feature_id],
      references: [featuresTable.id],
      relationName: "spaceFeaturesToFeature"
    })
  })
)

export const spaceFileDirectoryTable = mysqlTable("space_file_directory", {
  id: int("id").primaryKey().autoincrement(),
  space_id: varchar("space_id", { length: 36 }),
  entity_name: varchar("entity_name", { length: 255 }).notNull(),
  entity_type: varchar("entity_type", { length: 100 }).notNull(),
  entity_id: int("entity_id"),
  entity_size: int("entity_size"),
  parent_id: int("parent_id"),
  ...timestamps
})

export const spaceFileDirectoryRelations = relations(
  spaceFileDirectoryTable,
  ({ one }) => ({
    file: one(filesTable, {
      fields: [spaceFileDirectoryTable.entity_id],
      references: [filesTable.id],
      relationName: "spaceFileDirectoryToFile"
    })
  })
)

export type InsertSpaceFileDirectory =
  typeof spaceFileDirectoryTable.$inferInsert
export type SelectSpaceFileDirectory =
  typeof spaceFileDirectoryTable.$inferSelect & {
    file?: SelectFile
  }


export const SpaceUsersTable = mysqlTable("space_users", {
  id: int("id").primaryKey().autoincrement(),
  space_id: varchar("space_id", { length: 36 }).notNull(),
  user_id: varchar("user_id", { length: 36 }).notNull(),
  role: varchar("role", { length: 50 }).default("member"),
  status: varchar("status", { length: 50 }).default("active"),
});

export type InsertSpaceUser = typeof SpaceUsersTable.$inferInsert
export type SelectSpaceUser = typeof SpaceUsersTable.$inferSelect & { 
  space?: SelectSpace
  user?: SelectUser
}

export const SpaceUsersRelations = relations(SpaceUsersTable, ({ one }) => ({
  space: one(spacesTable, {
    fields: [SpaceUsersTable.space_id],
    references: [spacesTable.id],
    relationName: "spaceToSpaceUser",
  }),
  user: one(usersTable, {
    fields: [SpaceUsersTable.user_id],
    references: [usersTable.unique_id],
    relationName: "spaceUserToUser",
  }),
}))

export const ChannelUsersTable = mysqlTable("channel_users", {
  id: int("id").primaryKey().autoincrement(),
  channel_id: varchar("channel_id", { length: 36 }).notNull(),
  user_id: varchar("user_id", { length: 36 }).notNull(),
  role: varchar("role", { length: 50 }).default("member"),
  status: varchar("status", { length: 50 }).default("active"),

})
export type InsertChannelUser = typeof ChannelUsersTable.$inferInsert
export type SelectChannelUser = typeof ChannelUsersTable.$inferSelect & { 
  channel?: SelectChannel
  user?: SelectUser
}

export const ChannelUsersRelations = relations(ChannelUsersTable, ({ one }) => ({
  channel: one(channelsTable, {
    fields: [ChannelUsersTable.channel_id],
    references: [channelsTable.id],
    relationName: "channelToChannelUser",
  }),
  user: one(usersTable, {
    fields: [ChannelUsersTable.user_id],
    references: [usersTable.unique_id],
    relationName: "channelUserToUser",
  }),
}))


export const projectTable = mysqlTable("project", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => randomUUID()),
    project_name: varchar("project_name", { length: 255 }).notNull(),
    project_slug: varchar("project_slug", { length: 255 }).notNull(),
    description: text("description"),
    project_startDate: varchar("project_startDate", { length: 50 }).notNull(),
    project_targetDate: varchar("project_targetDate", { length: 50 }).notNull(),
    channel_id: varchar("channel_id", { length: 36 }).notNull(),
    space_id: varchar("space_id", { length: 36 }).notNull(),
    created_by: varchar("created_by", { length: 36 }).notNull(),
    project_type: varchar("project_type", { length: 100 }),
    ...timestamps
})

export type InsertProject = typeof projectTable.$inferInsert
export type SelectProject = typeof projectTable.$inferSelect


export const taskTable = mysqlTable("task", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  task_num: varchar("task_num", { length: 50 }),
  task_title: varchar("task_title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  task_type: varchar("task_type", { length: 100 }).notNull(),
  task_priority: varchar("task_priority", { length: 50 }).notNull(),
  story_points: varchar("story_points", { length: 50 }).notNull(),
  project_id: varchar("project_id", { length: 36 }).notNull(),
  created_by: varchar("created_by", { length: 36 }).notNull(),
  ...timestamps
})

export type InsertTask = typeof taskTable.$inferInsert
export type SelectTask = typeof taskTable.$inferSelect
export const SpaceChatsTable = mysqlTable("space_chats", {
  id: int("id").primaryKey().autoincrement(),
  space_id: text().notNull(),
  chat_id: int().notNull(),
  ...timestamps
})

export type InsertSpaceChat = typeof SpaceChatsTable.$inferInsert
export type SelectSpaceChat = typeof SpaceChatsTable.$inferSelect & {
  space?: SelectSpace
  chat?: SelectChat
}

export const SpaceChatsRelations = relations(SpaceChatsTable, ({ one }) => ({
  space: one(spacesTable, {
    fields: [SpaceChatsTable.space_id],
    references: [spacesTable.id],
    relationName: "spaceToSpaceChat",
  }),
  chat: one(chatsTable, {
    fields: [SpaceChatsTable.chat_id],
    references: [chatsTable.id],
    relationName: "spaceChatToChat",
  }),
}))


export const TaskStatusTable = mysqlTable("tasks_status", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  project_id: text().notNull(),
  name: text().notNull(),
  position: int().notNull(),
  status_slug: text(),
  ...timestamps
})

export type InsertTaskStatus = typeof TaskStatusTable.$inferInsert
export type SelectTaskStatus = typeof TaskStatusTable.$inferSelect