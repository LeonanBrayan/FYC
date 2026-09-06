import React from 'react';
import { Share2, Star, Youtube, Github } from 'lucide-react';

export const SupportSection: React.FC = () => {
  return (
    <div className="py-10 max-w-5xl mx-auto px-4 sm:px-6">
      
      {/* Header */}
      <div className="text-center space-y-3 mb-8">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 px-3 py-1 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 rounded-full">
          Comunidade & Apoio
        </span>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Como Apoiar o SmartCursos
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
          O SmartCursos é e sempre será 100% gratuito. Veja as maneiras mais simples de fortalecer esse projeto e ajudar mais estudantes a terem acesso à programação!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Compartilhar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
            <Share2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">1. Compartilhe com Amigos</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Conhece alguém que quer aprender a programar mas não tem computador? Envie o link do SmartCursos no WhatsApp, Telegram ou grupos de estudo.
          </p>
        </div>

        {/* Card 2: Star no GitHub */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
            <Star className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">2. Deixe sua Estrela no GitHub</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Apoie o projeto deixando sua estrela (Star) no repositório oficial do Leonan Brayan.
          </p>
          <a
            href="https://github.com/LeonanBrayan/SmartCursos"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            <Github className="w-4 h-4" />
            <span>Visitar repositório &rarr;</span>
          </a>
        </div>

        {/* Card 3: Inscrever no YouTube */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 flex items-center justify-center font-bold">
            <Youtube className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">3. Inscreva-se no YouTube</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Assista às aulas no YouTube, deixe seu like e comente seus aprendizados e desafios resolvidos.
          </p>
        </div>

      </div>

    </div>
  );
};
