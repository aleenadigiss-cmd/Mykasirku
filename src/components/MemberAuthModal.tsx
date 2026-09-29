import React, { useState } from 'react';
import {
  X,
  Crown,
  Sparkles,
  Phone,
  Lock,
  Eye,
  EyeOff,
  User,
  Mail,
  Calendar,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  LogIn,
  UserPlus,
  ShieldCheck,
  Gift,
  Store,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { usePos } from '../context/PosContext';
import { Member } from '../types';

interface MemberAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  onSuccess?: (member: Member) => void;
}

export const MemberAuthModal: React.FC<MemberAuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  onSuccess,
}) => {
  const { memberSignIn, memberSignUp, members, setActiveTab } = usePos();

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);

  // Sign In state
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [signInError, setSignInError] = useState('');
  const [signInLoading, setSignInLoading] = useState(false);

  // Sign Up state
  const [signUpName, setSignUpName] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpBirthDate, setSignUpBirthDate] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signUpError, setSignUpError] = useState('');
  const [signUpLoading, setSignUpLoading] = useState(false);

  if (!isOpen) return null;

  // Quick fill demo member
  const handleQuickFill = (member: Member) => {
    setSignInIdentifier(member.phone);
    setSignInPassword(member.password || 'member123');
    setSignInError('');
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');
    setSignInLoading(true);

    setTimeout(() => {
      const res = memberSignIn(signInIdentifier, signInPassword || undefined);
      setSignInLoading(false);

      if (!res.success) {
        setSignInError(res.message);
      } else {
        if (onSuccess && res.member) onSuccess(res.member);
        onClose();
      }
    }, 300);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError('');

    if (signUpPassword && signUpConfirmPassword && signUpPassword !== signUpConfirmPassword) {
      setSignUpError('Konfirmasi password tidak cocok.');
      return;
    }

    if (signUpPassword && signUpPassword.length < 4) {
      setSignUpError('Password minimal 4 karakter / PIN 4 digit.');
      return;
    }

    setSignUpLoading(true);

    setTimeout(() => {
      const res = memberSignUp({
        name: signUpName,
        phone: signUpPhone,
        email: signUpEmail,
        birthDate: signUpBirthDate,
        password: signUpPassword || 'member123',
      });

      setSignUpLoading(false);

      if (!res.success) {
        setSignUpError(res.message);
      } else {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.5 },
        });
        if (onSuccess && res.member) onSuccess(res.member);
        onClose();
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-[#e2e1f2] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#e2e1f2] flex items-center justify-between bg-linear-to-r from-[#684cb6]/10 via-[#a589f8]/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#684cb6] text-white flex items-center justify-center shadow-md">
              <Crown className="w-5 h-5 text-amber-300 fill-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1e1b4b]">
                {mode === 'signin' ? 'Sign In Akun Member' : 'Sign Up Member Baru'}
              </h3>
              <p className="text-xs text-[#5d5e6c]">
                {mode === 'signin'
                  ? 'Akses poin reward & kartu digital VIP Anda'
                  : 'Daftar gratis + Welcome Bonus 500 Poin'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher (Sign In vs Sign Up) */}
        <div className="flex border-b border-[#e2e1f2] bg-slate-50 p-1.5 gap-1">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setSignInError('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-white text-[#684cb6] shadow-2xs font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In (Masuk)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setSignUpError('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-[#684cb6] shadow-2xs font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span>Sign Up (Daftar Baru)</span>
          </button>
        </div>

        {/* Tab 1: SIGN IN (MASUK MEMBER) */}
        {mode === 'signin' && (
          <form onSubmit={handleSignInSubmit} className="p-6 space-y-4 overflow-y-auto">
            {signInError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-start gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{signInError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nomor WhatsApp / HP atau ID Member <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Contoh: 081234567890 atau MBR-7701"
                  value={signInIdentifier}
                  onChange={(e) => setSignInIdentifier(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#684cb6] focus:bg-white transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Password / PIN Member
                </label>
                <span className="text-[11px] text-slate-400">Default: member123</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showSignInPassword ? 'text' : 'password'}
                  placeholder="Masukkan password atau PIN (Opsional)"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#684cb6] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowSignInPassword(!showSignInPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick Demo Sign In Pills */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-[11px] font-bold text-slate-600 block mb-2">
                Pilih Akun Demo untuk Coba Masuk Cepat:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {members.slice(0, 4).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleQuickFill(m)}
                    className="px-2.5 py-1 text-xs rounded-lg font-bold border border-slate-200 bg-white hover:bg-[#684cb6] hover:text-white transition-all cursor-pointer shadow-2xs"
                  >
                    {m.name.split(' ')[0]} ({m.tier})
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={signInLoading}
              className="w-full py-3.5 bg-[#684cb6] hover:bg-[#583ca4] active:scale-[0.98] text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {signInLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk ke Akun Member</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-500">
                Belum punya kartu member?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-[#684cb6] font-bold hover:underline cursor-pointer"
                >
                  Daftar akun baru gratis (+500 Poin)
                </button>
              </p>
            </div>
          </form>
        )}

        {/* Tab 2: SIGN UP (DAFTAR MEMBER BARU) */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="p-6 space-y-3.5 overflow-y-auto">
            {/* Welcome Bonus Notice */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900">
              <Gift className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold block">Bonus Selamat Datang 500 Poin</span>
                <span className="text-[11px] text-emerald-700">Langsung aktif di akun Anda begitu selesai mendaftar.</span>
              </div>
            </div>

            {signUpError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-start gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{signUpError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Lengkap Pelanggan <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rina Anggraini"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#684cb6] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nomor WhatsApp / HP Aktif <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  required
                  placeholder="081234567890"
                  value={signUpPhone}
                  onChange={(e) => setSignUpPhone(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#684cb6] focus:bg-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email (Opsional)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    placeholder="rina@gmail.com"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#684cb6] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tanggal Lahir (Kado Ultah)
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={signUpBirthDate}
                    onChange={(e) => setSignUpBirthDate(e.target.value)}
                    className="w-full pl-9 pr-2 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#684cb6] focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password / PIN
                </label>
                <input
                  type={showSignUpPassword ? 'text' : 'password'}
                  placeholder="Min. 4 karakter"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#684cb6] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Konfirmasi Password
                </label>
                <input
                  type={showSignUpPassword ? 'text' : 'password'}
                  placeholder="Ulangi password"
                  value={signUpConfirmPassword}
                  onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#684cb6] focus:bg-white"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={showSignUpPassword}
                onChange={(e) => setShowSignUpPassword(e.target.checked)}
                className="rounded text-[#684cb6]"
              />
              <span>Tampilkan password</span>
            </label>

            <button
              type="submit"
              disabled={signUpLoading}
              className="w-full py-3.5 bg-[#684cb6] hover:bg-[#583ca4] active:scale-[0.98] text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {signUpLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Daftar Sekarang & Ambil Kartu VIP</span>
                </>
              )}
            </button>

            <div className="text-center pt-1">
              <p className="text-xs text-slate-500">
                Sudah punya akun member?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-[#684cb6] font-bold hover:underline cursor-pointer"
                >
                  Sign In di sini
                </button>
              </p>
            </div>
          </form>
        )}

        {/* Footer info: Staff switch */}
        <div className="p-3.5 border-t border-[#e2e1f2] bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Petugas Kasir / Toko?</span>
          <button
            type="button"
            onClick={() => {
              onClose();
              setActiveTab('kasir');
            }}
            className="text-[#684cb6] font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Login Kasir POS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
