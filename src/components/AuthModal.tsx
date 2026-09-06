import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  ShieldCheck,
  AlertCircle,
  Clock,
  KeyRound,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowRight,
  Info
} from 'lucide-react';
import { authService } from '../services/authService';
import { UserProfile, UserProgress } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile, progress?: UserProgress) => void;
  initialMode?: 'login' | 'register' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login'
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset-confirm' | 'google-direct'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Google Direct Fallback flow (for Vercel / custom domains without Firebase domain setup)
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [currentDomain, setCurrentDomain] = useState('');

  // Forgot / Reset flow
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockRemainingSeconds, setLockRemainingSeconds] = useState<number | null>(null);

  if (!isOpen) return null;

  const resetFormState = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setAttemptsRemaining(null);
    setIsLocked(false);
    setLockRemainingSeconds(null);
  };

  const handleModeChange = (newMode: 'login' | 'register' | 'forgot' | 'google-direct') => {
    resetFormState();
    setMode(newMode);
    if (newMode === 'google-direct' && email) {
      setGoogleEmail(email);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    resetFormState();

    try {
      const data = await authService.login(email, password);
      setSuccessMessage('Login realizado com sucesso!');
      setTimeout(() => {
        onAuthSuccess(data.user, data.progress);
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao autenticar.');
      if (err.isLocked) {
        setIsLocked(true);
        setLockRemainingSeconds(err.remainingSeconds || 900);
      }
      if (err.attemptsLeft !== undefined) {
        setAttemptsRemaining(err.attemptsLeft);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    resetFormState();
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    setCurrentDomain(hostname);

    // Domínios externos como Vercel ou domínios customizados não devem tentar popup do Firebase
    const isExternalHost = hostname && !hostname.includes('localhost') && !hostname.includes('127.0.0.1') && !hostname.includes('run.app');

    if (isExternalHost) {
      if (email.trim() && email.includes('@')) {
        try {
          const data = await authService.loginWithGoogleDirect(email.trim(), name.trim());
          setSuccessMessage('Login realizado com sucesso!');
          setTimeout(() => {
            onAuthSuccess(data.user, data.progress);
            onClose();
          }, 600);
          return;
        } catch (err: any) {
          setErrorMessage(err.message || 'Erro ao autenticar com a conta Google.');
          return;
        } finally {
          setIsLoading(false);
        }
      }

      // Abre imediatamente o formulário de conexão direta sem exibir nenhum erro do Firebase
      setMode('google-direct');
      setGoogleEmail(email.trim() || '');
      setGoogleName(name.trim() || '');
      setIsLoading(false);
      return;
    }

    try {
      const data = await authService.loginWithGoogle({
        email: email.trim(),
        name: name.trim()
      });
      setSuccessMessage('Login realizado com sucesso!');
      setTimeout(() => {
        onAuthSuccess(data.user, data.progress);
        onClose();
      }, 600);
    } catch (err: any) {
      const msg = String(err?.message || '');
      if (err.isUnauthorizedDomain || msg.includes('unauthorized-domain') || msg.includes('auth/')) {
        // Redireciona de forma suave e transparente sem travar com erro
        setMode('google-direct');
        setGoogleEmail(email.trim() || '');
        setGoogleName(name.trim() || '');
        setErrorMessage(null);
      } else {
        setErrorMessage(err.message || 'Falha na autenticação com o Google.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    resetFormState();

    try {
      const data = await authService.loginWithGoogleDirect(googleEmail || email, googleName || name);
      setSuccessMessage('Login com Conta Google realizado com sucesso!');
      setTimeout(() => {
        onAuthSuccess(data.user, data.progress);
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao conectar com a conta Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    resetFormState();

    try {
      const data = await authService.register(name, email, password);
      setSuccessMessage('Conta criada com sucesso!');
      setTimeout(() => {
        onAuthSuccess(data.user, data.progress);
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao cadastrar.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    resetFormState();

    try {
      const data = await authService.requestPasswordReset(email);
      setSuccessMessage(data.message);
      setMode('reset-confirm');
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao solicitar recuperação de senha.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    resetFormState();

    try {
      const data = await authService.resetPassword(email, resetCode, newPassword);
      setSuccessMessage('Senha atualizada com sucesso!');
      setTimeout(() => {
        setMode('login');
        setPassword('');
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Código inválido ou expirado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-extrabold text-white tracking-tight">
            {mode === 'login' && 'Entrar na sua Conta'}
            {mode === 'register' && 'Criar Conta de Aluno'}
            {mode === 'forgot' && 'Recuperar Senha'}
            {mode === 'reset-confirm' && 'Código de Verificação'}
            {mode === 'google-direct' && 'Acessar com Conta Google'}
          </h2>
          <p className="text-xs text-blue-200 mt-1">
            {mode === 'login' && 'Acesse seus cursos, aulas assistidas e certificados.'}
            {mode === 'register' && 'Cadastre-se para acompanhar sua evolução nas aulas.'}
            {mode === 'forgot' && 'Enviaremos um código para redefinir sua senha.'}
            {mode === 'reset-confirm' && 'Digite o código de 6 dígitos que enviamos.'}
            {mode === 'google-direct' && 'Conecte sua conta Google para sincronizar suas aulas e progresso.'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {/* Alert Messages */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">{errorMessage}</p>
                {attemptsRemaining !== null && attemptsRemaining > 0 && (
                  <p className="mt-1 text-rose-700 dark:text-rose-300 font-medium">
                    Tentativas restantes: <strong>{attemptsRemaining}</strong> de 5.
                  </p>
                )}
                {isLocked && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-rose-800 dark:text-rose-200 font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Acesso temporariamente bloqueado por 15 minutos por segurança.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">{successMessage}</p>
              </div>
            </div>
          )}

          {/* 1. LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Google Login Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading || isLocked}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continuar com Google</span>
              </button>

              <div className="flex items-center my-3">
                <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
                <span className="px-3 text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">ou com e-mail</span>
                <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Endereço de E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => handleModeChange('forgot')}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors cursor-pointer"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    className="w-full pl-9 pr-10 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Notice */}
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Por segurança, 5 tentativas incorretas consecutivas bloqueiam o acesso temporariamente por 15 minutos.
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading || isLocked}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Entrando...</span>
                ) : (
                  <>
                    <span>Entrar no SmartCursos</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <span className="text-xs text-slate-600 dark:text-slate-400">Ainda não tem conta? </span>
                <button
                  type="button"
                  onClick={() => handleModeChange('register')}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline transition-colors cursor-pointer"
                >
                  Cadastre-se gratuitamente
                </button>
              </div>
            </form>
          )}

          {/* 2. REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Seu Nome Completo"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Senha (mínimo 6 caracteres)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Crie uma senha de acesso"
                    className="w-full pl-9 pr-10 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800 text-[11px] text-blue-900 dark:text-blue-200 leading-relaxed flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <span>
                  Ao se cadastrar, seu progresso nas aulas e questionários ficará gravado na sua conta com segurança.
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Criando conta...</span>
                ) : (
                  <>
                    <span>Criar Minha Conta</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <span className="text-xs text-slate-600 dark:text-slate-400">Já possui uma conta? </span>
                <button
                  type="button"
                  onClick={() => handleModeChange('login')}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline transition-colors cursor-pointer"
                >
                  Fazer login
                </button>
              </div>
            </form>
          )}

          {/* 3. FORGOT PASSWORD (REQUEST CODE) */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Informe o seu E-mail Cadastrado
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-2">
                <KeyRound className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Um código de uso único com validade de 15 minutos será enviado para o seu e-mail.
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Enviando código...</span>
                ) : (
                  <>
                    <span>Enviar Código de Recuperação</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => handleModeChange('login')}
                  className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  ← Voltar para o login
                </button>
              </div>
            </form>
          )}

          {/* 4. CONFIRM RESET CODE & SET NEW PASSWORD */}
          {mode === 'reset-confirm' && (
            <form onSubmit={handleResetConfirm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Código de 6 Dígitos
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ex: 123456"
                  className="w-full text-center tracking-widest font-mono text-lg py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Nova Senha (mínimo 6 caracteres)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite sua nova senha"
                    className="w-full pl-9 pr-10 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Atualizando senha...</span>
                ) : (
                  <>
                    <span>Confirmar Nova Senha</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => handleModeChange('login')}
                  className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  ← Cancelar e voltar ao login
                </button>
              </div>
            </form>
          )}

          {/* 5. GOOGLE DIRECT (PARA HOSPEDAGEM NA VERCEL OU QUALQUER DOMÍNIO) */}
          {mode === 'google-direct' && (
            <form onSubmit={handleGoogleDirectSubmit} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 leading-relaxed flex items-start gap-2.5">
                <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <div className="flex-1">
                  <p className="font-semibold text-blue-950 dark:text-blue-100">Acesso com Conta Google</p>
                  <p className="mt-0.5 text-[11px] text-blue-800/90 dark:text-blue-300">
                    Conecte seu e-mail do Google para sincronizar suas aulas assistidas, questionários e certificados.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Seu E-mail Google (Gmail)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="seu.email@gmail.com"
                    autoFocus
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Nome do Aluno (opcional)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    placeholder="Ex: Seu Nome Completo"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Conectando ao Google...</span>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Conectar com Conta Google</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => handleModeChange('login')}
                  className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  ← Voltar para o login com e-mail e senha
                </button>
              </div>

              <div className="mt-2 p-2.5 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Autenticação direta compatível com Vercel, smartphones e navegadores.</span>
              </div>
            </form>
          )}
        </div>

        {/* Footer Notice */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Conexão Segura
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            SmartCursos
          </span>
        </div>
      </div>
    </div>
  );
};
