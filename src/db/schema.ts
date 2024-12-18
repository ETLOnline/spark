import { randomUUID } from "crypto";
import { relations, sql } from "drizzle-orm";
import { int, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";


const timestamps = {
  updated_at: text("updated_at"),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  deleted_at: text("deleted_at"),
}

export const usersTable = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  first_name: text().notNull(),
  last_name: text().notNull(),
  email: text().notNull().unique(),
  external_auth_id: text().notNull().unique(),
  profile_url: text(),
  unique_id: text("unique_id", { length: 36 }).$defaultFn(() => randomUUID()),
  meta: text(),
});

export const usersRelations = relations(usersTable, ({ many }) => ({
  userChats: many(userChatsTable),
}));

export type InsertUser = typeof usersTable.$inferInsert ;
export type SelectUser = Omit<typeof usersTable.$inferSelect , 'meta'>;

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
});

export const chatRelations = relations(chatTable, ({ many }) => ({
	messages: many(messagesTable),
  chatUsers: many(userChatsTable),
}));

export type InsertChat = typeof chatTable.$inferInsert;
export type SelectChat = typeof chatTable.$inferSelect;
export type SelectChatWithRelation = typeof chatRelations.table.$inferSelect;

export const messagesTable = sqliteTable("messages", {
  id: int().primaryKey({ autoIncrement: true }),
  chat_id: int().notNull(),
  type: text().notNull(),
  sender_id: int().notNull(),
  message: text().notNull(),
  timestamp: int().notNull(),
  ...timestamps
});

export const messagesRelations = relations(messagesTable, ({ one }) => ({
	chat: one(chatTable, {
		fields: [messagesTable.chat_id],
		references: [chatTable.id],
	}),
}));

export type InsertMessage = typeof messagesTable.$inferInsert;
export type SelectMessage = typeof messagesTable.$inferSelect;

export const userChatsTable = sqliteTable("user_chats", {
  user_id: text().notNull().references(()=>usersTable.unique_id),
  chat_id: int().notNull().references(()=>chatTable.id),
}, (t) => ({
  pk: primaryKey({columns: [t.user_id, t.chat_id]}),
}));

export const userChatsRelations = relations(userChatsTable, ({ one }) => ({
  chat: one(chatTable, {
    fields: [userChatsTable.chat_id],
    references: [chatTable.id],
  }),
  user: one(usersTable, {
    fields: [userChatsTable.user_id],
    references: [usersTable.unique_id],
  }),
}));

export type InsertUserChat = typeof userChatsTable.$inferInsert;
export type SelectUserChat = typeof userChatsTable.$inferSelect;

export const userMessagesTable = sqliteTable("user_messages", {
  user_id: text().notNull(),
  message_id: int().notNull(),
});

export type InsertUserMessage = typeof userMessagesTable.$inferInsert;
export type SelectUserMessage = typeof userMessagesTable.$inferSelect;

export const userContactsTable = sqliteTable("user_contacts", {
  user_id: text().notNull(),
  contact_id: text().notNull(),
  is_requested: int().notNull().default(0),
  is_accepted: int().notNull().default(0),
  is_blocked: int().notNull().default(0),
  is_following: int().notNull().default(0),
  ...timestamps
});

export type InsertUserContact = typeof userContactsTable.$inferInsert;
export type SelectUserContact = typeof userContactsTable.$inferSelect;


