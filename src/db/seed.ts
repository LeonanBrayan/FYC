import bcrypt from 'bcryptjs';
import { db } from './index.ts';
import { courses, users, lessonProgress, userProgressSummary } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function seedInitialDatabase() {
  try {
    // 1. Seed courses
    await db.insert(courses)
      .values([
        {
          id: 'python-basico-mobile',
          title: 'Curso de Python no Celular',
          slug: 'python-basico',
          category: 'python',
          level: 'Iniciante',
          totalLessons: 10,
        },
        {
          id: 'web-frontend-mobile',
          title: 'Desenvolvimento Web Mobile',
          slug: 'web-frontend',
          category: 'web',
          level: 'Iniciante',
          totalLessons: 8,
        }
      ])
      .onConflictDoNothing();

    // 2. Seed default users
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('senha123', salt);

    // Demo User: Leonan Bryan
    const existingLeonan = await db.select().from(users).where(eq(users.email, 'leonanbryan@gmail.com')).limit(1);
    let leonanId: number;

    if (existingLeonan.length === 0) {
      const [leonan] = await db.insert(users).values({
        uid: 'usr_leonan_sql_101',
        name: 'Leonan Bryan',
        email: 'leonanbryan@gmail.com',
        passwordHash,
        role: 'student',
        bio: 'Estudante de Python e Desenvolvimento Web',
        customNotes: 'Minhas anotações privadas salvas no Cloud SQL PostgreSQL.',
        failedLoginAttempts: 0,
      }).returning();
      leonanId = leonan.id;

      // Seed progress for Leonan
      await db.insert(userProgressSummary).values({
        userId: leonanId,
        currentLessonId: 'py-aula-3',
        totalCompletedLessons: 2,
      }).onConflictDoNothing();

      await db.insert(lessonProgress).values([
        {
          userId: leonanId,
          courseId: 'python-basico-mobile',
          lessonId: 'py-aula-1',
          isCompleted: true,
          quizScore: 1,
          quizAttempts: 1,
          notes: 'Primeira aula de Python finalizada!',
        },
        {
          userId: leonanId,
          courseId: 'python-basico-mobile',
          lessonId: 'py-aula-2',
          isCompleted: true,
          quizScore: 1,
          quizAttempts: 1,
          notes: 'Input e variáveis compreendidos com sucesso.',
        }
      ]).onConflictDoNothing();
    }

    // Demo User 2: Mariana Silva (para testar estrito isolamento multitenant)
    const existingMariana = await db.select().from(users).where(eq(users.email, 'mariana.silva@exemplo.com')).limit(1);
    if (existingMariana.length === 0) {
      const [mariana] = await db.insert(users).values({
        uid: 'usr_mariana_sql_202',
        name: 'Mariana Silva',
        email: 'mariana.silva@exemplo.com',
        passwordHash,
        role: 'student',
        bio: 'Estudante de desenvolvimento frontend',
        customNotes: 'Anotações sigilosas de Mariana no Cloud SQL.',
        failedLoginAttempts: 0,
      }).returning();

      await db.insert(userProgressSummary).values({
        userId: mariana.id,
        currentLessonId: 'py-aula-9',
        totalCompletedLessons: 8,
        certificateEarnedDate: new Date(),
      }).onConflictDoNothing();

      const marianaLessons = ['py-aula-1', 'py-aula-2', 'py-aula-3', 'py-aula-4', 'py-aula-5', 'py-aula-6', 'py-aula-7', 'py-aula-8'];
      for (const lId of marianaLessons) {
        await db.insert(lessonProgress).values({
          userId: mariana.id,
          courseId: 'python-basico-mobile',
          lessonId: lId,
          isCompleted: true,
          quizScore: 1,
          quizAttempts: 1,
        }).onConflictDoNothing();
      }
    }

    console.log('[Cloud SQL] Banco de dados semeado com sucesso!');
  } catch (error) {
    console.error('[Cloud SQL Seed Error]:', error);
  }
}
