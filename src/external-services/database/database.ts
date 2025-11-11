import path from "node:path";
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { env } from '../env/env.ts';

export const database = drizzle(env.dbFileName);

await migrate(database, {
  migrationsFolder: path.resolve(import.meta.dirname, './migrations'),
});
