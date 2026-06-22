import { createClient } from "@libsql/client/http";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const url = process.env.TURSO_DATABASE_URL ?? "http://127.0.0.1:8080";
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url, authToken });

export const db = drizzle(client, { schema });

export * from "./schema";
