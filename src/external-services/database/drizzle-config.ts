import path from 'node:path';
import { defineConfig } from 'drizzle-kit';
import { env } from '../env/env.ts';

export default defineConfig({
  out: path.resolve(import.meta.dirname ?? __dirname, './migrations'),
  schema: path.resolve(import.meta.dirname ?? __dirname, './schemas/*.ts'),
  dialect: 'sqlite',
  dbCredentials: {
    url: env.dbFileName,
  },
});
