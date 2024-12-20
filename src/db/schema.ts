import { randomUUID } from "crypto";
import { relations, sql } from "drizzle-orm";
import { foreignKey, int, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";


const timestamps = {
  updated_at: text("updated_at"),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  deleted_at: text("deleted_at"),
}

export const usersTable = sqliteTable("users", {
  unique_id: text("unique_id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  first_name: text().notNull(),
  last_name: text().notNull(),
  email: text().notNull().unique(),
  external_auth_id: text().notNull().unique(),
  profile_url: text(),
  meta: text(),
});

export const usersRelations = relations(usersTable, ({ many }) => ({
  chats: many(userChatsTable,{
    relationName: 'userToChat',
  }),
  contacts: many(userContactsTable,{
    relationName: 'userToContact',
  }),
}));

export type InsertUser = typeof usersTable.$inferInsert ;
export type SelectUser = Omit<typeof usersTable.$inferSelect , 'meta'>;

export const chatsTable = sqliteTable("chats", {
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

export const chatsRelations = relations(chatsTable, ({ many }) => ({
	messages: many(messagesTable,{
    relationName: "messageToChat"
  }),
  users: many(userChatsTable,{
    relationName: "userToChat"
  }),
}));

export type InsertChat = typeof chatsTable.$inferInsert;
export type SelectChat = typeof chatsTable.$inferSelect;
// export type SelectChatWithRelation = typeof chatRelations.table.$inferSelect;

export const messagesTable = sqliteTable("messages", {
  id: int().primaryKey({ autoIncrement: true }),
  chat_id: int().notNull(),
  type: text().notNull(),
  sender_id: int().notNull(),
  message: text().notNull(),
  timestamp: int().notNull(),
  ...timestamps
},
  (t) => ({
    pk: primaryKey({ columns: [t.id] }),
  })
);

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
}));

export type InsertMessage = typeof messagesTable.$inferInsert;
export type SelectMessage = typeof messagesTable.$inferSelect;

export const userChatsTable = sqliteTable("user_chats", {
  user_id: text().notNull(),
  chat_id: int().notNull(),
}, (t) => ({
  pk: primaryKey({columns: [t.user_id, t.chat_id]}),
}));

export const userChatsRelations = relations(userChatsTable, ({ one }) => ({
  chat: one(chatsTable, {
    fields: [userChatsTable.chat_id],
    references: [chatsTable.id],
    relationName: "userToChat"
  }),
  user: one(usersTable, {
    fields: [userChatsTable.user_id],
    references: [usersTable.unique_id],
    relationName: "user"
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
  ...timestamps,
  
}, (t) => ({
  pk: primaryKey({columns: [t.user_id, t.contact_id] }),
}));

export const userContactsRelations = relations(userContactsTable, ({ one }) => ({
	user: one(usersTable, {
		fields: [userContactsTable.user_id],
		references: [usersTable.unique_id],
    relationName: "userToUser"
	}),
	contact: one(usersTable, {
		fields: [userContactsTable.contact_id],
		references: [usersTable.unique_id],
    relationName: "userToContact"
	}),
}));

export type InsertUserContact = typeof userContactsTable.$inferInsert;
export type SelectUserContact = typeof userContactsTable.$inferSelect;


