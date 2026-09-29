import React, { useState, useMemo, useEffect } from 'react';
import {
  Crown,
  Sparkles,
  Gift,
  Award,
  ShieldCheck,
  Zap,
  Star,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Phone,
  Search,
  Sliders,
  Calendar,
  CreditCard,
  QrCode,
  Tag,
  Coffee,
  ShoppingBag,
  ExternalLink,
  MessageCircle,
  Menu,
  X,
  Store,
  Clock,
  MapPin,
  TrendingUp,
  Users,
  Percent,
  CheckCircle2,
  Copy,
  Flame,
  Ticket,
  Barcode,
  LogIn,
  UserPlus,
  LogOut,
  Layers,
  Package,
  Receipt,
  Printer,
  Shield,
  HelpCircle,
  HeartHandshake,
  CheckCheck,
  AlertCircle,
  BarChart3,
  DollarSign,
  Smartphone,
  Laptop,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { usePos } from '../context/PosContext';
import { Member, MemberRewardVoucher, MemberTier } from '../types';
import { formatNumber, formatRupiah } from '../utils/formatters';
import { DigitalMemberCard } from './DigitalMemberCard';
import { AppAuthModal } from './AppAuthModal';

export const LandingPage: React.FC = () => {
  const {
    setActiveTab,
    currentUser,
    isAuthenticated,
    logout,
    settings,
    members,
    products,
  } = usePos();

  // Navigation & Drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [authModalUserType, setAuthModalUserType] = useState<'business' | 'member'>('business');

  // Hero Preview Mockup Tab
  const [heroActiveTab, setHeroActiveTab] = useState<'pos' | 'member' | 'analytics'>('pos');

  // Interactive Mini POS Simulator
  const [simCart, setSimCart] = useState<{ id: number; name: string; price: number; qty: number; category: string }[]>([
    { id: 1, name: 'Kopi Susu Gula Aren 250ml', price: 18000, qty: 2, category: 'Minuman' },
    { id: 2, name: 'Croissant Butter Paris', price: 24000, qty: 1, category: 'Makanan' },
  ]);
  const [simPaymentMethod, setSimPaymentMethod] = useState<'QRIS' | 'Tunai' | 'Debit'>('QRIS');
  const [simPaid, setSimPaid] = useState(false);

  // Interactive Calculator
  const [calcMonthlyTransactions, setCalcMonthlyTransactions] = useState<number>(1200);
  const [calcAverageBasket, setCalcAverageBasket] = useState<number>(65000);

  // Interactive Member Tier Selector
  const [selectedTier, setSelectedTier] = useState<MemberTier>('Platinum');

  // Pricing Billing Cycle Toggle
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  // FAQ Accordion
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Handle scroll detection for sticky navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Open Auth Modal Helper
  const openAuth = (mode: 'signin' | 'signup', type: 'business' | 'member' = 'business') => {
    setAuthModalMode(mode);
    setAuthModalUserType(type);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  // Scroll to section helper
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  // Mini POS Calculations
  const simSubtotal = useMemo(
    () => simCart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [simCart]
  );
  const simTax = Math.round(simSubtotal * 0.11);
  const simTotal = simSubtotal + simTax;

  const handleSimAdd = (product: { id: number; name: string; price: number; category: string }) => {
    setSimPaid(false);
    setSimCart((prev) => {
      const exist = prev.find((i) => i.id === product.id);
      if (exist) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const handleSimCompletePayment = () => {
    setSimPaid(true);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (_) {}
  };

  // Calculator outputs
  const calcOutput = useMemo(() => {
    const monthlyGross = calcMonthlyTransactions * calcAverageBasket;
    const hoursSavedPerMonth = Math.round((calcMonthlyTransactions * 1.5) / 60); // 1.5 min saved per checkout
    const potentialIncreaseWithLoyalty = Math.round(monthlyGross * 0.18); // 18% basket uplift via loyalty
    return {
      monthlyGross,
      hoursSavedPerMonth,
      potentialIncreaseWithLoyalty,
    };
  }, [calcMonthlyTransactions, calcAverageBasket]);

  // Demo Member for preview
  const demoMember = useMemo<Member>(() => {
    return {
      id: 'MBR-7701',
      name: 'Clarissa Aurelia',
      phone: '081234567890',
      email: 'clarissa@vipclub.id',
      tier: selectedTier,
      points: selectedTier === 'Diamond' ? 5200 : selectedTier === 'Platinum' ? 2800 : selectedTier === 'Gold' ? 1200 : 500,
      totalSpent: selectedTier === 'Diamond' ? 18250000 : selectedTier === 'Platinum' ? 6200000 : selectedTier === 'Gold' ? 1800000 : 450000,
      transactionsCount: 42,
      joinDate: '12 Jan 2024',
      barcode: '9988221045',
      qrCode: `KASIRKU-MBR-7701-${selectedTier.toUpperCase()}`,
    };
  }, [selectedTier]);

  return (
    <div className="min-h-screen bg-[#fbf8ff] text-[#30323e] font-sans antialiased selection:bg-[#684cb6]/20 selection:text-[#684cb6] flex flex-col">
      {/* ========================================================================= */}
      {/* 1. STICKY NAVIGATION BAR */}
      {/* ========================================================================= */}
      <header
        className={`sticky top-0 z-40 transition-all duration-200 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-[#e2e1f2]'
            : 'bg-white/80 backdrop-blur-xs border-b border-[#e2e1f2]/60'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo & Title */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-[#684cb6] to-[#4f378b] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Store className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-[#1e1b4b] font-sans">
                  KASIRKU
                </span>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  POS CLOUD
                </span>
              </div>
              <p className="text-xs text-[#5d5e6c] font-medium hidden sm:block">
                Sistem Kasir & Manajemen Toko Modern
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-[#5d5e6c]">
            <button
              onClick={() => scrollTo('fitur')}
              className="hover:text-[#684cb6] transition-colors cursor-pointer"
            >
              Fitur Utama
            </button>
            <button
              onClick={() => scrollTo('solusi')}
              className="hover:text-[#684cb6] transition-colors cursor-pointer"
            >
              Solusi Toko
            </button>
            <button
              onClick={() => scrollTo('demo')}
              className="hover:text-[#684cb6] transition-colors cursor-pointer"
            >
              Demo Interaktif
            </button>
            <button
              onClick={() => scrollTo('harga')}
              className="hover:text-[#684cb6] transition-colors cursor-pointer"
            >
              Paket & Harga
            </button>
            <button
              onClick={() => scrollTo('testimoni')}
              className="hover:text-[#684cb6] transition-colors cursor-pointer"
            >
              Testimoni
            </button>
            <button
              onClick={() => scrollTo('faq')}
              className="hover:text-[#684cb6] transition-colors cursor-pointer"
            >
              FAQ
            </button>
          </nav>

          {/* Desktop Right Action Group (Sign In / Sign Up / Enter App) */}
          <div className="hidden sm:flex items-center gap-2.5">
            {isAuthenticated && currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('kasir')}
                  className="px-4 py-2.5 rounded-xl bg-[#684cb6] hover:bg-[#583ca4] text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Store className="w-4 h-4 text-amber-300" />
                  <span>Buka Kasir POS ({currentUser.name})</span>
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Keluar"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Sign In Button */}
                <button
                  type="button"
                  onClick={() => openAuth('signin', 'business')}
                  className="px-4 py-2.5 rounded-xl border border-[#e2e1f2] hover:border-[#684cb6] text-[#1e1b4b] hover:bg-[#f4f2fe] hover:text-[#684cb6] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-2xs"
                >
                  <LogIn className="w-4 h-4 text-[#684cb6]" />
                  <span>Sign In</span>
                </button>

                {/* Sign Up Button */}
                <button
                  type="button"
                  onClick={() => openAuth('signup', 'business')}
                  className="px-5 py-2.5 bg-[#684cb6] hover:bg-[#583ca4] active:scale-[0.98] text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <UserPlus className="w-4 h-4 text-amber-300" />
                  <span>Sign Up Gratis</span>
                </button>

                {/* Direct Demo POS */}
                <button
                  type="button"
                  onClick={() => setActiveTab('kasir')}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#30323e] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  title="Coba Kasir POS Langsung (Demo Mode)"
                >
                  <span>Coba Kasir</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl border border-[#e2e1f2] text-[#30323e] lg:hidden hover:bg-slate-100 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Buka Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-b border-[#e2e1f2] bg-white px-6 py-5 shadow-lg overflow-hidden"
            >
              <div className="flex flex-col gap-3.5 text-sm font-semibold text-[#5d5e6c] mb-5">
                <button
                  onClick={() => scrollTo('fitur')}
                  className="text-left py-2 hover:text-[#684cb6] cursor-pointer min-h-[44px] flex items-center"
                >
                  Fitur Utama
                </button>
                <button
                  onClick={() => scrollTo('solusi')}
                  className="text-left py-2 hover:text-[#684cb6] cursor-pointer min-h-[44px] flex items-center"
                >
                  Solusi Bisnis
                </button>
                <button
                  onClick={() => scrollTo('demo')}
                  className="text-left py-2 hover:text-[#684cb6] cursor-pointer min-h-[44px] flex items-center"
                >
                  Demo Interaktif
                </button>
                <button
                  onClick={() => scrollTo('harga')}
                  className="text-left py-2 hover:text-[#684cb6] cursor-pointer min-h-[44px] flex items-center"
                >
                  Paket & Harga
                </button>
                <button
                  onClick={() => scrollTo('testimoni')}
                  className="text-left py-2 hover:text-[#684cb6] cursor-pointer min-h-[44px] flex items-center"
                >
                  Testimoni Pelanggan
                </button>
                <button
                  onClick={() => scrollTo('faq')}
                  className="text-left py-2 hover:text-[#684cb6] cursor-pointer min-h-[44px] flex items-center"
                >
                  Tanya Jawab (FAQ)
                </button>
              </div>

              {/* Mobile Auth Buttons */}
              <div className="pt-4 border-t border-[#e2e1f2] flex flex-col gap-2.5">
                {isAuthenticated && currentUser ? (
                  <button
                    onClick={() => {
                      setActiveTab('kasir');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-3 bg-[#684cb6] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Store className="w-4 h-4 text-amber-300" />
                    <span>Buka Kasir POS ({currentUser.name})</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => openAuth('signin', 'business')}
                      className="w-full py-3 rounded-xl border border-[#e2e1f2] text-[#1e1b4b] font-bold text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-[#f4f2fe]"
                    >
                      <LogIn className="w-4 h-4 text-[#684cb6]" />
                      <span>Sign In (Masuk Akun)</span>
                    </button>
                    <button
                      onClick={() => openAuth('signup', 'business')}
                      className="w-full py-3 bg-[#684cb6] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <UserPlus className="w-4 h-4 text-amber-300" />
                      <span>Sign Up Akun Baru (Gratis)</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('kasir');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Coba Kasir Langsung</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION (THE ABOVE-THE-FOLD ANCHOR) */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-[#e2e1f2]/60">
        {/* Decorative background grid subtle overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#684cb6_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headlines & Call to Actions */}
            <div className="lg:col-span-7 text-center lg:text-left">
              {/* Trust Pill / Announcement Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f4f2fe] border border-[#e2e1f2] text-xs font-bold text-[#684cb6] mb-6 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="whitespace-nowrap">Solusi Kasir Pintar #1 untuk Ritel & F&B</span>
                <span className="px-1.5 py-0.2 rounded-md bg-[#684cb6] text-white text-[10px] font-extrabold uppercase">
                  v2.5 Baru
                </span>
              </div>

              {/* H1 Value Proposition Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight text-[#1e1b4b] leading-[1.15] mb-5">
                Sistem Kasir & Manajemen Toko Modern yang Bikin Bisnis Lebih Cepat Bertumbuh
              </h1>

              {/* Supportive Subheadline (max 75ch) */}
              <p className="text-base sm:text-lg text-[#5d5e6c] font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-8">
                Kelola transaksi kasir kilat &lt; 2 detik, pantau stok real-time, terima pembayaran QRIS otomatis, dan bangun loyalitas pelanggan VIP dalam satu aplikasi terpadu.
              </p>

              {/* Primary Action Group */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 mb-8">
                <button
                  type="button"
                  onClick={() => openAuth('signup', 'business')}
                  className="w-full sm:w-auto px-7 py-3.5 bg-[#684cb6] hover:bg-[#583ca4] active:scale-[0.98] text-white font-bold rounded-2xl text-base transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2.5 cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>Coba Gratis 14 Hari</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('kasir')}
                  className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-[#f4f2fe] text-[#1e1b4b] font-bold rounded-2xl text-base border border-[#e2e1f2] hover:border-[#684cb6] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <Store className="w-5 h-5 text-[#684cb6]" />
                  <span>Buka Kasir POS Langsung</span>
                </button>
              </div>

              {/* Social Proof / Trust Badge Bar */}
              <div className="pt-6 border-t border-[#e2e1f2]/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#5d5e6c]">
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="font-bold text-[#1e1b4b]">4.9 / 5</span>
                  <span className="text-slate-400">(2.400+ Review)</span>
                </div>

                <div className="flex items-center gap-1.5 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Bank Indonesia QRIS Terverifikasi</span>
                </div>

                <div className="flex items-center gap-1.5 font-semibold">
                  <Users className="w-4 h-4 text-[#684cb6]" />
                  <span>10.000+ Toko Aktif</span>
                </div>
              </div>
            </div>

            {/* Right Column: Realistic Interactive App Mockup Asset */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-5 shadow-2xl border border-[#e2e1f2] relative">
                {/* Mockup Header Switcher */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#e2e1f2]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold text-slate-500 ml-2">Preview Aplikasi</span>
                  </div>

                  <div className="flex items-center bg-[#f4f2fe] p-1 rounded-xl border border-[#e2e1f2]">
                    <button
                      type="button"
                      onClick={() => setHeroActiveTab('pos')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                        heroActiveTab === 'pos'
                          ? 'bg-white text-[#684cb6] shadow-xs'
                          : 'text-slate-500 hover:text-[#30323e]'
                      }`}
                    >
                      Kasir POS
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroActiveTab('member')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                        heroActiveTab === 'member'
                          ? 'bg-white text-[#684cb6] shadow-xs'
                          : 'text-slate-500 hover:text-[#30323e]'
                      }`}
                    >
                      Member VIP
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroActiveTab('analytics')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                        heroActiveTab === 'analytics'
                          ? 'bg-white text-[#684cb6] shadow-xs'
                          : 'text-slate-500 hover:text-[#30323e]'
                      }`}
                    >
                      Analitik
                    </button>
                  </div>
                </div>

                {/* Tab 1: Live Interactive Mini POS Mockup */}
                {heroActiveTab === 'pos' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-[#fbf8ff] p-3 rounded-2xl border border-[#e2e1f2]">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Kasir Aktif</span>
                        <span className="text-xs font-black text-[#1e1b4b]">Kassa 1 • Toko Indah Mart</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Online Sync
                      </span>
                    </div>

                    {/* Fast Products Pick Grid */}
                    <div>
                      <span className="text-xs font-bold text-slate-700 block mb-2">
                        Klik Cepat Tambah Item:
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 101, name: 'Kopi Susu Aren', price: 18000, category: 'Minuman' },
                          { id: 102, name: 'Croissant Butter', price: 24000, category: 'Bakery' },
                          { id: 103, name: 'Teh Melati Segar', price: 8000, category: 'Minuman' },
                          { id: 104, name: 'Roti Cokelat Keju', price: 15000, category: 'Bakery' },
                        ].map((prod) => (
                          <button
                            key={prod.id}
                            type="button"
                            onClick={() => handleSimAdd(prod)}
                            className="p-2.5 bg-[#fbf8ff] hover:bg-[#684cb6]/5 border border-[#e2e1f2] hover:border-[#684cb6] rounded-xl text-left transition-all cursor-pointer flex items-center justify-between group"
                          >
                            <div className="truncate">
                              <span className="text-xs font-bold text-[#1e1b4b] block truncate">
                                {prod.name}
                              </span>
                              <span className="text-[11px] text-[#684cb6] font-extrabold">
                                {formatRupiah(prod.price)}
                              </span>
                            </div>
                            <span className="w-5 h-5 rounded-md bg-white border border-[#e2e1f2] text-[#684cb6] flex items-center justify-center text-xs font-bold group-hover:bg-[#684cb6] group-hover:text-white transition-colors">
                              +
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Cart Summary & Checkout */}
                    <div className="bg-[#1e1b4b] text-white p-4 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
                        <span className="text-slate-300">Total Belanja ({simCart.reduce((s, i) => s + i.qty, 0)} item)</span>
                        <span className="text-base font-black text-amber-300">{formatRupiah(simTotal)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {(['QRIS', 'Tunai', 'Debit'] as const).map((method) => (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setSimPaymentMethod(method)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              simPaymentMethod === method
                                ? 'bg-[#684cb6] text-white'
                                : 'bg-white/10 text-slate-300 hover:text-white'
                            }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={handleSimCompletePayment}
                        className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-white font-extrabold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                        <span>{simPaid ? '✓ Pembayaran Berhasil!' : `Bayar Sekarang (${simPaymentMethod})`}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab 2: Live Digital Member Card */}
                {heroActiveTab === 'member' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-1 p-1 bg-[#f4f2fe] rounded-xl border border-[#e2e1f2]">
                      {(['Silver', 'Gold', 'Platinum', 'Diamond'] as MemberTier[]).map((tier) => (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => setSelectedTier(tier)}
                          className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                            selectedTier === tier
                              ? 'bg-[#684cb6] text-white shadow-xs'
                              : 'text-slate-600 hover:text-[#1e1b4b]'
                          }`}
                        >
                          {tier}
                        </button>
                      ))}
                    </div>

                    <DigitalMemberCard member={demoMember} />

                    <div className="bg-[#fbf8ff] p-3 rounded-2xl border border-[#e2e1f2] flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-500 font-semibold block">Cashback Poin Belanja:</span>
                        <span className="text-xs font-bold text-[#1e1b4b]">
                          {selectedTier === 'Diamond' ? '3x Poin (30% Value)' : selectedTier === 'Platinum' ? '2x Poin (20% Value)' : '1x Poin Reguler'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openAuth('signup', 'member')}
                        className="px-3 py-1.5 bg-[#684cb6] text-white font-bold rounded-lg text-xs cursor-pointer hover:bg-[#583ca4]"
                      >
                        Daftar Member VIP
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab 3: Sales Analytics Graph */}
                {heroActiveTab === 'analytics' && (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#fbf8ff] p-3 rounded-2xl border border-[#e2e1f2]">
                        <span className="text-[11px] text-slate-500 font-semibold block">Omzet Hari Ini</span>
                        <span className="text-base font-black text-[#1e1b4b]">Rp 4.825.000</span>
                        <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1 mt-0.5">
                          <TrendingUp className="w-3 h-3" /> +24% vs kemarin
                        </span>
                      </div>
                      <div className="bg-[#fbf8ff] p-3 rounded-2xl border border-[#e2e1f2]">
                        <span className="text-[11px] text-slate-500 font-semibold block">Total Transaksi</span>
                        <span className="text-base font-black text-[#1e1b4b]">142 Struk</span>
                        <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Rata-rata Rp 33.900</span>
                      </div>
                    </div>

                    <div className="bg-[#fbf8ff] p-3.5 rounded-2xl border border-[#e2e1f2]">
                      <span className="text-xs font-bold text-[#1e1b4b] block mb-2">Metode Pembayaran Terbanyak:</span>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-[11px] font-semibold mb-1">
                            <span className="flex items-center gap-1.5">
                              <QrCode className="w-3.5 h-3.5 text-[#684cb6]" /> QRIS Statis & Dinamis
                            </span>
                            <span className="font-bold text-[#1e1b4b]">62% (Rp 2.99M)</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#684cb6] h-full rounded-full w-[62%]" />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] font-semibold mb-1">
                            <span className="flex items-center gap-1.5">
                              <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Uang Tunai
                            </span>
                            <span className="font-bold text-[#1e1b4b]">28% (Rp 1.35M)</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full w-[28%]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SOCIAL PROOF & CLIENT/PARTNER TRUST BAR */}
      {/* ========================================================================= */}
      <section className="py-12 bg-white border-b border-[#e2e1f2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 mb-8">
            Dipercaya Oleh Ribuan Pengusaha Ritel, F&B, dan Grosir Terkemuka
          </p>

          {/* Monochrome partner badges */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6 items-center justify-center opacity-70 grayscale hover:grayscale-0 transition-all">
            <div className="flex items-center justify-center gap-2 p-2">
              <Store className="w-6 h-6 text-slate-600" />
              <span className="text-sm font-black tracking-tight text-slate-800">TOKO INDAH</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-2">
              <Coffee className="w-6 h-6 text-slate-600" />
              <span className="text-sm font-black tracking-tight text-slate-800">KOPI SENJA</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-2">
              <ShoppingBag className="w-6 h-6 text-slate-600" />
              <span className="text-sm font-black tracking-tight text-slate-800">RITEL MAJU</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-2">
              <Package className="w-6 h-6 text-slate-600" />
              <span className="text-sm font-black tracking-tight text-slate-800">SENTOSA MART</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-2">
              <Flame className="w-6 h-6 text-slate-600" />
              <span className="text-sm font-black tracking-tight text-slate-800">BERKAH JAYA</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-2">
              <Tag className="w-6 h-6 text-slate-600" />
              <span className="text-sm font-black tracking-tight text-slate-800">PRIMA RETAIL</span>
            </div>
          </div>

          {/* Key milestone metrics bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12 pt-10 border-t border-[#e2e1f2]">
            <div className="text-center">
              <span className="text-3xl sm:text-4xl font-black text-[#1e1b4b] block">99.9%</span>
              <span className="text-xs font-semibold text-slate-500 mt-1 block">Uptime Server SLA Cloud</span>
            </div>
            <div className="text-center">
              <span className="text-3xl sm:text-4xl font-black text-[#684cb6] block">Rp 50M+</span>
              <span className="text-xs font-semibold text-slate-500 mt-1 block">Transaksi Sukses Diproses</span>
            </div>
            <div className="text-center">
              <span className="text-3xl sm:text-4xl font-black text-emerald-600 block">&lt; 2 Detik</span>
              <span className="text-xs font-semibold text-slate-500 mt-1 block">Kecepatan Cetak & Checkout</span>
            </div>
            <div className="text-center">
              <span className="text-3xl sm:text-4xl font-black text-amber-500 block">10.000+</span>
              <span className="text-xs font-semibold text-slate-500 mt-1 block">Toko Aktif di 34 Provinsi</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. PROBLEM VS SOLUTION & CORE VALUE PROPOSITIONS (BENTO GRID) */}
      {/* ========================================================================= */}
      <section id="fitur" className="py-20 bg-[#fbf8ff] border-b border-[#e2e1f2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#684cb6] px-3 py-1 rounded-full bg-[#f4f2fe] border border-[#e2e1f2]">
              Solusi Masalah Kasir Konvensional
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1e1b4b] mt-4 mb-4">
              Tinggalkan Kasir Manual yang Lambat & Sering Selisih
            </h2>
            <p className="text-base text-[#5d5e6c] leading-relaxed">
              KASIRKU memecahkan friksi terbesar operasional toko: antrean kasir panjang, kebocoran inventori, serta kehilangan pelanggan setia.
            </p>
          </div>

          {/* Asymmetric Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-6">
            {/* Bento 1: Kasir Cepat (Col 8) */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-8 border border-[#e2e1f2] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#684cb6] flex items-center justify-center mb-5">
                  <Zap className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-[#684cb6] uppercase tracking-wider block mb-1">
                  Point of Sale Ultra Cepat
                </span>
                <h3 className="text-2xl font-black text-[#1e1b4b] mb-3">
                  Checkout Kasir Cepat Kilat dengan Barcode & Multi Pembayaran
                </h3>
                <p className="text-sm text-[#5d5e6c] leading-relaxed max-w-xl mb-6">
                  Dukung barcode scanner kamera, input touch screen kilat, pembayaran QRIS dinamis, kartu debit, hingga uang tunai dengan kalkulasi kembalian otomatis bebas human error.
                </p>
              </div>

              <div className="bg-[#fbf8ff] rounded-2xl p-4 border border-[#e2e1f2] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1e1b4b]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Cetak Struk Bluetooth & USB</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#1e1b4b]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Kirim Struk via WhatsApp</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#1e1b4b]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Dukungan Laci Uang Kasir (Cash Drawer)</span>
                </div>
              </div>
            </div>

            {/* Bento 2: Member VIP Loyalty (Col 4) */}
            <div className="lg:col-span-4 bg-linear-to-br from-[#1e1b4b] to-[#312e81] text-white rounded-3xl p-8 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/10 text-amber-300 flex items-center justify-center mb-5">
                  <Crown className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block mb-1">
                  Loyalty Program Terpadu
                </span>
                <h3 className="text-2xl font-black text-white mb-3">
                  Sistem Member VIP & Poin Otomatis
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  Buat pelanggan betah berbelanja berulang kali dengan sistem kartu digital, tier Silver hingga Diamond, dan voucher reward potongan harga.
                </p>
              </div>

              <div className="p-3.5 bg-white/10 rounded-2xl border border-white/15 text-xs">
                <div className="flex items-center justify-between font-bold text-amber-300 mb-1">
                  <span>Clarissa Aurelia</span>
                  <span>Diamond VIP</span>
                </div>
                <span className="text-slate-300 text-[11px] block">Saldo: 5.200 Poin (Gratis Voucher Rp 50.000)</span>
              </div>
            </div>

            {/* Bento 3: Stok Inventori Real-Time (Col 4) */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-8 border border-[#e2e1f2] shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5">
                  <Package className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                  Manajemen Inventori
                </span>
                <h3 className="text-xl font-black text-[#1e1b4b] mb-3">
                  Pantau Stok Barang & Alert Menipis
                </h3>
                <p className="text-sm text-[#5d5e6c] leading-relaxed mb-6">
                  Stok langsung berkurang otomatis setiap transaksi kasir. Dapatkan notifikasi dini saat produk favorit hampir habis.
                </p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Alert: 3 produk tersisa di bawah batas minimum</span>
              </div>
            </div>

            {/* Bento 4: Laporan Keuangan & Shift Kasir (Col 4) */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-8 border border-[#e2e1f2] shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-5">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block mb-1">
                  Analitik & Laporan
                </span>
                <h3 className="text-xl font-black text-[#1e1b4b] mb-3">
                  Rekap Shift & Laba Rugi Otomatis
                </h3>
                <p className="text-sm text-[#5d5e6c] leading-relaxed mb-6">
                  Closing toko tidak lagi memusingkan. Hitung kas awal, kas masuk, selisih tunai, serta unduh laporan penjualan Excel/PDF dalam 1 detik.
                </p>
              </div>

              <div className="p-3 bg-[#fbf8ff] border border-[#e2e1f2] rounded-2xl flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">Ekspor Laporan:</span>
                <span className="font-bold text-[#684cb6]">Excel & PDF Ready</span>
              </div>
            </div>

            {/* Bento 5: Multi Pengguna & Hak Akses RBAC (Col 4) */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-8 border border-[#e2e1f2] shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-5">
                  <Shield className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-1">
                  Keamanan & Otorisasi
                </span>
                <h3 className="text-xl font-black text-[#1e1b4b] mb-3">
                  Multi Akun Petugas & Hak Akses (RBAC)
                </h3>
                <p className="text-sm text-[#5d5e6c] leading-relaxed mb-6">
                  Pisahkan wewenang antara Super Admin (Owner), Manajer, dan Kasir. Cegah kecurangan dengan log aktivitas lengkap per transaksi.
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Enkripsi Database Cloud Aman</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. DEEP-DIVE FEATURES & INTERACTIVE DEMONSTRATION */}
      {/* ========================================================================= */}
      <section id="demo" className="py-20 bg-white border-b border-[#e2e1f2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#684cb6] px-3 py-1 rounded-full bg-[#f4f2fe] border border-[#e2e1f2]">
              Simulasi Langsung
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1e1b4b] mt-4 mb-4">
              Hitung Potensi Efisiensi & Keuntungan Toko Anda
            </h2>
            <p className="text-base text-[#5d5e6c]">
              Gunakan kalkulator interaktif di bawah untuk melihat estimasi waktu yang dihemat dan lonjakan omzet bisnis Anda.
            </p>
          </div>

          <div className="bg-[#fbf8ff] rounded-3xl p-6 sm:p-10 border border-[#e2e1f2] shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Sliders Input Column */}
              <div className="lg:col-span-7 space-y-7">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-bold text-[#1e1b4b]">
                      Jumlah Transaksi Toko per Bulan:
                    </label>
                    <span className="text-base font-black text-[#684cb6] bg-purple-100 px-3 py-1 rounded-xl">
                      {formatNumber(calcMonthlyTransactions)} Transaksi
                    </span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="5000"
                    step="100"
                    value={calcMonthlyTransactions}
                    onChange={(e) => setCalcMonthlyTransactions(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#684cb6]"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>200 Transaksi (Toko Baru)</span>
                    <span>5.000 Transaksi (Super Sibuk)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-bold text-[#1e1b4b]">
                      Rata-rata Nilai Belanja (Average Basket Size):
                    </label>
                    <span className="text-base font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-xl">
                      {formatRupiah(calcAverageBasket)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15000"
                    max="250000"
                    step="5000"
                    value={calcAverageBasket}
                    onChange={(e) => setCalcAverageBasket(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#006d4b]"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>Rp 15.000 (Minuman/Snack)</span>
                    <span>Rp 250.000 (Grosir/Supermarket)</span>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#e2e1f2] flex items-start gap-3">
                  <CheckCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Sistem otomatisasi kasir & program loyalty terbukti meningkatkan frekuensi belanja pelanggan rata-rata <strong>18% hingga 25%</strong> dalam 60 hari pertama penggunaan.
                  </p>
                </div>
              </div>

              {/* Outputs Summary Column */}
              <div className="lg:col-span-5 bg-[#1e1b4b] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300 block mb-1">
                    Hasil Analisis Efisiensi
                  </span>
                  <h4 className="text-xl font-black text-white mb-6">
                    Estimasi Dampak Nyata pada Toko:
                  </h4>

                  <div className="space-y-5">
                    <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
                      <span className="text-xs text-slate-300 block">Waktu Antrean Kasir yang Dihemat:</span>
                      <span className="text-2xl sm:text-3xl font-black text-amber-300 block mt-1">
                        ~{calcOutput.hoursSavedPerMonth} Jam / Bulan
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Pelanggan tidak lagi menunggu lama & antrean berkurang 40%.
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
                      <span className="text-xs text-slate-300 block">Estimasi Omzet Bulanan Toko:</span>
                      <span className="text-2xl sm:text-3xl font-black text-emerald-400 block mt-1">
                        {formatRupiah(calcOutput.monthlyGross)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openAuth('signup', 'business')}
                  className="w-full mt-6 py-3.5 bg-[#684cb6] hover:bg-[#583ca4] active:scale-[0.98] text-white font-bold rounded-2xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Mulai Rasakan Manfaatnya Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. CUSTOMER TESTIMONIALS & WALL OF LOVE */}
      {/* ========================================================================= */}
      <section id="testimoni" className="py-20 bg-[#fbf8ff] border-b border-[#e2e1f2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#684cb6] px-3 py-1 rounded-full bg-[#f4f2fe] border border-[#e2e1f2]">
              Wall of Love
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1e1b4b] mt-4 mb-4">
              Cerita Sukses dari Pemilik Toko di Seluruh Indonesia
            </h2>
            <p className="text-base text-[#5d5e6c]">
              Lihat bagaimana KASIRKU mengubah operasional toko mereka menjadi jauh lebih teratur, cepat, dan menguntungkan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                quote:
                  'Sebelum pakai KASIRKU, closing kasir tiap malam butuh waktu hampir 1 jam karena nota manual sering selisih. Sekarang dalam 2 menit rekap shift langsung beres dan pas ke rupiah terakhir!',
                name: 'Hendra Wijaya',
                role: 'Pemilik Toko',
                store: 'Toko Berkah Mandiri - Surabaya',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
              },
              {
                quote:
                  'Fitur Member VIP bikin pelanggan kafe saya sangat rajin balik buat kumpulin poin. Pembayaran QRIS dinamisnya juga sangat cepat, kasir tidak perlu repot cek mutasi manual.',
                name: 'Dewi Kartika',
                role: 'Founder',
                store: 'Kopi & Pastry Senja - Bandung',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
              },
              {
                quote:
                  'Sistem scan barcode produknya sangat responsif bahkan lewat kamera HP biasa. Inventori 3.000+ item di swalayan kami terpantau rapi tanpa pernah kecolongan stok lagi.',
                name: 'Rudi Hartono',
                role: 'Manajer Operasional',
                store: 'Sentosa Swalayan - Jakarta Barat',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
              },
              {
                quote:
                  'Bisa cetak struk thermal via Bluetooth dengan logo toko kami sendiri. Tampilannya elegan, pelanggan merasa berbelanja di butik modern. Sangat direkomendasikan!',
                name: 'Anisa Rahmawati',
                role: 'Owner',
                store: 'Cantika Beauty Care - Yogyakarta',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              },
              {
                quote:
                  'Karyawan kasir baru saya hanya butuh 10 menit training sudah langsung lancar melayani pembeli. Antarmukanya sangat intuitif dan berbahasa Indonesia dengan jelas.',
                name: 'Budi Pratama',
                role: 'Store Manager',
                store: 'Jaya Fashion & Retail - Semarang',
                avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
              },
              {
                quote:
                  'Fitur multi user dengan hak akses kasir vs admin sangat menjaga keamanan data keuangan kami. Laporan harian dikirim otomatis, memantau toko dari mana saja jadi tenang.',
                name: 'Linda Kusuma',
                role: 'Co-Founder',
                store: 'Fresh Groceries Medan - Medan',
                avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
              },
            ].map((t, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-3xl border border-[#e2e1f2] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex text-amber-400 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-[#30323e] leading-relaxed mb-6 italic">
                    "{t.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-[#e2e1f2]/80">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-11 h-11 rounded-full object-cover border border-purple-200"
                  />
                  <div>
                    <h5 className="text-sm font-black text-[#1e1b4b] leading-tight">{t.name}</h5>
                    <p className="text-xs text-[#684cb6] font-semibold">{t.role} • {t.store}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. TRANSPARENT PRICING MATRIX */}
      {/* ========================================================================= */}
      <section id="harga" className="py-20 bg-white border-b border-[#e2e1f2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#684cb6] px-3 py-1 rounded-full bg-[#f4f2fe] border border-[#e2e1f2]">
              Investasi Transparan
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1e1b4b] mt-4 mb-4">
              Pilihan Paket yang Sesuai dengan Skala Usaha Anda
            </h2>
            <p className="text-base text-[#5d5e6c]">
              Mulai gratis selamanya atau tingkatkan ke fitur Pro tanpa biaya tersembunyi.
            </p>

            {/* Monthly / Annual Billing Toggle */}
            <div className="inline-flex items-center gap-3 bg-[#fbf8ff] p-1.5 rounded-2xl border border-[#e2e1f2] mt-8 shadow-xs">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-[#1e1b4b] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#1e1b4b]'
                }`}
              >
                Bulanan
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  billingCycle === 'annual'
                    ? 'bg-[#684cb6] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#1e1b4b]'
                }`}
              >
                <span>Tahunan</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-300 text-amber-950 text-[10px] font-extrabold uppercase">
                  Hemat 20%
                </span>
              </button>
            </div>
          </div>

          {/* 3-Tier Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Tier 1: Starter / Free */}
            <div className="bg-[#fbf8ff] rounded-3xl p-8 border border-[#e2e1f2] flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Untuk Toko Baru & Rintisan
                </span>
                <h3 className="text-2xl font-black text-[#1e1b4b] mb-2">Starter (Gratis)</h3>
                <p className="text-xs text-slate-500 mb-6">
                  Cocok untuk warung mandiri, UMKM pemula, atau pedagang kaki lima.
                </p>

                <div className="mb-6 pb-6 border-b border-[#e2e1f2]">
                  <span className="text-4xl font-black text-[#1e1b4b]">Rp 0</span>
                  <span className="text-xs text-slate-500 ml-1">/ selamanya</span>
                </div>

                <ul className="space-y-3.5 text-xs text-slate-700 mb-8">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Hingga 100 Produk Inventori</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>1 Akun Kasir Aktif</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Cetak Struk Transaksi Standar</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Pembayaran Tunai & QRIS</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Laporan Penjualan Harian</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => openAuth('signup', 'business')}
                className="w-full py-3.5 rounded-xl border border-[#e2e1f2] hover:border-[#684cb6] text-[#1e1b4b] font-bold text-xs transition-all hover:bg-white cursor-pointer"
              >
                Mulai Gratis Sekarang
              </button>
            </div>

            {/* Tier 2: Pro Bisnis (Highlighted) */}
            <div className="bg-white rounded-3xl p-8 border-2 border-[#684cb6] shadow-xl flex flex-col justify-between relative transform lg:-translate-y-2">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-linear-to-r from-[#684cb6] to-[#4f378b] text-white text-xs font-black uppercase tracking-wider shadow-md">
                Paling Populer
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#684cb6] block mb-2 mt-2">
                  Untuk Ritel, Kafe & Minimarket
                </span>
                <h3 className="text-2xl font-black text-[#1e1b4b] mb-2">Pro Bisnis</h3>
                <p className="text-xs text-slate-500 mb-6">
                  Solusi terlengkap untuk toko berkembang yang butuh member & stok otomatis.
                </p>

                <div className="mb-6 pb-6 border-b border-[#e2e1f2]">
                  <span className="text-4xl font-black text-[#684cb6]">
                    {billingCycle === 'annual' ? 'Rp 119.000' : 'Rp 149.000'}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">/ bulan</span>
                  {billingCycle === 'annual' && (
                    <span className="text-[10px] text-emerald-700 font-bold block mt-1">
                      Ditagih tahunan (Hemat Rp 360.000/tahun)
                    </span>
                  )}
                </div>

                <ul className="space-y-3.5 text-xs text-slate-700 mb-8">
                  <li className="flex items-center gap-2.5 font-semibold text-[#1e1b4b]">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Produk & Transaksi Unlimited</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Multi Akun Kasir & Shift (Unlimited)</span>
                  </li>
                  <li className="flex items-center gap-2.5 font-semibold text-[#684cb6]">
                    <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                    <span><strong>Sistem Member VIP & Loyalty Poin</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Cetak Struk Bluetooth & Custom Logo Struk</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Alert Stok Menipis & Log Riwayat Stok</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Ekspor Laporan Penjualan Excel & PDF</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Dukungan CS WhatsApp Prioritas</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => openAuth('signup', 'business')}
                className="w-full py-3.5 rounded-xl bg-[#684cb6] hover:bg-[#583ca4] active:scale-[0.98] text-white font-bold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Coba Pro Gratis 14 Hari</span>
              </button>
            </div>

            {/* Tier 3: Enterprise / Multi-Cabang */}
            <div className="bg-[#fbf8ff] rounded-3xl p-8 border border-[#e2e1f2] flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Untuk Multi Outlet & Grosir
                </span>
                <h3 className="text-2xl font-black text-[#1e1b4b] mb-2">Enterprise</h3>
                <p className="text-xs text-slate-500 mb-6">
                  Dirancang khusus bagi rantai ritel dengan banyak cabang dan gudang terpusat.
                </p>

                <div className="mb-6 pb-6 border-b border-[#e2e1f2]">
                  <span className="text-4xl font-black text-[#1e1b4b]">
                    {billingCycle === 'annual' ? 'Rp 319.000' : 'Rp 399.000'}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">/ bulan</span>
                  {billingCycle === 'annual' && (
                    <span className="text-[10px] text-emerald-700 font-bold block mt-1">
                      Ditagih tahunan (Hemat Rp 960.000/tahun)
                    </span>
                  )}
                </div>

                <ul className="space-y-3.5 text-xs text-slate-700 mb-8">
                  <li className="flex items-center gap-2.5 font-bold text-[#1e1b4b]">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Semua Fitur di Paket Pro Bisnis</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Kelola Banyak Cabang / Multi Outlet</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Transfer Stok Antar Toko & Gudang</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Integrasi API & Database Kustom</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Account Manager Khusus & SLA 99.9%</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => openAuth('signup', 'business')}
                className="w-full py-3.5 rounded-xl border border-[#e2e1f2] hover:border-[#684cb6] text-[#1e1b4b] font-bold text-xs transition-all hover:bg-white cursor-pointer"
              >
                Hubungi Konsultan Enterprise
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. INTERACTIVE FAQ ACCORDION */}
      {/* ========================================================================= */}
      <section id="faq" className="py-20 bg-[#fbf8ff] border-b border-[#e2e1f2]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#684cb6] px-3 py-1 rounded-full bg-[#f4f2fe] border border-[#e2e1f2]">
              Tanya Jawab Populer
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1e1b4b] mt-4 mb-4">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-base text-[#5d5e6c]">
              Punya pertanyaan seputar penggunaan KASIRKU? Kami kumpulkan jawaban paling jelas untuk Anda.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Apakah KASIRKU tetap bisa digunakan saat internet lambat atau offline?',
                a: 'Bisa! KASIRKU dilengkapi sistem cache offline lokal pintar. Anda tetap dapat memproses transaksi kasir, menyimpan struk, dan mencetak nota. Saat koneksi internet kembali pulih, seluruh data transaksi akan tersinkronisasi otomatis ke cloud tanpa risiko data hilang.',
              },
              {
                q: 'Perangkat dan printer apa saja yang kompatibel dengan KASIRKU?',
                a: 'KASIRKU kompatibel dengan 99% printer thermal kasir (58mm & 80mm) yang mendukung koneksi Bluetooth, USB, maupun LAN/WiFi. Anda bisa mengakses aplikasi lewat Laptop (Windows, Mac, Chromebook), Tablet (iPad, Android), maupun Smartphone tanpa perlu membeli perangkat kasir khusus yang mahal.',
              },
              {
                q: 'Bagaimana cara memasukkan produk saya yang sudah ada?',
                a: 'Sangat mudah! Anda dapat menambahkan produk satu per satu langsung dari menu Produk, atau mengunggah data massal lewat file Excel/CSV. Tim support kami juga siap membantu proses migrasi data Anda secara gratis.',
              },
              {
                q: 'Apakah ada potongan biaya atau komisi tersembunyi per transaksi?',
                a: 'Tidak ada! KASIRKU tidak memotong komisi sepeser pun dari penjualan toko Anda. Untuk transaksi QRIS Bank Indonesia, biaya MDR mengikuti ketentuan resmi standar nasional (0% - 0.3%). Seluruh omzet penjualan masuk utuh ke rekening toko Anda.',
              },
              {
                q: 'Bagaimana keamanan data penjualan dan privasi toko saya?',
                a: 'Keamanan data adalah prioritas utama kami. Data Anda dienkripsi 256-bit standar perbankan dan dicadangkan secara otomatis di server cloud dengan sertifikasi keamanan ISO/IEC 27001. Hanya pemilik toko dan staf berwenang yang dapat melihat laporan penjualan.',
              },
              {
                q: 'Apakah bisa digunakan untuk banyak kasir dan banyak cabang toko?',
                a: 'Tentu saja! Anda bisa mendaftarkan banyak staf kasir dengan akun masing-masing, lengkap dengan sistem buka/tutup kasir (shift shift log). Untuk paket Enterprise, Anda juga dapat mengelola multi-cabang dari satu dasbor pusat.',
              },
            ].map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-[#e2e1f2] overflow-hidden transition-all shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  >
                    <span className="text-sm sm:text-base font-bold text-[#1e1b4b]">
                      {faq.q}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[#f4f2fe] text-[#684cb6] flex items-center justify-center shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#5d5e6c] leading-relaxed border-t border-[#e2e1f2]/60">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. HIGH-IMPACT FINAL CTA BANNER */}
      {/* ========================================================================= */}
      <section className="py-16 bg-linear-to-r from-[#1e1b4b] via-[#312e81] to-[#4f378b] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300 mb-6">
            <Zap className="w-4 h-4" />
            <span>Mulai Dalam 60 Detik Tanpa Kartu Kredit</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-6 max-w-3xl mx-auto leading-tight">
            Siap Tingkatkan Penjualan & Rapikan Pembukuan Toko Anda?
          </h2>

          <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto mb-9 leading-relaxed">
            Bergabunglah dengan lebih dari 10.000 pemilik bisnis yang telah mempercepat antrean kasir dan melipatgandakan pelanggan setia bersama KASIRKU.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => openAuth('signup', 'business')}
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-100 text-[#1e1b4b] font-black rounded-2xl text-base transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-5 h-5 text-[#684cb6]" />
              <span>Daftar Akun Toko Gratis</span>
              <ArrowRight className="w-4 h-4 text-[#684cb6]" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('kasir')}
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-base border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Store className="w-5 h-5 text-amber-300" />
              <span>Coba Demo Kasir POS</span>
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> Bebas biaya setup
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> Bantuan setup awal gratis
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> Batalkan kapan saja
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. RETENTION FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-white border-t border-[#e2e1f2] pt-16 pb-12 text-[#5d5e6c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            {/* Col 1: Brand Info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#684cb6] text-white flex items-center justify-center shadow-md">
                  <Store className="w-5 h-5 text-amber-300" />
                </div>
                <span className="text-xl font-black tracking-tight text-[#1e1b4b]">
                  KASIRKU POS
                </span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed max-w-sm text-slate-500">
                Aplikasi Point of Sale (POS) & Manajemen Toko pintar berbasis Cloud. Membantu UMKM dan ritel modern meningkatkan efisiensi kasir, pengelolaan inventori, dan loyalitas pelanggan.
              </p>
              <div className="pt-2 text-xs text-slate-400">
                <p>📍 Gedung Cyber 2 Tower Lt. 18, Jakarta Selatan</p>
                <p className="mt-1">📞 Hubungi Kami: (021) 555-0199 / WhatsApp Support 24/7</p>
              </div>
            </div>

            {/* Col 2: Produk */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-[#1e1b4b] mb-4">
                Fitur & Produk
              </h5>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <button onClick={() => setActiveTab('kasir')} className="hover:text-[#684cb6] transition-colors cursor-pointer">
                    Aplikasi Kasir POS
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('member')} className="hover:text-[#684cb6] transition-colors cursor-pointer">
                    Member VIP & Loyalty
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollTo('fitur')} className="hover:text-[#684cb6] transition-colors cursor-pointer">
                    Manajemen Stok Barang
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollTo('fitur')} className="hover:text-[#684cb6] transition-colors cursor-pointer">
                    Laporan Penjualan & Laba
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollTo('fitur')} className="hover:text-[#684cb6] transition-colors cursor-pointer">
                    Pembayaran QRIS Dinamis
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Solusi Bisnis */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-[#1e1b4b] mb-4">
                Solusi Bisnis
              </h5>
              <ul className="space-y-2.5 text-xs">
                <li><span className="hover:text-[#684cb6] cursor-pointer">Minimarket & Swalayan</span></li>
                <li><span className="hover:text-[#684cb6] cursor-pointer">Kafe, Resto & Coffee Shop</span></li>
                <li><span className="hover:text-[#684cb6] cursor-pointer">Fashion, Butik & Ritel</span></li>
                <li><span className="hover:text-[#684cb6] cursor-pointer">Apotek & Toko Kosmetik</span></li>
                <li><span className="hover:text-[#684cb6] cursor-pointer">Toko Bangunan & Grosir</span></li>
              </ul>
            </div>

            {/* Col 4: Keamanan & Legalitas */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-[#1e1b4b] mb-4">
                Legal & Keamanan
              </h5>
              <ul className="space-y-2.5 text-xs">
                <li><span className="hover:text-[#684cb6] cursor-pointer">Kebijakan Privasi Data</span></li>
                <li><span className="hover:text-[#684cb6] cursor-pointer">Ketentuan Layanan</span></li>
                <li><span className="hover:text-[#684cb6] cursor-pointer">Standar Keamanan Cloud</span></li>
                <li><span className="hover:text-[#684cb6] cursor-pointer">SLA & Uptime Server</span></li>
                <li><span className="hover:text-[#684cb6] cursor-pointer">Panduan Pengguna</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#e2e1f2] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© 2026 KASIRKU POS. Hak Cipta Dilindungi Undang-Undang.</p>
            <div className="flex items-center gap-6">
              <span className="hover:text-[#684cb6] cursor-pointer">Privasi</span>
              <span className="hover:text-[#684cb6] cursor-pointer">Syarat & Ketentuan</span>
              <span className="hover:text-[#684cb6] cursor-pointer">Keamanan</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 11. UNIFIED SIGN IN & SIGN UP MODAL */}
      {/* ========================================================================= */}
      <AppAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        initialUserType={authModalUserType}
      />
    </div>
  );
};
