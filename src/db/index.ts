import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

// Global connection pool caching to persist across hot-reloads
declare global {
  var _postgresPool: Pool | undefined;
}

// Function to create or retrieve the connection pool using the Object Method.
export const createPool = () => {
  if (!global._postgresPool) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;

    if (connectionString) {
      const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
      global._postgresPool = new Pool({
        connectionString,
        ssl: isLocal ? false : { rejectUnauthorized: false },
        max: 10,
        connectionTimeoutMillis: 15000,
      });
    } else {
      const host = process.env.SQL_HOST || process.env.PGHOST || 'localhost';
      const isLocal = host === 'localhost' || host === '127.0.0.1';
      const useSsl = process.env.SQL_SSL === 'true' || (!isLocal && process.env.NODE_ENV === 'production');

      global._postgresPool = new Pool({
        host,
        port: process.env.SQL_PORT ? parseInt(process.env.SQL_PORT, 10) : (process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432),
        user: process.env.SQL_USER || process.env.PGUSER,
        password: process.env.SQL_PASSWORD || process.env.PGPASSWORD,
        database: process.env.SQL_DB_NAME || process.env.PGDATABASE,
        ssl: useSsl ? { rejectUnauthorized: false } : undefined,
        max: 10,
        connectionTimeoutMillis: 15000,
      });
    }

    // Prevent unhandled pool-level errors from crashing the application
    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

// Create or retrieve the pool instance.
const pool = createPool();

// Initialize Drizzle with the pool and schema.
export const db = drizzle(pool, { schema });
