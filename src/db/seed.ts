import { db } from './index.ts';
import { courses } from './schema.ts';

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

    console.log('[Supabase] Catálogo de cursos inicializado com sucesso.');
  } catch (error) {
    console.error('[Supabase Seed Error]:', error);
  }
}
