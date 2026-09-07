import React, { useState, useEffect } from 'react';
import {
  User,
  Lock,
  FileText,
  Save,
  CheckCircle2,
  LogOut,
  GraduationCap,
  Award,
  PlayCircle,
  Check,
  RefreshCw
} from 'lucide-react';
import { UserProfile, UserProgress } from '../types';
import { COURSES_DATA } from '../data/coursesData';
import { authService, DetailedLessonHistory } from '../services/authService';

interface UserDashboardProps {
  user: UserProfile;
  progress: UserProgress;
  token?: string;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onLogout: () => void;
  onNavigateToCourse: (lessonIndex?: number) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  progress,
  onUpdateUser,
  onLogout,
  onNavigateToCourse
}) => {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [customNotes, setCustomNotes] = useState(user.customNotes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'evolution' | 'profile' | 'notes'>('evolution');

  // Relational history from backend
  const [lessonHistory, setLessonHistory] = useState<DetailedLessonHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const featuredCourse = COURSES_DATA[0];
  const totalCourseLessons = featuredCourse.lessons.length;
  const completedCount = progress.completedLessons.length;
  const progressPercent = Math.min(100, Math.round((completedCount / totalCourseLessons) * 100));

  useEffect(() => {
    setName(user.name);
    setBio(user.bio || '');
    setCustomNotes(user.customNotes || '');
  }, [user]);

  const loadLessonDetails = async () => {
    setIsLoadingHistory(true);
    try {
      const historyData = await authService.getLessonHistory();
      if (historyData && Array.isArray(historyData.detailedHistory)) {
        setLessonHistory(historyData.detailedHistory);
      }
    } catch (e) {
      console.error('Failed to load lesson details:', e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadLessonDetails();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const data = await authService.updateProfile({
        name,
        bio,
        customNotes
      });
      onUpdateUser(data.user);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Erro ao salvar alterações.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Top Banner: Greeting */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-cyan-400/20 border-2 border-cyan-300/40 flex items-center justify-center text-cyan-200 text-2xl font-black shadow-inner">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {user.name}
                </h1>
              </div>
              <p className="text-blue-200 text-sm mt-0.5 flex items-center gap-2">
                <span>{user.email ? user.email.replace(/(.{2}).+(@.*)/, '$1***$2') : 'redacted'}</span>
                <span className="text-blue-400">•</span>
                <span className="text-xs text-blue-300">Aluno</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <button
              onClick={() => onNavigateToCourse()}
              className="px-4 py-2 rounded-xl bg-white text-indigo-950 font-bold text-xs sm:text-sm hover:bg-blue-50 transition-all cursor-pointer shadow-md flex items-center gap-1.5"
            >
              <PlayCircle className="w-4 h-4 text-blue-600" />
              <span>Continuar Aulas</span>
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-rose-500/20 text-white hover:text-rose-200 border border-white/20 hover:border-rose-400/40 text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('evolution')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'evolution'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Evolução nas Aulas</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Meu Perfil</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'notes'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Minhas Anotações</span>
        </button>
      </div>

      {/* TAB 1: EVOLUÇÃO NAS AULAS */}
      {activeTab === 'evolution' && (
        <div className="space-y-8">
          
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Aulas Assistidas
                </span>
                <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <PlayCircle className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {completedCount}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  de {totalCourseLessons} aulas
                </span>
              </div>
              <div className="mt-3 w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                {progressPercent}% do curso concluído
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Desempenho nos Quizzes
                </span>
                <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <Award className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {completedCount > 0 ? '100%' : '0%'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  de acertos
                </span>
              </div>
              <p className="mt-4 text-[11px] text-slate-500 dark:text-slate-400">
                Aproveitamento nas atividades práticas
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Certificado de Conclusão
                </span>
                <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <GraduationCap className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {completedCount >= totalCourseLessons ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Disponível para emissão!
                    </span>
                  ) : (
                    <span>{totalCourseLessons - completedCount} aulas restantes</span>
                  )}
                </span>
              </div>
              <p className="mt-4 text-[11px] text-slate-500 dark:text-slate-400">
                Disponível ao concluir todas as aulas
              </p>
            </div>

          </div>

          {/* List of Lessons Evolution */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Acompanhamento Aula por Aula
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Veja abaixo as aulas que você já concluiu e o seu aproveitamento.
                </p>
              </div>

              <button
                onClick={loadLessonDetails}
                disabled={isLoadingHistory}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHistory ? 'animate-spin text-blue-600' : ''}`} />
                <span>Atualizar</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {featuredCourse.lessons.map((lesson, idx) => {
                const isWatched = progress.completedLessons.includes(lesson.id);

                return (
                  <div
                    key={lesson.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                        isWatched
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        {isWatched ? <Check className="w-4 h-4" /> : lesson.number}
                      </span>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                            Aula {lesson.number}: {lesson.title}
                          </h3>
                          {isWatched && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                              Assistida
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <span>Duração: {lesson.durationMinutes} min</span>
                          <span>•</span>
                          <span>
                            Quiz: {isWatched ? 'Concluído com sucesso' : 'Pendente'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => onNavigateToCourse(idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isWatched
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                        }`}
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>{isWatched ? 'Reassistir' : 'Assistir Aula'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: EDITAR PERFIL */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Informações Pessoais
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Mantenha seu nome atualizado para a emissão correta dos seus certificados.
            </p>

            {saveSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Dados atualizados com sucesso!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Nome Completo (Emitido no Certificado)
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Endereço de E-mail
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email ? user.email.replace(/(.{2}).+(@.*)/, '$1***$2') : 'redacted'}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-xl cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Biografia / Objetivos de Aprendizado
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Conte um pouco sobre suas metas de estudo..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Salvando alterações...' : 'Salvar Alterações'}</span>
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Dados da Conta</span>
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Tipo de Conta:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Aluno</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Membro desde:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Banco de Dados:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                    Supabase (PostgreSQL)
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Tabela:</span>
                  <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">public.users</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Status da Conta:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ativa no Supabase
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: ANOTAÇÕES DO ALUNO */}
      {activeTab === 'notes' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs max-w-3xl">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
              <Lock className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Caderno de Anotações Pessoal
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Suas notas ficam salvas na sua conta e só você tem acesso.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
            <div>
              <textarea
                rows={8}
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Escreva aqui seus resumos de estudo, códigos de exemplo ou dúvidas..."
                className="w-full p-4 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl font-mono focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
            </div>

            {saveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Anotações salvas com sucesso!</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Salvando...' : 'Salvar Anotações'}</span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
