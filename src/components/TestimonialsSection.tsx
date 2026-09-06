import React, { useState } from 'react';
import { TESTIMONIALS_DATA } from '../data/coursesData';
import { Testimonial } from '../types';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Heart,
  Quote,
  Star,
  Mail,
  Github
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TestimonialsSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(TESTIMONIALS_DATA);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Estudante Mobile');
  const [content, setContent] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    const newTestimonial: Testimonial = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      role: role.trim() || 'Estudante SmartCursos',
      avatarText: name.trim().slice(0, 2).toUpperCase(),
      content: `"${content.trim()}"`,
      highlight: true
    };

    setTestimonials([newTestimonial, ...testimonials]);
    setName('');
    setContent('');
    setSubmitted(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 px-3 py-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 rounded-full">
          Comunidade & Contato
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Contato & Depoimentos dos Alunos
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Veja o impacto do SmartCursos na vida de quem aprendeu programação pelo celular e envie sua mensagem.
        </p>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {testimonials.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <Quote className="w-5 h-5 text-slate-300 dark:text-slate-600" />
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                {item.content}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                {item.avatarText}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{item.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Contact / Leave Feedback Form */}
      <div className="max-w-2xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Envie uma Mensagem ou Depoimento</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Compartilhe sua experiência de aprendizado com o Leonan Brayan</p>
          </div>
        </div>

        {submitted ? (
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>Obrigado pela sua mensagem! Seu depoimento foi publicado com sucesso na página.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Seu Nome:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: João Silva"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Dispositivo / Curso:</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Ex: Aluno Pydroid 3"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Sua Mensagem ou Depoimento:</label>
              <textarea
                required
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escreva como o SmartCursos te ajudou ou tire suas dúvidas..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar Depoimento</span>
            </button>
          </form>
        )}

        {/* Creator Direct Channels */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-slate-900 dark:text-white">Canais do Criador:</span>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/LeonanBrayan"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:underline font-medium"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          </div>
        </div>

      </div>

    </div>
  );
};
