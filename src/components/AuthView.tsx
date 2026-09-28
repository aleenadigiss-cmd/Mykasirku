import React, { useState } from 'react';
import {
  Store,
  ShieldCheck,
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
  KeyRound,
  Shield,
  ShoppingBag,
  Briefcase,
  Crown,
} from 'lucide-react';
import { usePos } from '../context/PosContext';
import { UserRole } from '../types';

export const AuthView: React.FC = () => {
  const { login, registerUser, setActiveTab: setPosActiveTab } = usePos();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login states
  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Register states
  const [regName, setRegName] = useState<string>('');
  const [regUsername, setRegUsername] = useState<string>('');
  const [regRole, setRegRole] = useState<UserRole>('Kasir');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // Quick fill default requested credentials: Super Admin (tokoindah / indahberharga134)
  const handleQuickFillSuperAdmin = () => {
    setActiveTab('login');
    setLoginUsername('tokoindah');
    setLoginPassword('indahberharga134');
    setLoginError(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccess(null);

    if (!loginUsername.trim()) {
      setLoginError('Harap masukkan username Anda.');
      return;
    }
    if (!loginPassword) {
      setLoginError('Harap masukkan password Anda.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = login(loginUsername, loginPassword);
      setIsLoading(false);

      if (!res.success) {
        setLoginError(res.message);
      } else {
        setLoginSuccess(res.message);
      }
    }, 350);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    if (!regName.trim()) {
      setRegError('Nama lengkap wajib diisi.');
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
      setRegError('Konfirmasi password tidak cocok.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = registerUser({
        name: regName,
        username: regUsername,
        password: regPassword,
        role: regRole,
        email: regEmail,
      });
      setIsLoading(false);

      if (!res.success) {
        setRegError(res.message);
      } else {
        setRegSuccess(res.message);
        // Pre-fill login with the newly created account
        setLoginUsername(regUsername.toLowerCase());
        setLoginPassword(regPassword);
        // Switch to login tab after 1.5s
        setTimeout(() => {
          setActiveTab('login');
          setRegSuccess(null);
        }, 1500);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen w-full bg-[#fbf8ff] flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 antialiased selection:bg-[#a589f8] selection:text-white">
      {/* Background Decor Shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#684cb6]/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#a589f8]/15 blur-3xl" />
      </div>

      <div className="relative w-full max-w-xl z-10 flex flex-col items-center">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-[#e2e1f2] shadow-xs mb-3">
            <ShieldCheck className="w-4 h-4 text-[#684cb6]" />
            <span className="text-xs font-bold text-[#684cb6] tracking-wide uppercase">
              KASIRKU POS ENTERPRISE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#30323e] tracking-tight">
            Sistem Kasir & Toko Terpadu
          </h1>
          <p className="text-xs sm:text-sm text-[#5d5e6c] mt-1 max-w-md">
            Masuk dengan akun terotorisasi untuk mengakses modul penjualan, manajemen stok, dan laporan keuangan.
          </p>
        </div>

        {/* Super Admin Quick Credentials Banner (High Visibility & User Friendly) */}
        <div className="w-full mb-5 bg-gradient-to-r from-[#684cb6]/10 via-[#a589f8]/15 to-[#684cb6]/10 border border-[#a589f8]/40 rounded-2xl p-3.5 sm:p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#684cb6] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-[#30323e]">Kredensial Super Admin</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#684cb6] text-white">
                    Master Access
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-xs text-[#5d5e6c]">
                  <span>
                    Username: <code className="font-bold text-[#684cb6] bg-white px-1.5 py-0.5 rounded border border-[#e2e1f2]">tokoindah</code>
                  </span>
                  <span>
                    Password: <code className="font-bold text-[#684cb6] bg-white px-1.5 py-0.5 rounded border border-[#e2e1f2]">indahberharga134</code>
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleQuickFillSuperAdmin}
              className="w-full sm:w-auto px-3 py-2 bg-white hover:bg-[#f4f2fe] text-[#684cb6] border border-[#a589f8]/50 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs cursor-pointer shrink-0"
              title="Klik untuk mengisi otomatis form login dengan akun Super Admin"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Isi Otomatis</span>
            </button>
          </div>
        </div>

        {/* Auth Card Box */}
        <div className="w-full bg-white rounded-3xl border border-[#e2e1f2] shadow-xl overflow-hidden">
          {/* Tab Switcher */}
          <div className="flex border-b border-[#e2e1f2] bg-[#fbf8ff]/60 p-1.5 gap-1.5">
            <button
              type="button"
              id="tab-login"
              onClick={() => {
                setActiveTab('login');
                setLoginError(null);
              }}
              className={`flex-1 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-white text-[#684cb6] shadow-xs'
                  : 'text-[#5d5e6c] hover:text-[#30323e] hover:bg-white/60'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk (Login)</span>
            </button>

            <button
              type="button"
              id="tab-register"
              onClick={() => {
                setActiveTab('register');
                setRegError(null);
              }}
              className={`flex-1 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-white text-[#684cb6] shadow-xs'
                  : 'text-[#5d5e6c] hover:text-[#30323e] hover:bg-white/60'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Daftar Akun Baru</span>
            </button>
          </div>

          {/* Form Content Area */}
          <div className="p-5 sm:p-7">
            {/* ======================= */}
            {/* LOGIN FORM              */}
            {/* ======================= */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {loginError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{loginError}</span>
                  </div>
                )}

                {loginSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{loginSuccess}</span>
                  </div>
                )}

                {/* Username Input */}
                <div>
                  <label className="block text-xs font-bold text-[#30323e] mb-1.5">
                    Username Kasir / Admin
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#797988] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      id="input-login-username"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="Contoh: tokoindah, kassa1, atau kassa2"
                      autoComplete="username"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e2e1f2] rounded-xl text-sm text-[#30323e] placeholder-[#797988] focus:outline-none focus:border-[#684cb6] focus:ring-1 focus:ring-[#684cb6] transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#30323e]">
                      Password
                    </label>
                    <span className="text-[11px] text-[#797988]">
                      Default: <code className="text-[#684cb6] font-semibold">indahberharga134</code>
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#797988] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      id="input-login-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Masukkan password akun Anda"
                      autoComplete="current-password"
                      required
                      className="w-full pl-10 pr-11 py-2.5 bg-white border border-[#e2e1f2] rounded-xl text-sm text-[#30323e] placeholder-[#797988] focus:outline-none focus:border-[#684cb6] focus:ring-1 focus:ring-[#684cb6] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#797988] hover:text-[#30323e] p-1 cursor-pointer"
                      title={showLoginPassword ? 'Sembunyikan password' : 'Lihat password'}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-[#5d5e6c] cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-[#e2e1f2] text-[#684cb6] focus:ring-[#684cb6]"
                    />
                    <span>Ingat saya di perangkat ini</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleQuickFillSuperAdmin}
                    className="text-[#684cb6] hover:underline font-semibold cursor-pointer text-[11px]"
                  >
                    Bantuan Login?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  id="btn-login-submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 bg-[#684cb6] hover:bg-[#583ca4] active:scale-[0.99] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Masuk ke Dashboard Kasir</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ======================= */}
            {/* REGISTER FORM           */}
            {/* ======================= */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {regError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{regError}</span>
                  </div>
                )}

                {regSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{regSuccess}</span>
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-[#30323e] mb-1">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#797988] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      id="input-reg-name"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Contoh: Rian Pratama"
                      required
                      className="w-full pl-10 pr-4 py-2 bg-white border border-[#e2e1f2] rounded-xl text-sm text-[#30323e] placeholder-[#797988] focus:outline-none focus:border-[#684cb6] focus:ring-1 focus:ring-[#684cb6] transition-all"
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs font-bold text-[#30323e] mb-1">
                    Username Login <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="text-xs font-bold text-[#797988] absolute left-3.5 top-1/2 -translate-y-1/2">
                      @
                    </span>
                    <input
                      type="text"
                      id="input-reg-username"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value.replace(/\s+/g, '').toLowerCase())}
                      placeholder="username (huruf kecil tanpa spasi)"
                      required
                      className="w-full pl-8 pr-4 py-2 bg-white border border-[#e2e1f2] rounded-xl text-sm text-[#30323e] placeholder-[#797988] focus:outline-none focus:border-[#684cb6] focus:ring-1 focus:ring-[#684cb6] transition-all"
                    />
                  </div>
                </div>

                {/* Role Selector Pills */}
                <div>
                  <label className="block text-xs font-bold text-[#30323e] mb-1">
                    Tingkat Hak Akses (Role)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: 'Kasir', label: 'Kasir', desc: 'Transaksi POS', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
                        { id: 'Manager', label: 'Manager', desc: 'Stok & Laporan', icon: <Briefcase className="w-3.5 h-3.5" /> },
                        { id: 'Super Admin', label: 'Super Admin', desc: 'Akses Penuh', icon: <Shield className="w-3.5 h-3.5" /> },
                      ] as { id: UserRole; label: string; desc: string; icon: React.ReactNode }[]
                    ).map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRegRole(r.id)}
                        className={`p-2 rounded-xl border text-left flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          regRole === r.id
                            ? 'bg-[#684cb6] text-white border-[#684cb6] shadow-xs scale-[1.02]'
                            : 'bg-white text-[#5d5e6c] border-[#e2e1f2] hover:bg-[#f4f2fe]'
                        }`}
                      >
                        <div className="flex items-center gap-1 font-bold text-xs">
                          {r.icon}
                          <span>{r.label}</span>
                        </div>
                        <span className={`text-[10px] ${regRole === r.id ? 'text-white/80' : 'text-[#797988]'}`}>
                          {r.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Email */}
                <div>
                  <label className="block text-xs font-bold text-[#30323e] mb-1">
                    Alamat Email (Opsional)
                  </label>
                  <input
                    type="email"
                    id="input-reg-email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="email@toko.id"
                    className="w-full px-3.5 py-2 bg-white border border-[#e2e1f2] rounded-xl text-sm text-[#30323e] placeholder-[#797988] focus:outline-none focus:border-[#684cb6] focus:ring-1 focus:ring-[#684cb6] transition-all"
                  />
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-[#30323e] mb-1">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-[#797988] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        id="input-reg-password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min. 6 karakter"
                        required
                        className="w-full pl-8 pr-3 py-2 bg-white border border-[#e2e1f2] rounded-xl text-xs sm:text-sm text-[#30323e] placeholder-[#797988] focus:outline-none focus:border-[#684cb6] focus:ring-1 focus:ring-[#684cb6]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#30323e] mb-1">
                      Konfirmasi Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-[#797988] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        id="input-reg-confirm-password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Ulangi password"
                        required
                        className="w-full pl-8 pr-3 py-2 bg-white border border-[#e2e1f2] rounded-xl text-xs sm:text-sm text-[#30323e] placeholder-[#797988] focus:outline-none focus:border-[#684cb6] focus:ring-1 focus:ring-[#684cb6]"
                      />
                    </div>
                  </div>
                </div>

                {/* Show password check */}
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-1.5 text-[#5d5e6c] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showRegPassword}
                      onChange={(e) => setShowRegPassword(e.target.checked)}
                      className="rounded border-[#e2e1f2] text-[#684cb6] focus:ring-[#684cb6]"
                    />
                    <span>Tampilkan password</span>
                  </label>
                  <span className="text-[11px] text-[#797988]">
                    {regPassword.length > 0 && regPassword.length < 6 && (
                      <span className="text-rose-600">Kurang dari 6 karakter</span>
                    )}
                  </span>
                </div>

                {/* Submit Register Button */}
                <button
                  type="submit"
                  id="btn-register-submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 bg-[#684cb6] hover:bg-[#583ca4] active:scale-[0.99] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Daftarkan Akun Petugas</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Customer Member Portal Banner */}
        <div className="mt-5 p-4 bg-white/95 backdrop-blur-md rounded-3xl border border-amber-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 text-amber-600 fill-amber-500" />
            </div>
            <div>
              <span className="font-bold text-[#1e1b4b] text-sm block">Pelanggan Setia Toko?</span>
              <span className="text-[#5d5e6c]">Cek poin reward, tukar voucher, atau dapatkan kartu VIP digital gratis</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPosActiveTab('member')}
            className="w-full sm:w-auto px-4 py-2.5 bg-amber-400 hover:bg-amber-500 active:scale-95 text-amber-950 font-bold rounded-xl transition-all cursor-pointer shrink-0 shadow-2xs whitespace-nowrap"
          >
            Buka Landing Page Member
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-[#797988]">
          <p>© 2026 KASIRKU Enterprise POS • Keamanan Terenkripsi & Standar Multi-Outlet</p>
        </div>
      </div>
    </div>
  );
};
