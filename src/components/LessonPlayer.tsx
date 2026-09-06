import React, { useState } from 'react';
import { Course, Lesson } from '../types';
import {
  Play,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Code2,
  HelpCircle,
  BookOpen,
  Smartphone,
  Copy,
  Check,
  Award,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LessonPlayerProps {
  course: Course;
  currentLessonIndex: number;
  onSelectLessonIndex: (index: number) => void;
  completedLessons: string[];
  onToggleComplete: (lessonId: string, quizScore?: number, notes?: string) => void;
  onOpenPlaygroundWithCode: (code: string) => void;
  onOpenCertificate: () => void;
}

export const LessonPlayer: React.FC<LessonPlayerProps> = ({
  course,
  currentLessonIndex,
  onSelectLessonIndex,
  completedLessons,
  onToggleComplete,
  onOpenPlaygroundWithCode,
  onOpenCertificate
}) => {
  const currentLesson: Lesson = course.lessons[currentLessonIndex] || course.lessons[0];
  const [activeTab, setActiveTab] = useState<'summary' | 'code' | 'quiz' | 'pydroid'>('summary');
  const [copied, setCopied] = useState(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const isCompleted = completedLessons.includes(currentLesson.id);
  const isLastLesson = currentLessonIndex === course.lessons.length - 1;
  const isFirstLesson = currentLessonIndex === 0;

  // Reset quiz state when switching lessons
  React.useEffect(() => {
    setSelectedQuizOption(null);
    setQuizSubmitted(false);
  }, [currentLesson.id]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
    const isCorrect = selectedQuizOption === currentLesson.quiz.correctIndex;
    if (isCorrect) {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.7 }
      });
      if (!isCompleted) {
        onToggleComplete(currentLesson.id, 1);
      }
    } else {
      // Record attempt in database
      onToggleComplete(currentLesson.id, 0);
    }
  };

  const handleNextLesson = () => {
    if (!isLastLesson) {
      onSelectLessonIndex(currentLessonIndex + 1);
    } else {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
      onOpenCertificate();
    }
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Course Breadcrumb & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">
            <Smartphone className="w-3.5 h-3.5" />
            <span>{course.title}</span>
            <span className="text-slate-400 dark:text-slate-500">•</span>
            <span className="text-slate-500 dark:text-slate-400">Aula {currentLesson.number} de {course.lessons.length}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {currentLesson.title}
          </h1>
        </div>

        {/* Action button: Toggle complete */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleComplete(currentLesson.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isCompleted
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs'
                : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-xs'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Aula Concluída</span>
              </>
            ) : (
              <>
                <Circle className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span>Marcar como Concluída</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Content: Video Player & Tabs (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* YouTube Video Container */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black shadow-lg">
            <div className="aspect-video w-full">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${currentLesson.youtubeId}?rel=0`}
                title={currentLesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* Next / Previous Controls */}
          <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <button
              onClick={() => !isFirstLesson && onSelectLessonIndex(currentLessonIndex - 1)}
              disabled={isFirstLesson}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all border border-slate-200 dark:border-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Aula Anterior</span>
            </button>

            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
              Progresso: {completedLessons.length}/{course.lessons.length} aulas
            </span>

            <button
              onClick={handleNextLesson}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer transition-all"
            >
              <span>{isLastLesson ? 'Concluir & Certificado' : 'Próxima Aula'}</span>
              {isLastLesson ? <Award className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Lesson Tabs: Summary, Code, Quiz, PyDroid Tip */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6 shadow-xs">
            
            {/* Tab header navigation */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <button
                onClick={() => setActiveTab('summary')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  activeTab === 'summary'
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Resumo & Conceitos</span>
              </button>

              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  activeTab === 'code'
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Código da Aula</span>
              </button>

              <button
                onClick={() => setActiveTab('quiz')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  activeTab === 'quiz'
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Quiz de Fixação</span>
              </button>

              <button
                onClick={() => setActiveTab('pydroid')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  activeTab === 'pydroid'
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Dicas Pydroid 3</span>
              </button>
            </div>

            {/* Tab 1: Summary */}
            {activeTab === 'summary' && (
              <div className="space-y-5">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {currentLesson.description}
                </p>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                    Tópicos abordados nesta aula:
                  </h4>
                  <ul className="space-y-2.5">
                    {currentLesson.summary.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                    Palavras-chave:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {currentLesson.keyConcepts.map((concept, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Code Snippet */}
            {activeTab === 'code' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-mono font-medium">aula_{currentLesson.number}.py</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => currentLesson.codeSnippet && handleCopy(currentLesson.codeSnippet)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer transition-all font-medium border border-slate-200 dark:border-slate-700"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copiado!' : 'Copiar Código'}</span>
                    </button>
                    {currentLesson.codeSnippet && (
                      <button
                        onClick={() => onOpenPlaygroundWithCode(currentLesson.codeSnippet!)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-all shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Executar no Editor Web</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 font-mono text-xs text-slate-100 overflow-x-auto whitespace-pre leading-relaxed shadow-xs">
                  {currentLesson.codeSnippet}
                </div>
              </div>
            )}

            {/* Tab 3: Quiz */}
            {activeTab === 'quiz' && (
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Teste o que aprendeu na Aula {currentLesson.number}</h3>
                </div>

                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {currentLesson.quiz.question}
                </p>

                <div className="space-y-2.5">
                  {currentLesson.quiz.options.map((option, idx) => {
                    const isSelected = selectedQuizOption === idx;
                    const isCorrect = idx === currentLesson.quiz.correctIndex;
                    let style = 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300';

                    if (quizSubmitted) {
                      if (isCorrect) {
                        style = 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold';
                      } else if (isSelected && !isCorrect) {
                        style = 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-300';
                      } else {
                        style = 'border-slate-100 dark:border-slate-800 opacity-40 text-slate-400 dark:text-slate-600';
                      }
                    } else if (isSelected) {
                      style = 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 font-medium';
                    }

                    return (
                      <button
                        key={idx}
                        disabled={quizSubmitted}
                        onClick={() => setSelectedQuizOption(idx)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${style}`}
                      >
                        <span>{option}</span>
                        {quizSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>

                {!quizSubmitted ? (
                  <button
                    onClick={handleQuizSubmit}
                    disabled={selectedQuizOption === null}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-xs"
                  >
                    Confirmar Resposta
                  </button>
                ) : (
                  <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                    selectedQuizOption === currentLesson.quiz.correctIndex
                      ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200'
                      : 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200'
                  }`}>
                    <strong>
                      {selectedQuizOption === currentLesson.quiz.correctIndex
                        ? ' Parabéns, você acertou em cheio!'
                        : ' Quase lá! Veja a explicação:'}
                    </strong>
                    <p className="mt-1 text-slate-700 dark:text-slate-300">{currentLesson.quiz.explanation}</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: PyDroid Tip */}
            {activeTab === 'pydroid' && (
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Como praticar essa aula no seu Smartphone</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <strong className="text-blue-700 dark:text-blue-400 block mb-1">1. Instalação do Pydroid 3</strong>
                    <p className="text-slate-600 dark:text-slate-400">Baixe o Pydroid 3 na Play Store. Ele já vem com Python 3 completo e terminal integrado, sem precisar de internet para rodar códigos.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <strong className="text-emerald-700 dark:text-emerald-400 block mb-1">2. Teclado com símbolos</strong>
                    <p className="text-slate-600 dark:text-slate-400">O Pydroid 3 inclui uma barra acima do teclado com atalhos para parênteses <code>( )</code>, aspas <code>" "</code> e tabulações.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <strong className="text-amber-700 dark:text-amber-400 block mb-1">3. Botão Play Amarelo</strong>
                    <p className="text-slate-600 dark:text-slate-400">Para executar, basta clicar no ícone circular amarelo de "Play" no canto inferior direito do app.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <strong className="text-purple-700 dark:text-purple-400 block mb-1">4. Salvando seus arquivos</strong>
                    <p className="text-slate-600 dark:text-slate-400">Salve seus scripts na pasta interna do celular com a extensão <code>.py</code> para poder reabrir quando quiser.</p>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Sidebar: Course Lessons Playlist with Thumbnails (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Playlist de Aulas</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{course.lessons.length} aulas gravadas</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {Math.round((completedLessons.length / course.lessons.length) * 100)}% concluído
              </span>
            </div>

            {/* Playlist list */}
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {course.lessons.map((lesson, idx) => {
                const isActive = idx === currentLessonIndex;
                const isDone = completedLessons.includes(lesson.id);

                return (
                  <button
                    key={lesson.id}
                    onClick={() => onSelectLessonIndex(idx)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer group ${
                      isActive
                        ? 'border-blue-300 dark:border-blue-700 bg-blue-50/80 dark:bg-blue-950/60 text-blue-900 dark:text-blue-100 shadow-xs font-bold'
                        : isDone
                        ? 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate pr-2">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {lesson.number}
                      </div>

                      <div className="truncate">
                        <p className={`text-xs truncate ${isActive ? 'text-blue-900 dark:text-blue-200 font-bold' : 'text-slate-800 dark:text-slate-200'}`}>
                          {lesson.title.replace(`Aula ${lesson.number}: `, '')}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">{lesson.durationMinutes} min</p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Certificate Unlock Banner */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <button
                onClick={onOpenCertificate}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs cursor-pointer transition-all"
              >
                <Award className="w-4 h-4" />
                <span>Emitir Certificado Digital</span>
              </button>
            </div>

          </div>

          {/* Instructor Box */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
              LB
            </div>
            <div className="text-xs truncate">
              <p className="font-bold text-slate-900 dark:text-white">Leonan Brayan</p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">Instrutor SmartCursos</p>
              <div className="flex items-center gap-2.5 mt-1 text-slate-600 dark:text-slate-400 font-medium">
                <a href="https://github.com/LeonanBrayan" target="_blank" rel="noreferrer" className="text-slate-700 dark:text-slate-300 hover:underline">
                  GitHub LeonanBrayan
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
