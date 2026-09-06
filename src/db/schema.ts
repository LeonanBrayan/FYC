import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

// ============================================================================
// 1. TABELA: USERS (Usuários da plataforma)
// Atende normas de segurança: senhas criptografadas (bcrypt), bloqueio por força bruta
// ============================================================================
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Identificador único (Firebase UID ou UUID)
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'), // Hash bcrypt (vazio caso autentique via Google)
  role: text('role').notNull().default('student'), // 'student' | 'admin'
  bio: text('bio').default('Estudante SmartCursos'),
  customNotes: text('custom_notes').default(''),
  failedLoginAttempts: integer('failed_login_attempts').notNull().default(0),
  lockUntil: timestamp('lock_until'), // Timestamp de bloqueio temporário por tentativas
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================================================
// 2. TABELA: COURSES (Cursos disponíveis)
// ============================================================================
export const courses = pgTable('courses', {
  id: text('id').primaryKey(), // ex: 'python-basico'
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  category: text('category').notNull().default('python'),
  level: text('level').notNull().default('Iniciante'),
  totalLessons: integer('total_lessons').notNull().default(10),
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================================================
// 3. TABELA: LESSON_PROGRESS (Desempenho e aulas assistidas por aluno)
// Relacionamento com users (user_id -> users.id)
// Guarda quais aulas já foram assistidas e desempenho no quiz da aula
// ============================================================================
export const lessonProgress = pgTable('lesson_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  courseId: text('course_id').notNull().default('python-basico'),
  lessonId: text('lesson_id').notNull(), // ex: 'py-aula-1'
  isCompleted: boolean('is_completed').notNull().default(false),
  watchedAt: timestamp('watched_at').defaultNow(),
  quizScore: integer('quiz_score').default(0), // 1 (acertou) ou 0 (errou)
  quizAttempts: integer('quiz_attempts').notNull().default(1),
  notes: text('notes').default(''),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  uniqueIndex('user_lesson_idx').on(table.userId, table.lessonId),
]);

// ============================================================================
// 4. TABELA: USER_PROGRESS_SUMMARY (Resumo geral da evolução do aluno)
// Relacionamento 1:1 com users
// ============================================================================
export const userProgressSummary = pgTable('user_progress_summary', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  currentLessonId: text('current_lesson_id').notNull().default('py-aula-1'),
  totalCompletedLessons: integer('total_completed_lessons').notNull().default(0),
  certificateEarnedDate: timestamp('certificate_earned_date'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================================================
// 5. TABELA: PASSWORD_RESET_TOKENS (Recuperação de senha segura)
// Tokens descartáveis de uso único com expiração
// ============================================================================
export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  email: text('email').notNull(),
  token: text('token').notNull().unique(),
  code: text('code').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================================================
// 6. TABELA: SECURITY_AUDIT_LOGS (Auditoria de Segurança da Informação)
// Registro de eventos críticos (LGPD / ISO 27001)
// ============================================================================
export const securityAuditLogs = pgTable('security_audit_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(), // 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'ACCOUNT_LOCKED', etc.
  details: text('details'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================================================
// RELACIONAMENTOS (Drizzle ORM Relations)
// ============================================================================
export const usersRelations = relations(users, ({ one, many }) => ({
  lessonProgress: many(lessonProgress),
  progressSummary: one(userProgressSummary, {
    fields: [users.id],
    references: [userProgressSummary.userId],
  }),
  resetTokens: many(passwordResetTokens),
  auditLogs: many(securityAuditLogs),
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  user: one(users, {
    fields: [lessonProgress.userId],
    references: [users.id],
  }),
}));

export const userProgressSummaryRelations = relations(userProgressSummary, ({ one }) => ({
  user: one(users, {
    fields: [userProgressSummary.userId],
    references: [users.id],
  }),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

export const securityAuditLogsRelations = relations(securityAuditLogs, ({ one }) => ({
  user: one(users, {
    fields: [securityAuditLogs.userId],
    references: [users.id],
  }),
}));
