import React, { useState, useEffect } from 'react';
import { COURSES_DATA } from './data/coursesData';
import { Course, UserProfile, UserProgress } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { HeroBanner } from './components/HeroBanner';
import { CourseCatalog } from './components/CourseCatalog';
import { LessonPlayer } from './components/LessonPlayer';
import { PythonPlayground } from './components/PythonPlayground';
import { TestimonialsSection } from './components/TestimonialsSection';
import { AboutSection } from './components/AboutSection';
import { SupportSection } from './components/SupportSection';
import { CertificateModal } from './components/CertificateModal';
import { AuthModal } from './components/AuthModal';
import { UserDashboard } from './components/UserDashboard';
import { Footer } from './components/Footer';
import { authService } from './services/authService';
import confetti from 'canvas-confetti';

export default function App() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'player' | 'playground' | 'testimonials' | 'about' | 'support' | 'dashboard'>('catalog');
  const [selectedCourse, setSelectedCourse] = useState<Course>(COURSES_DATA[0]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  
  // Auth & Isolated User State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => authService.getStoredUser());
  const [jwtToken, setJwtToken] = useState<string | null>(() => authService.getToken());

  const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('smartcursos_completed_lessons');
      return saved ? JSON.parse(saved) : ['py-aula-1'];
    } catch {
      return ['py-aula-1'];
    }
  });

  const [studentName, setStudentName] = useState<string>(() => {
    try {
      return localStorage.getItem('smartcursos_student_name') || 'Leonan Bryan';
    } catch {
      return 'Leonan Bryan';
    }
  });

  const [isCertificateOpen, setIsCertificateOpen] = useState<boolean>(false);
  const [playgroundCode, setPlaygroundCode] = useState<string | undefined>(undefined);

  // Dark / Light Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const savedTheme = localStorage.getItem('smartcursos_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // fallback to light
    }
    return 'light';
  });

  useEffect(() => {
    try {
      localStorage.setItem('smartcursos_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Check valid session on mount with strict backend verification
  useEffect(() => {
    async function verifySession() {
      if (jwtToken) {
        try {
          const profileData = await authService.getMyProfile();
          if (profileData && profileData.user) {
            setCurrentUser(profileData.user);
            if (profileData.user.name) {
              setStudentName(profileData.user.name);
            }
            if (profileData.progress && Array.isArray(profileData.progress.completedLessons)) {
              setCompletedLessons(profileData.progress.completedLessons);
            }
          } else {
            setCurrentUser(null);
            setJwtToken(null);
          }
        } catch (err) {
          console.error('Session check error:', err);
        }
      }
    }
    verifySession();
  }, [jwtToken]);

  // Sync completed lessons to localStorage & backend (if logged in)
  useEffect(() => {
    try {
      localStorage.setItem('smartcursos_completed_lessons', JSON.stringify(completedLessons));
      if (jwtToken) {
        authService.syncProgress({ completedLessons }).catch(console.error);
      }
    } catch (e) {
      console.error(e);
    }
  }, [completedLessons, jwtToken]);

  // Sync student name to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('smartcursos_student_name', studentName);
    } catch (e) {
      console.error(e);
    }
  }, [studentName]);

  const handleToggleComplete = async (lessonId: string, quizScore?: number, notes?: string) => {
    const exists = completedLessons.includes(lessonId);
    const willBeCompleted = !exists;

    setCompletedLessons((prev) => {
      if (exists) {
        return prev.filter((id) => id !== lessonId);
      } else {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 }
        });
        return [...prev, lessonId];
      }
    });

    if (jwtToken) {
      try {
        await authService.recordLessonEvolution({
          lessonId,
          isCompleted: willBeCompleted,
          quizScore: quizScore !== undefined ? quizScore : (willBeCompleted ? 1 : 0),
          notes
        });
      } catch (err) {
        console.error('Failed to record lesson evolution to database:', err);
      }
    }
  };

  const handleSelectCourse = (course: Course) => {
    const isPython = course.category === 'python' || course.id.includes('python');
    if (!isPython || !course.isAvailable) {
      return;
    }
    setSelectedCourse(course);
    setCurrentLessonIndex(0);
    setActiveTab('player');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectLesson = (course: Course, lessonIndex: number) => {
    const isPython = course.category === 'python' || course.id.includes('python');
    if (!isPython || !course.isAvailable) {
      return;
    }
    setSelectedCourse(course);
    setCurrentLessonIndex(lessonIndex);
    setActiveTab('player');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPlaygroundWithCode = (code: string) => {
    setPlaygroundCode(code);
    setActiveTab('playground');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = (user: UserProfile, progress?: UserProgress) => {
    setCurrentUser(user);
    setJwtToken(authService.getToken());
    if (user.name) {
      setStudentName(user.name);
    }
    if (progress && Array.isArray(progress.completedLessons)) {
      setCompletedLessons(progress.completedLessons);
    }
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    authService.clearSession();
    setCurrentUser(null);
    setJwtToken(null);
    if (activeTab === 'dashboard') {
      setActiveTab('catalog');
    }
  };

  // Total lessons in featured course
  const totalFeaturedLessons = selectedCourse.lessons.length;
  const completedInCurrentCourse = selectedCourse.lessons.filter((l) => completedLessons.includes(l.id)).length;
  const totalAllLessonsCount = COURSES_DATA.reduce((acc, c) => acc + c.lessons.length, 0);

  const currentProgressState: UserProgress = {
    completedLessons,
    currentLessonId: selectedCourse.lessons[currentLessonIndex]?.id || 'py-aula-1',
    quizScores: {},
    studentName: currentUser ? currentUser.name : studentName
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200">
      
      {/* Lateral Menu / Drawer */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        courses={COURSES_DATA}
        selectedCourse={selectedCourse}
        onSelectCourse={handleSelectCourse}
        completedLessonsCount={completedLessons.length}
        totalLessonsCount={totalAllLessonsCount}
        onOpenCertificate={() => setIsCertificateOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        completedLessonsCount={completedLessons.length}
        totalLessonsCount={totalAllLessonsCount}
        onOpenCertificate={() => setIsCertificateOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'catalog' && (
          <>
            <HeroBanner
              onStartCourse={() => {
                setSelectedCourse(COURSES_DATA[0]);
                setActiveTab('player');
              }}
              onOpenPlayground={() => setActiveTab('playground')}
              completedCount={completedInCurrentCourse}
              totalCount={totalFeaturedLessons}
            />

            <CourseCatalog
              courses={COURSES_DATA}
              completedLessons={completedLessons}
              onSelectCourse={handleSelectCourse}
              onSelectLesson={handleSelectLesson}
              onOpenPlayground={() => setActiveTab('playground')}
            />
          </>
        )}

        {activeTab === 'player' && (
          <LessonPlayer
            course={selectedCourse}
            currentLessonIndex={currentLessonIndex}
            onSelectLessonIndex={(idx) => {
              setCurrentLessonIndex(idx);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            completedLessons={completedLessons}
            onToggleComplete={handleToggleComplete}
            onOpenPlaygroundWithCode={handleOpenPlaygroundWithCode}
            onOpenCertificate={() => setIsCertificateOpen(true)}
          />
        )}

        {activeTab === 'playground' && (
          <PythonPlayground initialCode={playgroundCode} />
        )}

        {activeTab === 'testimonials' && (
          <TestimonialsSection />
        )}

        {activeTab === 'about' && (
          <AboutSection onStartCourse={() => {
            setSelectedCourse(COURSES_DATA[0]);
            setActiveTab('player');
          }} />
        )}

        {activeTab === 'support' && (
          <SupportSection />
        )}

        {activeTab === 'dashboard' && currentUser && jwtToken && (
          <UserDashboard
            user={currentUser}
            progress={currentProgressState}
            token={jwtToken}
            onUpdateUser={(updated) => {
              setCurrentUser(updated);
              setStudentName(updated.name);
            }}
            onLogout={handleLogout}
            onNavigateToCourse={(lessonIndex?: number) => {
              setSelectedCourse(COURSES_DATA[0]);
              if (lessonIndex !== undefined) {
                setCurrentLessonIndex(lessonIndex);
              }
              setActiveTab('player');
            }}
          />
        )}
      </main>

      {/* Auth Modal (Login / Cadastro / Recuperação de Senha / Proteção Força Bruta) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        studentName={studentName}
        onUpdateStudentName={setStudentName}
        courseTitle={selectedCourse.title}
        completedCount={completedInCurrentCourse}
        totalCount={totalFeaturedLessons}
      />

      {/* Footer */}
      <Footer
        onOpenPlayground={() => {
          setActiveTab('playground');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCourses={() => {
          setActiveTab('catalog');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

    </div>
  );
}
