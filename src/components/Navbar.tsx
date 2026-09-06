import React from 'react';
import {
  Menu,
  Award,
  Terminal,
  User,
  LogIn,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  activeTab: 'catalog' | 'player' | 'playground' | 'testimonials' | 'about' | 'support' | 'dashboard';
  setActiveTab: (tab: 'catalog' | 'player' | 'playground' | 'testimonials' | 'about' | 'support' | 'dashboard') => void;
  completedLessonsCount: number;
  totalLessonsCount: number;
  onOpenCertificate: () => void;
  onToggleSidebar: () => void;
  currentUser: UserProfile | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  completedLessonsCount,
  totalLessonsCount,
  onOpenCertificate,
  onToggleSidebar,
  currentUser,
  onOpenAuthModal,
  onLogout,
  theme,
  onToggleTheme
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand on Left */}
          <button
            onClick={() => setActiveTab('catalog')}
            className="text-left cursor-pointer focus:outline-none flex items-center gap-2 group"
          >
            <span className="font-brand font-black text-2xl tracking-tight text-black dark:text-white select-none transition-opacity group-hover:opacity-85">
              SmartCursos
            </span>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('support')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'support'
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Apoio
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'about'
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Sobre
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'catalog'
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Cursos
            </button>
            <button
              onClick={() => setActiveTab('testimonials')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'testimonials'
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Contato
            </button>

            <span className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-2" />

            {/* Extra tools */}
            <button
              onClick={() => setActiveTab('playground')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'playground'
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Editor Python</span>
            </button>

            <button
              onClick={onOpenCertificate}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800/60 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Certificado</span>
            </button>

            <span className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-2" />

            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center"
              title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
              aria-label={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 stroke-[2.2]" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 stroke-[2.2]" />
              )}
            </button>

            {/* User Auth Controls */}
            {currentUser ? (
              <div className="flex items-center gap-2 ml-1">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/60'
                  }`}
                  title="Painel Seguro do Aluno"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="max-w-[120px] truncate">{currentUser.name}</span>
                </button>
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                  title="Sair da Conta"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer ml-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Entrar / Cadastrar</span>
              </button>
            )}

          </nav>

          {/* Right Action: Mobile menu + Mobile Theme Toggle + Mobile Auth indicator */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
              aria-label={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400 stroke-[2.2]" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700 stroke-[2.2]" />
              )}
            </button>

            {currentUser ? (
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1"
              >
                <User className="w-3 h-3" />
                <span className="max-w-[80px] truncate">{currentUser.name}</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white flex items-center gap-1"
              >
                <LogIn className="w-3 h-3" />
                <span>Entrar</span>
              </button>
            )}

            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              title="Abrir Menu Lateral"
              aria-label="Abrir Menu Lateral"
            >
              <Menu className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
