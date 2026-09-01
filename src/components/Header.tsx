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
} from 'lucide-react';
import { usePos } from '../context/PosContext';

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
      {/* Left: Mobile menu toggle + Search input */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 text-[#5d5e6c] hover:bg-[#f4f2fe] rounded-lg md:hidden"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
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
      <div className="flex items-center gap-3 md:gap-5">
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
              <div className="pt-2 border-t border-[#e2e1f2]">
                <button
                  onClick={() => {
                    setActiveTab('pengaturan');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 p-2 text-xs font-medium text-[#5d5e6c] hover:bg-[#f4f2fe] rounded-lg transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Pengaturan Kasir & Toko</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
