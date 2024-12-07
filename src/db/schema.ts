import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";


export const usersTable = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  first_name: text().notNull(),
  last_name: text().notNull(),
  email: text().notNull().unique(),
  external_auth_id: text().notNull().unique(),
});


export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;
