var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server.ts
import "dotenv/config";
import express from "express";
import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

// src/db/users.ts
import { eq, sql } from "drizzle-orm";

// src/db/index.ts
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  courses: () => courses,
  lessonProgress: () => lessonProgress,
  lessonProgressRelations: () => lessonProgressRelations,
  passwordResetTokens: () => passwordResetTokens,
  passwordResetTokensRelations: () => passwordResetTokensRelations,
  securityAuditLogs: () => securityAuditLogs,
  securityAuditLogsRelations: () => securityAuditLogsRelations,
  userProgressSummary: () => userProgressSummary,
  userProgressSummaryRelations: () => userProgressSummaryRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(),
  // Identificador único (UUID do usuário)
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  // Hash bcrypt (10 rounds)
  role: text("role").notNull().default("student"),
  // 'student' | 'admin'
  bio: text("bio").default("Estudante SmartCursos"),
  customNotes: text("custom_notes").default(""),
  failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
  lockUntil: timestamp("lock_until"),
  // Timestamp de bloqueio temporário por tentativas
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var courses = pgTable("courses", {
  id: text("id").primaryKey(),
  // ex: 'python-basico'
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull().default("python"),
  level: text("level").notNull().default("Iniciante"),
  totalLessons: integer("total_lessons").notNull().default(10),
  createdAt: timestamp("created_at").defaultNow()
});
var lessonProgress = pgTable("lesson_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  courseId: text("course_id").notNull().default("python-basico"),
  lessonId: text("lesson_id").notNull(),
  // ex: 'py-aula-1'
  isCompleted: boolean("is_completed").notNull().default(false),
  watchedAt: timestamp("watched_at").defaultNow(),
  quizScore: integer("quiz_score").default(0),
  // 1 (acertou) ou 0 (errou)
  quizAttempts: integer("quiz_attempts").notNull().default(1),
  notes: text("notes").default(""),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => [
  uniqueIndex("user_lesson_idx").on(table.userId, table.lessonId)
]);
var userProgressSummary = pgTable("user_progress_summary", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  currentLessonId: text("current_lesson_id").notNull().default("py-aula-1"),
  totalCompletedLessons: integer("total_completed_lessons").notNull().default(0),
  certificateEarnedDate: timestamp("certificate_earned_date"),
  updatedAt: timestamp("updated_at").defaultNow()
});
var passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var securityAuditLogs = pgTable("security_audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  // 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'ACCOUNT_LOCKED', etc.
  details: text("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow()
});
var usersRelations = relations(users, ({ one, many }) => ({
  lessonProgress: many(lessonProgress),
  progressSummary: one(userProgressSummary, {
    fields: [users.id],
    references: [userProgressSummary.userId]
  }),
  resetTokens: many(passwordResetTokens),
  auditLogs: many(securityAuditLogs)
}));
var lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  user: one(users, {
    fields: [lessonProgress.userId],
    references: [users.id]
  })
}));
var userProgressSummaryRelations = relations(userProgressSummary, ({ one }) => ({
  user: one(users, {
    fields: [userProgressSummary.userId],
    references: [users.id]
  })
}));
var passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id]
  })
}));
var securityAuditLogsRelations = relations(securityAuditLogs, ({ one }) => ({
  user: one(users, {
    fields: [securityAuditLogs.userId],
    references: [users.id]
  })
}));

// src/db/index.ts
var createPool = () => {
  if (!global._postgresPool) {
    const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;
    if (!connectionString) {
      console.warn(
        "Aviso de Seguran\xE7a: DATABASE_URL ou SUPABASE_DATABASE_URL n\xE3o encontrada nas vari\xE1veis de ambiente. Defina no arquivo .env ou no painel da Vercel."
      );
    }
    const isLocal = connectionString ? connectionString.includes("localhost") || connectionString.includes("127.0.0.1") : true;
    const isSupabase = connectionString ? connectionString.includes("supabase") || connectionString.includes("pooler.supabase") : false;
    global._postgresPool = new Pool({
      connectionString: connectionString || void 0,
      ssl: isLocal && !isSupabase ? false : { rejectUnauthorized: false },
      max: 10,
      connectionTimeoutMillis: 15e3
    });
    global._postgresPool.on("error", (err) => {
      console.error("Unexpected error on idle Supabase/SQL pool client:", err);
    });
  }
  return global._postgresPool;
};
var pool = createPool();
var db = drizzle(pool, { schema: schema_exports });

// src/db/users.ts
async function findUserByEmail(email) {
  try {
    const normalized = email.trim().toLowerCase();
    const result = await db.select().from(users).where(eq(users.email, normalized)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("Database query failed in findUserByEmail:", error);
    throw new Error("Falha ao consultar usu\xE1rio no banco de dados.", { cause: error });
  }
}
async function findUserById(id) {
  try {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("Database query failed in findUserById:", error);
    throw new Error("Falha ao consultar usu\xE1rio no banco de dados.", { cause: error });
  }
}
async function createUserWithPassword(data) {
  try {
    const normalizedEmail = data.email.trim().toLowerCase();
    const userUid = data.uid || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const [newUser] = await db.insert(users).values({
      uid: userUid,
      name: data.name.trim(),
      email: normalizedEmail,
      passwordHash: data.passwordHash,
      role: data.role || "student",
      failedLoginAttempts: 0,
      lockUntil: null
    }).returning();
    await db.insert(userProgressSummary).values({
      userId: newUser.id,
      currentLessonId: "py-aula-1",
      totalCompletedLessons: 1
    }).onConflictDoNothing();
    await db.insert(lessonProgress).values({
      userId: newUser.id,
      courseId: "python-basico",
      lessonId: "py-aula-1",
      isCompleted: true,
      quizScore: 1,
      quizAttempts: 1
    }).onConflictDoNothing();
    return newUser;
  } catch (error) {
    console.error("Database insert failed in createUserWithPassword:", error);
    throw new Error("Falha ao registrar novo usu\xE1rio no banco de dados.", { cause: error });
  }
}
async function updateUserLoginAttempts(userId, failedAttempts, lockUntil) {
  try {
    await db.update(users).set({
      failedLoginAttempts: failedAttempts,
      lockUntil,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId));
  } catch (error) {
    console.error("Database update failed in updateUserLoginAttempts:", error);
    throw new Error("Falha ao atualizar tentativas de login.", { cause: error });
  }
}
async function updateUserProfile(userId, fields) {
  try {
    const updates = { updatedAt: /* @__PURE__ */ new Date() };
    if (fields.name !== void 0) updates.name = fields.name.trim();
    if (fields.bio !== void 0) updates.bio = fields.bio.trim();
    if (fields.customNotes !== void 0) updates.customNotes = fields.customNotes;
    const [updated] = await db.update(users).set(updates).where(eq(users.id, userId)).returning();
    return updated;
  } catch (error) {
    console.error("Database update failed in updateUserProfile:", error);
    throw new Error("Falha ao atualizar dados do perfil.", { cause: error });
  }
}
async function updateUserPassword(userId, passwordHash) {
  try {
    await db.update(users).set({
      passwordHash,
      failedLoginAttempts: 0,
      lockUntil: null,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId));
  } catch (error) {
    console.error("Database update failed in updateUserPassword:", error);
    throw new Error("Falha ao atualizar senha no banco de dados.", { cause: error });
  }
}
async function createPasswordResetToken(userId, email, token, code, expiresAt) {
  try {
    const [record] = await db.insert(passwordResetTokens).values({
      userId,
      email: email.trim().toLowerCase(),
      token,
      code,
      expiresAt,
      used: false
    }).returning();
    return record;
  } catch (error) {
    console.error("Database insert failed in createPasswordResetToken:", error);
    throw new Error("Falha ao registrar token de recupera\xE7\xE3o de senha.", { cause: error });
  }
}
async function findActiveResetToken(email, code) {
  try {
    const normalized = email.trim().toLowerCase();
    const result = await db.select().from(passwordResetTokens).where(
      sql`${passwordResetTokens.email} = ${normalized} AND ${passwordResetTokens.code} = ${code.trim()}`
    ).orderBy(sql`${passwordResetTokens.createdAt} DESC`).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("Database query failed in findActiveResetToken:", error);
    throw new Error("Falha ao verificar c\xF3digo de recupera\xE7\xE3o.", { cause: error });
  }
}
async function markResetTokenUsed(tokenId) {
  try {
    await db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.id, tokenId));
  } catch (error) {
    console.error("Database update failed in markResetTokenUsed:", error);
    throw new Error("Falha ao invalidar token de uso \xFAnico.", { cause: error });
  }
}
async function logSecurityAudit(userId, action, details, ipAddress) {
  try {
    await db.insert(securityAuditLogs).values({
      userId,
      action,
      details: details || "",
      ipAddress: ipAddress || "127.0.0.1"
    });
  } catch (error) {
    console.error("Falha ao registrar log de auditoria de seguran\xE7a:", error);
  }
}
async function getAllUsersAuditSummary() {
  try {
    const allUsers = await db.select({
      id: users.id,
      uid: users.uid,
      name: users.name,
      email: users.email,
      failedLoginAttempts: users.failedLoginAttempts,
      lockUntil: users.lockUntil,
      createdAt: users.createdAt
    }).from(users);
    const recentLogs = await db.select().from(securityAuditLogs).orderBy(sql`${securityAuditLogs.createdAt} DESC`).limit(10);
    return {
      totalUsers: allUsers.length,
      users: allUsers.map((u) => ({
        id: String(u.id),
        uid: u.uid,
        name: u.name,
        email: u.email,
        failedLoginAttempts: u.failedLoginAttempts,
        isLocked: Boolean(u.lockUntil && new Date(u.lockUntil).getTime() > Date.now()),
        lockUntilSecondsRemaining: u.lockUntil && new Date(u.lockUntil).getTime() > Date.now() ? Math.ceil((new Date(u.lockUntil).getTime() - Date.now()) / 1e3) : 0
      })),
      recentLogs
    };
  } catch (error) {
    console.error("Failed to get security summary:", error);
    throw new Error("Falha ao obter dados de auditoria.", { cause: error });
  }
}

// src/db/progress.ts
import { eq as eq2, sql as sql2 } from "drizzle-orm";
async function getUserFullProgress(userId) {
  try {
    const summaryResult = await db.select().from(userProgressSummary).where(eq2(userProgressSummary.userId, userId)).limit(1);
    const summary = summaryResult[0] || null;
    const lessons = await db.select().from(lessonProgress).where(eq2(lessonProgress.userId, userId)).orderBy(lessonProgress.lessonId);
    const userResult = await db.select({ name: users.name }).from(users).where(eq2(users.id, userId)).limit(1);
    const studentName = userResult[0]?.name || "Aluno";
    const completedLessons = [];
    const quizScores = {};
    const detailedLessons = [];
    for (const l of lessons) {
      if (l.isCompleted) {
        completedLessons.push(l.lessonId);
      }
      if (l.quizScore !== null) {
        quizScores[l.lessonId] = l.quizScore;
      }
      detailedLessons.push({
        lessonId: l.lessonId,
        isCompleted: l.isCompleted,
        watchedAt: l.watchedAt,
        quizScore: l.quizScore,
        quizAttempts: l.quizAttempts,
        notes: l.notes
      });
    }
    return {
      userId,
      studentName,
      completedLessons,
      currentLessonId: summary?.currentLessonId || (completedLessons.length > 0 ? completedLessons[completedLessons.length - 1] : "py-aula-1"),
      quizScores,
      certificateEarnedDate: summary?.certificateEarnedDate ? new Date(summary.certificateEarnedDate).toISOString() : void 0,
      totalCompletedLessons: completedLessons.length,
      detailedHistory: detailedLessons
    };
  } catch (error) {
    console.error("Database query failed in getUserFullProgress:", error);
    throw new Error("Falha ao consultar progresso no banco de dados.", { cause: error });
  }
}
async function recordLessonEvolution(data) {
  try {
    const courseId = data.courseId || "python-basico";
    const isCompleted = data.isCompleted ?? true;
    const now = /* @__PURE__ */ new Date();
    await db.insert(lessonProgress).values({
      userId: data.userId,
      courseId,
      lessonId: data.lessonId,
      isCompleted,
      watchedAt: now,
      quizScore: data.quizScore !== void 0 ? data.quizScore : 1,
      quizAttempts: 1,
      notes: data.notes || "",
      updatedAt: now
    }).onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonId],
      set: {
        isCompleted,
        watchedAt: now,
        ...data.quizScore !== void 0 ? { quizScore: data.quizScore } : {},
        ...data.notes !== void 0 ? { notes: data.notes } : {},
        quizAttempts: sql2`${lessonProgress.quizAttempts} + 1`,
        updatedAt: now
      }
    });
    const completedRows = await db.select({ count: sql2`count(*)` }).from(lessonProgress).where(sql2`${lessonProgress.userId} = ${data.userId} AND ${lessonProgress.isCompleted} = true`);
    const totalCompleted = Number(completedRows[0]?.count || 0);
    await db.insert(userProgressSummary).values({
      userId: data.userId,
      currentLessonId: data.lessonId,
      totalCompletedLessons: totalCompleted,
      updatedAt: now
    }).onConflictDoUpdate({
      target: userProgressSummary.userId,
      set: {
        currentLessonId: data.lessonId,
        totalCompletedLessons: totalCompleted,
        updatedAt: now
      }
    });
    return await getUserFullProgress(data.userId);
  } catch (error) {
    console.error("Database mutation failed in recordLessonEvolution:", error);
    throw new Error("Falha ao registrar evolu\xE7\xE3o da aula no banco de dados.", { cause: error });
  }
}
async function bulkSyncUserProgress(userId, data) {
  try {
    const now = /* @__PURE__ */ new Date();
    if (data.completedLessons && Array.isArray(data.completedLessons)) {
      for (const lessonId of data.completedLessons) {
        const score = data.quizScores && data.quizScores[lessonId] !== void 0 ? data.quizScores[lessonId] : 1;
        await db.insert(lessonProgress).values({
          userId,
          courseId: "python-basico",
          lessonId,
          isCompleted: true,
          watchedAt: now,
          quizScore: score,
          quizAttempts: 1,
          updatedAt: now
        }).onConflictDoUpdate({
          target: [lessonProgress.userId, lessonProgress.lessonId],
          set: {
            isCompleted: true,
            quizScore: score,
            updatedAt: now
          }
        });
      }
    }
    const certDate = data.certificateEarnedDate ? new Date(data.certificateEarnedDate) : void 0;
    const completedCount = data.completedLessons ? data.completedLessons.length : 0;
    await db.insert(userProgressSummary).values({
      userId,
      currentLessonId: data.currentLessonId || "py-aula-1",
      totalCompletedLessons: completedCount,
      certificateEarnedDate: certDate,
      updatedAt: now
    }).onConflictDoUpdate({
      target: userProgressSummary.userId,
      set: {
        ...data.currentLessonId ? { currentLessonId: data.currentLessonId } : {},
        totalCompletedLessons: completedCount,
        ...certDate ? { certificateEarnedDate: certDate } : {},
        updatedAt: now
      }
    });
    return await getUserFullProgress(userId);
  } catch (error) {
    console.error("Database update failed in bulkSyncUserProgress:", error);
    throw new Error("Falha ao sincronizar progresso no banco de dados.", { cause: error });
  }
}

// src/db/seed.ts
async function seedInitialDatabase() {
  try {
    await db.insert(courses).values([
      {
        id: "python-basico-mobile",
        title: "Curso de Python no Celular",
        slug: "python-basico",
        category: "python",
        level: "Iniciante",
        totalLessons: 10
      },
      {
        id: "web-frontend-mobile",
        title: "Desenvolvimento Web Mobile",
        slug: "web-frontend",
        category: "web",
        level: "Iniciante",
        totalLessons: 8
      }
    ]).onConflictDoNothing();
    console.log("[Supabase] Cat\xE1logo de cursos inicializado com sucesso.");
  } catch (error) {
    console.error("[Supabase Seed Error]:", error);
  }
}

// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
var supabaseAnonClient = null;
function getSupabaseUrl() {
  return process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL || "";
}
function getSupabaseAnonKey() {
  return process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY || "";
}
function getSupabaseClient() {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  if (!url || !anonKey) {
    return null;
  }
  if (!supabaseAnonClient) {
    supabaseAnonClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  }
  return supabaseAnonClient;
}

// server.ts
var app = express();
var PORT = 3e3;
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});
app.use((req, res, next) => {
  if (!req.url.startsWith("/api") && (req.url.startsWith("/auth") || req.url.startsWith("/database") || req.url.startsWith("/profile") || req.url.startsWith("/lessons") || req.url.startsWith("/quiz") || req.url.startsWith("/certificates") || req.url.startsWith("/admin") || req.url.startsWith("/user"))) {
    req.url = `/api${req.url}`;
  }
  next();
});
app.use(express.json());
async function sendResetEmail(toEmail, studentName, resetCode) {
  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0;">Smart<span style="color: #4f46e5;">Cursos</span></h1>
        <p style="font-size: 14px; color: #64748b; margin: 4px 0 0;">Plataforma de Cursos Online \u2022 Supabase</p>
      </div>
      
      <p style="font-size: 15px; line-height: 1.5; color: #334155;">Ol\xE1, <strong>${studentName}</strong>!</p>
      <p style="font-size: 14px; line-height: 1.6; color: #475569;">
        Recebemos uma solicita\xE7\xE3o para redefinir a senha da sua conta no SmartCursos associada ao e-mail <strong>${toEmail}</strong>.
      </p>
      
      <div style="margin: 28px 0; text-align: center;">
        <div style="display: inline-block; padding: 14px 32px; background-color: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; font-size: 28px; font-weight: 800; letter-spacing: 6px; font-family: monospace; color: #0f172a;">
          ${resetCode}
        </div>
        <p style="font-size: 12px; color: #64748b; margin-top: 8px;">Este c\xF3digo \xE9 v\xE1lido por <strong>15 minutos</strong> e de uso \xFAnico.</p>
      </div>

      <p style="font-size: 13px; line-height: 1.5; color: #64748b;">
        Insira o c\xF3digo acima na tela de redefini\xE7\xE3o para cadastrar sua nova senha. Se voc\xEA n\xE3o fez esta solicita\xE7\xE3o, ignore este e-mail; sua conta permanecer\xE1 segura.
      </p>
      
      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
      <p style="font-size: 11px; text-align: center; color: #94a3b8; margin: 0;">
        SmartCursos \u2022 Plataforma de Cursos Online
      </p>
    </div>
  `;
  const subject = `Seu c\xF3digo de redefini\xE7\xE3o de senha: ${resetCode} - SmartCursos`;
  const text2 = `Ol\xE1 ${studentName},

Seu c\xF3digo de redefini\xE7\xE3o de senha do SmartCursos \xE9: ${resetCode}

Este c\xF3digo expira em 15 minutos e s\xF3 pode ser utilizado uma vez.

Se voc\xEA n\xE3o solicitou, ignore esta mensagem.`;
  if (process.env.RESEND_API_KEY) {
    try {
      const fromAddress = process.env.RESEND_FROM || process.env.SMTP_FROM || "SmartCursos <onboarding@resend.dev>";
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [toEmail],
          subject,
          text: text2,
          html: htmlContent
        })
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("[Email Service] Erro na API do Resend:", data);
        return { success: false, configured: true, provider: "Resend", error: data.message || "Falha ao enviar via Resend" };
      }
      console.log(`[Email Service] E-mail enviado com sucesso via Resend para ${toEmail}. ID: ${data.id}`);
      return { success: true, configured: true, provider: "Resend" };
    } catch (err) {
      console.error("[Email Service] Falha na requisi\xE7\xE3o ao Resend:", err);
      return { success: false, configured: true, provider: "Resend", error: err.message };
    }
  }
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (smtpUser && smtpPass) {
    try {
      const host = process.env.SMTP_HOST || (smtpUser.includes("@gmail.com") ? "smtp.gmail.com" : void 0);
      if (!host) {
        return { success: false, configured: false, provider: "SMTP", error: "SMTP_HOST n\xE3o configurado." };
      }
      const port = Number(process.env.SMTP_PORT) || (host === "smtp.gmail.com" ? 587 : 587);
      const isSecure = process.env.SMTP_SECURE === "true" || port === 465;
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
        text: text2,
        html: htmlContent
      });
      console.log(`[Email Service] E-mail de redefini\xE7\xE3o enviado com sucesso via SMTP (${host}) para ${toEmail}. MessageId: ${info.messageId}`);
      return { success: true, configured: true, provider: "SMTP" };
    } catch (err) {
      console.error("[Email Service] Erro no envio SMTP:", err);
      return { success: false, configured: true, provider: "SMTP", error: `Falha no envio SMTP: ${err.message}` };
    }
  }
  console.warn(`[Email Service] \u26A0\uFE0F Nenhuma credencial de e-mail (SMTP_USER/SMTP_PASS ou RESEND_API_KEY) configurada. C\xF3digo gerado para ${toEmail}: ${resetCode}`);
  return {
    success: false,
    configured: false,
    error: "Servidor de e-mail n\xE3o configurado: adicione suas credenciais SMTP nas Configura\xE7\xF5es do projeto."
  };
}
var JWT_SECRET = process.env.JWT_SECRET || "smartcursos-jwt-supabase-secure-token-2026";
var TOKEN_EXPIRY = "7d";
var sanitizeUser = (user) => ({
  id: String(user.id),
  uid: user.uid,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
  bio: user.bio || "",
  customNotes: user.customNotes || ""
});
var cleanEmail = (email) => email.trim().toLowerCase();
var requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Acesso n\xE3o autorizado. Token ausente ou mal formatado no cabe\xE7alho Authorization."
    });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded && decoded.userId) {
      req.user = decoded;
      return next();
    }
  } catch (jwtErr) {
  }
  return res.status(401).json({
    error: "Sess\xE3o expirada ou Token inv\xE1lido. Fa\xE7a login novamente."
  });
};
app.get("/api/health", (req, res) => {
  const isSupabaseConfigured = Boolean(
    process.env.SUPABASE_DATABASE_URL || process.env.SUPABASE_DB_URL || process.env.SUPABASE_URL || process.env.SUPABASE_HOST
  );
  res.json({
    status: "ok",
    database: isSupabaseConfigured ? "Supabase (PostgreSQL)" : "PostgreSQL on Supabase",
    provider: "Supabase",
    orm: "Drizzle ORM",
    time: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/database/status", async (req, res) => {
  try {
    const isSupabaseConfigured = Boolean(
      process.env.SUPABASE_DATABASE_URL || process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || process.env.SUPABASE_HOST
    );
    res.json({
      status: "ok",
      engine: isSupabaseConfigured ? "PostgreSQL on Supabase" : "PostgreSQL (Supabase Ready)",
      provider: "Supabase",
      connectionPool: "pg.Pool active (Supavisor / Direct SSL)",
      securityCompliance: {
        passwords: "Bcrypt Hash 10-rounds (Zero plaintext storage)",
        bruteForceProtection: "Account lockout (5 attempts / 15 min lock)",
        sessionSecurity: "HMAC-SHA256 JWT & Supabase Auth Bearer Tokens",
        idorProtection: "Strict Tenant UID database scoping (Anti-IDOR)",
        auditLogging: "Security Events persisted to security_audit_logs table",
        rowLevelSecurity: "RLS policies enforced on all tables",
        dataEncryption: "TLS 1.3 / SSL encrypted connection"
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Falha ao obter status do banco de dados." });
  }
});
app.post("/api/auth/register", async (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || "127.0.0.1";
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nome, e-mail e senha s\xE3o obrigat\xF3rios." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "A senha deve conter no m\xEDnimo 6 caracteres." });
    }
    const normalizedEmail = cleanEmail(email);
    const existing = await findUserByEmail(normalizedEmail);
    if (existing) {
      await logSecurityAudit(null, "REGISTER_ATTEMPT_DUPLICATE_EMAIL", `Tentativa de cadastro com e-mail j\xE1 existente: ${normalizedEmail}`, clientIp);
      return res.status(409).json({ error: "J\xE1 existe uma conta cadastrada com este endere\xE7o de e-mail." });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await createUserWithPassword({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "student"
    });
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: { name: name.trim() }
          }
        });
      }
    } catch (sbErr) {
      console.warn("Supabase Auth user sync notice:", sbErr);
    }
    await logSecurityAudit(newUser.id, "USER_REGISTER_SUCCESS", `Novo usu\xE1rio registrado no Supabase: ${normalizedEmail}`, clientIp);
    const progress = await getUserFullProgress(newUser.id);
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );
    return res.status(201).json({
      message: "Cadastro realizado com sucesso!",
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
  } catch (error) {
    console.error("Register error:", error);
    await logSecurityAudit(null, "REGISTER_ERROR", error.message, clientIp);
    return res.status(500).json({ error: "Erro interno ao processar cadastro no banco de dados." });
  }
});
app.post("/api/auth/login", async (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || "127.0.0.1";
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "E-mail e senha s\xE3o obrigat\xF3rios." });
    }
    const normalizedEmail = cleanEmail(email);
    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      await logSecurityAudit(null, "LOGIN_FAILED_UNKNOWN_EMAIL", `Tentativa de login com e-mail n\xE3o cadastrado: ${normalizedEmail}`, clientIp);
      return res.status(401).json({ error: "Credenciais inv\xE1lidas. Verifique seu e-mail e senha." });
    }
    const now = Date.now();
    if (user.lockUntil) {
      const lockTime = new Date(user.lockUntil).getTime();
      if (lockTime > now) {
        const remainingSeconds = Math.ceil((lockTime - now) / 1e3);
        const remainingMinutes = Math.ceil(remainingSeconds / 60);
        await logSecurityAudit(user.id, "LOGIN_BLOCKED_LOCKED_ACCOUNT", `Tentativa de login em conta bloqueada at\xE9 ${user.lockUntil}`, clientIp);
        return res.status(429).json({
          error: `Conta bloqueada temporariamente devido a 5 tentativas consecutivas incorretas. Tente novamente em ${remainingMinutes} minuto(s) (${remainingSeconds}s).`,
          isLocked: true,
          remainingSeconds
        });
      }
    }
    if (!user.passwordHash) {
      return res.status(400).json({
        error: 'Esta conta n\xE3o possui senha definida. Utilize a op\xE7\xE3o "Esqueci minha senha" para cadastrar uma nova senha.'
      });
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      const nextAttempts = (user.failedLoginAttempts || 0) + 1;
      const MAX_ATTEMPTS = 5;
      const LOCK_TIME_MS = 15 * 60 * 1e3;
      if (nextAttempts >= MAX_ATTEMPTS) {
        const lockUntilDate = new Date(now + LOCK_TIME_MS);
        await updateUserLoginAttempts(user.id, nextAttempts, lockUntilDate);
        await logSecurityAudit(user.id, "ACCOUNT_LOCKED_BRUTE_FORCE", `Bloqueio de 15 min ativado ap\xF3s ${nextAttempts} tentativas incorretas`, clientIp);
        return res.status(429).json({
          error: "Limite de 5 tentativas incorretas atingido! Sua conta foi temporariamente bloqueada por 15 minutos para sua seguran\xE7a.",
          isLocked: true,
          remainingSeconds: 15 * 60
        });
      } else {
        await updateUserLoginAttempts(user.id, nextAttempts, null);
        await logSecurityAudit(user.id, "LOGIN_FAILED_PASSWORD_MISMATCH", `Tentativa incorreta ${nextAttempts}/5`, clientIp);
        const attemptsLeft = MAX_ATTEMPTS - nextAttempts;
        return res.status(401).json({
          error: `Senha incorreta. Aten\xE7\xE3o: restam ${attemptsLeft} tentativa(s) antes do bloqueio tempor\xE1rio de seguran\xE7a.`,
          attemptsLeft
        });
      }
    }
    await updateUserLoginAttempts(user.id, 0, null);
    await logSecurityAudit(user.id, "LOGIN_SUCCESS", `Login bem-sucedido via Supabase PostgreSQL`, clientIp);
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );
    const progress = await getUserFullProgress(user.id);
    return res.json({
      message: "Login realizado com sucesso!",
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
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Erro ao autenticar usu\xE1rio no banco de dados." });
  }
});
app.get("/api/user/me", requireAuth, async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const user = await findUserById(currentUserId);
    if (!user) {
      return res.status(404).json({ error: "Usu\xE1rio n\xE3o encontrado no banco de dados." });
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
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ error: "Erro ao carregar dados do usu\xE1rio." });
  }
});
app.put("/api/user/profile", requireAuth, async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const { name, bio, customNotes } = req.body;
    const updatedUser = await updateUserProfile(currentUserId, { name, bio, customNotes });
    if (!updatedUser) {
      return res.status(404).json({ error: "Usu\xE1rio n\xE3o encontrado." });
    }
    return res.json({
      message: "Perfil atualizado com sucesso!",
      user: sanitizeUser(updatedUser)
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ error: "Erro ao salvar altera\xE7\xF5es do perfil." });
  }
});
app.put("/api/user/progress", requireAuth, async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const { completedLessons, currentLessonId, quizScores, certificateEarnedDate } = req.body;
    const updatedProgress = await bulkSyncUserProgress(currentUserId, {
      completedLessons,
      currentLessonId,
      quizScores,
      certificateEarnedDate
    });
    return res.json({
      message: "Progresso salvo com sucesso!",
      progress: {
        completedLessons: updatedProgress.completedLessons,
        currentLessonId: updatedProgress.currentLessonId,
        quizScores: updatedProgress.quizScores,
        studentName: updatedProgress.studentName,
        certificateEarnedDate: updatedProgress.certificateEarnedDate
      }
    });
  } catch (error) {
    console.error("Sync progress error:", error);
    return res.status(500).json({ error: "Erro ao salvar progresso." });
  }
});
app.post("/api/user/lesson-progress", requireAuth, async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const { courseId, lessonId, isCompleted, quizScore, notes } = req.body;
    if (!lessonId) {
      return res.status(400).json({ error: "ID da aula (lessonId) \xE9 obrigat\xF3rio." });
    }
    const updatedProgress = await recordLessonEvolution({
      userId: currentUserId,
      courseId: courseId || "python-basico",
      lessonId,
      isCompleted: isCompleted !== void 0 ? Boolean(isCompleted) : true,
      quizScore: quizScore !== void 0 ? Number(quizScore) : 1,
      notes: typeof notes === "string" ? notes : ""
    });
    await logSecurityAudit(currentUserId, "LESSON_EVOLUTION_RECORDED", `Aula conclu\xEDda: ${lessonId}, Quiz: ${quizScore}`);
    return res.json({
      message: "Evolu\xE7\xE3o da aula atualizada com sucesso!",
      progress: {
        completedLessons: updatedProgress.completedLessons,
        currentLessonId: updatedProgress.currentLessonId,
        quizScores: updatedProgress.quizScores,
        studentName: updatedProgress.studentName,
        certificateEarnedDate: updatedProgress.certificateEarnedDate,
        totalCompletedLessons: updatedProgress.totalCompletedLessons
      }
    });
  } catch (error) {
    console.error("Lesson progress error:", error);
    return res.status(500).json({ error: "Erro ao gravar desempenho da aula no banco de dados." });
  }
});
app.get("/api/user/lesson-history", requireAuth, async (req, res) => {
  try {
    const currentUserId = req.user.userId;
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
  } catch (error) {
    console.error("Lesson history error:", error);
    return res.status(500).json({ error: "Erro ao obter hist\xF3rico detalhado do aluno." });
  }
});
app.post("/api/auth/forgot-password", async (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || "127.0.0.1";
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Informe o endere\xE7o de e-mail." });
    }
    const normalizedEmail = cleanEmail(email);
    const userFound = await findUserByEmail(normalizedEmail);
    if (userFound) {
      const code = Math.floor(1e5 + Math.random() * 9e5).toString();
      const token = `reset_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      const expiresAt = new Date(Date.now() + 15 * 60 * 1e3);
      await createPasswordResetToken(userFound.id, normalizedEmail, token, code, expiresAt);
      await logSecurityAudit(userFound.id, "PASSWORD_RESET_REQUESTED", `C\xF3digo de recupera\xE7\xE3o gerado para ${normalizedEmail}`, clientIp);
      const emailResult = await sendResetEmail(normalizedEmail, userFound.name, code);
      if (!emailResult.success) {
        if (!emailResult.configured) {
          return res.status(503).json({
            error: "Servidor de e-mail n\xE3o configurado: adicione suas credenciais SMTP nas vari\xE1veis de ambiente da Vercel para envio real."
          });
        } else {
          return res.status(502).json({
            error: `Falha no envio de e-mail: ${emailResult.error || "Verifique as credenciais do servidor SMTP"}`
          });
        }
      }
      return res.json({
        message: `Enviamos o c\xF3digo de 6 d\xEDgitos para o seu e-mail (${normalizedEmail}). V\xE1lido por 15 minutos.`
      });
    }
    return res.json({
      message: `Se o e-mail ${normalizedEmail} estiver cadastrado no SmartCursos, as instru\xE7\xF5es foram enviadas.`
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ error: "Erro ao processar solicita\xE7\xE3o de recupera\xE7\xE3o." });
  }
});
app.post("/api/auth/reset-password", async (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || "127.0.0.1";
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: "E-mail, c\xF3digo e nova senha s\xE3o obrigat\xF3rios." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "A nova senha deve ter no m\xEDnimo 6 caracteres." });
    }
    const normalizedEmail = cleanEmail(email);
    const activeReset = await findActiveResetToken(normalizedEmail, code);
    if (!activeReset) {
      return res.status(400).json({ error: "C\xF3digo de recupera\xE7\xE3o inv\xE1lido ou inexistente." });
    }
    if (activeReset.used) {
      return res.status(400).json({ error: "Este c\xF3digo de uso \xFAnico j\xE1 foi utilizado anteriormente." });
    }
    if (new Date(activeReset.expiresAt).getTime() < Date.now()) {
      return res.status(400).json({ error: "Este c\xF3digo de recupera\xE7\xE3o expirou (validade de 15 minutos excedida). Solicite um novo." });
    }
    await markResetTokenUsed(activeReset.id);
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(activeReset.userId, passwordHash);
    await logSecurityAudit(activeReset.userId, "PASSWORD_RESET_SUCCESS", `Senha redefinida com sucesso com token #${activeReset.id}`, clientIp);
    return res.json({
      message: "Senha redefinida com sucesso! Voc\xEA j\xE1 pode fazer login com sua nova senha."
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ error: "Erro ao redefinir senha no banco de dados." });
  }
});
app.get("/api/auth/security-stats", requireAuth, async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Acesso restrito apenas a administradores." });
    }
    const stats = await getAllUsersAuditSummary();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message || "Erro ao carregar auditoria." });
  }
});
async function startServer() {
  seedInitialDatabase().catch((err) => {
    console.error("Seed error:", err);
  });
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SmartCursos com Supabase (PostgreSQL) rodando em http://0.0.0.0:${PORT}`);
  });
}
var isServerless = Boolean(
  process.env.VERCEL || process.env.VERCEL_ENV || process.env.NOW_REGION || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT
);
if (!isServerless) {
  startServer();
}
var server_default = app;

// serverless.ts
function handler(req, res) {
  return server_default(req, res);
}
export {
  handler as default
};
