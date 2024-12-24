import { v4 as uuidv4 } from "uuid"
import { relations, sql } from "drizzle-orm"
import { int, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core"

const timestamps = {
  updated_at: text("updated_at"),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  deleted_at: text("deleted_at")
}

export const usersTable = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  first_name: text().notNull(),
  last_name: text().notNull(),
  email: text().notNull().unique(),
  external_auth_id: text().notNull().unique(),
  profile_url: text(),
  unique_id: text("unique_id", { length: 36 }).$defaultFn(() => uuidv4()),
  bio: text(),
  meta: text()
})

export const userChatsTable = sqliteTable(
  "user_chats",
  {
    user_id: text()
      .notNull()
      .references(() => usersTable.unique_id),
    chat_id: int()
      .notNull()
      .references(() => chatTable.id)
  },
  (table) => ({
    pk: primaryKey({ columns: [table.user_id, table.chat_id] })
  })
)

export const usersRelations = relations(usersTable, ({ many }) => ({
  userChats: many(userChatsTable)
}))

export const chatTable = sqliteTable("chat", {
  id: int().primaryKey({ autoIncrement: true }),
  channel_id: text().notNull(),
  name: text(),
  type: text(),
  avatar: text(),
  last_message: text(),
  unread_count: int().notNull().default(0),
  is_group: int().notNull().default(0),
  ...timestamps
})

export const chatRelations = relations(chatTable, ({ many }) => ({
  messages: many(messagesTable),
  chatUsers: many(userChatsTable)
}))

export const messagesTable = sqliteTable("messages", {
  id: int().primaryKey({ autoIncrement: true }),
  chat_id: int().notNull(),
  type: text().notNull(),
  sender_id: int().notNull(),
  message: text().notNull(),
  timestamp: int().notNull(),
  ...timestamps
})

export const messagesRelations = relations(messagesTable, ({ one }) => ({
  chat: one(chatTable, {
    fields: [messagesTable.chat_id],
    references: [chatTable.id]
  })
}))

export const userChatsRelations = relations(userChatsTable, ({ one }) => ({
  chat: one(chatTable, {
    fields: [userChatsTable.chat_id],
    references: [chatTable.id]
  }),
  user: one(usersTable, {
    fields: [userChatsTable.user_id],
    references: [usersTable.unique_id]
  })
}))

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
  (table) => ({
    pk: primaryKey({ columns: [table.user_id, table.contact_id] })
  })
)

export const useContactsRelations = relations(userContactsTable, ({ one }) => ({
  user: one(usersTable, {
    relationName: "userToContacts",
    fields: [userContactsTable.user_id],
    references: [usersTable.unique_id]
  }),
  contact: one(usersTable, {
    relationName: "contactToUser",
    fields: [userContactsTable.contact_id],
    references: [usersTable.unique_id]
  })
}))

export const tagsTable = sqliteTable("tags", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  type: text().notNull(),
  ...timestamps
})

export const userTagsTable = sqliteTable("user_tags", {
  id: int().primaryKey({ autoIncrement: true }),
  user_id: text().notNull(),
  tag_id: int().notNull(),
})

export type InsertUser = typeof usersTable.$inferInsert
export type SelectUser = Omit<typeof usersTable.$inferSelect, "meta">
export type InsertChat = typeof chatTable.$inferInsert
export type SelectChat = typeof chatTable.$inferSelect
export type SelectChatWithRelation = typeof chatRelations.table.$inferSelect
export type InsertMessage = typeof messagesTable.$inferInsert
export type SelectMessage = typeof messagesTable.$inferSelect
export type InsertUserChat = typeof userChatsTable.$inferInsert
export type SelectUserChat = typeof userChatsTable.$inferSelect
export type InsertUserContact = typeof userContactsTable.$inferInsert
export type SelectUserContact = typeof userContactsTable.$inferSelect
export type InsertTag = typeof tagsTable.$inferInsert
export type SelectTag = typeof tagsTable.$inferSelect
export type InsertUserTag = typeof userTagsTable.$inferInsert
export type SelectUserTag = typeof userTagsTable.$inferSelect
