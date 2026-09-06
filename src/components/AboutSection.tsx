import React from 'react';
import { Smartphone, Code, Heart, CheckCircle2, User, Globe, Youtube, Github } from 'lucide-react';

export const AboutSection: React.FC<{ onStartCourse: () => void }> = ({ onStartCourse }) => {
  return (
    <div className="py-10 max-w-4xl mx-auto px-4 sm:px-6">
      
      {/* Header */}
      <div className="text-center space-y-3 mb-8">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 px-3 py-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 rounded-full">
          Nossa História & Missão
        </span>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Sobre o SmartCursos
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
          Uma plataforma gratuita criada para provar que a falta de um computador nunca deve ser um obstáculo para aprender programação.
        </p>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
        
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-md">
            LB
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Criado por Leonan Brayan</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Desenvolvedor & Criador de Conteúdo Educacional</p>
          </div>
        </div>

        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <p>
            O <strong className="text-slate-900 dark:text-white">SmartCursos</strong> nasceu com uma missão clara: democratizar o acesso ao aprendizado de linguagens de programação como o <strong className="text-slate-900 dark:text-white">Python 3</strong> para quem tem apenas um celular smartphone em mãos.
          </p>
          <p>
            Muitos estudantes que ingressam no ensino médio, faculdade ou cursos técnicos não possuem computadores ou notebooks em casa. Ao ensinar utilizando o aplicativo <strong className="text-slate-900 dark:text-white">Pydroid 3</strong>, o SmartCursos permitiu que centenas de alunos dessem seus primeiros passos em algoritmos e lógica de programação de forma prática, gratuita e sem complicação.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
              <Smartphone className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs">Foco no Celular</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">Aulas estruturadas com base no Pydroid 3 para Android.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
              <Heart className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs">100% Gratuito</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">Aulas públicas e didáticas no YouTube.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
              <Code className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs">Didática Prática</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">Exemplos do dia a dia e exercícios resolvidos passo a passo.</p>
          </div>
        </div>

        {/* Action button */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/LeonanBrayan/SmartCursos"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>

          <button
            onClick={onStartCourse}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 cursor-pointer transition-all"
          >
            Acessar Cursos & Videoaulas
          </button>
        </div>

      </div>

    </div>
  );
};
