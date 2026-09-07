-- ============================================================================
-- SMARTCURSOS - SUPABASE DATABASE SCHEMA COM REGRAS DE SEGURANÇA DA INFORMAÇÃO
-- Compatível com PostgreSQL / Supabase, Row Level Security (RLS), LGPD e ISO 27001
-- ============================================================================

-- 1. TABELA DE USUÁRIOS
CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  uid TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'instructor')),
  bio TEXT DEFAULT 'Estudante SmartCursos',
  custom_notes TEXT DEFAULT '',
  failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  lock_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 2. TABELA DE CURSOS
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'python',
  level TEXT NOT NULL DEFAULT 'Iniciante',
  total_lessons INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 3. TABELA DE PROGRESSO POR AULA
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL DEFAULT 'python-basico',
  lesson_id TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  watched_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  quiz_score INTEGER DEFAULT 0,
  quiz_attempts INTEGER NOT NULL DEFAULT 1,
  notes TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  CONSTRAINT unique_user_lesson UNIQUE (user_id, lesson_id)
);

-- 4. TABELA DE RESUMO DE PROGRESSO DO ALUNO
CREATE TABLE IF NOT EXISTS public.user_progress_summary (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  current_lesson_id TEXT NOT NULL DEFAULT 'py-aula-1',
  total_completed_lessons INTEGER NOT NULL DEFAULT 0,
  certificate_earned_date TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 5. TABELA DE TOKENS DE RECUPERAÇÃO DE SENHA (USO ÚNICO)
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 6. TABELA DE LOGS DE AUDITORIA DE SEGURANÇA (LGPD / ISO 27001)
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ÍNDICES DE PERFORMANCE E INTEGRIDADE
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_uid ON public.users(uid);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON public.lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson ON public.lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_user ON public.security_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_action ON public.security_audit_logs(action);

-- ============================================================================
-- REGRAS E NORMAS DE SEGURANÇA DA INFORMAÇÃO (ROW LEVEL SECURITY - RLS)
-- ============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE ACESSO (POLICIES)

-- Cursos: Leitura pública liberada para todos
DROP POLICY IF EXISTS "Cursos visíveis para todos" ON public.courses;
CREATE POLICY "Cursos visíveis para todos" ON public.courses
  FOR SELECT USING (true);

-- Usuários: Alunos podem visualizar seu próprio perfil
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.users;
CREATE POLICY "Usuários podem ver seu próprio perfil" ON public.users
  FOR SELECT USING (auth.uid()::text = uid OR auth.role() = 'service_role');

-- Usuários: Apenas o backend autenticado pode atualizar perfis
DROP POLICY IF EXISTS "Backend gerencia dados sensíveis" ON public.users;
CREATE POLICY "Backend gerencia dados sensíveis" ON public.users
  FOR ALL USING (auth.role() = 'service_role');

-- Progresso de Aulas: Alunos só acessam suas próprias aulas assistidas
DROP POLICY IF EXISTS "Alunos gerenciam seu próprio progresso" ON public.lesson_progress;
CREATE POLICY "Alunos gerenciam seu próprio progresso" ON public.lesson_progress
  FOR ALL USING (
    user_id IN (SELECT id FROM public.users WHERE uid = auth.uid()::text) 
    OR auth.role() = 'service_role'
  );

-- Resumo de Progresso: Alunos só acessam seu próprio resumo
DROP POLICY IF EXISTS "Alunos visualizam seu resumo de progresso" ON public.user_progress_summary;
CREATE POLICY "Alunos visualizam seu resumo de progresso" ON public.user_progress_summary
  FOR ALL USING (
    user_id IN (SELECT id FROM public.users WHERE uid = auth.uid()::text) 
    OR auth.role() = 'service_role'
  );

-- Logs de Auditoria: Append-only (somente INSERT, proibido UPDATE e DELETE para integridade jurídica)
DROP POLICY IF EXISTS "Logs de auditoria append-only" ON public.security_audit_logs;
CREATE POLICY "Logs de auditoria append-only" ON public.security_audit_logs
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Apenas administradores leem logs de auditoria" ON public.security_audit_logs;
CREATE POLICY "Apenas administradores leem logs de auditoria" ON public.security_audit_logs
  FOR SELECT USING (auth.role() = 'service_role');

-- Tokens de Recuperação: Somente o backend (service role) acessa
DROP POLICY IF EXISTS "Acesso estrito a tokens de recuperação" ON public.password_reset_tokens;
CREATE POLICY "Acesso estrito a tokens de recuperação" ON public.password_reset_tokens
  FOR ALL USING (auth.role() = 'service_role');
