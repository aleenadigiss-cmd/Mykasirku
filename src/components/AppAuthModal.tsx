import React, { useState, useEffect } from 'react';
import {
  X,
  Store,
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  AlertCircle,
  Sparkles,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { usePos } from '../context/PosContext';

export interface AppAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  onSuccess?: () => void;
}

export const AppAuthModal: React.FC<AppAuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  onSuccess,
}) => {
  const { login, registerUser, setActiveTab } = usePos();

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);

  // Sign In State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sign Up State
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg(null);
    }
  }, [isOpen, initialMode]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 1-Click Demo Fill
  const handleQuickDemo = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setErrorMsg(null);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim() || !password) {
      setErrorMsg('Harap masukkan username dan password.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = login(username.trim(), password);
      setLoading(false);

      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        onClose();
        setActiveTab('dashboard');
        if (onSuccess) onSuccess();
      }
    }, 250);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!regFullName.trim()) {
      setErrorMsg('Nama lengkap wajib diisi.');
      return;
    }
    if (!regUsername.trim()) {
      setErrorMsg('Username wajib diisi.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg('Password minimal 6 karakter.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = registerUser({
        name: regFullName.trim(),
        username: regUsername.trim().toLowerCase(),
        password: regPassword,
        role: 'Super Admin',
      });

      if (!res.success) {
        setLoading(false);
        setErrorMsg(res.message);
      } else {
        // Auto login
        login(regUsername.trim().toLowerCase(), regPassword);
        setLoading(false);

        try {
          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch (_) {}

        onClose();
        setActiveTab('dashboard');
        if (onSuccess) onSuccess();
      }
    }, 300);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#e2e1f2] overflow-hidden relative z-10"
      >
        {/* Header */}
        <div className="bg-linear-to-r from-[#1e1b4b] to-[#3b2d71] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-amber-300 shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-200 block">
                KASIRKU POS
              </span>
              <h3 className="text-xl font-black text-white">
                {mode === 'signin' ? 'Masuk ke Kasir' : 'Daftar Akun Baru'}
              </h3>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#e2e1f2] bg-[#fbf8ff] p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-white text-[#684cb6] shadow-xs'
                : 'text-slate-500 hover:text-[#1e1b4b]'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In (Masuk)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-[#684cb6] shadow-xs'
                : 'text-slate-500 hover:text-[#1e1b4b]'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Sign Up (Daftar)</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1e1b4b] mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: tokoindah atau kassa1"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] focus:ring-2 focus:ring-[#684cb6]/20 text-sm outline-hidden bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1e1b4b] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] focus:ring-2 focus:ring-[#684cb6]/20 text-sm outline-hidden bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 1-Click Demo Login Pills */}
              <div className="p-3 bg-[#f8f7ff] rounded-2xl border border-[#e2e1f2] space-y-2">
                <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Coba Akun Demo Cepat (1-Klik):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('tokoindah', 'indahberharga134')}
                    className="px-3 py-2 bg-white border border-[#e2e1f2] hover:border-[#684cb6] hover:bg-purple-50/50 rounded-xl text-xs font-bold text-[#1e1b4b] transition-all text-center cursor-pointer shadow-2xs"
                  >
                    Super Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('kassa1', 'kasir123')}
                    className="px-3 py-2 bg-white border border-[#e2e1f2] hover:border-[#684cb6] hover:bg-purple-50/50 rounded-xl text-xs font-bold text-[#1e1b4b] transition-all text-center cursor-pointer shadow-2xs"
                  >
                    Kasir (Kassa 1)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 bg-[#684cb6] hover:bg-[#583ca4] active:scale-[0.98] text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Memeriksa...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-amber-300" />
                    <span>Masuk ke Dashboard Kasir</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#1e1b4b] mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] text-xs outline-hidden bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1e1b4b] mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  placeholder="username_toko"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] text-xs outline-hidden bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1e1b4b] mb-1">
                  Password (Min 6 Karakter) *
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] text-xs outline-hidden bg-white"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 bg-[#684cb6] hover:bg-[#583ca4] active:scale-[0.98] text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <span>Mendaftarkan...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 text-amber-300" />
                    <span>Daftar & Langsung Masuk</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer Toggle */}
        <div className="bg-[#fbf8ff] px-6 py-3.5 border-t border-[#e2e1f2] flex items-center justify-between text-xs text-slate-500">
          <span>{mode === 'signin' ? 'Belum punya akun?' : 'Sudah punya akun?'}</span>
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setErrorMsg(null);
            }}
            className="font-bold text-[#684cb6] hover:underline cursor-pointer"
          >
            {mode === 'signin' ? 'Daftar sekarang →' : 'Masuk di sini →'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
