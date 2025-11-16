import type { ObjectId } from "mongodb";

export type IWithDatabaseId<T> = T & { databaseId: ObjectId };
