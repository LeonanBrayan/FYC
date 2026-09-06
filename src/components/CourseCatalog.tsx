import React from 'react';
import { Course } from '../types';
import { CourseLogo } from './CourseLogo';

interface CourseCatalogProps {
  courses: Course[];
  completedLessons: string[];
  onSelectCourse: (course: Course) => void;
  onSelectLesson: (course: Course, lessonIndex: number) => void;
  onOpenPlayground?: () => void;
}

export const CourseCatalog: React.FC<CourseCatalogProps> = ({
  courses,
  completedLessons,
  onSelectCourse,
}) => {
  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header matching Screenshot: "Nossos cursos" + "Aprenda com facilidade com nossas video-aulas intuitivas" */}
      <div className="mb-8 text-left">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Nossos cursos
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
          Aprenda com facilidade com nossas video-aulas intuitivas
        </p>
      </div>

      {/* 4 Cards Grid exactly as shown in screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {courses.map((course) => {
          const isPython = course.category === 'python' || course.id.includes('python');
          const isAccessible = isPython && course.isAvailable;
          const completedInThisCourse = course.lessons.filter((l) => completedLessons.includes(l.id)).length;
          const displayTitle = course.cardTitle || course.title.toUpperCase();
          const logoType = course.logoType || (course.id.includes('python') ? 'python' : course.id.includes('html') ? 'html5' : course.id.includes('css') ? 'css3' : 'php');

          return (
            <div
              key={course.id}
              onClick={() => {
                if (isAccessible) {
                  onSelectCourse(course);
                }
              }}
              className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-6 flex flex-col items-center justify-between text-center select-none min-h-[260px] transition-all duration-200 ${
                isAccessible
                  ? 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer group'
                  : 'cursor-default opacity-85'
              }`}
            >
              {/* Logo container */}
              <div className="w-full flex-1 flex items-center justify-center pt-2 pb-3">
                <div className={`w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center transition-transform duration-200 ${
                  isAccessible ? 'transform group-hover:scale-105' : ''
                }`}>
                  <CourseLogo type={logoType} className="w-full h-full" />
                </div>
              </div>

              {/* Course Title in uppercase */}
              <div className="w-full mt-2">
                <h3 className={`text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 tracking-wide uppercase transition-colors ${
                  isAccessible ? 'group-hover:text-blue-600 dark:group-hover:text-blue-400' : ''
                }`}>
                  {displayTitle}
                </h3>

                {isAccessible ? (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                    {completedInThisCourse > 0
                      ? `${completedInThisCourse}/${course.lessons.length} aulas concluídas`
                      : `${course.lessons.length} videoaulas disponíveis`}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Em breve
                  </p>
                )}
              </div>

              {/* Action Button: "Acessar" for Python, "Em breve" for others */}
              <div className="w-full mt-4">
                {isAccessible ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCourse(course);
                    }}
                    className="w-full max-w-[150px] mx-auto py-1.5 px-6 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 active:bg-slate-100 dark:active:bg-slate-600 border border-slate-300/90 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium shadow-2xs hover:border-slate-400 dark:hover:border-slate-600 transition-all cursor-pointer block"
                  >
                    Acessar
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full max-w-[150px] mx-auto py-1.5 px-6 rounded-lg bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-xs sm:text-sm font-medium cursor-not-allowed select-none block"
                  >
                    Em breve
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
