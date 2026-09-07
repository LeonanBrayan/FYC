import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load environment variables from .env file.
dotenv.config();

const connectionString =
  process.env.SUPABASE_DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL;

const sqlHost = process.env.SUPABASE_HOST || process.env.SQL_HOST || "localhost";
const sqlDbName = process.env.SUPABASE_DB_NAME || process.env.SQL_DB_NAME || "postgres";
const user = process.env.SUPABASE_USER || process.env.SQL_ADMIN_USER || process.env.SQL_USER || "postgres";
const password = process.env.SUPABASE_PASSWORD || process.env.SQL_ADMIN_PASSWORD || process.env.SQL_PASSWORD || "";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle", // Output directory for migrations.
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials: connectionString
    ? {
        url: connectionString,
        ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
      }
    : {
        host: sqlHost,
        user: user,
        password: password,
        database: sqlDbName,
        ssl: sqlHost.includes("supabase") ? { rejectUnauthorized: false } : false,
      },
  verbose: true, // Enable verbose output.
});

