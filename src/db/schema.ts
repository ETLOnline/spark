import { randomUUID } from "crypto"
import { InferSelectModel, relations, sql } from "drizzle-orm"
import {
  integer,
  pgTable,
  primaryKey,
  varchar,
  json,
  boolean,
  text,
  jsonb
} from "drizzle-orm/pg-core"
// import { integer, primaryKey, pgTable, varchar } from "drizzle-orm/sqlite-core"

const timestamps = {
  updated_at: varchar("updated_at").$onUpdateFn(() => sql`CURRENT_TIMESTAMP`),
  created_at: varchar("created_at").default(sql`CURRENT_TIMESTAMP`),
  deleted_at: varchar("deleted_at")
}

export const usersTable = pgTable("users", {
  unique_id: varchar("unique_id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  first_name: varchar().notNull(),
  last_name: varchar().notNull(),
  email: varchar().notNull().unique(),
  external_auth_id: varchar().notNull().unique(),
  profile_url: varchar(),
  cover_image: varchar(),
  meta: varchar(),
  role: varchar().notNull().default("user"),
  meta_profile: json("meta_profile").default({
    bio_written: false,
    persona_selected: false,
    profile_picture_uploaded: false
  })
})

export const usersRelations = relations(usersTable, ({ many, one }) => ({
  profile: one(profileTable, {
    fields: [usersTable.unique_id],
    references: [profileTable.user_id],
    relationName: "userToProfile"
  }),
  userRewardLevel: one(userRewardsLevelTable, {
    fields: [usersTable.unique_id],
    references: [userRewardsLevelTable.user_id],
    relationName: "userRewardsLevelToUser"
  }),
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
    relationName: "spaceUserToUser"
  }),
  channels: many(ChannelUsersTable, {
    relationName: "channelUserToUser"
  }),
  roles: many(userRolesTable, {
    relationName: "userRolesToUser"
  }),
  joinedCommunities: many(communityUsersTable, {
    relationName: "userToCommunity"
  }),
  projectUsers: many(ProjectUsersTable, {
    relationName: "userToProject"
  }),
  tasksAssignedTo: many(taskTable, {
    relationName: "taskAssignee"
  }),
  tasksAssignor: many(taskTable, {
    relationName: "taskAssignor"
  }),
  certificates: many(certificatesTable, {
    relationName: "userToCertificate"
  }),
  taskComments: many(taskCommentsTable, {
    relationName: "taskCommentToUser"
  }),
  hostedEvents: many(eventsTable, {
    relationName: "userToHostedEvents" // User can host many events
  }),
  TaskCreator: many(taskTable, {
    relationName: "taskCreator"
  }),
  createdChats: many(chatsTable, {
    relationName: "chatToCreator"
  }),
  pointLedger: many(pointLedgerTable, {
    relationName: "pointLedgerToUser"
  }),
  advisorTrustVerification: many(trustVerificationTable, {
    relationName: "trustVerificationToAdvisor"
  }),
  userTrustVerification: many(trustVerificationTable, {
    relationName: "trustVerificationToUser"
  }),
  userRewardBalance: many(userRewardBalanceTable, {
    relationName: "userRewardBalanceToUser"
  }),
  testedTasks: many(taskTable, {
    relationName: "taskTester"
  })
}))

export type InsertUser = typeof usersTable.$inferInsert
export type SelectUser = Omit<typeof usersTable.$inferSelect, "meta"> & {
  // meta?: string
  chats?: SelectUserChat[]
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
  roles?: SelectUserRole[] | null
  profile?: SelectProfile | null
  joinedCommunities?: SelectCommunityUser[]
  certificates?: SelectCertificate[]
  taskComments?: SelectTaskComment[]
}

export const profileTable = pgTable("profile", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  user_id: varchar("user_id")
    .notNull()
    .references(() => usersTable.unique_id),
  bio: varchar(),
  degree: varchar(),
  institute: varchar(),
  education_start_date: varchar(),
  education_end_date: varchar(),
  linkedin_url: varchar(),
  github_url: varchar(),
  instagram_url: varchar(),
  twitter_url: varchar(),
  personal_website_url: varchar(),
  sum_of_ratings: integer().default(0),
  number_of_ratings: integer().default(0),
  total_average_rating: varchar().default("0"),
  is_profile_completed: integer().notNull().default(0),
  fyp_status: varchar("fyp_status"),
  learning_goals: text("learning_goals"),

  professional_title: varchar("professional_title"),
  company: varchar("company"),
  engagement_type: varchar("engagement_type"),
  is_mentor_active: boolean("is_mentor_active").notNull().default(false),
  total_completed_sessions: integer("total_completed_sessions")
    .notNull()
    .default(0),
  ...timestamps
})

export const profileRelations = relations(profileTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [profileTable.user_id],
    references: [usersTable.unique_id],
    relationName: "userToProfile"
  })
}))

export type InsertProfile = typeof profileTable.$inferInsert
export type SelectProfile = typeof profileTable.$inferSelect & {
  user?: SelectUser
}

export const mentorAvailabilityTable = pgTable("mentor_availability", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  mentor_id: varchar("mentor_id")
    .notNull()
    .references(() => usersTable.unique_id, { onDelete: "cascade" }),
  date: varchar("date").notNull(), // YYYY-MM-DD  (the anchor / start date)
  start_time: varchar("start_time").notNull(),
  end_time: varchar("end_time").notNull(),
  session_type: varchar("session_type").notNull().default("1:1"),
  repeat_type: varchar("repeat_type").notNull().default("none"), // "none" | "daily" | "weekly"
  repeat_end_date: varchar("repeat_end_date"), // YYYY-MM-DD, nullable
  is_active: boolean("is_active").notNull().default(true),
  ...timestamps
})

export type InsertMentorAvailability =
  typeof mentorAvailabilityTable.$inferInsert
export type SelectMentorAvailability =
  typeof mentorAvailabilityTable.$inferSelect

export const sessionRequestsTable = pgTable("session_requests", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  mentor_id: varchar("mentor_id")
    .notNull()
    .references(() => usersTable.unique_id, { onDelete: "cascade" }),
  mentee_id: varchar("mentee_id")
    .notNull()
    .references(() => usersTable.unique_id, { onDelete: "cascade" }),
  // No FK constraint on purpose: a mentor editing their availability replaces
  // every slot row with a fresh id (see ReplaceMentorAvailability), so this
  // column is informational only. The request's own
  // session_date/start_time/end_time/session_type are the source of truth,
  // and availability is re-checked live against current slots wherever it
  // matters — nothing about this row should ever be touched by a slot delete.
  availability_slot_id: integer("availability_slot_id"),
  session_date: varchar("session_date").notNull(),
  start_time: varchar("start_time").notNull(),
  end_time: varchar("end_time").notNull(),
  session_type: varchar("session_type").notNull(),
  topic: varchar("topic").notNull(),
  description: varchar("description"),
  status: varchar("status").notNull().default("pending"),
  ...timestamps
})

export type InsertSessionRequest = typeof sessionRequestsTable.$inferInsert
export type SelectSessionRequest = typeof sessionRequestsTable.$inferSelect

export const certificatesTable = pgTable("certificates", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  user_id: varchar("user_id")
    .notNull()
    .references(() => usersTable.unique_id),
  title: varchar(),
  institute: varchar(),
  year: varchar(),
  ...timestamps
})

export const certificatesRelations = relations(
  certificatesTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [certificatesTable.user_id],
      references: [usersTable.unique_id],
      relationName: "userToCertificate"
    })
  })
)

export type InsertCertificate = typeof certificatesTable.$inferInsert
export type SelectCertificate = typeof certificatesTable.$inferSelect & {
  user?: SelectUser
}

export const chatsTable = pgTable("chats", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  channel_id: varchar().notNull(),
  chat_slug: varchar()
    .notNull()
    .$defaultFn(() => randomUUID()),
  name_index: varchar(),
  name: varchar(),
  type: varchar(),
  avatar: varchar(),
  last_message: varchar(),
  is_group: integer().notNull().default(0),
  created_by: varchar(),
  ...timestamps
})

export const chatsRelations = relations(chatsTable, ({ many, one }) => ({
  messages: many(messagesTable, {
    relationName: "messageToChat"
  }),
  users: many(userChatsTable, {
    relationName: "ChatUsers"
  }),
  creator: one(usersTable, {
    fields: [chatsTable.created_by],
    references: [usersTable.unique_id],
    relationName: "chatToCreator"
  })
}))

export type InsertChat = typeof chatsTable.$inferInsert
export type SelectChat = InferSelectModel<typeof chatsTable> & {
  messages?: SelectMessage[]
  users?: SelectUserChat[]
  creator?: SelectUser
}
export type SelectChatWithRelation = typeof chatsRelations

export const messagesTable = pgTable("messages", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  chat_id: integer().notNull(),
  type: varchar().notNull(),
  sender_id: varchar().notNull(),
  message: varchar().notNull(),
  mentions: varchar("mentions").array(),
  is_deleted: integer().notNull().default(0),

  ...timestamps
})

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

export type InsertMessage = typeof messagesTable.$inferInsert & {
  mentions?: string[] // 👈 Allow mentions when inserting
}
export type SelectMessage = typeof messagesTable.$inferSelect & {
  chat?: SelectChat
  sender?: SelectUser
  mentions?: string[] | null
}

export const userChatsTable = pgTable("user_chats", {
  user_id: varchar().notNull(),
  chat_id: integer().notNull(),
  unread_count: integer().notNull().default(0)
})

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

export const userMessagesTable = pgTable("user_messages", {
  user_id: varchar().notNull(),
  message_id: integer().notNull()
})

export type InsertUserMessage = typeof userMessagesTable.$inferInsert
export type SelectUserMessage = typeof userMessagesTable.$inferSelect

export const userContactsTable = pgTable("user_contacts", {
  user_id: varchar().notNull(),
  contact_id: varchar().notNull(),
  is_requested: integer().notNull().default(0),
  is_accepted: integer().notNull().default(0),
  is_blocked: integer().notNull().default(0),
  is_following: integer().notNull().default(0),
  is_followed_by: integer().notNull().default(0),
  ...timestamps
})

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

export const tagsTable = pgTable("tags", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar().notNull(),
  type: varchar().notNull(),
  count: integer().notNull().default(1),
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

export type InsertTag = typeof tagsTable.$inferInsert & {
  id?: number
}
export type SelectTag = typeof tagsTable.$inferSelect

export const userTagsTable = pgTable("user_tags", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  user_id: varchar().notNull(),
  tag_id: integer().notNull()
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
export type SelectUserTag = typeof userTagsTable.$inferSelect & {
  tag?: SelectTag
  user?: SelectUser
}

export const rewardsTable = pgTable("rewards", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar().notNull(),
  description: varchar().notNull(),
  badge_type: varchar().notNull(),
  ...timestamps
})

export const rewardsRelations = relations(rewardsTable, ({ many }) => ({
  rewards: many(userRewardsTable, {
    relationName: "userRewardsToReward"
  })
}))

export type InsertReward = typeof rewardsTable.$inferInsert
export type SelectReward = typeof rewardsTable.$inferSelect

export const userRewardsTable = pgTable("user_rewards", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  user_id: varchar().notNull(),
  reward_id: integer().notNull()
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

export const activitiesTable = pgTable("activities", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar().notNull(),
  date: varchar().notNull(),
  description: varchar().notNull(),
  type: varchar().notNull(),
  ...timestamps
})

export const activitiesRelations = relations(activitiesTable, ({ many }) => ({
  activities: many(userActivitiesTable, {
    relationName: "userActivitiesToActivity"
  })
}))

export type InsertActivity = typeof activitiesTable.$inferInsert
export type SelectActivity = typeof activitiesTable.$inferSelect

export const userActivitiesTable = pgTable("user_activities", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  user_id: varchar().notNull(),
  activity_id: integer().notNull()
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

export const recommendationsTable = pgTable("recommendations", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  content: varchar().notNull(),
  rating: integer().notNull(),
  recommender_id: varchar(),
  receiver_id: varchar(),
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
export type SelectRecommendation = typeof recommendationsTable.$inferSelect & {
  recommender: SelectUser
  receiver: SelectUser
}

export const notificationsTable = pgTable("notifications", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  created_by: varchar().notNull(),
  received_by: varchar().notNull(),
  title: varchar().notNull(),
  body: varchar().notNull(),
  deep_link: varchar().notNull(),
  icon: varchar(),
  is_read: integer().notNull().default(0),
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

export const eventsTable = pgTable("events", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar().notNull(),
  description: varchar(),
  coverImage: varchar(),
  start_date_time: varchar(),
  end_date_time: varchar(),
  type: varchar(),
  metadata: varchar(),
  tags: varchar("tags").array(),
  host_id: varchar()
    .notNull()
    .references(() => usersTable.unique_id),
  ...timestamps
})
export const eventsRelations = relations(eventsTable, ({ one }) => ({
  host: one(usersTable, {
    fields: [eventsTable.host_id],
    references: [usersTable.unique_id],
    relationName: "userToHostedEvents"
  })
}))
export type InsertEvent = typeof eventsTable.$inferInsert
export type SelectEvent = typeof eventsTable.$inferSelect

export const postsTable = pgTable("posts", {
  id: varchar()
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  content: varchar(),
  user_id: varchar().notNull(),
  type: varchar().notNull(),
  entity_id: varchar(),
  entity_type: varchar(),
  likes: integer().notNull().default(0),
  comments: integer().notNull().default(0),
  category: varchar(),
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
  files: many(postFilesTable, {
    relationName: "postToFiles"
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
  options?: SelectPollOption[]
}
export type SelectFilePost = SelectPost & {
  file?: SelectFile
  files?: SelectFile[]
}
export type SelectPollPost = SelectPost & {
  options: SelectPollOption[]
  files?: SelectFile[]
}

export const commentsTable = pgTable("comments", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  content: varchar().notNull(),
  user_id: varchar().notNull(),
  post_id: varchar().notNull(),
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

export const postHashtagsTable = pgTable("post_hashtags", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  post_id: varchar().notNull(),
  hashtag_id: integer().notNull()
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

export const likesTable = pgTable("likes", {
  user_id: varchar().notNull(),
  post_id: varchar().notNull(),
  ...timestamps
})

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

export const pollOptionsTable = pgTable("poll_options", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  post_id: varchar().notNull(),
  option_text: varchar().notNull(),
  vote_count: integer().notNull().default(0)
})

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

export const pollVotesTable = pgTable("poll_votes", {
  user_id: varchar().notNull(),
  post_id: varchar().notNull(),
  option_text: varchar().notNull(),
  ...timestamps
})

export const pollVotesRelations = relations(pollVotesTable, ({ one }) => ({
  option: one(pollOptionsTable, {
    fields: [pollVotesTable.post_id, pollVotesTable.option_text],
    references: [pollOptionsTable.post_id, pollOptionsTable.option_text],
    relationName: "voteToOption"
  })
}))

export type InsertPollVote = typeof pollVotesTable.$inferInsert
export type SelectPollVote = typeof pollVotesTable.$inferSelect

export const filesTable = pgTable("files", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  file_name: varchar().notNull(),
  file_size: integer().notNull(),
  file_type: varchar().notNull(),
  file_path: varchar().notNull(),
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

export const postFilesTable = pgTable("post_files", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  post_id: varchar().notNull(),
  file_id: integer().notNull()
})

export const postFilesRelations = relations(postFilesTable, ({ one }) => ({
  post: one(postsTable, {
    fields: [postFilesTable.post_id],
    references: [postsTable.id],
    relationName: "postToFiles"
  }),
  postFile: one(filesTable, {
    fields: [postFilesTable.file_id],
    references: [filesTable.id],
    relationName: "fileToPost"
  })
}))

export type InsertPostFile = typeof postFilesTable.$inferInsert
export type SelectPostFile = typeof postFilesTable.$inferSelect

export const channelsTable = pgTable("channels", {
  id: varchar("channel_id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  channel_slug: varchar().notNull(),
  channel_name: varchar().notNull(),
  description: varchar(),
  channel_type: varchar(),
  created_by: varchar().notNull(),
  publish_channel: integer().notNull().default(0),
  ownerId: varchar(),
  community_id: varchar("community_id", { length: 36 }).references(
    () => communitiesTable.id,
    { onDelete: "cascade" }
  ),
  ...timestamps
})

export const channelsRelations = relations(channelsTable, ({ many, one }) => ({
  spaces: many(spacesTable, {
    relationName: "spaceToChannel"
  }),
  users: many(ChannelUsersTable, {
    relationName: "channelToChannelUser"
  }),
  community: one(communitiesTable, {
    fields: [channelsTable.community_id],
    references: [communitiesTable.id],
    relationName: "channelToCommunity"
  })
}))

export type InsertChannel = typeof channelsTable.$inferInsert
export type SelectChannel = typeof channelsTable.$inferSelect & {
  spaces?: SelectSpace[]
  users?: SelectChannelUser[]
  community?: SelectCommunity | null
}

export const spacesTable = pgTable("spaces", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  space_slug: varchar().notNull(),
  space_name: varchar().notNull(),
  description: varchar(),
  channel_id: varchar("channel_id", { length: 36 })
    .references(() => channelsTable.id, { onDelete: "cascade" })
    .notNull(),
  created_by: varchar().notNull(),
  ownerId: varchar(),
  space_type: varchar(),
  publish_space: integer().notNull().default(0),
  overview: varchar(),
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
  })
}))

export type InsertSpace = typeof spacesTable.$inferInsert
export type SelectSpace = InferSelectModel<typeof spacesTable> & {
  posts?: SelectPost[]
  features?: SelectSpaceFeature[]
  owner?: SelectUser | null
  channel?: SelectChannel
  users?: SelectSpaceUser[]
}

export const featuresTable = pgTable("features", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  feature_name: varchar().notNull(),
  feature_slug: varchar().notNull(),
  feature_type: varchar().notNull(),
  feature_description: varchar(),
  feature_icon: varchar(),
  feature_url: varchar(),
  feature_order: integer().notNull().default(0),
  feature_status: integer().notNull().default(1),
  ...timestamps
})

export type InsertFeature = typeof featuresTable.$inferInsert
export type SelectFeature = typeof featuresTable.$inferSelect

export const featuresTableRelations = relations(featuresTable, ({ many }) => ({
  spaces: many(spaceFeaturesTable, {
    relationName: "spaceFeaturesToFeature"
  })
}))

export const spaceFeaturesTable = pgTable("space_features", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  space_id: varchar().notNull(), // space_id
  feature_id: integer().notNull(), // feature_id
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

export const spaceFileDirectoryTable = pgTable("space_file_directory", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  space_id: varchar(),
  entity_name: varchar().notNull(),
  entity_type: varchar().notNull(),
  entity_slug: varchar(),
  entity_id: integer(),
  entity_size: integer(),
  parent_id: integer(),
  created_by: varchar(),
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

export const SpaceUsersTable = pgTable("space_users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  space_id: varchar().notNull(),
  user_id: varchar().notNull(),
  channel_user_id: integer().references(() => ChannelUsersTable.id, {
    onDelete: "cascade"
  }),
  role: varchar().default("member"),
  status: varchar().default("active")
})

export type InsertSpaceUser = typeof SpaceUsersTable.$inferInsert
export type SelectSpaceUser = typeof SpaceUsersTable.$inferSelect & {
  space?: SelectSpace
  user?: SelectUser
}

export const SpaceUsersRelations = relations(SpaceUsersTable, ({ one }) => ({
  space: one(spacesTable, {
    fields: [SpaceUsersTable.space_id],
    references: [spacesTable.id],
    relationName: "spaceToSpaceUser"
  }),
  user: one(usersTable, {
    fields: [SpaceUsersTable.user_id],
    references: [usersTable.unique_id],
    relationName: "spaceUserToUser"
  })
}))

export const ChannelUsersTable = pgTable("channel_users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  channel_id: varchar().notNull(),
  user_id: varchar().notNull(),
  community_user_id: varchar().references(() => communityUsersTable.id, {
    onDelete: "cascade"
  }),
  role: varchar().default("member"),
  status: varchar().default("active")
})
export type InsertChannelUser = typeof ChannelUsersTable.$inferInsert
export type SelectChannelUser = typeof ChannelUsersTable.$inferSelect & {
  channel?: SelectChannel
  user?: SelectUser
}

export const ChannelUsersRelations = relations(
  ChannelUsersTable,
  ({ one }) => ({
    channel: one(channelsTable, {
      fields: [ChannelUsersTable.channel_id],
      references: [channelsTable.id],
      relationName: "channelToChannelUser"
    }),
    user: one(usersTable, {
      fields: [ChannelUsersTable.user_id],
      references: [usersTable.unique_id],
      relationName: "channelUserToUser"
    })
  })
)

export const projectTable = pgTable("project", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  project_name: varchar().notNull(),
  project_slug: varchar().notNull(),
  description: varchar(),
  project_startDate: varchar().notNull(),
  project_targetDate: varchar().notNull(),
  channel_id: varchar().notNull(),
  space_id: varchar("space_id", { length: 36 }).references(
    () => spacesTable.id,
    { onDelete: "cascade" }
  ),
  created_by: varchar().notNull(),
  project_type: varchar(),
  ...timestamps
})

export const projectRelations = relations(projectTable, ({ one }) => ({
  channel: one(channelsTable, {
    fields: [projectTable.channel_id],
    references: [channelsTable.id],
    relationName: "projectToChannel"
  }),
  space: one(spacesTable, {
    fields: [projectTable.space_id],
    references: [spacesTable.id],
    relationName: "projectToSpace"
  })
}))

export type InsertProject = typeof projectTable.$inferInsert
export type SelectProject = typeof projectTable.$inferSelect & {
  channel?: SelectChannel
  space?: SelectSpace
}

export const taskTable = pgTable("task", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  task_num: varchar(),
  task_title: varchar().notNull(),
  description: varchar().notNull(),
  task_type: varchar().notNull(),
  task_priority: varchar().notNull(),
  story_points: varchar().notNull(),
  project_id: varchar().notNull(),
  created_by: varchar().notNull(),
  status_id: varchar(),
  sprint_id: varchar(),
  assign_to: varchar(),
  assign_by: varchar(),
  parent_task_id: varchar(),
  tested_by: varchar(),
  ...timestamps
})

export type InsertTask = typeof taskTable.$inferInsert
export type SelectTask = typeof taskTable.$inferSelect & {
  assignee?: SelectUser | null
  assignor?: SelectUser | null
  status?: InferSelectModel<typeof TaskStatusTable> | null
  parentTask?: SelectTask | null
  subTasks?: SelectTask[]
  creator?: SelectUser | null
  testedBy?: SelectUser | null
}

export const taskRelations = relations(taskTable, ({ one, many }) => ({
  assignee: one(usersTable, {
    fields: [taskTable.assign_to],
    references: [usersTable.unique_id],
    relationName: "taskAssignee"
  }),
  assignor: one(usersTable, {
    fields: [taskTable.assign_by],
    references: [usersTable.unique_id],
    relationName: "taskAssignor"
  }),
  status: one(TaskStatusTable, {
    fields: [taskTable.status_id],
    references: [TaskStatusTable.id],
    relationName: "taskStatus"
  }),
  burnDowns: many(sprintBurnDownTable, {
    relationName: "taskToBurnDown"
  }),
  parentTask: one(taskTable, {
    fields: [taskTable.parent_task_id],
    references: [taskTable.id],
    relationName: "taskParent"
  }),
  subTasks: many(taskTable, {
    relationName: "taskParent"
  }),
  creator: one(usersTable, {
    fields: [taskTable.created_by],
    references: [usersTable.unique_id],
    relationName: "taskCreator"
  }),
  testedBy: one(usersTable, {
    fields: [taskTable.tested_by],
    references: [usersTable.unique_id],
    relationName: "taskTester"
  })
}))

export const SpaceChatsTable = pgTable("space_chats", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  space_id: varchar().notNull(),
  chat_id: integer().notNull(),
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
    relationName: "spaceToSpaceChat"
  }),
  chat: one(chatsTable, {
    fields: [SpaceChatsTable.chat_id],
    references: [chatsTable.id],
    relationName: "spaceChatToChat"
  })
}))

export const TaskStatusTable = pgTable("tasks_status", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  project_id: varchar().notNull(),
  name: varchar().notNull(),
  position: integer().notNull(),
  status_slug: varchar(),
  defination_of_completion: boolean(),
  ...timestamps
})

export const TaskStatusRelations = relations(TaskStatusTable, ({ many }) => ({
  tasks: many(taskTable, {
    relationName: "taskStatus"
  })
}))

export type InsertTaskStatus = typeof TaskStatusTable.$inferInsert
export type SelectTaskStatus = typeof TaskStatusTable.$inferSelect

export const SprintTable = pgTable("sprints", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  title: varchar().notNull(),
  start_date: varchar().notNull(),
  end_date: varchar().notNull(),
  projectId: varchar().notNull(),
  sprint_status: varchar(),
  ...timestamps
})

export const SprintRelations = relations(SprintTable, ({ many }) => ({
  burnDowns: many(sprintBurnDownTable, {
    relationName: "sprintToBurnDown"
  })
}))

export type InsertSprint = typeof SprintTable.$inferInsert
export type SelectSprint = typeof SprintTable.$inferSelect

export const ProjectUsersTable = pgTable("project_users", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  project_id: varchar().notNull(),
  user_id: varchar().notNull(),
  role: varchar().default("member"),
  status: varchar().default("active"),
  ...timestamps
})

export type InsertProjectUser = typeof ProjectUsersTable.$inferInsert
export type SelectProjectUser = typeof ProjectUsersTable.$inferSelect & {
  user?: SelectUser
  project?: SelectProject
}

export const ProjectUsersRelations = relations(
  ProjectUsersTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [ProjectUsersTable.user_id],
      references: [usersTable.unique_id],
      relationName: "userToProject"
    }),
    project: one(projectTable, {
      fields: [ProjectUsersTable.project_id],
      references: [projectTable.id],
      relationName: "projectToProjectUsers" // Must match relation name in projectTable
    })
  })
)

// Permissions
export const permissionsTable = pgTable("permissions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  namespace: varchar("namespace").notNull(),
  action: varchar("action").notNull()
})

// Roles (Global or Scoped)
export const rolesTable = pgTable("roles", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name").notNull(),
  role_type: varchar("role_type").notNull(),
  slug: varchar("slug"),
  entity_type: varchar("entity_type"),
  entity_id: varchar("entity_id")
})

// Role-Permissions (Many-to-Many)
export const rolePermissionsTable = pgTable("role_permissions", {
  role_id: integer("role_id").notNull(),
  permission_id: integer("permission_id").notNull()
})

// User Scoped Roles (can be used for Global as well)
export const userRolesTable = pgTable("user_roles", {
  user_id: varchar("user_id").notNull(),
  role_id: integer("role_id").notNull()
})

export const rolesRelations = relations(rolesTable, ({ many }) => ({
  permissions: many(rolePermissionsTable),
  users: many(userRolesTable)
}))

export const permissionsRelations = relations(permissionsTable, ({ many }) => ({
  roles: many(rolePermissionsTable)
}))

export const userRolesRelations = relations(userRolesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [userRolesTable.user_id],
    references: [usersTable.unique_id],
    relationName: "userRolesToUser"
  }),
  role: one(rolesTable, {
    fields: [userRolesTable.role_id],
    references: [rolesTable.id],
    relationName: "userRolesToRole"
  })
}))

export const rolePermissionsRelations = relations(
  rolePermissionsTable,
  ({ one }) => ({
    permission: one(permissionsTable, {
      fields: [rolePermissionsTable.permission_id],
      references: [permissionsTable.id]
    }),
    role: one(rolesTable, {
      fields: [rolePermissionsTable.role_id],
      references: [rolesTable.id]
    })
  })
)

export type SelectPermission = typeof permissionsTable.$inferSelect & {
  roles?: SelectRolePermission[]
}

export type SelectRolePermission = typeof rolePermissionsTable.$inferSelect & {
  permission?: SelectPermission
}

export type SelectRole = typeof rolesTable.$inferSelect & {
  permissions?: SelectRolePermission[]
  users?: SelectUserRole[]
}
export type SelectUserRole = typeof userRolesTable.$inferSelect & {
  role?: SelectRole
}

export const communitiesTable = pgTable("communities", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  title: varchar().notNull(),
  description: varchar(),
  category_id: varchar().notNull(),
  slug: varchar().notNull().unique(),
  type: varchar().notNull().default("public"),
  created_by: varchar().notNull(),
  cover_image: varchar(),
  ...timestamps
})

export const communitiesRelations = relations(
  communitiesTable,
  ({ many, one }) => ({
    creator: one(usersTable, {
      fields: [communitiesTable.created_by],
      references: [usersTable.unique_id],
      relationName: "communityToCreator"
    }),
    communityMembers: many(communityUsersTable, {
      relationName: "communityToUser"
    }),
    channels: many(channelsTable, {
      relationName: "channelToCommunity"
    }),
    category: one(communityCategoriesTable, {
      fields: [communitiesTable.category_id],
      references: [communityCategoriesTable.id],
      relationName: "communityToCategory"
    })
  })
)

export type InsertCommunity = typeof communitiesTable.$inferInsert
export type SelectCommunity = typeof communitiesTable.$inferSelect & {
  communityMembers?: SelectCommunityUser[]
  channels?: SelectChannel[]
  creator?: SelectUser
  category?: SelectCommunityCategory
}

export const communityUsersTable = pgTable("community_users", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  community_id: varchar()
    .notNull()
    .references(() => communitiesTable.id),
  user_id: varchar()
    .notNull()
    .references(() => usersTable.unique_id),
  role: varchar().default("member"),
  status: varchar().default("active")
})

export const communityUsersRelations = relations(
  communityUsersTable,
  ({ one }) => ({
    community: one(communitiesTable, {
      fields: [communityUsersTable.community_id],
      references: [communitiesTable.id],
      relationName: "communityToUser"
    }),
    user: one(usersTable, {
      fields: [communityUsersTable.user_id],
      references: [usersTable.unique_id],
      relationName: "userToCommunity"
    })
  })
)

export type InsertCommunityUser = typeof communityUsersTable.$inferInsert
export type SelectCommunityUser = typeof communityUsersTable.$inferSelect & {
  community?: SelectCommunity
  user?: SelectUser
}

export const communityCategoriesTable = pgTable("community_categories", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  ...timestamps
})

export type SelectCommunityCategory =
  typeof communityCategoriesTable.$inferSelect & {
    communities?: SelectCommunity[]
  }

export const communityRequestsTable = pgTable("community_requests", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  university_name: varchar().notNull(),
  official_university_email: varchar().notNull(),
  contact_person_id: varchar().notNull(),
  contact_person_name: varchar().notNull(),
  contact_number: varchar().notNull(),
  designation: varchar().notNull(),
  university_website: varchar(),
  city: varchar().notNull(),
  description: varchar(),
  estimated_number_of_students: varchar(),
  intended_usage: varchar(),
  status: varchar().notNull().default("pending"),
  invite_link: varchar(),
  reason: varchar(),
  ...timestamps
})

export type InsertCommunityRequest = typeof communityRequestsTable.$inferInsert
export type SelectCommunityRequest = typeof communityRequestsTable.$inferSelect

export const shortcutsTable = pgTable("shortcuts", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  title: varchar().notNull(),
  url: varchar().notNull(),
  type: varchar().notNull(),
  user_id: varchar().notNull(),
  community_id: varchar("community_id", { length: 36 }).references(
    () => communitiesTable.id,
    { onDelete: "cascade" }
  ),
  channel_id: varchar("channelid", { length: 36 }).references(
    () => channelsTable.id,
    { onDelete: "cascade" }
  ),
  space_id: varchar("space_id", { length: 36 }).references(
    () => spacesTable.id,
    { onDelete: "cascade" }
  ),
  project_id: varchar("project_id", { length: 36 }).references(
    () => projectTable.id,
    { onDelete: "cascade" }
  ),
  ...timestamps
})
export const shortcutsRelations = relations(shortcutsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [shortcutsTable.user_id],
    references: [usersTable.unique_id]
  }),
  community: one(communitiesTable, {
    fields: [shortcutsTable.community_id],
    references: [communitiesTable.id]
  }),
  channel: one(channelsTable, {
    fields: [shortcutsTable.channel_id],
    references: [channelsTable.id]
  }),
  space: one(spacesTable, {
    fields: [shortcutsTable.space_id],
    references: [spacesTable.id]
  }),
  project: one(projectTable, {
    fields: [shortcutsTable.project_id],
    references: [projectTable.id]
  })
}))

export type SelectShortcut = typeof shortcutsTable.$inferSelect
export type InsertShortcut = typeof shortcutsTable.$inferInsert

export const taskCommentsTable = pgTable("task_comments", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  content: varchar().notNull(),
  user_id: varchar().notNull(),
  task_id: varchar().notNull(),
  task_history: jsonb(),
  type: varchar(),
  mentions: varchar("mentions").array(),
  ...timestamps
})

export const taskCommentsRelations = relations(
  taskCommentsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [taskCommentsTable.user_id],
      references: [usersTable.unique_id],
      relationName: "taskCommentToUser"
    })
  })
)

export type SelectTaskComment = InferSelectModel<typeof taskCommentsTable> & {
  user?: SelectUser
}
export type InsertTaskComment = typeof taskCommentsTable.$inferInsert

export const siteSettingsTable = pgTable("site_settings", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  key: varchar().notNull(),
  value: json().notNull(),
  page: varchar().notNull(),
  ...timestamps
})

export type SelectSiteSetting = typeof siteSettingsTable.$inferSelect
export type InsertSiteSetting = typeof siteSettingsTable.$inferInsert

export const eventRegistrationsTable = pgTable("event_users", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  event_id: integer("event_id")
    .notNull()
    .references(() => eventsTable.id, { onDelete: "cascade" }),
  user_id: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => usersTable.unique_id, { onDelete: "cascade" }),
  ...timestamps
})

export const eventRegistrationsRelations = relations(
  eventRegistrationsTable,
  ({ one }) => ({
    event: one(eventsTable, {
      fields: [eventRegistrationsTable.event_id],
      references: [eventsTable.id],
      relationName: "eventToRegistration"
    }),
    user: one(usersTable, {
      fields: [eventRegistrationsTable.user_id],
      references: [usersTable.unique_id],
      relationName: "userToEventRegistration"
    })
  })
)

export type InsertEventRegistration =
  typeof eventRegistrationsTable.$inferInsert

export type SelectEventRegistration =
  typeof eventRegistrationsTable.$inferSelect & {
    event?: SelectEvent
    user?: SelectUser
  }

export const emailTemplatesTable = pgTable("email_templates", {
  unique_id: varchar("unique_id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: varchar("name", { length: 100 }).notNull().unique(),

  subject: varchar("subject", { length: 255 }).notNull(),
  body: text("body").notNull(),
  isActive: boolean("is_active").default(true),
  ...timestamps
})

export const sprintBurnDownTable = pgTable("sprint_burndown", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  sprint_id: varchar().notNull(),
  task_id: varchar(),
  total_tasks: integer().notNull().default(0),
  completed_tasks: integer().notNull().default(0),
  total_story_points: integer().notNull().default(0),
  ...timestamps
})

export const sprintBurnDownRelations = relations(
  sprintBurnDownTable,
  ({ one }) => ({
    sprint: one(SprintTable, {
      fields: [sprintBurnDownTable.sprint_id],
      references: [SprintTable.id],
      relationName: "sprintToBurnDown"
    }),
    task: one(taskTable, {
      fields: [sprintBurnDownTable.task_id],
      references: [taskTable.id],
      relationName: "taskToBurnDown"
    })
  })
)
export type InsertSprintBurnDown = typeof sprintBurnDownTable.$inferInsert
export type SelectSprintBurnDown = typeof sprintBurnDownTable.$inferSelect & {
  sprint?: SelectSprint
  task?: SelectTask
  user?: SelectUser
}

export const projectRecentActivityTable = pgTable("project_recent_activity", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  project_id: varchar().notNull(),
  icon: varchar().notNull(),
  activity: varchar().notNull(),
  deep_link: varchar().notNull(),
  ...timestamps
})

export type InsertProjectRecentActivity =
  typeof projectRecentActivityTable.$inferInsert
export type SelectProjectRecentActivity =
  typeof projectRecentActivityTable.$inferSelect

export const invitationsTable = pgTable("invitations", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  invite_key: varchar("key").notNull().unique(),
  invite_email: jsonb("invite_email").default([]).notNull(),
  joined_email: jsonb("joined_email").default([]).notNull(),
  invited_by: varchar("invited_by", { length: 36 })
    .notNull()
    .references(() => usersTable.unique_id),
  entity_id: varchar("entity_id").notNull(),
  entity_type: varchar("entity_type").notNull(),
  role_offer_id: integer("role_offer_id")
    .notNull()
    .references(() => rolesTable.id),
  ...timestamps
})

export const invitationsRelations = relations(invitationsTable, ({ one }) => ({
  inviter: one(usersTable, {
    fields: [invitationsTable.invited_by],
    references: [usersTable.unique_id],
    relationName: "userToInvitations"
  }),
  role: one(rolesTable, {
    fields: [invitationsTable.role_offer_id],
    references: [rolesTable.id]
  })
}))

export type InsertInvitation = typeof invitationsTable.$inferInsert
export type SelectInvitation = typeof invitationsTable.$inferSelect

export const featureFlagsTable = pgTable("feature_flags", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  key: varchar().notNull().unique(),
  label: varchar().notNull(),
  is_enabled: boolean().notNull().default(false),
  description: text(),
  ...timestamps
})

export type InsertFeatureFlag = typeof featureFlagsTable.$inferInsert
export type SelectFeatureFlag = typeof featureFlagsTable.$inferSelect
export const rewardsMetadataTable = pgTable("rewards_metadata", {
  reward_id: integer().primaryKey(),
  internal_name: varchar().notNull(),
  display_name: varchar().notNull(),
  is_soulbound: boolean().notNull().default(true),
  has_decay: boolean().notNull().default(false),
  decay_period: integer().notNull(),
  ...timestamps
})

export const rewardsMetadataRelations = relations(
  rewardsMetadataTable,
  ({ many }) => ({
    rules: many(activityRulesTable, {
      relationName: "activityRuleToReward"
    }),
    ledger: many(pointLedgerTable, {
      relationName: "pointLedgerToReward"
    }),
    rewardBalance: many(userRewardBalanceTable, {
      relationName: "userRewardBalanceToReward"
    }),
    rewardLevels: many(rewardLevelTable, {
      relationName: "rewardLevelToReward"
    })
  })
)

export type InsertRewardsMetadata = typeof rewardsMetadataTable.$inferInsert
export type SelectRewardsMetadata = typeof rewardsMetadataTable.$inferSelect

export const activityRulesTable = pgTable("activity_rules", {
  rule_id: integer().primaryKey(),
  action_type: varchar().notNull(),
  action_display_name: varchar().notNull(),
  reward_id: integer().notNull(),
  base_points: integer().notNull(),
  category_group: varchar().notNull(),
  required_verification: boolean().notNull().default(false),
  is_active: boolean().notNull().default(true),
  description: varchar().notNull(),
  ...timestamps
})

export const activityRulesRelations = relations(
  activityRulesTable,
  ({ one, many }) => ({
    reward: one(rewardsMetadataTable, {
      fields: [activityRulesTable.reward_id],
      references: [rewardsMetadataTable.reward_id],
      relationName: "activityRuleToReward"
    }),
    rules: many(pointLedgerTable, {
      relationName: "pointLedgerToRule"
    }),
    trustVerification: many(trustVerificationTable, {
      relationName: "trustVerificationToRule"
    })
  })
)

export type InsertActivityRules = typeof activityRulesTable.$inferInsert
export type SelectActivityRules = typeof activityRulesTable.$inferSelect & {
  reward?: SelectRewardsMetadata
}

export const pointLedgerTable = pgTable("point_ledger", {
  transection_id: integer().primaryKey().generatedAlwaysAsIdentity(),
  user_id: varchar().notNull(),
  reward_id: integer().notNull(),
  rule_id: integer().notNull(),
  amount: integer().notNull(),
  source_system: varchar().notNull(),
  external_ref_id: varchar().notNull(),
  metadata: jsonb().notNull(),
  trust_verification_id: integer(),
  transection_type: varchar().notNull(),
  ...timestamps
})

export const pointLedgerRelations = relations(pointLedgerTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [pointLedgerTable.user_id],
    references: [usersTable.unique_id],
    relationName: "pointLedgerToUser"
  }),
  reward: one(rewardsMetadataTable, {
    fields: [pointLedgerTable.reward_id],
    references: [rewardsMetadataTable.reward_id],
    relationName: "pointLedgerToReward"
  }),
  rule: one(activityRulesTable, {
    fields: [pointLedgerTable.rule_id],
    references: [activityRulesTable.rule_id],
    relationName: "pointLedgerToRule"
  }),
  trustVerification: one(trustVerificationTable, {
    fields: [pointLedgerTable.trust_verification_id],
    references: [trustVerificationTable.verification_id],
    relationName: "pointLedgerToTrustVerification"
  })
}))

export type InsertPointLedger = typeof pointLedgerTable.$inferInsert
export type SelectPointLedger = typeof pointLedgerTable.$inferSelect & {
  user?: SelectUser
  reward?: SelectRewardsMetadata
  rule?: SelectActivityRules
  trustVerification?: SelectTrustVerification
}

export const trustVerificationTable = pgTable("trust_verification", {
  verification_id: integer().primaryKey().generatedAlwaysAsIdentity(),
  user_id: varchar().notNull(),
  rule_id: integer().notNull(),
  approved_by: varchar(),
  status: varchar().notNull(),
  proof_url: varchar().notNull(),
  points: integer().notNull(),
  feedback: varchar(),
  verified_at: varchar(),
  metadata: jsonb(),
  ...timestamps
})

export const trustVerificationRelations = relations(
  trustVerificationTable,
  ({ one, many }) => ({
    user: one(usersTable, {
      fields: [trustVerificationTable.user_id],
      references: [usersTable.unique_id],
      relationName: "trustVerificationToUser"
    }),
    rule: one(activityRulesTable, {
      fields: [trustVerificationTable.rule_id],
      references: [activityRulesTable.rule_id],
      relationName: "trustVerificationToRule"
    }),
    advisor: one(usersTable, {
      fields: [trustVerificationTable.approved_by],
      references: [usersTable.unique_id],
      relationName: "trustVerificationToAdvisor"
    }),
    ledger: many(pointLedgerTable, {
      relationName: "pointLedgerToTrustVerification"
    })
  })
)

export type InsertTrustVerification = typeof trustVerificationTable.$inferInsert
export type SelectTrustVerification = typeof trustVerificationTable.$inferSelect

export const userRewardBalanceTable = pgTable("user_reward_balance", {
  user_id: varchar().notNull(),
  reward_id: integer().notNull(),
  current_balance: integer().notNull(),
  last_updated_at: varchar()
    .default(sql`now()`)
    .notNull(),
  ...timestamps
})

export const userRewardBalanceRelations = relations(
  userRewardBalanceTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [userRewardBalanceTable.user_id],
      references: [usersTable.unique_id],
      relationName: "userRewardBalanceToUser"
    }),
    reward: one(rewardsMetadataTable, {
      fields: [userRewardBalanceTable.reward_id],
      references: [rewardsMetadataTable.reward_id],
      relationName: "userRewardBalanceToReward"
    })
  })
)

export type InsertUserRewardBalance = typeof userRewardBalanceTable.$inferInsert
export type SelectUserRewardBalance = typeof userRewardBalanceTable.$inferSelect

export const rewardLevelTable = pgTable("reward_level", {
  id: integer().primaryKey(),
  name: varchar().notNull(),
  description: varchar(),
  key: varchar().notNull(),
  min_points: integer().notNull(),
  max_points: integer(),
  reward_id: integer().notNull(),
  ...timestamps
})

export const rewardLevelRelations = relations(
  rewardLevelTable,
  ({ one, many }) => ({
    userRewardLevels: many(userRewardsLevelTable, {
      relationName: "userRewardsLevelToRewardLevel"
    }),
    reward: one(rewardsMetadataTable, {
      fields: [rewardLevelTable.reward_id],
      references: [rewardsMetadataTable.reward_id],
      relationName: "rewardLevelToReward"
    })
  })
)

export type InsertRewardLevel = typeof rewardLevelTable.$inferInsert
export type SelectRewardLevel = typeof rewardLevelTable.$inferSelect

export const userRewardsLevelTable = pgTable("user_rewards_level", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  user_id: varchar().notNull(),
  level_id: integer().notNull(),
  ...timestamps
})

export const userRewardsLevelRelations = relations(
  userRewardsLevelTable,
  ({ one }) => ({
    rewardLevel: one(rewardLevelTable, {
      fields: [userRewardsLevelTable.level_id],
      references: [rewardLevelTable.id],
      relationName: "userRewardsLevelToRewardLevel"
    }),
    user: one(usersTable, {
      fields: [userRewardsLevelTable.user_id],
      references: [usersTable.unique_id],
      relationName: "userRewardsLevelToUser"
    })
  })
)

export type InsertUserRewardsLevel = typeof userRewardsLevelTable.$inferInsert
export type SelectUserRewardsLevel =
  typeof userRewardsLevelTable.$inferSelect & {
    rewardLevel?: SelectRewardLevel
    user?: SelectUser
  }

export const successfullReferralsTable = pgTable("successful_referrals", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  referrer_user_id: varchar().notNull(),
  referred_user_id: varchar().notNull(),
  ...timestamps
})

export type InsertSuccessfulReferral =
  typeof successfullReferralsTable.$inferInsert
export type SelectSuccessfulReferral =
  typeof successfullReferralsTable.$inferSelect

export const feedbackTable = pgTable("feedbacks", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar().notNull(),
  email: varchar().notNull(),
  subject: varchar().notNull(),
  description: varchar().notNull(),
  file_url: varchar(),
  ...timestamps
})

export type InsertFeedback = typeof feedbackTable.$inferInsert
export type SelectFeedback = typeof feedbackTable.$inferSelect

export const contactUsTable = pgTable("contact_us", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar().notNull(),
  email: varchar().notNull(),
  subject: varchar().notNull(),
  description: varchar().notNull(),
  ...timestamps
})

export type InsertContactUs = typeof contactUsTable.$inferInsert
export type SelectContactUs = typeof contactUsTable.$inferSelect

export const leaderboardSnapshotsTable = pgTable("leaderboard_snapshots", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  community_id: varchar("community_id", { length: 36 })
    .notNull()
    .references(() => communitiesTable.id, { onDelete: "cascade" }),
  user_id: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => usersTable.unique_id, { onDelete: "cascade" }),
  reward_id: integer().notNull(),
  rank: integer().notNull(),
  points: integer().notNull().default(0),
  points_gained: integer().notNull().default(0),
  trend: varchar("trend").default("neutral"),
  rank_change: integer().default(0),
  snapshot_date: varchar().notNull(), // Keep for daily reference
  snapshot_datetime: varchar().notNull(), // Timestamp for flexible scheduling
  ...timestamps
})

export const leaderboardSnapshotsRelations = relations(
  leaderboardSnapshotsTable,
  ({ one }) => ({
    community: one(communitiesTable, {
      fields: [leaderboardSnapshotsTable.community_id],
      references: [communitiesTable.id],
      relationName: "leaderboardToCommunity"
    }),
    user: one(usersTable, {
      fields: [leaderboardSnapshotsTable.user_id],
      references: [usersTable.unique_id],
      relationName: "leaderboardToUser"
    })
  })
)

export type InsertLeaderboardSnapshot =
  typeof leaderboardSnapshotsTable.$inferInsert
export type SelectLeaderboardSnapshot =
  typeof leaderboardSnapshotsTable.$inferSelect & {
    user?: SelectUser
    community?: SelectCommunity
  }
