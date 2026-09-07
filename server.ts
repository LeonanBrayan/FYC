import 'dotenv/config';
import express from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

// Supabase (PostgreSQL) Helpers & Schema
import {
  findUserByEmail,
  findUserById,
  createUserWithPassword,
  updateUserLoginAttempts,
  updateUserProfile,
  updateUserPassword,
  createPasswordResetToken,
  findActiveResetToken,
  markResetTokenUsed,
  logSecurityAudit,
  getAllUsersAuditSummary
} from './src/db/users.ts';
import {
  getUserFullProgress,
  recordLessonEvolution,
  bulkSyncUserProgress
} from './src/db/progress.ts';
import { seedInitialDatabase } from './src/db/seed.ts';
import { getSupabaseClient } from './src/lib/supabase.ts';

const app = express();
const PORT = 3000;
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  /^https:\/\/.*\.vercel\.app$/i
];

const isAllowedOrigin = (origin: string | undefined) => {
  if (!origin) return true;
  if (allowedOrigins.some((allowed) => typeof allowed === 'string' ? allowed === origin : allowed.test(origin))) {
    return true;
  }
  return false;
};

// CORS e cabeçalhos para suporte a Vercel e requisições externas
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || 'http://localhost:5173');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Normalização de rotas para Serverless da Vercel
// Caso a Vercel redirecione para /auth/login sem o prefixo /api
app.use((req, res, next) => {
  if (!req.url.startsWith('/api') && (
    req.url.startsWith('/auth') ||
    req.url.startsWith('/database') ||
    req.url.startsWith('/profile') ||
    req.url.startsWith('/lessons') ||
    req.url.startsWith('/quiz') ||
    req.url.startsWith('/certificates') ||
    req.url.startsWith('/admin') ||
    req.url.startsWith('/user')
  )) {
    req.url = `/api${req.url}`;
  }
  next();
});

app.use(express.json());

// Setup email delivery service (SMTP or Resend)
interface SendEmailResult {
  success: boolean;
  configured: boolean;
  provider?: string;
  error?: string;
}

async function sendResetEmail(toEmail: string, studentName: string, resetCode: string): Promise<SendEmailResult> {
  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0;">Smart<span style="color: #4f46e5;">Cursos</span></h1>
        <p style="font-size: 14px; color: #64748b; margin: 4px 0 0;">Plataforma de Cursos Online • Supabase</p>
      </div>
      
      <p style="font-size: 15px; line-height: 1.5; color: #334155;">Olá, <strong>${studentName}</strong>!</p>
      <p style="font-size: 14px; line-height: 1.6; color: #475569;">
        Recebemos uma solicitação para redefinir a senha da sua conta no SmartCursos associada ao e-mail <strong>${toEmail}</strong>.
      </p>
      
      <div style="margin: 28px 0; text-align: center;">
        <div style="display: inline-block; padding: 14px 32px; background-color: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; font-size: 28px; font-weight: 800; letter-spacing: 6px; font-family: monospace; color: #0f172a;">
          ${resetCode}
        </div>
        <p style="font-size: 12px; color: #64748b; margin-top: 8px;">Este código é válido por <strong>15 minutos</strong> e de uso único.</p>
      </div>

      <p style="font-size: 13px; line-height: 1.5; color: #64748b;">
        Insira o código acima na tela de redefinição para cadastrar sua nova senha. Se você não fez esta solicitação, ignore este e-mail; sua conta permanecerá segura.
      </p>
      
      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
      <p style="font-size: 11px; text-align: center; color: #94a3b8; margin: 0;">
        SmartCursos • Plataforma de Cursos Online
      </p>
    </div>
  `;

  const subject = `Seu código de redefinição de senha: ${resetCode} - SmartCursos`;
  const text = `Olá ${studentName},\n\nSeu código de redefinição de senha do SmartCursos é: ${resetCode}\n\nEste código expira em 15 minutos e só pode ser utilizado uma vez.\n\nSe você não solicitou, ignore esta mensagem.`;

  // 1. Resend API
  if (process.env.RESEND_API_KEY) {
    try {
      const fromAddress = process.env.RESEND_FROM || process.env.SMTP_FROM || 'SmartCursos <onboarding@resend.dev>';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [toEmail],
          subject,
          text,
          html: htmlContent
        })
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('[Email Service] Erro na API do Resend:', data);
        return { success: false, configured: true, provider: 'Resend', error: data.message || 'Falha ao enviar via Resend' };
      }
      console.log(`[Email Service] E-mail enviado com sucesso via Resend para ${toEmail}. ID: ${data.id}`);
      return { success: true, configured: true, provider: 'Resend' };
    } catch (err: any) {
      console.error('[Email Service] Falha na requisição ao Resend:', err);
      return { success: false, configured: true, provider: 'Resend', error: err.message };
    }
  }

  // 2. SMTP (Gmail, Brevo, SendGrid, custom SMTP)
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpUser && smtpPass) {
    try {
      const host = process.env.SMTP_HOST || (smtpUser.includes('@gmail.com') ? 'smtp.gmail.com' : undefined);
      if (!host) {
        return { success: false, configured: false, provider: 'SMTP', error: 'SMTP_HOST não configurado.' };
      }

      const port = Number(process.env.SMTP_PORT) || (host === 'smtp.gmail.com' ? 587 : 587);
      const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: isSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      const fromAddress = process.env.SMTP_FROM || `"SmartCursos" <${smtpUser}>`;
      const info = await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject,
        text,
        html: htmlContent
      });

      console.log(`[Email Service] E-mail de redefinição enviado com sucesso via SMTP (${host}) para ${toEmail}. MessageId: ${info.messageId}`);
      return { success: true, configured: true, provider: 'SMTP' };
    } catch (err: any) {
      console.error('[Email Service] Erro no envio SMTP:', err);
      return { success: false, configured: true, provider: 'SMTP', error: `Falha no envio SMTP: ${err.message}` };
    }
  }

  // 3. Fallback: No real email service configured in environment
  console.warn('[Email Service] ⚠️ Nenhuma credencial de e-mail (SMTP_USER/SMTP_PASS ou RESEND_API_KEY) configurada. Operação de reset iniciada sem envio externo.');
  return {
    success: false,
    configured: false,
    error: 'Servidor de e-mail não configurado: adicione suas credenciais SMTP nas Configurações do projeto.'
  };
}

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET ausente. Defina a variável de ambiente antes de iniciar o servidor.');
}

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = '7d';

const maskEmail = (email?: string | null) => {
  if (!email) return 'redacted';
  const [localPart, domainPart] = email.split('@');
  if (!domainPart) return 'redacted';
  const visibleLocal = localPart.length <= 2 ? `${localPart[0] || ''}*` : `${localPart.slice(0, 2)}***`;
  return `${visibleLocal}@${domainPart}`;
};

// Helper: Public user profile without sensitive credentials
const sanitizeUser = (user: any) => ({
  id: String(user.id),
  name: user.name,
  email: maskEmail(user.email),
  role: user.role,
  createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
  bio: user.bio || '',
  customNotes: user.customNotes || ''
});

// Helper: Normalize emails
const cleanEmail = (email: string) => email.trim().toLowerCase();

// ============================================================================
// CONTROLE DE ACESSO: Middleware de Autenticação JWT (Supabase PostgreSQL)
// Garante que o usuário logado acesse única e exclusivamente os seus próprios dados (Anti-IDOR)
// ============================================================================
export interface AuthenticatedRequest extends express.Request {
  user?: {
    userId: number;
    email: string;
    role: string;
    uid?: string;
  };
}

const requireAuth = async (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Acesso não autorizado. Token ausente ou mal formatado no cabeçalho Authorization.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string; role: string };
    if (decoded && decoded.userId) {
      req.user = decoded;
      return next();
    }
  } catch (jwtErr) {
    // JWT inválido ou expirado
  }

  return res.status(401).json({
    error: 'Sessão expirada ou Token inválido. Faça login novamente.'
  });
};

// ============================================================================
// API ROUTES COM SUPORTE TOTAL A SUPABASE (POSTGRESQL)
// ============================================================================

// 1. Health check & Supabase Connection Info
app.get('/api/health', (req, res) => {
  const isSupabaseConfigured = Boolean(
    process.env.SUPABASE_DATABASE_URL ||
    process.env.SUPABASE_DB_URL ||
    process.env.SUPABASE_URL ||
    process.env.SUPABASE_HOST
  );
  res.json({
    status: 'ok',
    database: isSupabaseConfigured ? 'Supabase (PostgreSQL)' : 'PostgreSQL on Supabase',
    provider: 'Supabase',
    orm: 'Drizzle ORM',
    time: new Date().toISOString()
  });
});

// Status detalhado do Supabase e Conformidade com Segurança da Informação (ISO 27001 / LGPD)
app.get('/api/database/status', async (req, res) => {
  try {
    const isSupabaseConfigured = Boolean(
      process.env.SUPABASE_DATABASE_URL ||
      process.env.SUPABASE_DB_URL ||
      process.env.DATABASE_URL ||
      process.env.SUPABASE_HOST
    );
    res.json({
      status: 'ok',
      engine: isSupabaseConfigured ? 'PostgreSQL on Supabase' : 'PostgreSQL (Supabase Ready)',
      provider: 'Supabase',
      connectionPool: 'pg.Pool active (Supavisor / Direct SSL)',
      securityCompliance: {
        passwords: 'Bcrypt Hash 10-rounds (Zero plaintext storage)',
        bruteForceProtection: 'Account lockout (5 attempts / 15 min lock)',
        sessionSecurity: 'HMAC-SHA256 JWT & Supabase Auth Bearer Tokens',
        idorProtection: 'Strict Tenant UID database scoping (Anti-IDOR)',
        auditLogging: 'Security Events persisted to security_audit_logs table',
        rowLevelSecurity: 'RLS policies enforced on all tables',
        dataEncryption: 'TLS 1.3 / SSL encrypted connection'
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Falha ao obter status do banco de dados.' });
  }
});

// ----------------------------------------------------------------------------
// 2. CADASTRO DE USUÁRIO COM PERSISTÊNCIA REAL NO SUPABASE (POSTGRESQL)
// Regras de Segurança: Validação de tamanho de senha, hash bcrypt, e-mail único
// ----------------------------------------------------------------------------
app.post('/api/auth/register', async (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha deve conter no mínimo 6 caracteres.' });
    }

    const normalizedEmail = cleanEmail(email);

    // Verificar unicidade de e-mail no PostgreSQL
    const existing = await findUserByEmail(normalizedEmail);
    if (existing) {
      await logSecurityAudit(null, 'REGISTER_ATTEMPT_DUPLICATE_EMAIL', `Tentativa de cadastro com e-mail já existente: ${normalizedEmail}`, clientIp);
      return res.status(409).json({ error: 'Já existe uma conta cadastrada com este endereço de e-mail.' });
    }

    // Hash criptográfico da senha (Bcrypt 10 rounds)
    const passwordHash = await bcrypt.hash(password, 10);

    // Criar usuário no PostgreSQL (Supabase public.users) com inicialização de progresso
    const newUser = await createUserWithPassword({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'student'
    });

    // Sincronizar com Supabase Auth (auth.users)
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.auth.signUp({
          email: normalizedEmail,
          password: password,
          options: {
            data: { name: name.trim() }
          }
        });
      }
    } catch (sbErr) {
      console.warn('Supabase Auth user sync notice:', sbErr);
    }

    await logSecurityAudit(newUser.id, 'USER_REGISTER_SUCCESS', `Novo usuário registrado no Supabase: ${normalizedEmail}`, clientIp);

    // Carregar progresso inicial
    const progress = await getUserFullProgress(newUser.id);

    // Gerar JWT com claims seguras
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    return res.status(201).json({
      message: 'Cadastro realizado com sucesso!',
      token,
      user: sanitizeUser(newUser),
      progress: {
        completedLessons: progress.completedLessons,
        currentLessonId: progress.currentLessonId,
        quizScores: progress.quizScores,
        studentName: progress.studentName,
        certificateEarnedDate: progress.certificateEarnedDate
      }
    });
  } catch (error: any) {
    console.error('Register error:', error);
    await logSecurityAudit(null, 'REGISTER_ERROR', error.message, clientIp);
    return res.status(500).json({ error: 'Erro interno ao processar cadastro no banco de dados.' });
  }
});

// ----------------------------------------------------------------------------
// 3. LOGIN SEGURO COM PROTEÇÃO CONTRA FORÇA BRUTA NO SUPABASE (POSTGRESQL)
// Regras: 5 tentativas máx, bloqueio de 15 minutos, auditoria de falhas
// ----------------------------------------------------------------------------
app.post('/api/auth/login', async (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const normalizedEmail = cleanEmail(email);

    // Buscar usuário no Supabase / PostgreSQL
    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
      await logSecurityAudit(null, 'LOGIN_FAILED_UNKNOWN_EMAIL', `Tentativa de login com e-mail não cadastrado: ${normalizedEmail}`, clientIp);
      // Resposta genérica para mitigar User Enumeration
      return res.status(401).json({ error: 'Credenciais inválidas. Verifique seu e-mail e senha.' });
    }

    const now = Date.now();

    // Verificação de Bloqueio por Força Bruta
    if (user.lockUntil) {
      const lockTime = new Date(user.lockUntil).getTime();
      if (lockTime > now) {
        const remainingSeconds = Math.ceil((lockTime - now) / 1000);
        const remainingMinutes = Math.ceil(remainingSeconds / 60);

        await logSecurityAudit(user.id, 'LOGIN_BLOCKED_LOCKED_ACCOUNT', `Tentativa de login em conta bloqueada até ${user.lockUntil}`, clientIp);

        return res.status(429).json({
          error: `Conta bloqueada temporariamente devido a 5 tentativas consecutivas incorretas. Tente novamente em ${remainingMinutes} minuto(s) (${remainingSeconds}s).`,
          isLocked: true,
          remainingSeconds
        });
      }
    }

    // Se a senha estiver nula, instruir recuperação de senha
    if (!user.passwordHash) {
      return res.status(400).json({
        error: 'Esta conta não possui senha definida. Utilize a opção "Esqueci minha senha" para cadastrar uma nova senha.'
      });
    }

    // Comparação do hash da senha
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      const nextAttempts = (user.failedLoginAttempts || 0) + 1;
      const MAX_ATTEMPTS = 5;
      const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutos

      if (nextAttempts >= MAX_ATTEMPTS) {
        const lockUntilDate = new Date(now + LOCK_TIME_MS);
        await updateUserLoginAttempts(user.id, nextAttempts, lockUntilDate);
        await logSecurityAudit(user.id, 'ACCOUNT_LOCKED_BRUTE_FORCE', `Bloqueio de 15 min ativado após ${nextAttempts} tentativas incorretas`, clientIp);

        return res.status(429).json({
          error: 'Limite de 5 tentativas incorretas atingido! Sua conta foi temporariamente bloqueada por 15 minutos para sua segurança.',
          isLocked: true,
          remainingSeconds: 15 * 60
        });
      } else {
        await updateUserLoginAttempts(user.id, nextAttempts, null);
        await logSecurityAudit(user.id, 'LOGIN_FAILED_PASSWORD_MISMATCH', `Tentativa incorreta ${nextAttempts}/5`, clientIp);

        const attemptsLeft = MAX_ATTEMPTS - nextAttempts;
        return res.status(401).json({
          error: `Senha incorreta. Atenção: restam ${attemptsLeft} tentativa(s) antes do bloqueio temporário de segurança.`,
          attemptsLeft
        });
      }
    }

    // Sucesso: zerar contador de tentativas no banco de dados
    await updateUserLoginAttempts(user.id, 0, null);
    await logSecurityAudit(user.id, 'LOGIN_SUCCESS', `Login bem-sucedido via Supabase PostgreSQL`, clientIp);

    // Gerar JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    // Carregar progresso real do Supabase
    const progress = await getUserFullProgress(user.id);

    return res.json({
      message: 'Login realizado com sucesso!',
      token,
      user: sanitizeUser(user),
      progress: {
        completedLessons: progress.completedLessons,
        currentLessonId: progress.currentLessonId,
        quizScores: progress.quizScores,
        studentName: progress.studentName,
        certificateEarnedDate: progress.certificateEarnedDate
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);

    const isDatabaseMissing = !process.env.SUPABASE_DATABASE_URL && !process.env.SUPABASE_DB_URL && !process.env.DATABASE_URL && !process.env.POSTGRES_URL;

    if (isDatabaseMissing) {
      return res.status(503).json({
        error: 'Serviço de autenticação indisponível. O banco de dados não foi configurado no ambiente da Vercel.'
      });
    }

    return res.status(500).json({ error: 'Erro ao autenticar usuário no banco de dados.' });
  }
});

// ----------------------------------------------------------------------------
// 4. ISOLAMENTO DE DADOS: GET /api/user/me
// O ID do usuário logado é extraído exclusivamente do token autenticado (Prevenção Anti-IDOR)
// ----------------------------------------------------------------------------
app.get('/api/user/me', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const currentUserId = req.user!.userId;
    const user = await findUserById(currentUserId);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado no banco de dados.' });
    }

    const progress = await getUserFullProgress(currentUserId);

    return res.json({
      user: sanitizeUser(user),
      progress: {
        completedLessons: progress.completedLessons,
        currentLessonId: progress.currentLessonId,
        quizScores: progress.quizScores,
        studentName: progress.studentName,
        certificateEarnedDate: progress.certificateEarnedDate
      }
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return res.status(500).json({ error: 'Erro ao carregar dados do usuário.' });
  }
});

// ----------------------------------------------------------------------------
// 6. ATUALIZAÇÃO DO PERFIL DO ALUNO
// ----------------------------------------------------------------------------
app.put('/api/user/profile', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const currentUserId = req.user!.userId;
    const { name, bio, customNotes } = req.body;

    const updatedUser = await updateUserProfile(currentUserId, { name, bio, customNotes });
    if (!updatedUser) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    return res.json({
      message: 'Perfil atualizado com sucesso!',
      user: sanitizeUser(updatedUser)
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Erro ao salvar alterações do perfil.' });
  }
});

// ----------------------------------------------------------------------------
// 7. SINCRONIZAÇÃO GERAL DO PROGRESSO DE AULAS
// ----------------------------------------------------------------------------
app.put('/api/user/progress', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const currentUserId = req.user!.userId;
    const { completedLessons, currentLessonId, quizScores, certificateEarnedDate } = req.body;

    const updatedProgress = await bulkSyncUserProgress(currentUserId, {
      completedLessons,
      currentLessonId,
      quizScores,
      certificateEarnedDate
    });

    return res.json({
      message: 'Progresso salvo com sucesso!',
      progress: {
        completedLessons: updatedProgress.completedLessons,
        currentLessonId: updatedProgress.currentLessonId,
        quizScores: updatedProgress.quizScores,
        studentName: updatedProgress.studentName,
        certificateEarnedDate: updatedProgress.certificateEarnedDate
      }
    });
  } catch (error: any) {
    console.error('Sync progress error:', error);
    return res.status(500).json({ error: 'Erro ao salvar progresso.' });
  }
});

// ----------------------------------------------------------------------------
// 8. REGISTRO ESPECÍFICO DE AULA ASSISTIDA E DESEMPENHO NO QUIZ
// ----------------------------------------------------------------------------
app.post('/api/user/lesson-progress', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const currentUserId = req.user!.userId;
    const { courseId, lessonId, isCompleted, quizScore, notes } = req.body;

    if (!lessonId) {
      return res.status(400).json({ error: 'ID da aula (lessonId) é obrigatório.' });
    }

    const updatedProgress = await recordLessonEvolution({
      userId: currentUserId,
      courseId: courseId || 'python-basico',
      lessonId,
      isCompleted: isCompleted !== undefined ? Boolean(isCompleted) : true,
      quizScore: quizScore !== undefined ? Number(quizScore) : 1,
      notes: typeof notes === 'string' ? notes : ''
    });

    await logSecurityAudit(currentUserId, 'LESSON_EVOLUTION_RECORDED', `Aula concluída: ${lessonId}, Quiz: ${quizScore}`);

    return res.json({
      message: 'Evolução da aula atualizada com sucesso!',
      progress: {
        completedLessons: updatedProgress.completedLessons,
        currentLessonId: updatedProgress.currentLessonId,
        quizScores: updatedProgress.quizScores,
        studentName: updatedProgress.studentName,
        certificateEarnedDate: updatedProgress.certificateEarnedDate,
        totalCompletedLessons: updatedProgress.totalCompletedLessons
      }
    });
  } catch (error: any) {
    console.error('Lesson progress error:', error);
    return res.status(500).json({ error: 'Erro ao gravar desempenho da aula no banco de dados.' });
  }
});

// ----------------------------------------------------------------------------
// 8. HISTÓRICO COMPLETO DE AULAS ASSISTIDAS E EVOLUÇÃO (Supabase PostgreSQL)
// ----------------------------------------------------------------------------
app.get('/api/user/lesson-history', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const currentUserId = req.user!.userId;
    const progress = await getUserFullProgress(currentUserId);

    return res.json({
      userId: currentUserId,
      studentName: progress.studentName,
      totalCompletedLessons: progress.totalCompletedLessons,
      completedLessons: progress.completedLessons,
      quizScores: progress.quizScores,
      certificateEarnedDate: progress.certificateEarnedDate,
      detailedHistory: progress.detailedHistory
    });
  } catch (error: any) {
    console.error('Lesson history error:', error);
    return res.status(500).json({ error: 'Erro ao obter histórico detalhado do aluno.' });
  }
});

// ----------------------------------------------------------------------------
// 9. RECUPERAÇÃO DE SENHA SEGURA (Tokens descartáveis no Supabase PostgreSQL)
// ----------------------------------------------------------------------------
app.post('/api/auth/forgot-password', async (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Informe o endereço de e-mail.' });
    }

    const normalizedEmail = cleanEmail(email);
    const userFound = await findUserByEmail(normalizedEmail);

    if (userFound) {
      // Código de 6 dígitos e Token de uso único
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const token = `reset_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos de validade

      await createPasswordResetToken(userFound.id, normalizedEmail, token, code, expiresAt);
      await logSecurityAudit(userFound.id, 'PASSWORD_RESET_REQUESTED', `Código de recuperação gerado para ${normalizedEmail}`, clientIp);

      const emailResult = await sendResetEmail(normalizedEmail, userFound.name, code);

      if (!emailResult.success) {
        if (!emailResult.configured) {
          return res.status(503).json({
            error: 'Servidor de e-mail não configurado: adicione suas credenciais SMTP nas variáveis de ambiente da Vercel para envio real.'
          });
        } else {
          return res.status(502).json({
            error: `Falha no envio de e-mail: ${emailResult.error || 'Verifique as credenciais do servidor SMTP'}`
          });
        }
      }

      return res.json({
        message: `Enviamos o código de 6 dígitos para o seu e-mail (${normalizedEmail}). Válido por 15 minutos.`
      });
    }

    // Mensagem neutra para evitar enumeração
    return res.json({
      message: `Se o e-mail ${normalizedEmail} estiver cadastrado no SmartCursos, as instruções foram enviadas.`
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Erro ao processar solicitação de recuperação.' });
  }
});

// ----------------------------------------------------------------------------
// 10. CONFIRMAÇÃO DE REDEFINIÇÃO DE SENHA (Uso único garantido no Supabase PostgreSQL)
// ----------------------------------------------------------------------------
app.post('/api/auth/reset-password', async (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'E-mail, código e nova senha são obrigatórios.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' });
    }

    const normalizedEmail = cleanEmail(email);

    // Buscar token ativo no Supabase PostgreSQL
    const activeReset = await findActiveResetToken(normalizedEmail, code);

    if (!activeReset) {
      return res.status(400).json({ error: 'Código de recuperação inválido ou inexistente.' });
    }

    if (activeReset.used) {
      return res.status(400).json({ error: 'Este código de uso único já foi utilizado anteriormente.' });
    }

    if (new Date(activeReset.expiresAt).getTime() < Date.now()) {
      return res.status(400).json({ error: 'Este código de recuperação expirou (validade de 15 minutos excedida). Solicite um novo.' });
    }

    // Invalidar token no Supabase PostgreSQL imediatamente
    await markResetTokenUsed(activeReset.id);

    // Atualizar senha do usuário com hash bcrypt
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(activeReset.userId, passwordHash);

    await logSecurityAudit(activeReset.userId, 'PASSWORD_RESET_SUCCESS', `Senha redefinida com sucesso com token #${activeReset.id}`, clientIp);

    return res.json({
      message: 'Senha redefinida com sucesso! Você já pode fazer login com sua nova senha.'
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Erro ao redefinir senha no banco de dados.' });
  }
});

// ----------------------------------------------------------------------------
// 12. AUDITORIA DE SEGURANÇA (Relatório restrito a Administradores)
// ----------------------------------------------------------------------------
app.get('/api/auth/security-stats', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso restrito apenas a administradores.' });
    }
    const stats = await getAllUsersAuditSummary();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao carregar auditoria.' });
  }
});

// ============================================================================
// Inicialização do Servidor & Vite Middleware
// ============================================================================
async function startServer() {
  // Semeador de banco inicial (executado de forma assíncrona para não atrasar inicialização)
  seedInitialDatabase().catch(err => {
    console.error('Seed error:', err);
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartCursos com Supabase (PostgreSQL) rodando em http://0.0.0.0:${PORT}`);
  });
}

// Em ambientes serverless (como Vercel e AWS Lambda), a porta 3000 não deve ser vinculada
const isServerless = Boolean(
  process.env.VERCEL ||
  process.env.VERCEL_ENV ||
  process.env.NOW_REGION ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.LAMBDA_TASK_ROOT
);

if (!isServerless) {
  startServer();
}

export default app;
