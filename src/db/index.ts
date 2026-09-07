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

    if (!connectionString) {
      console.warn(
        'Aviso de Segurança: DATABASE_URL ou SUPABASE_DATABASE_URL não encontrada nas variáveis de ambiente. Defina no arquivo .env ou no painel da Vercel.'
      );
    }

    const isLocal = connectionString ? (connectionString.includes('localhost') || connectionString.includes('127.0.0.1')) : true;
    // Supabase requires SSL encryption for all external pooler/direct connections
    const isSupabase = connectionString ? (connectionString.includes('supabase') || connectionString.includes('pooler.supabase')) : false;

    global._postgresPool = new Pool({
      connectionString: connectionString || undefined,
      ssl: isLocal && !isSupabase ? false : { rejectUnauthorized: false },
      max: 10,
      connectionTimeoutMillis: 15000,
    });

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
