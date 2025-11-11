import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const playerTable = sqliteTable("players", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
});
