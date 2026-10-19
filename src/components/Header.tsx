import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  User,
  LogOut,
  RotateCcw,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  Database,
  RefreshCw,
  Crown,
  Globe,
  ShieldAlert,
  Sun,
  Moon,
  Store,
  Printer,
  Bluetooth,
} from 'lucide-react';
import { usePos } from '../context/PosContext';
import { formatRupiah } from '../utils/formatters';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const {
    searchQuery,
    setSearchQuery,
    products,
    cashiers,
    activeCashier,
    setActiveCashier,
    setActiveTab,
    transactions,
    resetDemoData,
    sidebarCollapsed,
    toggleSidebar,
    logout,
    currentUser,
    tursoStatus,
    lastSyncTime,
    syncWithTurso,
    theme,
    toggleTheme,
    isRegisterOpen,
    registerStartingCash,
    setShowOpenRegisterModal,
    printerStatus,
    printerDevice,
    setShowPrinterModal,
  } = usePos();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Low stock notifications
  const lowStockProducts = products.filter((p) => p.stock <= (p.minStock || 10));

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-[#e2e1f2] h-16 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Universal Hamburger Menu toggle + Search input */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {/* Universal Hamburger Menu Button */}
        <button
          id="btn-hamburger-menu"
          onClick={() => {
            if (window.innerWidth < 1024) {
              onToggleMobileMenu();
            } else {
              toggleSidebar();
            }
          }}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[#30323e] hover:text-[#684cb6] hover:bg-[#f4f2fe] active:bg-[#e2e1f2] border border-[#e2e1f2] bg-white transition-all cursor-pointer shadow-2xs group shrink-0"
          title={
            sidebarCollapsed
              ? 'Hamburger Menu: Perluas Navigasi'
              : 'Hamburger Menu: Kecilkan / Buka Menu Navigasi'
          }
          aria-label="Hamburger Menu Navigasi"
        >
          <Menu className="w-5 h-5 text-[#684cb6] group-hover:scale-105 transition-transform" />
          <span className="text-xs font-bold text-[#30323e] hidden sm:inline-block">
            Menu
          </span>
        </button>

        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#797988]" />
          <input
            id="global-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari produk, SKU, atau transaksi..."
            className="w-full pl-10 pr-4 py-2 bg-[#f4f2fe] border border-[#e2e1f2] rounded-full text-sm text-[#30323e] placeholder-[#797988] focus:outline-none focus:border-[#684cb6] focus:ring-1 focus:ring-[#684cb6] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#797988] hover:text-[#30323e]"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right: Notifications, Cashier profile & Demo controls */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Turso Cloud Database Status Badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border transition-all ${
            tursoStatus === 'connected'
              ? 'bg-[#006d4b]/10 text-[#006d4b] border-[#006d4b]/20'
              : tursoStatus === 'connecting'
              ? 'bg-amber-500/10 text-amber-700 border-amber-500/20'
              : 'bg-[#a8364b]/10 text-[#a8364b] border-[#a8364b]/20'
          }`}
          title={
            tursoStatus === 'connected'
              ? `Terhubung ke Turso Cloud DB (libsql://mykasirdb-aleenadigiss.aws-ap-northeast-1.turso.io). Terakhir sinkron: ${lastSyncTime || 'Baru saja'}`
              : tursoStatus === 'connecting'
              ? 'Menghubungkan ke Turso Cloud...'
              : 'Mode Offline (Lokal)'
          }
        >
          <span className="relative flex h-2 w-2">
            {tursoStatus === 'connected' && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                tursoStatus === 'connected'
                  ? 'bg-[#006d4b]'
                  : tursoStatus === 'connecting'
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-[#a8364b]'
              }`}
            ></span>
          </span>
          <Database className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {tursoStatus === 'connected' ? 'Turso Cloud' : tursoStatus === 'connecting' ? 'Menghubungkan...' : 'Turso Offline'}
          </span>
          <button
            onClick={() => syncWithTurso()}
            className="hover:rotate-180 transition-transform duration-500 opacity-70 hover:opacity-100 ml-0.5 cursor-pointer"
            title="Klik untuk sinkronisasi manual sekarang"
          >
            <RefreshCw className={`w-3 h-3 ${tursoStatus === 'connecting' ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Cashier Register Status & Shift Button */}
        <button
          type="button"
          onClick={() => setShowOpenRegisterModal(true)}
          title={
            isRegisterOpen
              ? `Sesi Kasir Terbuka (Modal: ${formatRupiah(registerStartingCash)}) - Klik untuk Rekap / Tutup Shift`
              : 'Sesi Kasir Tutup - Klik untuk Membuka Sesi Kasir'
          }
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-2xs whitespace-nowrap ${
            isRegisterOpen
              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-red-50 hover:bg-red-100 text-red-800 border-red-300 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
          }`}
        >
          <span className="relative flex h-2 w-2">
            {isRegisterOpen && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isRegisterOpen ? 'bg-emerald-600' : 'bg-red-600'
              }`}
            ></span>
          </span>
          <Store className="w-3.5 h-3.5" />
          <span>{isRegisterOpen ? 'Kasir Buka' : 'Kasir Tutup'}</span>
        </button>

        {/* Global Mini Printer & Bluetooth Status Button */}
        <button
          type="button"
          onClick={() => setShowPrinterModal(true)}
          title={
            printerStatus === 'connected' && printerDevice
              ? `Printer Mini Terhubung: ${printerDevice.name} (${printerDevice.paperWidth}) - Klik untuk Kelola / Tes Cetak`
              : 'Printer Mini Belum Terhubung - Klik untuk Pindai & Sambungkan Bluetooth'
          }
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-2xs whitespace-nowrap ${
            printerStatus === 'connected'
              ? 'bg-purple-50 hover:bg-purple-100 text-[#684cb6] border-purple-300 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
          }`}
        >
          <span className="relative flex h-2 w-2">
            {printerStatus === 'connected' && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                printerStatus === 'connected' ? 'bg-[#684cb6]' : 'bg-slate-400'
              }`}
            ></span>
          </span>
          <Printer className="w-3.5 h-3.5" />
          <span className="hidden md:inline">
            {printerStatus === 'connected' && printerDevice
              ? printerDevice.name.length > 16
                ? `${printerDevice.name.substring(0, 14)}... (${printerDevice.paperWidth})`
                : `${printerDevice.name} (${printerDevice.paperWidth})`
              : 'Printer Mini'}
          </span>
        </button>

        {/* Super Admin Control Center Shortcut */}
        <button
          onClick={() => setActiveTab('superadmin')}
          title="Buka Pusat Kontrol & CRUD Super Admin"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 active:scale-95 rounded-lg border border-amber-300 transition-all cursor-pointer shadow-2xs whitespace-nowrap"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
          <span className="hidden sm:inline">Super Admin</span>
        </button>

        {/* Landing Page Home Shortcut */}
        <button
          onClick={() => setActiveTab('landing')}
          title="Buka Halaman Depan / Landing Page KASIRKU"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#684cb6] bg-purple-50 hover:bg-purple-100 active:scale-95 rounded-lg border border-purple-200 transition-all cursor-pointer shadow-2xs whitespace-nowrap"
        >
          <Globe className="w-3.5 h-3.5 text-[#684cb6]" />
          <span className="hidden sm:inline">Landing Page</span>
        </button>

        {/* Reset Demo Data Pill */}
        <button
          onClick={() => {
            if (window.confirm('Reset data ke kondisi awal (demo data)?')) {
              resetDemoData();
            }
          }}
          title="Reset Data Demo"
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#5d5e6c] bg-[#f4f2fe] hover:bg-[#e2e1f2] rounded-lg border border-[#e2e1f2] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#684cb6]" />
          <span>Reset Demo</span>
        </button>

        {/* Dark / Light Mode Switcher */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Beralih ke Mode Terang (Light Mode)' : 'Beralih ke Mode Gelap (Dark Mode)'}
          className="p-2 rounded-xl border border-[#e2e1f2] hover:border-[#684cb6] bg-white text-[#5d5e6c] hover:text-[#684cb6] transition-all cursor-pointer shadow-2xs flex items-center justify-center"
          aria-label="Ganti Tema Gelap / Terang"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-[#684cb6]" />
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            id="btn-notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-[#5d5e6c] hover:text-[#684cb6] hover:bg-[#f4f2fe] rounded-full transition-colors cursor-pointer"
            aria-label="Pemberitahuan"
          >
            <Bell className="w-5 h-5" />
            {lowStockProducts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#a8364b] rounded-full border-2 border-white animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#e2e1f2] rounded-2xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#e2e1f2]">
                <h4 className="font-bold text-sm text-[#30323e] flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-[#684cb6]" />
                  Pemberitahuan
                </h4>
                <span className="text-xs px-2 py-0.5 bg-[#a8364b]/10 text-[#a8364b] font-semibold rounded-full">
                  {lowStockProducts.length} Peringatan Stok
                </span>
              </div>

              <div className="py-2 max-h-72 overflow-y-auto space-y-2 divide-y divide-[#e2e1f2]/40">
                {lowStockProducts.length > 0 ? (
                  lowStockProducts.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        setActiveTab('stok');
                        setShowNotifications(false);
                      }}
                      className="pt-2 flex items-start gap-3 cursor-pointer hover:bg-[#f4f2fe] p-2 rounded-lg transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#a8364b]/10 text-[#a8364b] flex items-center justify-center shrink-0 mt-0.5">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-xs">
                        <p className="font-semibold text-[#30323e]">{prod.name}</p>
                        <p className="text-[#a8364b]">
                          {prod.stock === 0 ? 'Stok Habis (0 Unit)' : `Tersisa ${prod.stock} unit`} (Min: {prod.minStock || 10})
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-[#5d5e6c]">
                    <CheckCircle2 className="w-6 h-6 text-[#006d4b] mx-auto mb-1" />
                    Semua stok dalam batas aman.
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[#e2e1f2] flex justify-between">
                <button
                  onClick={() => {
                    setActiveTab('stok');
                    setShowNotifications(false);
                  }}
                  className="w-full text-center text-xs font-semibold text-[#684cb6] hover:underline py-1"
                >
                  Kelola Semua Stok
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile / Cashier Selector */}
        <div className="relative" ref={userRef}>
          <div
            id="user-profile-trigger"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 cursor-pointer hover:bg-[#f4f2fe] p-1.5 md:p-2 rounded-xl transition-colors select-none"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-[#30323e] leading-tight">
                {activeCashier.name}
              </p>
              <p className="text-xs text-[#5d5e6c] font-normal">{activeCashier.role}</p>
            </div>
            <img
              src={activeCashier.avatar}
              alt={activeCashier.name}
              className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover border-2 border-[#e2e1f2]"
            />
            <ChevronDown className="w-4 h-4 text-[#797988] hidden sm:block" />
          </div>

          {/* User Switcher Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-[#e2e1f2] rounded-2xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-2 py-2 border-b border-[#e2e1f2]">
                <p className="text-xs font-medium text-[#797988]">Ganti Petugas Kasir:</p>
              </div>
              <div className="py-2 space-y-1">
                {cashiers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setActiveCashier(c);
                      setShowUserMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-colors ${
                      activeCashier.id === c.id
                        ? 'bg-[#a589f8]/20 text-[#684cb6] font-semibold'
                        : 'hover:bg-[#f4f2fe] text-[#30323e]'
                    }`}
                  >
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#e2e1f2]"
                    />
                    <div className="text-xs flex-1">
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-[#5d5e6c]">{c.role}</p>
                    </div>
                    {activeCashier.id === c.id && (
                      <CheckCircle2 className="w-4 h-4 text-[#684cb6]" />
                    )}
                  </button>
                ))}
              </div>
              <div className="pt-2 border-t border-[#e2e1f2] space-y-1">
                <button
                  onClick={() => {
                    setActiveTab('pengaturan');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 p-2 text-xs font-medium text-[#5d5e6c] hover:bg-[#f4f2fe] rounded-lg transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Pengaturan Kasir & Toko</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  id="btn-logout-dropdown"
                  className="w-full flex items-center gap-2 p-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar dari Sistem (Logout)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
