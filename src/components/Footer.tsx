import React from 'react';
import { Github, Youtube, Heart } from 'lucide-react';

interface FooterProps {
  onOpenPlayground: () => void;
  onOpenCourses: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPlayground,
  onOpenCourses
}) => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1: Brand */}
          <div className="space-y-3 md:col-span-2">
            <span className="font-brand font-black text-slate-900 dark:text-white text-xl tracking-tight">
              SmartCursos
            </span>
            <p className="text-slate-500 dark:text-slate-400 max-w-md leading-relaxed text-xs">
              Plataforma educacional dedicada a ensinar programação gratuita para pessoas que usam o smartphone para praticar seus estudos. Criada por Leonan Brayan.
            </p>
          </div>

          {/* Col 2: Links */}
          <div className="space-y-2">
            <p className="text-slate-900 dark:text-slate-100 font-bold text-xs uppercase tracking-wider">Navegação</p>
            <ul className="space-y-1.5">
              <li>
                <button onClick={onOpenCourses} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                  Nossos Cursos
                </button>
              </li>
              <li>
                <button onClick={onOpenPlayground} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                  Editor Python Web
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Social */}
          <div className="space-y-2">
            <p className="text-slate-900 dark:text-slate-100 font-bold text-xs uppercase tracking-wider">Redes & Criador</p>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/LeonanBrayan/SmartCursos"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <Github className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                  <span>LeonanBrayan (GitHub)</span>
                </a>
              </li>
              <li>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Youtube className="w-4 h-4 text-red-600" />
                  <span>Leonan Brayan (YouTube)</span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 dark:text-slate-400 text-[11px]">
          <p>© {new Date().getFullYear()} SmartCursos. Gratuito para estudantes.</p>
          <div className="flex items-center gap-1.5">
            <span>Desenvolvido com</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
            <span>para quem aprende pelo smartphone</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
