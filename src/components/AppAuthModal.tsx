import React, { useState, useEffect } from 'react';
import {
  X,
  Store,
  Crown,
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Phone,
  Mail,
  Calendar,
  Building2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { usePos } from '../context/PosContext';
import { UserRole } from '../types';

export interface AppAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  initialUserType?: 'business' | 'member';
  onSuccess?: () => void;
}

export const AppAuthModal: React.FC<AppAuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  initialUserType = 'business',
  onSuccess,
}) => {
  const {
    login,
    registerUser,
    memberSignIn,
    memberSignUp,
    setActiveTab,
    members,
    showToast,
  } = usePos();

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [userType, setUserType] = useState<'business' | 'member'>(initialUserType);

  // Business Sign In Form
  const [bizUsername, setBizUsername] = useState('');
  const [bizPassword, setBizPassword] = useState('');
  const [showBizPassword, setShowBizPassword] = useState(false);
  const [bizError, setBizError] = useState<string | null>(null);
  const [bizLoading, setBizLoading] = useState(false);

  // Business Sign Up Form
  const [regFullName, setRegFullName] = useState('');
  const [regStoreName, setRegStoreName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Super Admin');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regLoading, setRegLoading] = useState(false);

  // Member Sign In Form
  const [memberIdentifier, setMemberIdentifier] = useState('');
  const [memberPassword, setMemberPassword] = useState('');
  const [showMemberPassword, setShowMemberPassword] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);
  const [memberLoading, setMemberLoading] = useState(false);

  // Member Sign Up Form
  const [memName, setMemName] = useState('');
  const [memPhone, setMemPhone] = useState('');
  const [memEmail, setMemEmail] = useState('');
  const [memBirthDate, setMemBirthDate] = useState('');
  const [memPassword, setMemPassword] = useState('');
  const [memConfirmPassword, setMemConfirmPassword] = useState('');
  const [memError, setMemError] = useState<string | null>(null);
  const [memLoading, setMemLoading] = useState(false);

  // Reset states when opening modal or changing mode
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setUserType(initialUserType);
      setBizError(null);
      setRegError(null);
      setMemberError(null);
      setMemError(null);
    }
  }, [isOpen, initialMode, initialUserType]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Quick fill business accounts
  const handleQuickFillBiz = (user: string, pass: string) => {
    setBizUsername(user);
    setBizPassword(pass);
    setBizError(null);
  };

  // Quick fill member accounts
  const handleQuickFillMember = (phone: string, pass?: string) => {
    setMemberIdentifier(phone);
    setMemberPassword(pass || 'member123');
    setMemberError(null);
  };

  // Business Sign In Submit
  const handleBizSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setBizError(null);

    if (!bizUsername.trim()) {
      setBizError('Username atau email wajib diisi.');
      return;
    }
    if (!bizPassword) {
      setBizError('Password wajib diisi.');
      return;
    }

    setBizLoading(true);
    setTimeout(() => {
      const res = login(bizUsername, bizPassword);
      setBizLoading(false);

      if (!res.success) {
        setBizError(res.message);
      } else {
        onClose();
        setActiveTab('dashboard');
        if (onSuccess) onSuccess();
      }
    }, 300);
  };

  // Business Sign Up Submit
  const handleBizSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regFullName.trim()) {
      setRegError('Nama lengkap pemilik/petugas wajib diisi.');
      return;
    }
    if (!regUsername.trim()) {
      setRegError('Username wajib diisi.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Password minimal harus 6 karakter.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Konfirmasi password tidak sesuai.');
      return;
    }

    setRegLoading(true);
    setTimeout(() => {
      const res = registerUser({
        name: regFullName.trim(),
        username: regUsername.trim(),
        password: regPassword,
        role: regRole,
        email: regEmail.trim(),
        phone: regPhone.trim(),
      });

      if (!res.success) {
        setRegLoading(false);
        setRegError(res.message);
      } else {
        // Auto sign in after sign up
        login(regUsername.trim(), regPassword);
        setRegLoading(false);

        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch (_) {}

        onClose();
        setActiveTab('dashboard');
        if (onSuccess) onSuccess();
      }
    }, 400);
  };

  // Member Sign In Submit
  const handleMemberSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setMemberError(null);

    if (!memberIdentifier.trim()) {
      setMemberError('Nomor WhatsApp atau ID Member wajib diisi.');
      return;
    }

    setMemberLoading(true);
    setTimeout(() => {
      const res = memberSignIn(memberIdentifier, memberPassword || undefined);
      setMemberLoading(false);

      if (!res.success) {
        setMemberError(res.message);
      } else {
        onClose();
        if (onSuccess) onSuccess();
      }
    }, 300);
  };

  // Member Sign Up Submit
  const handleMemberSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setMemError(null);

    if (!memName.trim()) {
      setMemError('Nama lengkap wajib diisi.');
      return;
    }
    if (!memPhone.trim() || memPhone.replace(/[^0-9]/g, '').length < 8) {
      setMemError('Nomor WhatsApp tidak valid (minimal 8 digit).');
      return;
    }
    if (memPassword && memConfirmPassword && memPassword !== memConfirmPassword) {
      setMemError('Konfirmasi password/PIN tidak sesuai.');
      return;
    }

    setMemLoading(true);
    setTimeout(() => {
      const res = memberSignUp({
        name: memName.trim(),
        phone: memPhone.trim(),
        email: memEmail.trim(),
        birthDate: memBirthDate,
        password: memPassword || 'member123',
        pin: memPassword ? memPassword.slice(0, 4) : '1234',
      });
      setMemLoading(false);

      if (!res.success) {
        setMemError(res.message);
      } else {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (_) {}

        onClose();
        if (onSuccess) onSuccess();
      }
    }, 350);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#e2e1f2] overflow-hidden my-6 relative z-10 flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="bg-linear-to-r from-[#1e1b4b] to-[#312e81] text-white p-6 pb-5 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xs">
              {userType === 'business' ? (
                <Store className="w-5 h-5 text-amber-300" />
              ) : (
                <Crown className="w-5 h-5 text-amber-300" />
              )}
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-200 block">
                {userType === 'business' ? 'Portal Kasir & Toko KASIRKU' : 'Portal Pelanggan & Loyalty'}
              </span>
              <h2 className="text-xl font-black tracking-tight text-white">
                {mode === 'signin' ? 'Sign In ke Akun Anda' : 'Buat Akun Baru'}
              </h2>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
            {mode === 'signin'
              ? userType === 'business'
                ? 'Masuk untuk mengelola transaksi POS, inventori, dan laporan penjualan.'
                : 'Masuk untuk cek saldo poin, barcode kartu VIP, dan tukar voucher diskon.'
              : userType === 'business'
              ? 'Daftar sekarang untuk mulai mengelola tokomu dengan kasir modern & cloud sync.'
              : 'Daftar member VIP gratis dalam 30 detik & langsung dapatkan bonus +500 Poin!'}
          </p>

          {/* Account Category Switcher: Business Store VS VIP Member */}
          <div className="grid grid-cols-2 gap-2 mt-4 p-1 bg-white/10 backdrop-blur-md rounded-xl border border-white/15">
            <button
              type="button"
              onClick={() => {
                setUserType('business');
                setBizError(null);
                setRegError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                userType === 'business'
                  ? 'bg-white text-[#1e1b4b] shadow-sm'
                  : 'text-slate-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <Store className="w-4 h-4 text-[#684cb6]" />
              <span>Pemilik Toko & Kasir</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setUserType('member');
                setMemberError(null);
                setMemError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                userType === 'member'
                  ? 'bg-white text-[#1e1b4b] shadow-sm'
                  : 'text-slate-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <Crown className="w-4 h-4 text-amber-500" />
              <span>Member VIP</span>
            </button>
          </div>
        </div>

        {/* Mode Selector Tab (Sign In vs Sign Up) */}
        <div className="flex border-b border-[#e2e1f2] bg-[#fbf8ff] px-6 pt-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setBizError(null);
              setRegError(null);
              setMemberError(null);
              setMemError(null);
            }}
            className={`flex-1 py-3 text-center text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              mode === 'signin'
                ? 'border-[#684cb6] text-[#684cb6] bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-[#30323e]'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In (Masuk)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setBizError(null);
              setRegError(null);
              setMemberError(null);
              setMemError(null);
            }}
            className={`flex-1 py-3 text-center text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              mode === 'signup'
                ? 'border-[#684cb6] text-[#684cb6] bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-[#30323e]'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Sign Up (Daftar Akun)</span>
            {userType === 'member' && (
              <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.2 rounded-full border border-amber-300">
                +500 Poin
              </span>
            )}
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 text-[#30323e]">
          {/* ========================================================================= */}
          {/* A. BUSINESS (OWNER / CASHIER) TAB */}
          {/* ========================================================================= */}
          {userType === 'business' && mode === 'signin' && (
            <form onSubmit={handleBizSignIn} className="space-y-4">
              {bizError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{bizError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#1e1b4b] mb-1.5">
                  Username atau Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={bizUsername}
                    onChange={(e) => setBizUsername(e.target.value)}
                    placeholder="Contoh: tokoindah atau kassa1"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] focus:ring-2 focus:ring-[#684cb6]/20 text-sm outline-hidden transition-all bg-white"
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
                    type={showBizPassword ? 'text' : 'password'}
                    value={bizPassword}
                    onChange={(e) => setBizPassword(e.target.value)}
                    placeholder="Masukkan password akun"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] focus:ring-2 focus:ring-[#684cb6]/20 text-sm outline-hidden transition-all bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowBizPassword(!showBizPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showBizPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick Fill Demo Cashier Accounts */}
              <div className="bg-[#f8f7ff] p-3 rounded-2xl border border-[#e2e1f2]/80 space-y-2">
                <span className="text-[11px] font-bold text-slate-600 block flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Akun Demo Siap Pakai (1-Klik):
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickFillBiz('tokoindah', 'indahberharga134')}
                    className="px-2 py-1.5 bg-white border border-[#e2e1f2] hover:border-[#684cb6] hover:bg-[#684cb6]/5 rounded-lg text-[11px] font-bold text-[#1e1b4b] transition-all text-center truncate cursor-pointer"
                  >
                    Super Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFillBiz('kassa1', 'kasir123')}
                    className="px-2 py-1.5 bg-white border border-[#e2e1f2] hover:border-[#684cb6] hover:bg-[#684cb6]/5 rounded-lg text-[11px] font-bold text-[#1e1b4b] transition-all text-center truncate cursor-pointer"
                  >
                    Kassa 1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFillBiz('kassa2', 'kasir123')}
                    className="px-2 py-1.5 bg-white border border-[#e2e1f2] hover:border-[#684cb6] hover:bg-[#684cb6]/5 rounded-lg text-[11px] font-bold text-[#1e1b4b] transition-all text-center truncate cursor-pointer"
                  >
                    Kassa 2
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={bizLoading}
                className="w-full py-3 px-6 bg-[#684cb6] hover:bg-[#583ca4] active:scale-[0.98] text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {bizLoading ? (
                  <span>Memverifikasi akun...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-amber-300" />
                    <span>Masuk ke Dashboard POS</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Business Sign Up */}
          {userType === 'business' && mode === 'signup' && (
            <form onSubmit={handleBizSignUp} className="space-y-3.5">
              {regError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1e1b4b] mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Budi Santoso"
                    className="w-full px-3 py-2 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] text-xs outline-hidden bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1e1b4b] mb-1">
                    Nama Toko / Usaha *
                  </label>
                  <input
                    type="text"
                    value={regStoreName}
                    onChange={(e) => setRegStoreName(e.target.value)}
                    placeholder="Toko Maju Jaya"
                    className="w-full px-3 py-2 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] text-xs outline-hidden bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1e1b4b] mb-1">
                    Username Akun *
                  </label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    placeholder="username_toko"
                    className="w-full px-3 py-2 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] text-xs outline-hidden bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1e1b4b] mb-1">
                    Peran / Jabatan
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] text-xs outline-hidden bg-white font-medium"
                  >
                    <option value="Super Admin">Pemilik / Super Admin</option>
                    <option value="Manajer">Manajer Toko</option>
                    <option value="Kasir">Kasir Toko</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1e1b4b] mb-1">
                    No. WhatsApp / HP
                  </label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="08123456789"
                    className="w-full px-3 py-2 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] text-xs outline-hidden bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1e1b4b] mb-1">
                    Email Bisnis
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="toko@bisnis.id"
                    className="w-full px-3 py-2 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] text-xs outline-hidden bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1e1b4b] mb-1">
                    Password (Min 6 Karakter) *
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 pr-8 py-2 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] text-xs outline-hidden bg-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1e1b4b] mb-1">
                    Konfirmasi Password *
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] text-xs outline-hidden bg-white"
                    required
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-tight">
                Dengan mendaftar, Anda menyetujui Ketentuan Layanan & Kebijakan Privasi KASIRKU POS.
              </p>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full py-3 px-6 bg-[#684cb6] hover:bg-[#583ca4] active:scale-[0.98] text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {regLoading ? (
                  <span>Mendaftarkan akun...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 text-amber-300" />
                    <span>Daftar Toko & Buka POS Sekarang</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================================= */}
          {/* B. MEMBER VIP CLUB TAB */}
          {/* ========================================================================= */}
          {userType === 'member' && mode === 'signin' && (
            <form onSubmit={handleMemberSignIn} className="space-y-4">
              {memberError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{memberError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#1e1b4b] mb-1.5">
                  Nomor WhatsApp atau ID Member
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={memberIdentifier}
                    onChange={(e) => setMemberIdentifier(e.target.value)}
                    placeholder="Contoh: 081234567890 atau MBR-7701"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] focus:ring-2 focus:ring-[#684cb6]/20 text-sm outline-hidden transition-all bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1e1b4b] mb-1.5 flex items-center justify-between">
                  <span>Password atau PIN (Opsional)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Default: member123</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showMemberPassword ? 'text' : 'password'}
                    value={memberPassword}
                    onChange={(e) => setMemberPassword(e.target.value)}
                    placeholder="Masukkan PIN / Password member"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] focus:ring-2 focus:ring-[#684cb6]/20 text-sm outline-hidden transition-all bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMemberPassword(!showMemberPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showMemberPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick Fill Demo Members */}
              {members.length > 0 && (
                <div className="bg-[#f8f7ff] p-3 rounded-2xl border border-[#e2e1f2]/80 space-y-2">
                  <span className="text-[11px] font-bold text-slate-600 block flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    Pilih Member Contoh (1-Klik):
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {members.slice(0, 4).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleQuickFillMember(m.phone, m.password)}
                        className="p-2 bg-white border border-[#e2e1f2] hover:border-[#684cb6] rounded-xl text-left transition-all cursor-pointer flex items-center gap-2 group"
                      >
                        <div className="w-7 h-7 rounded-full bg-purple-100 text-[#684cb6] flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-[#684cb6] group-hover:text-white transition-colors">
                          {m.name.charAt(0)}
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-bold text-[#1e1b4b] block truncate leading-tight">
                            {m.name}
                          </span>
                          <span className="text-[10px] text-purple-700 font-semibold block">
                            {m.tier} • {m.points} Pts
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={memberLoading}
                className="w-full py-3 px-6 bg-[#684cb6] hover:bg-[#583ca4] active:scale-[0.98] text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {memberLoading ? (
                  <span>Mengecek member...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-amber-300" />
                    <span>Masuk ke Kartu Member VIP</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Member Sign Up */}
          {userType === 'member' && mode === 'signup' && (
            <form onSubmit={handleMemberSignUp} className="space-y-3.5">
              {memError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{memError}</span>
                </div>
              )}

              {/* Bonus banner */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-5 h-5 fill-amber-950" />
                </div>
                <div>
                  <span className="text-xs font-bold text-amber-950 block">
                    Bonus Langsung +500 Poin Selamat Datang!
                  </span>
                  <span className="text-[11px] text-amber-800 block">
                    Bisa langsung ditukar voucher belanja diskon Rp 25.000.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1e1b4b] mb-1">
                  Nama Lengkap *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={memName}
                    onChange={(e) => setMemName(e.target.value)}
                    placeholder="Contoh: Jessica Melinda"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] text-xs outline-hidden bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1e1b4b] mb-1">
                    No. WhatsApp Aktif *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={memPhone}
                      onChange={(e) => setMemPhone(e.target.value)}
                      placeholder="081234567890"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] text-xs outline-hidden bg-white"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1e1b4b] mb-1">
                    Email (Opsional)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={memEmail}
                      onChange={(e) => setMemEmail(e.target.value)}
                      placeholder="jessica@email.com"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] text-xs outline-hidden bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1e1b4b] mb-1">
                    Tanggal Lahir (Promo Ulang Tahun)
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={memBirthDate}
                      onChange={(e) => setMemBirthDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] text-xs outline-hidden bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1e1b4b] mb-1">
                    PIN / Password (Min 4 digit)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={memPassword}
                      onChange={(e) => setMemPassword(e.target.value)}
                      placeholder="••••"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] text-xs outline-hidden bg-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={memLoading}
                className="w-full py-3 px-6 bg-linear-to-r from-[#684cb6] to-[#4f378b] hover:from-[#583ca4] hover:to-[#432b7a] active:scale-[0.98] text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {memLoading ? (
                  <span>Mendaftarkan member...</span>
                ) : (
                  <>
                    <Crown className="w-4 h-4 text-amber-300" />
                    <span>Daftar VIP & Klaim 500 Poin Gratis</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer info & toggle mode */}
        <div className="bg-[#fbf8ff] p-4 border-t border-[#e2e1f2] flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>
            {mode === 'signin' ? 'Belum punya akun?' : 'Sudah terdaftar sebelumnya?'}
          </span>
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setBizError(null);
              setRegError(null);
              setMemberError(null);
              setMemError(null);
            }}
            className="font-bold text-[#684cb6] hover:underline cursor-pointer"
          >
            {mode === 'signin' ? 'Daftar sekarang →' : 'Masuk ke akun →'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
