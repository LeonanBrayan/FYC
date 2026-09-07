import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Cache client instances
let supabaseAnonClient: SupabaseClient | null = null;
let supabaseAdminClient: SupabaseClient | null = null;

export function getSupabaseUrl(): string {
  return (
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) ||
    ''
  );
}

export function getSupabaseAnonKey(): string {
  return (
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) ||
    ''
  );
}

export function getSupabaseServiceRoleKey(): string {
  // O Service Role Key NUNCA deve ser exposto ao navegador
  return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

/**
 * Cliente seguro com chave pública (Anon Key).
 * Respeita Row Level Security (RLS) configurado no Supabase.
 */
export function getSupabaseClient(): SupabaseClient | null {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  if (!url || !anonKey) {
    return null;
  }

  if (!supabaseAnonClient) {
    supabaseAnonClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return supabaseAnonClient;
}

/**
 * Cliente administrativo com Service Role Key (apenas backend / server-side).
 * Usado exclusivamente pelo servidor para migrações, logs de auditoria e operações de segurança.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  const url = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (!url || !serviceRoleKey) {
    return null;
  }

  if (!supabaseAdminClient) {
    supabaseAdminClient = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseAdminClient;
}

export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  const dbUrl =
    process.env.SUPABASE_DATABASE_URL ||
    process.env.SUPABASE_DB_URL ||
    process.env.DATABASE_URL;

  return Boolean((url && key) || dbUrl || process.env.SUPABASE_HOST);
}
