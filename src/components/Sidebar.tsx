import React from 'react';
import { Course, UserProfile } from '../types';
import {
  X,
  Award,
  Terminal,
  User,
  LogIn,
  LogOut,
  ShieldCheck,
  Github,
  Sun,
  Moon
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'catalog' | 'player' | 'playground' | 'testimonials' | 'about' | 'support' | 'dashboard';
  setActiveTab: (tab: 'catalog' | 'player' | 'playground' | 'testimonials' | 'about' | 'support' | 'dashboard') => void;
  courses: Course[];
  selectedCourse: Course;
  onSelectCourse: (course: Course) => void;
  completedLessonsCount: number;
  totalLessonsCount: number;
  onOpenCertificate: () => void;
  currentUser: UserProfile | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  courses,
  selectedCourse,
  onSelectCourse,
  completedLessonsCount,
  totalLessonsCount,
  onOpenCertificate,
  currentUser,
  onOpenAuthModal,
  onLogout,
  theme,
  onToggleTheme
}) => {
  if (!isOpen) return null;

  const handleNavClick = (tab: 'catalog' | 'player' | 'playground' | 'testimonials' | 'about' | 'support' | 'dashboard') => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dark overlay backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="absolute inset-y-0 left-0 max-w-full flex">
        <aside
          className="w-72 sm:w-80 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xl flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 transition-colors duration-200"
          role="dialog"
          aria-modal="true"
        >
          {/* Top Section */}
          <div className="p-6 overflow-y-auto">
            
            {/* Close Button X */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
              <span className="font-brand font-black text-xl text-black dark:text-white tracking-tight select-none">SmartCursos</span>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Fechar menu"
              >
                <X className="w-6 h-6 stroke-[2.5]" />
              </button>
            </div>

            {/* Theme Switcher Widget in Sidebar */}
            <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Modo de Exibição</span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {theme === 'dark' ? 'Tema Escuro' : 'Tema Claro'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 bg-slate-200/70 dark:bg-slate-900/80 p-1 rounded-xl">
                <button
                  onClick={() => theme !== 'light' && onToggleTheme()}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Claro</span>
                </button>
                <button
                  onClick={() => theme !== 'dark' && onToggleTheme()}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Escuro</span>
                </button>
              </div>
            </div>

            {/* User Profile Card in Sidebar */}
            <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              {currentUser ? (
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{currentUser.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">{currentUser.email ? currentUser.email.replace(/(.{2}).+(@.*)/, '$1***$2') : 'redacted'}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <button
                      onClick={() => handleNavClick('dashboard')}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Meu Perfil</span>
                    </button>
                    <button
                      onClick={() => {
                        onLogout();
                        onClose();
                      }}
                      className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sair</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-1">
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2.5">
                    Faça login com seu e-mail para salvar suas aulas com isolamento de dados.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAuthModal();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Entrar ou Cadastrar</span>
                  </button>
                </div>
              )}
            </div>

            {/* Primary Navigation Items */}
            <nav className="py-6 space-y-4">
              <button
                onClick={() => handleNavClick('support')}
                className={`w-full text-left font-bold text-lg transition-colors cursor-pointer ${
                  activeTab === 'support' ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-blue-600 dark:text-blue-400 hover:opacity-80'
                }`}
              >
                Apoio
              </button>

              <button
                onClick={() => handleNavClick('about')}
                className={`w-full text-left font-bold text-lg transition-colors cursor-pointer ${
                  activeTab === 'about' ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-blue-600 dark:text-blue-400 hover:opacity-80'
                }`}
              >
                Sobre
              </button>

              <button
                onClick={() => handleNavClick('catalog')}
                className={`w-full text-left font-bold text-lg transition-colors cursor-pointer ${
                  activeTab === 'catalog' ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-blue-600 dark:text-blue-400 hover:opacity-80'
                }`}
              >
                Cursos
              </button>

              <button
                onClick={() => handleNavClick('testimonials')}
                className={`w-full text-left font-bold text-lg transition-colors cursor-pointer ${
                  activeTab === 'testimonials' ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-blue-600 dark:text-blue-400 hover:opacity-80'
                }`}
              >
                Contato
              </button>
            </nav>

            {/* Additional Features */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Ferramentas Práticas:
              </p>

              <button
                onClick={() => handleNavClick('playground')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
              >
                <Terminal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Editor Python Web</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenCertificate();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors text-left cursor-pointer"
              >
                <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Emitir Certificado</span>
              </button>
            </div>

          </div>

          {/* Bottom Footer Section in Sidebar */}
          <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/90">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Auth JWT & Isolamento
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://github.com/LeonanBrayan/SmartCursos"
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  title="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
};
