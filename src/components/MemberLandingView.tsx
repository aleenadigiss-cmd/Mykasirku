import React, { useState, useMemo, useRef, useEffect } from 'react';
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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { usePos } from '../context/PosContext';
import { Member, MemberRewardVoucher, MemberTier, RedeemedVoucher } from '../types';
import { formatNumber, formatRupiah } from '../utils/formatters';
import { DigitalMemberCard } from './DigitalMemberCard';

export const MemberLandingView: React.FC = () => {
  const {
    members,
    rewardVouchers,
    addMember,
    redeemRewardVoucher,
    setActiveTab,
    settings,
    setActivePosMember,
  } = usePos();

  // Navigation & UI States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTierPreview, setActiveTierPreview] = useState<MemberTier>('Platinum');
  const [selectedVoucherCategory, setSelectedVoucherCategory] = useState<string>('Semua');

  // Interactive Calculator States
  const [calcMonthlySpend, setCalcMonthlySpend] = useState<number>(1500000);
  const [calcFrequency, setCalcFrequency] = useState<'weekly' | 'semiweekly' | 'daily'>('weekly');

  // Live Member Lookup & Card State
  const [lookupQuery, setLookupQuery] = useState<string>('081234567890');
  const [activeLookupMember, setActiveLookupMember] = useState<Member>(() => members[0] || {
    id: 'MBR-7701',
    name: 'Clarissa Aurelia',
    phone: '081234567890',
    email: 'clarissa.aurelia@gmail.com',
    tier: 'Diamond',
    points: 4850,
    totalSpent: 18250000,
    transactionsCount: 46,
    joinDate: '12 Jan 2024',
    barcode: '9988221045',
    qrCode: 'KASIRKU-MBR-7701-DIAMOND',
  });
  const [lookupError, setLookupError] = useState<string>('');

  // Modals
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [showVoucherRedeemModal, setShowVoucherRedeemModal] = useState<MemberRewardVoucher | null>(null);
  const [showFullscreenBarcode, setShowFullscreenBarcode] = useState<boolean>(false);
  const [lastRedeemedVoucher, setLastRedeemedVoucher] = useState<RedeemedVoucher | null>(null);

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regBirthDate, setRegBirthDate] = useState('');
  const [regError, setRegError] = useState('');

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Sync lookup member if members state updates
  useEffect(() => {
    if (activeLookupMember) {
      const refreshed = members.find((m) => m.id === activeLookupMember.id);
      if (refreshed) {
        setActiveLookupMember(refreshed);
      }
    }
  }, [members]);

  // Demo Member Preview generator for Hero Section
  const previewMemberForHero = useMemo<Member>(() => {
    const existing = members.find((m) => m.tier === activeTierPreview);
    if (existing) return existing;

    return {
      id: `MBR-${activeTierPreview.toUpperCase()}-01`,
      name: `Member ${activeTierPreview} VIP`,
      phone: '0812-3456-7890',
      email: 'member@vipclub.id',
      tier: activeTierPreview,
      points: activeTierPreview === 'Diamond' ? 5200 : activeTierPreview === 'Platinum' ? 2800 : activeTierPreview === 'Gold' ? 1200 : 500,
      totalSpent: activeTierPreview === 'Diamond' ? 16000000 : activeTierPreview === 'Platinum' ? 6000000 : activeTierPreview === 'Gold' ? 2000000 : 500000,
      transactionsCount: 20,
      joinDate: 'Jan 2024',
      barcode: '9988112233',
      qrCode: `KASIRKU-VIP-${activeTierPreview}`,
    };
  }, [activeTierPreview, members]);

  // Handle Search Member Lookup
  const handleLookup = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = lookupQuery.trim().toLowerCase();
    if (!q) {
      setLookupError('Silakan masukkan nomor WhatsApp atau ID Member.');
      return;
    }
    const cleanNum = q.replace(/[^0-9]/g, '');
    const found = members.find(
      (m) =>
        (cleanNum && m.phone.replace(/[^0-9]/g, '').includes(cleanNum)) ||
        m.id.toLowerCase() === q ||
        m.barcode === q ||
        m.name.toLowerCase().includes(q)
    );

    if (found) {
      setActiveLookupMember(found);
      setLookupError('');
    } else {
      setLookupError('Member tidak ditemukan. Silakan periksa kembali atau daftar baru.');
    }
  };

  // Quick Select Demo Member
  const handleSelectDemoMember = (member: Member) => {
    setActiveLookupMember(member);
    setLookupQuery(member.phone);
    setLookupError('');
  };

  // Calculator Outputs
  const calcResults = useMemo(() => {
    const annualSpend = calcMonthlySpend * 12;
    let tier: MemberTier = 'Silver';
    let multiplier = 1;

    if (annualSpend >= 15000000) {
      tier = 'Diamond';
      multiplier = 3;
    } else if (annualSpend >= 5000000) {
      tier = 'Platinum';
      multiplier = 2;
    } else if (annualSpend >= 1500000) {
      tier = 'Gold';
      multiplier = 1.5;
    }

    const monthlyPoints = Math.floor((calcMonthlySpend / 1000) * multiplier);
    const annualPoints = monthlyPoints * 12;
    const cashbackRupiah = Math.floor(annualPoints * 100); // 1 point = Rp 100 voucher value
    const vouchersCount = Math.floor(annualPoints / 500); // ~1 voucher 50k per 500 points

    return {
      tier,
      multiplier,
      monthlyPoints,
      annualPoints,
      cashbackRupiah,
      vouchersCount: Math.max(1, vouchersCount),
    };
  }, [calcMonthlySpend, calcFrequency]);

  // Handle Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      setRegError('Nama lengkap wajib diisi.');
      return;
    }
    if (!regPhone.trim() || regPhone.replace(/[^0-9]/g, '').length < 8) {
      setRegError('Nomor WhatsApp tidak valid (min. 8 digit).');
      return;
    }

    const existing = members.find(
      (m) => m.phone.replace(/[^0-9]/g, '') === regPhone.replace(/[^0-9]/g, '')
    );
    if (existing) {
      setRegError(`Nomor HP ini sudah terdaftar atas nama ${existing.name}.`);
      return;
    }

    const created = addMember({
      name: regName,
      phone: regPhone,
      email: regEmail,
      birthDate: regBirthDate,
    });

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.5 },
    });

    setActiveLookupMember(created);
    setLookupQuery(created.phone);
    setShowRegisterModal(false);
    setRegName('');
    setRegPhone('');
    setRegEmail('');
    setRegBirthDate('');
    setRegError('');
  };

  // Handle Voucher Redemption
  const handleConfirmRedeem = () => {
    if (!showVoucherRedeemModal || !activeLookupMember) return;

    const res = redeemRewardVoucher(activeLookupMember.id, showVoucherRedeemModal.id);
    if (res.success && res.voucher) {
      setLastRedeemedVoucher(res.voucher);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  // Filter Vouchers
  const filteredVouchers = useMemo(() => {
    if (selectedVoucherCategory === 'Semua') return rewardVouchers;
    return rewardVouchers.filter((v) => v.category === selectedVoucherCategory);
  }, [rewardVouchers, selectedVoucherCategory]);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqList = [
    {
      q: 'Apakah pendaftaran Member Kasirku VIP dipungut biaya?',
      a: '100% Gratis selamanya! Anda langsung mendapatkan Welcome Bonus 500 Poin saat pertama kali mendaftar tanpa biaya bulanan maupun tahunan.',
    },
    {
      q: 'Bagaimana cara mengumpulkan poin saat berbelanja di kasir?',
      a: 'Sangat mudah! Cukup sebutkan nomor WhatsApp yang terdaftar atau tunjukkan barcode/QR kartu digital di layar smartphone Anda kepada kasir saat pembayaran.',
    },
    {
      q: 'Apakah poin member memiliki masa kedaluwarsa?',
      a: 'Poin Anda aktif selama akun Anda melakukan minimal 1 kali transaksi dalam kurun waktu 12 bulan. Transaksi rutin akan memperpanjang masa aktif seluruh saldo poin Anda.',
    },
    {
      q: 'Bagaimana cara menukarkan voucher reward yang sudah saya klaim?',
      a: 'Setiap voucher yang Anda tukar akan menghasilkan kode voucher unik. Cukup tunjukkan kode tersebut kepada petugas kasir untuk langsung memotong total tagihan belanja Anda.',
    },
    {
      q: 'Bagaimana cara naik ke tingkat Gold, Platinum, dan Diamond VIP?',
      a: 'Sistem kami secara otomatis menghitung akumulasi total belanja tahunan Anda. Begitu Anda mencapai ambang batas belanja, status keanggotaan Anda akan naik secara otomatis seketika itu juga.',
    },
    {
      q: 'Apakah kartu digital ini bisa digunakan di semua cabang Toko Indah?',
      a: 'Ya, seluruh data keanggotaan, saldo poin, dan voucher Anda tersinkronisasi secara real-time di seluruh cabang toko jaringan Kasirku Mart.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#fbf8ff] text-[#30323e] font-sans antialiased selection:bg-[#684cb6]/20 selection:text-[#684cb6] flex flex-col">
      {/* ========================================================================= */}
      {/* 1. STICKY TOP NAVIGATION BAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#e2e1f2] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-[#684cb6] to-[#4f378b] text-white flex items-center justify-center shadow-md">
              <Crown className="w-6 h-6 text-amber-300 fill-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-[#1e1b4b] font-sans">
                  KASIRKU
                </span>
                <span className="text-xs uppercase font-extrabold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                  VIP CLUB
                </span>
              </div>
              <p className="text-xs text-[#5d5e6c] font-medium hidden sm:block">
                Loyalty, Rewards & Exclusive Privileges
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-[#5d5e6c]">
            <button
              onClick={() => scrollToSection('benefits')}
              className="hover:text-[#684cb6] transition-colors cursor-pointer"
            >
              Keuntungan VIP
            </button>
            <button
              onClick={() => scrollToSection('tiers')}
              className="hover:text-[#684cb6] transition-colors cursor-pointer"
            >
              Level & Tier
            </button>
            <button
              onClick={() => scrollToSection('calculator')}
              className="hover:text-[#684cb6] transition-colors cursor-pointer"
            >
              Kalkulator Reward
            </button>
            <button
              onClick={() => scrollToSection('catalog')}
              className="hover:text-[#684cb6] transition-colors cursor-pointer"
            >
              Katalog Voucher
            </button>
            <button
              onClick={() => scrollToSection('check-status')}
              className="hover:text-[#684cb6] transition-colors cursor-pointer"
            >
              Cek Kartu & Poin
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="hover:text-[#684cb6] transition-colors cursor-pointer"
            >
              FAQ
            </button>
          </nav>

          {/* Desktop Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => setActiveTab('kasir')}
              className="px-4 py-2.5 rounded-xl border border-[#e2e1f2] text-[#30323e] hover:bg-[#f4f2fe] hover:text-[#684cb6] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="Beralih ke Aplikasi Kasir POS"
            >
              <Store className="w-4 h-4 text-[#684cb6]" />
              <span>Buka Kasir POS</span>
            </button>

            <button
              onClick={() => setShowRegisterModal(true)}
              className="px-6 py-3 bg-[#684cb6] hover:bg-[#583ca4] active:scale-[0.98] text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Daftar Member Gratis</span>
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl border border-[#e2e1f2] text-[#30323e] lg:hidden hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Buka Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-b border-[#e2e1f2] bg-white px-5 py-4 space-y-3"
            >
              <div className="flex flex-col space-y-2 text-sm font-bold text-[#30323e]">
                <button
                  onClick={() => scrollToSection('benefits')}
                  className="text-left py-2 hover:text-[#684cb6]"
                >
                  Keuntungan VIP
                </button>
                <button
                  onClick={() => scrollToSection('tiers')}
                  className="text-left py-2 hover:text-[#684cb6]"
                >
                  Level & Tier Keanggotaan
                </button>
                <button
                  onClick={() => scrollToSection('calculator')}
                  className="text-left py-2 hover:text-[#684cb6]"
                >
                  Kalkulator Reward & Cashback
                </button>
                <button
                  onClick={() => scrollToSection('catalog')}
                  className="text-left py-2 hover:text-[#684cb6]"
                >
                  Katalog Voucher Belanja
                </button>
                <button
                  onClick={() => scrollToSection('check-status')}
                  className="text-left py-2 hover:text-[#684cb6]"
                >
                  Cek Status Kartu Saya
                </button>
                <button
                  onClick={() => scrollToSection('faq')}
                  className="text-left py-2 hover:text-[#684cb6]"
                >
                  Tanya Jawab (FAQ)
                </button>
              </div>

              <div className="pt-3 border-t border-[#e2e1f2] flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowRegisterModal(true);
                  }}
                  className="w-full py-3 bg-[#684cb6] text-white font-bold rounded-xl text-center text-sm shadow-md flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Daftar Member Baru (+500 Poin)</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setActiveTab('kasir');
                  }}
                  className="w-full py-2.5 border border-[#e2e1f2] rounded-xl text-center text-xs font-bold text-[#30323e] flex items-center justify-center gap-1.5"
                >
                  <Store className="w-4 h-4 text-[#684cb6]" />
                  <span>Buka Aplikasi Kasir POS</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION: THE ABOVE-THE-FOLD ANCHOR */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-[#e2e1f2] bg-radial from-[#ffffff] via-[#fbf8ff] to-[#f4f0fc]">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#684cb6]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Value Proposition & CTAs */}
            <div className="lg:col-span-7 flex flex-col items-start space-y-6">
              {/* Trust Badge Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#e2e1f2] shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-[#1e1b4b]">
                  Program Loyalitas Resmi Toko Indah
                </span>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-[#684cb6] text-white">
                  Gratis
                </span>
              </div>

              {/* H1 Value Proposition */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-black text-[#1e1b4b] tracking-tight leading-[1.15]">
                Kumpulkan Poin di Setiap Belanja, Nikmati{' '}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-[#684cb6] to-[#a8364b]">
                  Cashback & Reward Mewah
                </span>{' '}
                Tanpa Batas.
              </h1>

              {/* Supportive Subheadline (max 70ch) */}
              <p className="text-base sm:text-lg text-[#5d5e6c] leading-relaxed max-w-[65ch]">
                Bergabunglah bersama 28.500+ pelanggan setia Toko Indah. Dapatkan welcome bonus 500 poin instan, potongan belanja otomatis di meja kasir, dan privilege eksklusif.
              </p>

              {/* Primary Action Group */}
              <div className="flex flex-wrap items-center gap-3 pt-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="px-6 py-3 sm:px-8 sm:py-4 bg-[#684cb6] hover:bg-[#583ca4] active:scale-[0.98] text-white font-bold rounded-2xl text-sm sm:text-base transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2.5 cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
                  <span>Daftar Sekarang (Gratis + 500 Poin)</span>
                </button>

                <button
                  onClick={() => scrollToSection('check-status')}
                  className="px-6 py-3 sm:px-8 sm:py-4 bg-white hover:bg-[#f4f2fe] text-[#1e1b4b] hover:text-[#684cb6] border border-[#e2e1f2] font-bold rounded-2xl text-sm sm:text-base transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <Search className="w-4 h-4 text-[#684cb6]" />
                  <span>Cek Kartu & Poin Saya</span>
                </button>
              </div>

              {/* Social Proof Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-6 border-t border-[#e2e1f2]/80 w-full">
                {/* Avatar cluster */}
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2 overflow-hidden">
                    <img
                      className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover"
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                      alt="Clarissa"
                    />
                    <img
                      className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover"
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                      alt="Reza"
                    />
                    <img
                      className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover"
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                      alt="Siti"
                    />
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#684cb6] text-white text-xs font-bold ring-2 ring-white">
                      +28k
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-[#1e1b4b]">
                      4.9/5 dari 28.500+ Member
                    </span>
                  </div>
                </div>

                {/* Guarantee point active */}
                <div className="flex items-center gap-2 text-xs text-[#5d5e6c] font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Garansi Poin Aktif & Tanpa Biaya Tersembunyi</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Digital Card Showcase with Tier Switcher */}
            <div className="lg:col-span-5 flex flex-col items-center">
              {/* Interactive Tier Switcher Tabs */}
              <div className="flex items-center justify-center gap-1.5 p-1.5 bg-white border border-[#e2e1f2] rounded-2xl shadow-xs mb-4 w-full max-w-md">
                {(['Silver', 'Gold', 'Platinum', 'Diamond'] as MemberTier[]).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setActiveTierPreview(tier)}
                    className={`flex-1 py-2 px-2 text-xs font-black rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                      activeTierPreview === tier
                        ? 'bg-[#1e1b4b] text-white shadow-md'
                        : 'text-[#5d5e6c] hover:bg-slate-100'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>

              {/* Dynamic Digital Member Card Preview */}
              <div className="w-full max-w-md">
                <DigitalMemberCard
                  member={previewMemberForHero}
                  size="normal"
                  onShowFullBarcode={() => setShowFullscreenBarcode(true)}
                />
              </div>

              {/* Tier Quick Info Banner */}
              <div className="w-full max-w-md mt-4 p-3.5 bg-white rounded-2xl border border-[#e2e1f2] shadow-xs flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-[#1e1b4b]">
                    Privilege {activeTierPreview}:
                  </span>
                </div>
                <span className="font-semibold text-[#684cb6]">
                  {activeTierPreview === 'Diamond'
                    ? 'Cashback 3% + Hadiah Ultah Eksklusif'
                    : activeTierPreview === 'Platinum'
                    ? 'Cashback 2% + Jalur Kasir Prioritas'
                    : activeTierPreview === 'Gold'
                    ? 'Cashback 1.5% + Diskon Ultah 15%'
                    : 'Cashback 1% + 500 Poin Selamat Datang'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SOCIAL PROOF & CLIENT / PARTNER TRUST BAR */}
      {/* ========================================================================= */}
      <section className="py-10 bg-white border-b border-[#e2e1f2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-[#797988] mb-6">
            Dipercaya & Didukung Jaringan Pembayaran Retail Resmi
          </p>

          {/* Partner Badges / Payment Gateway */}
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-75 grayscale hover:grayscale-0 transition-all duration-300">
            <span className="font-black text-xl tracking-tight text-slate-800">QRIS</span>
            <span className="font-black text-xl tracking-tight text-blue-900">BCA</span>
            <span className="font-black text-xl tracking-tight text-yellow-700">MANDIRI</span>
            <span className="font-black text-xl tracking-tight text-blue-700">BRI</span>
            <span className="font-bold text-lg text-emerald-700 tracking-tight">GoPay</span>
            <span className="font-bold text-lg text-purple-700 tracking-tight">OVO</span>
            <span className="font-bold text-lg text-orange-600 tracking-tight">ShopeePay</span>
          </div>

          {/* Key Milestone Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 pt-8 border-t border-[#e2e1f2]">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-[#1e1b4b]">Rp 4.2 M+</div>
              <div className="text-xs font-medium text-[#5d5e6c] mt-1">Cashback Terdistribusi</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-[#1e1b4b]">28.500+</div>
              <div className="text-xs font-medium text-[#5d5e6c] mt-1">Member Aktif Terdaftar</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-[#1e1b4b]">99.8%</div>
              <div className="text-xs font-medium text-[#5d5e6c] mt-1">Kepuasan Pelanggan</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-[#1e1b4b]">&lt; 3 Detik</div>
              <div className="text-xs font-medium text-[#5d5e6c] mt-1">Scan Otomatis di Kasir</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. PROBLEM VS. SOLUTION & BENTO GRID VALUE PROPOSITIONS */}
      {/* ========================================================================= */}
      <section id="benefits" className="py-16 sm:py-24 bg-[#fbf8ff] border-b border-[#e2e1f2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-[#f4f2fe] text-[#684cb6] border border-[#e2e1f2]">
              Kenapa Harus Bergabung?
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1e1b4b] mt-3 tracking-tight">
              Belanja Cerdas Tanpa Struk Terbuang Sia-Sia
            </h2>
            <p className="text-base text-[#5d5e6c] mt-3">
              Jangan biarkan transaksi belanja Anda terlewat tanpa keuntungan. Dapatkan kembali uang Anda dalam bentuk poin cashback dan hadiah nyata.
            </p>
          </div>

          {/* Asymmetric Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-6">
            {/* Card 1: 100% Digital & Cardless (Spans 7 cols on LG) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e1f2] shadow-xs hover:border-[#684cb6] hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                  <CreditCard className="w-6 h-6" />
                </div>
                <span className="text-xs font-extrabold uppercase text-[#684cb6] tracking-wider">
                  Bebas Dompet Tebal
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#1e1b4b] mt-1 mb-2">
                  100% Cardless di Smartphone Anda
                </h3>
                <p className="text-sm text-[#5d5e6c] leading-relaxed">
                  Tidak perlu repot membawa kartu fisik plastik yang rawan patah atau hilang. Kartu Anda tersimpan aman di layar ponsel Anda lengkap dengan Barcode dan QR Code resmi.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#e2e1f2] flex items-center justify-between text-xs text-[#1e1b4b] font-bold">
                <span>Cukup buka di browser atau sebutkan nomor HP</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
            </div>

            {/* Card 2: Auto-Sync Kasir POS (Spans 5 cols on LG) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e1f2] shadow-xs hover:border-[#684cb6] hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6" />
                </div>
                <span className="text-xs font-extrabold uppercase text-[#684cb6] tracking-wider">
                  Instan & Cepat
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#1e1b4b] mt-1 mb-2">
                  Sinkronisasi Otomatis Kasir
                </h3>
                <p className="text-sm text-[#5d5e6c] leading-relaxed">
                  Poin otomatis masuk ke akun Anda detik itu juga saat struk kasir dicetak. Tidak ada jeda waktu tunggu poin 1x24 jam.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#e2e1f2] flex items-center justify-between text-xs text-[#1e1b4b] font-bold">
                <span>Real-Time Point Credit</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
            </div>

            {/* Card 3: Kado Ulang Tahun Spesial (Spans 4 cols on LG) */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e1f2] shadow-xs hover:border-[#684cb6] hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mb-4">
                <Gift className="w-6 h-6" />
              </div>
              <span className="text-xs font-extrabold uppercase text-[#684cb6] tracking-wider">
                Kejutan Manis
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-[#1e1b4b] mt-1 mb-2">
                Kado Diskon Ulang Tahun
              </h3>
              <p className="text-sm text-[#5d5e6c] leading-relaxed">
                Nikmati voucher diskon spesial hingga 30% dan kejutan bingkisan belanja di bulan kelahiran Anda setiap tahunnya.
              </p>
            </div>

            {/* Card 4: Double Points Weekend (Spans 4 cols on LG) */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e1f2] shadow-xs hover:border-[#684cb6] hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <Flame className="w-6 h-6" />
              </div>
              <span className="text-xs font-extrabold uppercase text-[#684cb6] tracking-wider">
                Sabtu & Minggu
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-[#1e1b4b] mt-1 mb-2">
                Double Points Weekend
              </h3>
              <p className="text-sm text-[#5d5e6c] leading-relaxed">
                Kumpulkan poin 2x lebih cepat setiap transaksi akhir pekan untuk belanja mingguan keluarga dan stok kebutuhan rumah.
              </p>
            </div>

            {/* Card 5: Priority Express Lane & Privileges (Spans 4 cols on LG) */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e1f2] shadow-xs hover:border-[#684cb6] hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Crown className="w-6 h-6" />
              </div>
              <span className="text-xs font-extrabold uppercase text-[#684cb6] tracking-wider">
                VIP Platinum & Diamond
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-[#1e1b4b] mt-1 mb-2">
                Jalur Kasir Prioritas
              </h3>
              <p className="text-sm text-[#5d5e6c] leading-relaxed">
                Bebas antre panjang di jam sibuk dengan akses jalur antrean prioritas ekspres dan gratis biaya parkir toko.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. TIER BENEFITS COMPARISON & MATRIX */}
      {/* ========================================================================= */}
      <section id="tiers" className="py-16 sm:py-24 bg-white border-b border-[#e2e1f2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-[#f4f2fe] text-[#684cb6] border border-[#e2e1f2]">
              Tingkatan Keanggotaan
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1e1b4b] mt-3 tracking-tight">
              Semakin Sering Belanja, Semakin Berlimpah Keuntungannya
            </h2>
            <p className="text-base text-[#5d5e6c] mt-3">
              Sistem berjenjang transparan tanpa syarat tersembunyi. Tingkatkan level Anda untuk mendapatkan multiplier poin tertinggi.
            </p>
          </div>

          {/* 4-Tier Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Silver Tier */}
            <div className="rounded-3xl p-6 border border-slate-200 bg-[#fbf8ff] flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-slate-200 text-slate-800">
                    SILVER
                  </span>
                  <Award className="w-5 h-5 text-slate-400" />
                </div>
                <h4 className="text-xl font-black text-[#1e1b4b]">Silver Club</h4>
                <p className="text-xs text-[#5d5e6c] mt-1 mb-4">
                  Otomatis didapatkan oleh semua pendaftar baru
                </p>
                <div className="text-2xl font-black text-[#1e1b4b] mb-4">
                  Rp 0 <span className="text-xs font-normal text-[#5d5e6c]">/ syarat belanja</span>
                </div>
                <ul className="space-y-2.5 text-xs text-[#5d5e6c]">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Cashback 1 Poin per Rp 1.000 belanja</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Welcome Bonus 500 Poin instan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Diskon ulang tahun 10%</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Akses penukaran katalog reward</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="mt-6 w-full py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Daftar Tier Ini
              </button>
            </div>

            {/* Gold Tier */}
            <div className="rounded-3xl p-6 border border-amber-300 bg-amber-50/40 flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-300 text-amber-950 font-sans">
                    GOLD
                  </span>
                  <Award className="w-5 h-5 text-amber-500" />
                </div>
                <h4 className="text-xl font-black text-[#1e1b4b]">Gold Privilege</h4>
                <p className="text-xs text-[#5d5e6c] mt-1 mb-4">
                  Untuk pelanggan setia belanja bulanan
                </p>
                <div className="text-2xl font-black text-[#1e1b4b] mb-4">
                  Rp 1.5 Jt <span className="text-xs font-normal text-[#5d5e6c]">/ akumulasi belanja</span>
                </div>
                <ul className="space-y-2.5 text-xs text-[#5d5e6c]">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-[#1e1b4b]">Cashback 1.5x Poin (150%)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Free Drink bulanan pilihan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Diskon ulang tahun 15%</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Akses flash sale 1 jam lebih awal</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="mt-6 w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-amber-950 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Mulai dari Silver
              </button>
            </div>

            {/* Platinum Tier (Highlighted: Paling Populer) */}
            <div className="rounded-3xl p-6 border-2 border-[#684cb6] bg-linear-to-b from-[#f4f2fe] to-white flex flex-col justify-between shadow-lg relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#684cb6] text-white text-[11px] font-extrabold uppercase rounded-full shadow-sm whitespace-nowrap">
                Paling Populer
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#684cb6] text-white">
                    PLATINUM
                  </span>
                  <Crown className="w-5 h-5 text-[#684cb6] fill-current" />
                </div>
                <h4 className="text-xl font-black text-[#1e1b4b]">Platinum Elite</h4>
                <p className="text-xs text-[#5d5e6c] mt-1 mb-4">
                  Favorit keluarga & pelanggan loyal
                </p>
                <div className="text-2xl font-black text-[#684cb6] mb-4">
                  Rp 5 Jt <span className="text-xs font-normal text-[#5d5e6c]">/ akumulasi belanja</span>
                </div>
                <ul className="space-y-2.5 text-xs text-[#5d5e6c]">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#684cb6] shrink-0 font-bold" />
                    <span className="font-bold text-[#1e1b4b]">Cashback 2x Poin (200%)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#684cb6] shrink-0 font-bold" />
                    <span>Jalur kasir prioritas anti-antre</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#684cb6] shrink-0 font-bold" />
                    <span>Diskon ulang tahun 20%</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#684cb6] shrink-0 font-bold" />
                    <span>Bebas parkir di seluruh cabang</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="mt-6 w-full py-3 bg-[#684cb6] hover:bg-[#583ca4] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Gabung Sekarang
              </button>
            </div>

            {/* Diamond Tier */}
            <div className="rounded-3xl p-6 border border-emerald-400 bg-linear-to-b from-emerald-50/50 to-white flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500 text-white">
                    DIAMOND VIP
                  </span>
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                </div>
                <h4 className="text-xl font-black text-[#1e1b4b]">Diamond Royal</h4>
                <p className="text-xs text-[#5d5e6c] mt-1 mb-4">
                  Kasta tertinggi dengan benefit maksimal
                </p>
                <div className="text-2xl font-black text-[#1e1b4b] mb-4">
                  Rp 15 Jt <span className="text-xs font-normal text-[#5d5e6c]">/ akumulasi belanja</span>
                </div>
                <ul className="space-y-2.5 text-xs text-[#5d5e6c]">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 font-bold" />
                    <span className="font-bold text-[#1e1b4b]">Cashback 3x Poin (300%)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 font-bold" />
                    <span>Diskon ulang tahun 30% + Gift Box</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 font-bold" />
                    <span>VIP Personal Assistant pesanan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 font-bold" />
                    <span>Undangan private gathering & hampers</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="mt-6 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Capai Diamond
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. INTERACTIVE REWARDS & CASHBACK CALCULATOR */}
      {/* ========================================================================= */}
      <section id="calculator" className="py-16 sm:py-24 bg-[#fbf8ff] border-b border-[#e2e1f2]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-[#f4f2fe] text-[#684cb6] border border-[#e2e1f2]">
              Simulasi Interaktif
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1e1b4b] mt-3 tracking-tight">
              Hitung Potensi Cashback & Voucher Belanja Anda
            </h2>
            <p className="text-base text-[#5d5e6c] mt-3">
              Geser nilai estimasi belanja Anda di bawah ini dan lihat berapa banyak rupiah yang bisa Anda hemat dalam setahun.
            </p>
          </div>

          {/* Calculator Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#e2e1f2] shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Sliders and Inputs */}
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-[#1e1b4b]">
                      Rata-Rata Belanja Bulanan:
                    </label>
                    <span className="text-xl sm:text-2xl font-black text-[#684cb6]">
                      {formatRupiah(calcMonthlySpend)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={200000}
                    max={10000000}
                    step={100000}
                    value={calcMonthlySpend}
                    onChange={(e) => setCalcMonthlySpend(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#684cb6]"
                  />
                  <div className="flex justify-between text-[11px] text-[#797988] mt-1 font-mono">
                    <span>Rp 200rb</span>
                    <span>Rp 5 Jt</span>
                    <span>Rp 10 Jt+</span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="text-xs font-bold text-[#5d5e6c] block mb-2">
                    Preset Cepat Kebutuhan:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Mahasiswa / Single', amount: 500000 },
                      { label: 'Pasangan Baru', amount: 1500000 },
                      { label: 'Keluarga Besar', amount: 4000000 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setCalcMonthlySpend(preset.amount)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                          calcMonthlySpend === preset.amount
                            ? 'bg-[#684cb6] text-white border-[#684cb6]'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-[#30323e]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Dengan belanja {formatRupiah(calcMonthlySpend)} per bulan, Anda otomatis memenuhi kualifikasi tingkat{' '}
                    <strong className="underline">{calcResults.tier}</strong> dengan bonus{' '}
                    <strong>{calcResults.multiplier}x Multiplier Poin</strong>!
                  </p>
                </div>
              </div>

              {/* Right Column: Live Calculated Output Results */}
              <div className="lg:col-span-6 bg-[#f4f2fe] rounded-2xl p-6 sm:p-8 border border-[#e2e1f2] flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#e2e1f2]">
                    <span className="text-xs font-bold text-[#5d5e6c]">Poin Terkumpul / Bulan:</span>
                    <span className="text-lg font-black text-[#1e1b4b]">
                      +{formatNumber(calcResults.monthlyPoints)} Poin
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-[#e2e1f2]">
                    <span className="text-xs font-bold text-[#5d5e6c]">Total Poin dalam 1 Tahun:</span>
                    <span className="text-xl font-black text-[#684cb6]">
                      {formatNumber(calcResults.annualPoints)} Poin
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-[#e2e1f2]">
                    <span className="text-xs font-bold text-[#5d5e6c]">Level Member Tercapai:</span>
                    <span className="text-xs font-black px-2.5 py-1 rounded-full uppercase bg-[#1e1b4b] text-white">
                      {calcResults.tier} VIP
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-[#e2e1f2] shadow-xs">
                    <span className="text-xs text-[#5d5e6c] font-medium block">
                      Potensi Nilai Hemat Belanja Setahun:
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-[#006d4b] mt-1">
                      {formatRupiah(calcResults.cashbackRupiah)}
                    </div>
                    <span className="text-[11px] text-[#797988] mt-0.5 block">
                      Setara dengan penukaran hingga ~{calcResults.vouchersCount} voucher belanja gratis!
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowRegisterModal(true)}
                  className="mt-6 w-full py-3.5 bg-[#684cb6] hover:bg-[#583ca4] active:scale-[0.98] text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Gift className="w-4 h-4 text-amber-300" />
                  <span>Klaim Keuntungan Cashback Ini Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. LIVE MEMBER STATUS CHECKER & CARD LOOKUP (INTERACTIVE DEMO) */}
      {/* ========================================================================= */}
      <section id="check-status" className="py-16 sm:py-24 bg-white border-b border-[#e2e1f2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-[#f4f2fe] text-[#684cb6] border border-[#e2e1f2]">
              Cek Kartu & Poin
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1e1b4b] mt-3 tracking-tight">
              Portal Cek Saldo & Kartu Digital Anda
            </h2>
            <p className="text-base text-[#5d5e6c] mt-3">
              Masukkan nomor HP Anda untuk membuka kartu digital resmi, melihat saldo poin aktif, dan riwayat voucher yang siap ditukarkan.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Search & Member Status Details */}
            <div className="lg:col-span-6 space-y-6">
              {/* Search Form */}
              <form onSubmit={handleLookup} className="bg-[#fbf8ff] p-5 sm:p-6 rounded-3xl border border-[#e2e1f2]">
                <label className="block text-xs font-bold text-[#1e1b4b] mb-2">
                  Cari Data Member Anda:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={lookupQuery}
                      onChange={(e) => setLookupQuery(e.target.value)}
                      placeholder="Masukkan No. HP atau ID (Contoh: 081234567890)"
                      className="w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-[#e2e1f2] rounded-xl focus:outline-none focus:border-[#684cb6]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#684cb6] hover:bg-[#583ca4] text-white text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-xs"
                  >
                    Cari
                  </button>
                </div>

                {lookupError && (
                  <p className="text-xs text-red-600 font-semibold mt-2">
                    {lookupError}
                  </p>
                )}

                {/* Demo Member Quick Buttons */}
                <div className="mt-4 pt-3 border-t border-[#e2e1f2]">
                  <span className="text-[11px] font-bold text-[#5d5e6c] block mb-2">
                    Atau coba lihat kartu contoh member:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {members.slice(0, 4).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectDemoMember(m)}
                        className={`px-2.5 py-1 text-xs rounded-lg font-bold border transition-colors cursor-pointer ${
                          activeLookupMember?.id === m.id
                            ? 'bg-[#1e1b4b] text-white border-[#1e1b4b]'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {m.name.split(' ')[0]} ({m.tier})
                      </button>
                    ))}
                  </div>
                </div>
              </form>

              {/* Member Dashboard Metrics */}
              {activeLookupMember && (
                <div className="bg-[#fbf8ff] p-5 sm:p-6 rounded-3xl border border-[#e2e1f2] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#e2e1f2]">
                    <div>
                      <span className="text-xs text-[#5d5e6c] font-medium">Status Anggota</span>
                      <h4 className="text-lg font-black text-[#1e1b4b]">{activeLookupMember.name}</h4>
                    </div>
                    <span className="text-xs font-black px-3 py-1 rounded-full uppercase bg-[#684cb6] text-white">
                      {activeLookupMember.tier}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded-xl border border-[#e2e1f2]">
                      <span className="text-[11px] text-[#5d5e6c]">Total Saldo Poin:</span>
                      <div className="text-xl font-black text-[#684cb6]">
                        {formatNumber(activeLookupMember.points)} Pts
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-[#e2e1f2]">
                      <span className="text-[11px] text-[#5d5e6c]">Total Belanja Kumulatif:</span>
                      <div className="text-xl font-black text-[#1e1b4b]">
                        {formatRupiah(activeLookupMember.totalSpent)}
                      </div>
                    </div>
                  </div>

                  {/* Progress to Next Tier */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>Progres Level Berikutnya</span>
                      <span className="text-[#684cb6]">
                        {activeLookupMember.tier === 'Diamond'
                          ? 'Tingkat Maksimal VIP'
                          : activeLookupMember.tier === 'Platinum'
                          ? `${formatRupiah(Math.max(0, 15000000 - activeLookupMember.totalSpent))} menuju Diamond`
                          : activeLookupMember.tier === 'Gold'
                          ? `${formatRupiah(Math.max(0, 5000000 - activeLookupMember.totalSpent))} menuju Platinum`
                          : `${formatRupiah(Math.max(0, 1500000 - activeLookupMember.totalSpent))} menuju Gold`}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-[#684cb6] to-emerald-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            activeLookupMember.tier === 'Diamond'
                              ? 100
                              : activeLookupMember.tier === 'Platinum'
                              ? Math.min(100, (activeLookupMember.totalSpent / 15000000) * 100)
                              : activeLookupMember.tier === 'Gold'
                              ? Math.min(100, (activeLookupMember.totalSpent / 5000000) * 100)
                              : Math.min(100, (activeLookupMember.totalSpent / 1500000) * 100)
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Actions for this member */}
                  <div className="pt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setShowFullscreenBarcode(true)}
                      className="px-4 py-2 bg-[#1e1b4b] hover:bg-black text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Barcode className="w-4 h-4" />
                      <span>Tunjukkan Barcode ke Kasir</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollToSection('catalog')}
                      className="px-4 py-2 bg-[#684cb6] hover:bg-[#583ca4] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Gift className="w-4 h-4" />
                      <span>Tukar Poin Sekarang</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Rendered Digital Member Card */}
            <div className="lg:col-span-6 flex flex-col items-center">
              {activeLookupMember ? (
                <div className="w-full max-w-md">
                  <DigitalMemberCard
                    member={activeLookupMember}
                    size="large"
                    onShowFullBarcode={() => setShowFullscreenBarcode(true)}
                  />
                  <p className="text-center text-xs text-[#5d5e6c] mt-3 font-medium">
                    Tunjukkan barcode atau QR code di atas kepada petugas kasir untuk scan instan.
                  </p>
                </div>
              ) : (
                <div className="w-full max-w-md p-10 bg-slate-100 rounded-3xl text-center text-slate-500">
                  Pilih atau cari member untuk melihat kartu digital.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. REWARDS REDEMPTION CATALOG (KATALOG TUKAR POIN INTERAKTIF) */}
      {/* ========================================================================= */}
      <section id="catalog" className="py-16 sm:py-24 bg-[#fbf8ff] border-b border-[#e2e1f2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-[#f4f2fe] text-[#684cb6] border border-[#e2e1f2]">
                Katalog Reward
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#1e1b4b] mt-3 tracking-tight">
                Tukarkan Poin dengan Voucher & Produk Favorit
              </h2>
              <p className="text-base text-[#5d5e6c] mt-2">
                Poin yang Anda kumpulkan dapat langsung dicairkan menjadi potongan belanja kasir atau hadiah eksklusif.
              </p>
            </div>

            {/* Active Member Points Chip */}
            {activeLookupMember && (
              <div className="bg-white p-3.5 rounded-2xl border border-[#e2e1f2] shadow-xs flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#5d5e6c]">Poin {activeLookupMember.name.split(' ')[0]}:</span>
                  <div className="text-lg font-black text-[#684cb6]">
                    {formatNumber(activeLookupMember.points)} Poin
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
            {['Semua', 'Voucher Belanja', 'Kuliner & Minuman', 'Diskon Transaksi', 'Produk Gratis'].map(
              (category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedVoucherCategory(category)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap border ${
                    selectedVoucherCategory === category
                      ? 'bg-[#684cb6] text-white border-[#684cb6] shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {category}
                </button>
              )
            )}
          </div>

          {/* Vouchers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredVouchers.map((voucher) => {
              const canRedeem = activeLookupMember ? activeLookupMember.points >= voucher.pointsCost : true;

              return (
                <div
                  key={voucher.id}
                  className="bg-white rounded-3xl p-5 border border-[#e2e1f2] shadow-xs hover:shadow-md hover:border-[#684cb6] transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Badge & Category */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {voucher.category}
                      </span>
                      {voucher.badge && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                          {voucher.badge}
                        </span>
                      )}
                    </div>

                    {/* Voucher Title */}
                    <h3 className="text-base font-bold text-[#1e1b4b] group-hover:text-[#684cb6] transition-colors line-clamp-2">
                      {voucher.title}
                    </h3>
                    <p className="text-xs text-[#5d5e6c] mt-2 line-clamp-3 leading-relaxed">
                      {voucher.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#e2e1f2]">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-[10px] text-[#797988] font-bold block uppercase">
                          Biaya Penukaran
                        </span>
                        <span className="text-lg font-black text-[#684cb6]">
                          {formatNumber(voucher.pointsCost)} Poin
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#797988] font-bold block uppercase">
                          Nilai Hadiah
                        </span>
                        <span className="text-sm font-bold text-[#006d4b]">
                          {formatRupiah(voucher.discountValue)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowVoucherRedeemModal(voucher)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        canRedeem
                          ? 'bg-[#684cb6] hover:bg-[#583ca4] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>{canRedeem ? 'Tukar Poin' : 'Poin Belum Cukup'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. TRANSPARENT COMPARISON MATRIX TABLE */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 bg-white border-b border-[#e2e1f2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-[#f4f2fe] text-[#684cb6] border border-[#e2e1f2]">
              Perbandingan Lengkap
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1e1b4b] mt-3 tracking-tight">
              Matriks Hak Istimewa Setiap Tier
            </h2>
            <p className="text-base text-[#5d5e6c] mt-2">
              Bandingkan seluruh fasilitas eksklusif yang Anda nikmati di setiap level keanggotaan.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-[#e2e1f2] shadow-sm">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#f4f2fe] text-[#1e1b4b] border-b border-[#e2e1f2]">
                  <th className="p-4 sm:p-5 font-black text-sm">Fitur & Privilege</th>
                  <th className="p-4 sm:p-5 font-bold text-center">Silver</th>
                  <th className="p-4 sm:p-5 font-bold text-center text-amber-800 bg-amber-50/50">Gold</th>
                  <th className="p-4 sm:p-5 font-black text-center text-[#684cb6] bg-[#684cb6]/10">Platinum (VIP)</th>
                  <th className="p-4 sm:p-5 font-black text-center text-emerald-900 bg-emerald-50/50">Diamond</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e1f2] text-xs sm:text-sm">
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-[#1e1b4b]">Syarat Akumulasi Belanja</td>
                  <td className="p-4 text-center text-slate-600">Rp 0 (Gratis)</td>
                  <td className="p-4 text-center font-bold text-amber-800 bg-amber-50/20">Rp 1.500.000</td>
                  <td className="p-4 text-center font-black text-[#684cb6] bg-[#684cb6]/5">Rp 5.000.000</td>
                  <td className="p-4 text-center font-black text-emerald-800 bg-emerald-50/20">Rp 15.000.000</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-[#1e1b4b]">Multiplier Poin Belanja</td>
                  <td className="p-4 text-center text-slate-600">1x (100 Poin/10k)</td>
                  <td className="p-4 text-center font-bold text-amber-800 bg-amber-50/20">1.5x (150 Poin/10k)</td>
                  <td className="p-4 text-center font-black text-[#684cb6] bg-[#684cb6]/5">2x (200 Poin/10k)</td>
                  <td className="p-4 text-center font-black text-emerald-800 bg-emerald-50/20">3x (300 Poin/10k)</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-[#1e1b4b]">Welcome Bonus Poin Awal</td>
                  <td className="p-4 text-center font-bold text-emerald-600">500 Poin</td>
                  <td className="p-4 text-center font-bold text-emerald-600 bg-amber-50/20">500 Poin</td>
                  <td className="p-4 text-center font-bold text-emerald-600 bg-[#684cb6]/5">500 Poin</td>
                  <td className="p-4 text-center font-bold text-emerald-600 bg-emerald-50/20">500 Poin</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-[#1e1b4b]">Diskon Voucher Ulang Tahun</td>
                  <td className="p-4 text-center text-slate-600">10%</td>
                  <td className="p-4 text-center font-bold text-amber-800 bg-amber-50/20">15%</td>
                  <td className="p-4 text-center font-black text-[#684cb6] bg-[#684cb6]/5">20%</td>
                  <td className="p-4 text-center font-black text-emerald-800 bg-emerald-50/20">30% + Kado Fisik</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-[#1e1b4b]">Jalur Kasir Prioritas (Express)</td>
                  <td className="p-4 text-center text-slate-300">-</td>
                  <td className="p-4 text-center text-slate-300 bg-amber-50/20">-</td>
                  <td className="p-4 text-center font-bold text-emerald-600 bg-[#684cb6]/5">✓ Prioritas</td>
                  <td className="p-4 text-center font-bold text-emerald-600 bg-emerald-50/20">✓ Prioritas Utama</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-[#1e1b4b]">Akses Early Bird Promo Flash Sale</td>
                  <td className="p-4 text-center text-slate-300">-</td>
                  <td className="p-4 text-center font-bold text-amber-800 bg-amber-50/20">1 Jam Awal</td>
                  <td className="p-4 text-center font-black text-[#684cb6] bg-[#684cb6]/5">2 Jam Awal</td>
                  <td className="p-4 text-center font-black text-emerald-800 bg-emerald-50/20">Private Invitation</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-[#1e1b4b]">Bebas Biaya Parkir Toko</td>
                  <td className="p-4 text-center text-slate-300">-</td>
                  <td className="p-4 text-center text-slate-300 bg-amber-50/20">-</td>
                  <td className="p-4 text-center font-bold text-emerald-600 bg-[#684cb6]/5">✓ Gratis</td>
                  <td className="p-4 text-center font-bold text-emerald-600 bg-emerald-50/20">✓ Gratis VIP Spot</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. CUSTOMER TESTIMONIALS & WALL OF LOVE */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 bg-[#fbf8ff] border-b border-[#e2e1f2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-[#f4f2fe] text-[#684cb6] border border-[#e2e1f2]">
              Ulasan Nyata
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1e1b4b] mt-3 tracking-tight">
              Cerita Dari Member Setia Toko Indah
            </h2>
            <p className="text-base text-[#5d5e6c] mt-2">
              Simak bagaimana para anggota menikmati kemudahan dan potongan belanja ratusan ribu rupiah setiap bulannya.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: 'Clarissa Aurelia',
                role: 'Wirausaha Kafe',
                tier: 'Diamond VIP',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                quote:
                  'Multiplier 3x di tier Diamond luar biasa! Tiap belanja stok kopi dan susu mingguan langsung terkumpul ribuan poin yang saya potongkan di kasir.',
              },
              {
                name: 'Reza Pratama',
                role: 'Manajer Operasional',
                tier: 'Platinum',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                quote:
                  'Jalur kasir prioritas sangat membantu saat jam sibuk pulang kerja. Kartunya praktis cukup simpan barcode di HP tanpa dompet tebal.',
              },
              {
                name: 'Siti Rahmawati',
                role: 'Ibu Rumah Tangga',
                tier: 'Gold',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
                quote:
                  'Bulan kemarin ulang tahun langsung dapat kado voucher diskon 15% dan minuman gratis. Poinnya nyata dan potongannya otomatis!',
              },
              {
                name: 'Budi Santoso',
                role: 'Freelancer Desain',
                tier: 'Silver',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
                quote:
                  'Baru daftar langsung dikasih 500 poin selamat datang. Belanja alat tulis kantor jadi selalu hemat dan seru kumpulin poin.',
              },
            ].map((t, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-[#e2e1f2] shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-[#30323e] leading-relaxed italic mb-4">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-[#e2e1f2]">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#e2e1f2]"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-[#1e1b4b]">{t.name}</h4>
                    <p className="text-[10px] text-[#5d5e6c]">{t.role}</p>
                    <span className="text-[10px] font-extrabold text-[#684cb6]">
                      {t.tier} Member
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11. INTERACTIVE FAQ ACCORDION */}
      {/* ========================================================================= */}
      <section id="faq" className="py-16 sm:py-24 bg-white border-b border-[#e2e1f2]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-[#f4f2fe] text-[#684cb6] border border-[#e2e1f2]">
              Tanya Jawab
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1e1b4b] mt-3 tracking-tight">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-base text-[#5d5e6c] mt-2">
              Segala hal yang perlu Anda ketahui seputar sistem loyalty member dan cara klaim hadiah.
            </p>
          </div>

          <div className="space-y-3">
            {faqList.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#e2e1f2] overflow-hidden transition-all bg-[#fbf8ff]"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-[#1e1b4b] hover:text-[#684cb6] transition-colors cursor-pointer"
                  >
                    <span>{item.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#684cb6] shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#5d5e6c] leading-relaxed border-t border-[#e2e1f2]/60"
                      >
                        {item.a}
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
      {/* 12. HIGH-IMPACT FINAL CTA BANNER */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-linear-to-br from-[#1e1b4b] via-[#302b63] to-[#24243e] text-white relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#684cb6]/30 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300">
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Bonus Pendaftaran 500 Poin Gratis Berakhir Segera</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Mulai Nikmati Belanja Lebih Hemat & Privilege VIP Hari Ini.
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Daftar hanya butuh 30 detik tanpa biaya apa pun. Langsung dapatkan kartu keanggotaan digital di smartphone Anda.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            <button
              onClick={() => setShowRegisterModal(true)}
              className="px-8 py-4 bg-[#684cb6] hover:bg-[#583ca4] active:scale-[0.98] text-white font-bold rounded-2xl text-base transition-all shadow-xl hover:shadow-2xl flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
              <span>Daftar Gratis Sekarang (+500 Poin)</span>
            </button>

            <a
              href="https://wa.me/6281298765432"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold rounded-2xl text-base transition-all border border-white/20 flex items-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              <span>Tanya Admin WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 13. COMPREHENSIVE RETENTION FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-white border-t border-[#e2e1f2] pt-14 pb-8 text-xs text-[#5d5e6c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Col 1: Brand Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#684cb6] text-white flex items-center justify-center">
                  <Crown className="w-4 h-4 text-amber-300 fill-current" />
                </div>
                <span className="text-base font-black text-[#1e1b4b]">KASIRKU VIP</span>
              </div>
              <p className="text-xs leading-relaxed text-[#5d5e6c]">
                Program loyalitas resmi Toko Indah untuk memberikan apresiasi terbaik kepada setiap pelanggan setia melalui sistem cashback dan reward digital.
              </p>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <h4 className="font-bold text-sm text-[#1e1b4b] mb-3">Navigasi Halaman</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => scrollToSection('benefits')} className="hover:text-[#684cb6] cursor-pointer">
                    Keuntungan VIP
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('tiers')} className="hover:text-[#684cb6] cursor-pointer">
                    Level & Tier Keanggotaan
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('calculator')} className="hover:text-[#684cb6] cursor-pointer">
                    Kalkulator Reward & Cashback
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('catalog')} className="hover:text-[#684cb6] cursor-pointer">
                    Katalog Voucher Hadiah
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Operational & Store Info */}
            <div>
              <h4 className="font-bold text-sm text-[#1e1b4b] mb-3">Toko & Lokasi</h4>
              <ul className="space-y-2 text-xs">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#684cb6] shrink-0 mt-0.5" />
                  <span>{settings.storeAddress}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#684cb6] shrink-0" />
                  <span>{settings.storePhone}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#684cb6] shrink-0" />
                  <span>Buka Setiap Hari: 08.00 - 22.00 WIB</span>
                </li>
              </ul>
            </div>

            {/* Col 4: POS App Direct Switch */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-[#1e1b4b] mb-3">Petugas & Pemilik Toko</h4>
              <p className="text-xs leading-relaxed">
                Ingin membuka mesin kasir atau mengelola inventaris produk toko?
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('kasir')}
                className="w-full py-2.5 bg-[#f4f2fe] hover:bg-[#684cb6] hover:text-white text-[#684cb6] font-bold rounded-xl border border-[#e2e1f2] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Store className="w-4 h-4" />
                <span>Masuk ke Kasir POS</span>
              </button>
            </div>
          </div>

          <div className="pt-8 border-t border-[#e2e1f2] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#797988]">
            <p>© {new Date().getFullYear()} KASIRKU MART - Toko Indah. Seluruh hak cipta dilindungi undang-undang.</p>
            <div className="flex items-center gap-4">
              <span>Syarat & Ketentuan Member</span>
              <span>•</span>
              <span>Kebijakan Privasi</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* MODAL 1: REGISTRASI MEMBER BARU INSTAN */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showRegisterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-[#e2e1f2]"
            >
              <div className="p-5 border-b border-[#e2e1f2] flex items-center justify-between bg-linear-to-r from-[#684cb6]/10 to-transparent">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#684cb6] text-white flex items-center justify-center">
                    <Crown className="w-5 h-5 text-amber-300 fill-current" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#1e1b4b]">
                      Daftar Member Kasirku VIP
                    </h3>
                    <p className="text-xs text-[#5d5e6c]">Gratis + Bonus 500 Poin Instan</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRegisterModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">
                {regError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-600 rounded-xl font-medium">
                    {regError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rina Anggraini"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#684cb6] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor WhatsApp / HP Aktif <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#684cb6] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email (Opsional)
                    </label>
                    <input
                      type="email"
                      placeholder="rina@gmail.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#684cb6] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tanggal Lahir (Kado Ultah)
                    </label>
                    <input
                      type="date"
                      value={regBirthDate}
                      onChange={(e) => setRegBirthDate(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#684cb6] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>500 Poin langsung masuk saat Anda menekan tombol di bawah.</span>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#684cb6] hover:bg-[#583ca4] active:scale-[0.98] text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Daftar Sekarang & Ambil Kartu</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: TUKAR POIN VOUCHER KONFIRMASI */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showVoucherRedeemModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-[#e2e1f2]"
            >
              <div className="p-5 border-b border-[#e2e1f2] flex items-center justify-between bg-linear-to-r from-[#684cb6]/10 to-transparent">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#684cb6] text-white flex items-center justify-center">
                    <Gift className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#1e1b4b]">
                      Konfirmasi Penukaran Poin
                    </h3>
                    <p className="text-xs text-[#5d5e6c]">Katalog Hadiah Kasirku</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowVoucherRedeemModal(null);
                    setLastRedeemedVoucher(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {lastRedeemedVoucher ? (
                  <div className="text-center py-4 space-y-3">
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-black text-[#1e1b4b]">
                      Voucher Berhasil Ditukarkan!
                    </h4>
                    <p className="text-xs text-[#5d5e6c]">
                      Tunjukkan kode voucher berikut kepada petugas kasir saat pembayaran:
                    </p>

                    <div className="p-3.5 bg-slate-100 rounded-2xl border border-dashed border-slate-300 my-2">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Kode Voucher Anda
                      </span>
                      <span className="text-lg font-mono font-black text-[#684cb6] tracking-wider">
                        {lastRedeemedVoucher.code}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowVoucherRedeemModal(null);
                        setLastRedeemedVoucher(null);
                      }}
                      className="w-full py-3 bg-[#684cb6] text-white font-bold rounded-xl text-xs sm:text-sm cursor-pointer"
                    >
                      Selesai
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-xs text-[#5d5e6c] font-medium block">
                        Voucher yang dipilih:
                      </span>
                      <h4 className="text-base font-bold text-[#1e1b4b] mt-0.5">
                        {showVoucherRedeemModal.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">
                        {showVoucherRedeemModal.description}
                      </p>
                    </div>

                    {activeLookupMember ? (
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Member:</span>
                          <span className="font-bold text-[#1e1b4b]">
                            {activeLookupMember.name} ({activeLookupMember.tier})
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Saldo Poin Anda:</span>
                          <span className="font-bold text-slate-800">
                            {formatNumber(activeLookupMember.points)} Poin
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Biaya Poin:</span>
                          <span className="font-bold text-red-600">
                            -{formatNumber(showVoucherRedeemModal.pointsCost)} Poin
                          </span>
                        </div>
                        <div className="flex justify-between py-1 pt-2 font-bold">
                          <span>Sisa Poin Setelah Tukar:</span>
                          <span
                            className={
                              activeLookupMember.points >= showVoucherRedeemModal.pointsCost
                                ? 'text-emerald-600'
                                : 'text-red-500'
                            }
                          >
                            {formatNumber(activeLookupMember.points - showVoucherRedeemModal.pointsCost)} Poin
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                        Silakan cari atau daftar member terlebih dahulu untuk menukarkan poin.
                      </div>
                    )}

                    <div className="pt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowVoucherRedeemModal(null)}
                        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        disabled={
                          !activeLookupMember ||
                          activeLookupMember.points < showVoucherRedeemModal.pointsCost
                        }
                        onClick={handleConfirmRedeem}
                        className="flex-1 py-3 bg-[#684cb6] hover:bg-[#583ca4] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs cursor-pointer shadow-md"
                      >
                        Konfirmasi Tukar
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 3: FULLSCREEN BARCODE UNTUK SCAN DI KASIR */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showFullscreenBarcode && activeLookupMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setShowFullscreenBarcode(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="pt-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#684cb6] text-white">
                  {activeLookupMember.tier} VIP MEMBER
                </span>
                <h3 className="text-lg font-black text-[#1e1b4b] mt-2">
                  {activeLookupMember.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {activeLookupMember.phone}
                </p>
              </div>

              {/* High Brightness White Barcode Container */}
              <div className="bg-white p-4 rounded-2xl border-2 border-slate-300 shadow-inner flex flex-col items-center justify-center">
                <DigitalMemberCard
                  member={activeLookupMember}
                  interactive={false}
                  size="compact"
                />
              </div>

              <p className="text-xs text-slate-600 font-medium">
                Tunjukkan layar ini dengan kecerahan maksimal ke alat scanner kasir.
              </p>

              <button
                type="button"
                onClick={() => setShowFullscreenBarcode(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
