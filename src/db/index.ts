import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

// Global connection pool caching to persist across hot-reloads
declare global {
  var _postgresPool: Pool | undefined;
}

// Function to create or retrieve the connection pool for Supabase / PostgreSQL
export const createPool = () => {
  if (!global._postgresPool) {
    const connectionString =
      process.env.SUPABASE_DATABASE_URL ||
      process.env.SUPABASE_DB_URL ||
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_URL_NON_POOLING;

    if (connectionString) {
      const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
      // Supabase requires SSL encryption for all external pooler/direct connections
      const isSupabase = connectionString.includes('supabase') || connectionString.includes('pooler.supabase');
      global._postgresPool = new Pool({
        connectionString,
        ssl: isLocal && !isSupabase ? false : { rejectUnauthorized: false },
        max: 10,
        connectionTimeoutMillis: 15000,
      });
    } else {
      const host =
        process.env.SUPABASE_HOST ||
        process.env.SQL_HOST ||
        process.env.PGHOST ||
        'localhost';
      const isLocal = host === 'localhost' || host === '127.0.0.1';
      const isSupabase = host.includes('supabase') || Boolean(process.env.SUPABASE_HOST);
      const useSsl = isSupabase || process.env.SQL_SSL === 'true' || (!isLocal && process.env.NODE_ENV === 'production');

      global._postgresPool = new Pool({
        host,
        port: process.env.SUPABASE_PORT
          ? parseInt(process.env.SUPABASE_PORT, 10)
          : process.env.SQL_PORT
          ? parseInt(process.env.SQL_PORT, 10)
          : process.env.PGPORT
          ? parseInt(process.env.PGPORT, 10)
          : 5432,
        user: process.env.SUPABASE_USER || process.env.SQL_USER || process.env.PGUSER,
        password: process.env.SUPABASE_PASSWORD || process.env.SQL_PASSWORD || process.env.PGPASSWORD,
        database: process.env.SUPABASE_DB_NAME || process.env.SQL_DB_NAME || process.env.PGDATABASE || 'postgres',
        ssl: useSsl ? { rejectUnauthorized: false } : undefined,
        max: 10,
        connectionTimeoutMillis: 15000,
      });
    }

    // Prevent unhandled pool-level errors from crashing the application
    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle Supabase/SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

// Create or retrieve the pool instance.
const pool = createPool();

// Initialize Drizzle with the pool and schema.
export const db = drizzle(pool, { schema });
