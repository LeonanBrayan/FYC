import { eq, sql } from 'drizzle-orm';
import { db } from './index.ts';
import { lessonProgress, userProgressSummary, users } from './schema.ts';

// ----------------------------------------------------------------------------
// Funções de Gestão de Progresso e Desempenho no Supabase (PostgreSQL)
// ----------------------------------------------------------------------------

export async function getUserFullProgress(userId: number) {
  try {
    // 1. Obter resumo geral
    const summaryResult = await db.select().from(userProgressSummary).where(eq(userProgressSummary.userId, userId)).limit(1);
    const summary = summaryResult[0] || null;

    // 2. Obter todas as aulas registradas/assistidas para este usuário
    const lessons = await db.select()
      .from(lessonProgress)
      .where(eq(lessonProgress.userId, userId))
      .orderBy(lessonProgress.lessonId);

    // 3. Obter nome do usuário
    const userResult = await db.select({ name: users.name }).from(users).where(eq(users.id, userId)).limit(1);
    const studentName = userResult[0]?.name || 'Aluno';

    const completedLessons: string[] = [];
    const quizScores: Record<string, number> = {};
    const detailedLessons: Array<{
      lessonId: string;
      isCompleted: boolean;
      watchedAt: Date | null;
      quizScore: number | null;
      quizAttempts: number;
      notes: string | null;
    }> = [];

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
        notes: l.notes,
      });
    }

    return {
      userId,
      studentName,
      completedLessons,
      currentLessonId: summary?.currentLessonId || (completedLessons.length > 0 ? completedLessons[completedLessons.length - 1] : 'py-aula-1'),
      quizScores,
      certificateEarnedDate: summary?.certificateEarnedDate ? new Date(summary.certificateEarnedDate).toISOString() : undefined,
      totalCompletedLessons: completedLessons.length,
      detailedHistory: detailedLessons,
    };
  } catch (error) {
    console.error('Database query failed in getUserFullProgress:', error);
    throw new Error('Falha ao consultar progresso no banco de dados.', { cause: error });
  }
}

export async function recordLessonEvolution(data: {
  userId: number;
  courseId?: string;
  lessonId: string;
  isCompleted?: boolean;
  quizScore?: number;
  notes?: string;
}) {
  try {
    const courseId = data.courseId || 'python-basico';
    const isCompleted = data.isCompleted ?? true;
    const now = new Date();

    // 1. Upsert em lesson_progress com relacionamento de chave única (userId, lessonId)
    await db.insert(lessonProgress)
      .values({
        userId: data.userId,
        courseId,
        lessonId: data.lessonId,
        isCompleted,
        watchedAt: now,
        quizScore: data.quizScore !== undefined ? data.quizScore : 1,
        quizAttempts: 1,
        notes: data.notes || '',
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [lessonProgress.userId, lessonProgress.lessonId],
        set: {
          isCompleted,
          watchedAt: now,
          ...(data.quizScore !== undefined ? { quizScore: data.quizScore } : {}),
          ...(data.notes !== undefined ? { notes: data.notes } : {}),
          quizAttempts: sql`${lessonProgress.quizAttempts} + 1`,
          updatedAt: now,
        },
      });

    // 2. Recalcular total de aulas concluídas
    const completedRows = await db.select({ count: sql<number>`count(*)` })
      .from(lessonProgress)
      .where(sql`${lessonProgress.userId} = ${data.userId} AND ${lessonProgress.isCompleted} = true`);
    
    const totalCompleted = Number(completedRows[0]?.count || 0);

    // 3. Atualizar resumo de progresso
    await db.insert(userProgressSummary)
      .values({
        userId: data.userId,
        currentLessonId: data.lessonId,
        totalCompletedLessons: totalCompleted,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: userProgressSummary.userId,
        set: {
          currentLessonId: data.lessonId,
          totalCompletedLessons: totalCompleted,
          updatedAt: now,
        },
      });

    return await getUserFullProgress(data.userId);
  } catch (error) {
    console.error('Database mutation failed in recordLessonEvolution:', error);
    throw new Error('Falha ao registrar evolução da aula no banco de dados.', { cause: error });
  }
}

export async function bulkSyncUserProgress(userId: number, data: {
  completedLessons?: string[];
  currentLessonId?: string;
  quizScores?: Record<string, number>;
  certificateEarnedDate?: string;
}) {
  try {
    const now = new Date();

    // Se houver lista de aulas concluídas, registrar cada uma
    if (data.completedLessons && Array.isArray(data.completedLessons)) {
      for (const lessonId of data.completedLessons) {
        const score = data.quizScores && data.quizScores[lessonId] !== undefined ? data.quizScores[lessonId] : 1;
        await db.insert(lessonProgress)
          .values({
            userId,
            courseId: 'python-basico',
            lessonId,
            isCompleted: true,
            watchedAt: now,
            quizScore: score,
            quizAttempts: 1,
            updatedAt: now,
          })
          .onConflictDoUpdate({
            target: [lessonProgress.userId, lessonProgress.lessonId],
            set: {
              isCompleted: true,
              quizScore: score,
              updatedAt: now,
            },
          });
      }
    }

    // Atualizar resumo
    const certDate = data.certificateEarnedDate ? new Date(data.certificateEarnedDate) : undefined;
    const completedCount = data.completedLessons ? data.completedLessons.length : 0;

    await db.insert(userProgressSummary)
      .values({
        userId,
        currentLessonId: data.currentLessonId || 'py-aula-1',
        totalCompletedLessons: completedCount,
        certificateEarnedDate: certDate,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: userProgressSummary.userId,
        set: {
          ...(data.currentLessonId ? { currentLessonId: data.currentLessonId } : {}),
          totalCompletedLessons: completedCount,
          ...(certDate ? { certificateEarnedDate: certDate } : {}),
          updatedAt: now,
        },
      });

    return await getUserFullProgress(userId);
  } catch (error) {
    console.error('Database update failed in bulkSyncUserProgress:', error);
    throw new Error('Falha ao sincronizar progresso no banco de dados.', { cause: error });
  }
}
