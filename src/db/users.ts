import { eq, sql } from 'drizzle-orm';
import crypto from 'node:crypto';
import { db } from './index.ts';
import { 
  users, 
  userProgressSummary, 
  lessonProgress, 
  passwordResetTokens, 
  securityAuditLogs 
} from './schema.ts';

// ----------------------------------------------------------------------------
// Funções de Usuário e Autenticação no Supabase (PostgreSQL)
// ----------------------------------------------------------------------------

export async function findUserByEmail(email: string) {
  try {
    const normalized = email.trim().toLowerCase();
    const result = await db.select().from(users).where(eq(users.email, normalized)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('Database query failed in findUserByEmail:', error);
    throw new Error('Falha ao consultar usuário no banco de dados.', { cause: error });
  }
}

export async function findUserById(id: number) {
  try {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('Database query failed in findUserById:', error);
    throw new Error('Falha ao consultar usuário no banco de dados.', { cause: error });
  }
}

export async function findUserByUid(uid: string) {
  try {
    const result = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('Database query failed in findUserByUid:', error);
    throw new Error('Falha ao consultar usuário no banco de dados.', { cause: error });
  }
}

export async function createUserWithPassword(data: {
  name: string;
  email: string;
  passwordHash: string;
  uid?: string;
  role?: string;
}) {
  try {
    const normalizedEmail = data.email.trim().toLowerCase();
    const userUid = data.uid || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    // Inserção atômica do usuário
    const [newUser] = await db.insert(users).values({
      uid: userUid,
      name: data.name.trim(),
      email: normalizedEmail,
      passwordHash: data.passwordHash,
      role: data.role || 'student',
      failedLoginAttempts: 0,
      lockUntil: null,
    }).returning();

    // Inicialização do resumo de progresso atrelado
    await db.insert(userProgressSummary).values({
      userId: newUser.id,
      currentLessonId: 'py-aula-1',
      totalCompletedLessons: 1,
    }).onConflictDoNothing();

    // Marcar primeira aula como iniciada
    await db.insert(lessonProgress).values({
      userId: newUser.id,
      courseId: 'python-basico',
      lessonId: 'py-aula-1',
      isCompleted: true,
      quizScore: 1,
      quizAttempts: 1,
    }).onConflictDoNothing();

    return newUser;
  } catch (error) {
    console.error('Database insert failed in createUserWithPassword:', error);
    throw new Error('Falha ao registrar novo usuário no banco de dados.', { cause: error });
  }
}

export async function updateUserLoginAttempts(userId: number, failedAttempts: number, lockUntil: Date | null) {
  try {
    await db.update(users)
      .set({
        failedLoginAttempts: failedAttempts,
        lockUntil: lockUntil,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  } catch (error) {
    console.error('Database update failed in updateUserLoginAttempts:', error);
    throw new Error('Falha ao atualizar tentativas de login.', { cause: error });
  }
}

export async function updateUserProfile(userId: number, fields: { name?: string; bio?: string; customNotes?: string }) {
  try {
    const updates: Record<string, any> = { updatedAt: new Date() };
    if (fields.name !== undefined) updates.name = fields.name.trim();
    if (fields.bio !== undefined) updates.bio = fields.bio.trim();
    if (fields.customNotes !== undefined) updates.customNotes = fields.customNotes;

    const [updated] = await db.update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();

    return updated;
  } catch (error) {
    console.error('Database update failed in updateUserProfile:', error);
    throw new Error('Falha ao atualizar dados do perfil.', { cause: error });
  }
}

export async function updateUserPassword(userId: number, passwordHash: string) {
  try {
    await db.update(users)
      .set({
        passwordHash,
        failedLoginAttempts: 0,
        lockUntil: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  } catch (error) {
    console.error('Database update failed in updateUserPassword:', error);
    throw new Error('Falha ao atualizar senha no banco de dados.', { cause: error });
  }
}

// ----------------------------------------------------------------------------
// Tokens de Recuperação de Senha (Segurança da Informação)
// ----------------------------------------------------------------------------

export async function createPasswordResetToken(userId: number, email: string, token: string, code: string, expiresAt: Date) {
  try {
    const [record] = await db.insert(passwordResetTokens).values({
      userId,
      email: email.trim().toLowerCase(),
      token,
      code,
      expiresAt,
      used: false,
    }).returning();
    return record;
  } catch (error) {
    console.error('Database insert failed in createPasswordResetToken:', error);
    throw new Error('Falha ao registrar token de recuperação de senha.', { cause: error });
  }
}

export async function findActiveResetToken(email: string, code: string) {
  try {
    const normalized = email.trim().toLowerCase();
    const codeHash = crypto.createHash('sha256').update(code.trim()).digest('hex');
    const result = await db.select()
      .from(passwordResetTokens)
      .where(
        sql`${passwordResetTokens.email} = ${normalized} AND ${passwordResetTokens.code} = ${codeHash}`
      )
      .orderBy(sql`${passwordResetTokens.createdAt} DESC`)
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('Database query failed in findActiveResetToken:', error);
    throw new Error('Falha ao verificar código de recuperação.', { cause: error });
  }
}

export async function markResetTokenUsed(tokenId: number) {
  try {
    await db.update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, tokenId));
  } catch (error) {
    console.error('Database update failed in markResetTokenUsed:', error);
    throw new Error('Falha ao invalidar token de uso único.', { cause: error });
  }
}

// ----------------------------------------------------------------------------
// Trilha de Auditoria de Segurança (ISO 27001 / LGPD)
// ----------------------------------------------------------------------------

const maskEmail = (email?: string | null) => {
  if (!email) return 'redacted';
  const [userPart, domainPart] = email.split('@');
  if (!domainPart) return 'redacted';
  const maskedUser = userPart.length <= 2 ? `${userPart[0] || ''}*` : `${userPart.slice(0, 2)}***`;
  return `${maskedUser}@${domainPart}`;
};

const sanitizeAuditText = (value?: string | null) => {
  if (!value) return '';
  return value.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, (match) => maskEmail(match));
};

export async function logSecurityAudit(userId: number | null, action: string, details?: string, ipAddress?: string) {
  try {
    await db.insert(securityAuditLogs).values({
      userId,
      action,
      details: sanitizeAuditText(details) || '',
      ipAddress: ipAddress ? 'redacted' : '127.0.0.1',
    });
  } catch (error) {
    // Audit log should never crash the main flow, but we record it
    console.error('Falha ao registrar log de auditoria de segurança:', error);
  }
}

export async function getAllUsersAuditSummary() {
  try {
    const allUsers = await db.select({
      id: users.id,
      uid: users.uid,
      name: users.name,
      email: users.email,
      failedLoginAttempts: users.failedLoginAttempts,
      lockUntil: users.lockUntil,
      createdAt: users.createdAt,
    }).from(users);

    const recentLogs = await db.select()
      .from(securityAuditLogs)
      .orderBy(sql`${securityAuditLogs.createdAt} DESC`)
      .limit(10);

    return {
      totalUsers: allUsers.length,
      users: allUsers.map(u => ({
        id: String(u.id),
        uid: u.uid.slice(0, 6) + '***',
        name: u.name,
        email: maskEmail(u.email),
        failedLoginAttempts: u.failedLoginAttempts,
        isLocked: Boolean(u.lockUntil && new Date(u.lockUntil).getTime() > Date.now()),
        lockUntilSecondsRemaining: u.lockUntil && new Date(u.lockUntil).getTime() > Date.now()
          ? Math.ceil((new Date(u.lockUntil).getTime() - Date.now()) / 1000)
          : 0,
      })),
      recentLogs: recentLogs.map((log) => ({
        ...log,
        details: sanitizeAuditText(log.details || ''),
        ipAddress: log.ipAddress ? 'redacted' : null,
      })),
    };
  } catch (error) {
    console.error('Failed to get security summary:', error);
    throw new Error('Falha ao obter dados de auditoria.', { cause: error });
  }
}
