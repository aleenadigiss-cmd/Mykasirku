import React from 'react';
import {
  LayoutDashboard,
  Store,
  Package,
  Layers,
  History,
  BarChart3,
  Settings,
  FolderTree,
  X,
  Menu,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Crown,
  Globe,
  ShieldAlert,
  Sun,
  Moon,
  Unlock,
  Lock,
} from 'lucide-react';
import { usePos, ActiveNavTab } from '../context/PosContext';
import { formatRupiah } from '../utils/formatters';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenRegisterModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  onCloseMobile,
  onOpenRegisterModal,
}) => {
  const {
    activeTab,
    setActiveTab,
    setShowOpenRegisterModal,
    isRegisterOpen,
    registerStartingCash,
    cartItemCount,
    sidebarCollapsed,
    toggleSidebar,
    theme,
    toggleTheme,
  } = usePos();

  const navItems: { id: ActiveNavTab; label: string; icon: React.ReactNode; badge?: number; tag?: string }[] = [
    {
      id: 'landing',
      label: 'Halaman Depan (Landing)',
      icon: <Globe className="w-5 h-5 text-[#684cb6]" />,
      tag: 'Home',
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'kasir',
      label: 'Kasir (POS)',
      icon: <Store className="w-5 h-5" />,
      badge: cartItemCount > 0 ? cartItemCount : undefined,
    },
    {
      id: 'superadmin',
      label: 'Super Admin',
      icon: <ShieldAlert className="w-5 h-5 text-amber-500" />,
      tag: 'CRUD',
    },
    {
      id: 'produk',
      label: 'Produk',
      icon: <Package className="w-5 h-5" />,
    },
    {
      id: 'kategori',
      label: 'Kategori',
      icon: <FolderTree className="w-5 h-5" />,
    },
    {
      id: 'stok',
      label: 'Stok',
      icon: <Layers className="w-5 h-5" />,
    },
    {
      id: 'riwayat',
      label: 'Riwayat Penjualan',
      icon: <History className="w-5 h-5" />,
    },
    {
      id: 'laporan',
      label: 'Laporan',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: 'pengaturan',
      label: 'Pengaturan',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const handleNavClick = (tabId: ActiveNavTab) => {
    setActiveTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  const renderNavContent = (isCollapsed: boolean) => (
    <div className="flex flex-col h-full bg-white border-r border-[#e2e1f2] select-none">
      {/* Brand Header */}
      <div
        className={`border-b border-[#e2e1f2]/60 flex items-center transition-all ${
          isCollapsed
            ? 'p-3 flex-col gap-2 justify-center'
            : 'px-5 py-4 justify-between'
        }`}
      >
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-1">
            <div className="w-9 h-9 rounded-xl bg-[#684cb6] text-white flex items-center justify-center font-black text-lg shadow-xs">
              K
            </div>
            <button
              id="btn-sidebar-hamburger-expand"
              onClick={toggleSidebar}
              title="Perluas Menu Sidebar (Hamburger Menu)"
              className="p-1.5 rounded-lg text-[#5d5e6c] hover:text-[#684cb6] hover:bg-[#f4f2fe] transition-colors cursor-pointer mt-1"
              aria-label="Perluas Menu Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl tracking-tight text-[#684cb6] font-['Geist',sans-serif]">
                KASIRKU
              </span>
              <span className="text-[11px] font-semibold text-[#5d5e6c] tracking-wider uppercase">
                Point of Sale
              </span>
            </div>

            <div className="flex items-center gap-1">
              {/* Desktop Slide Collapse Button with Hamburger Menu Icon */}
              <button
                id="btn-sidebar-hamburger-collapse"
                onClick={toggleSidebar}
                title="Sembunyikan / Kecilkan Sidebar (Hamburger Menu)"
                className="hidden md:flex p-1.5 rounded-lg text-[#5d5e6c] hover:text-[#684cb6] hover:bg-[#f4f2fe] transition-colors cursor-pointer"
                aria-label="Kecilkan Menu Sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Mobile Close Button */}
              {isMobileOpen && (
                <button
                  onClick={onCloseMobile}
                  className="p-1 rounded-lg text-[#5d5e6c] hover:bg-[#f4f2fe] md:hidden cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => handleNavClick(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center rounded-xl text-sm font-medium transition-all duration-150 relative group cursor-pointer ${
                isCollapsed
                  ? 'justify-center p-2.5'
                  : 'gap-3 px-3.5 py-2.5'
              } ${
                isActive
                  ? 'bg-[#684cb6] text-white font-bold shadow-xs'
                  : 'text-[#5d5e6c] hover:bg-[#f4f2fe] hover:text-[#30323e]'
              }`}
            >
              <span className={`shrink-0 ${isActive ? 'text-white' : 'text-[#797988] group-hover:text-[#684cb6]'}`}>
                {item.icon}
              </span>

              {!isCollapsed && (
                <>
                  <span className="truncate flex-1 text-left">{item.label}</span>
                  {item.tag && (
                    <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded-full bg-amber-400 text-amber-950 font-sans shadow-2xs whitespace-nowrap">
                      {item.tag}
                    </span>
                  )}
                  {item.badge !== undefined && (
                    <span
                      className={`ml-auto text-[11px] px-2 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-white text-[#684cb6]' : 'bg-[#684cb6] text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}

              {/* Dot badge indicator when collapsed */}
              {isCollapsed && item.badge !== undefined && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#e11d48] border-2 border-white" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Action Button */}
      <div className={`border-t border-[#e2e1f2] ${isCollapsed ? 'p-2' : 'p-3.5 space-y-2'}`}>
        {/* Theme Mode Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Beralih ke Mode Terang (Light Mode)' : 'Beralih ke Mode Gelap (Dark Mode)'}
          className={`w-full flex items-center justify-between p-2 rounded-xl border border-[#e2e1f2] hover:border-[#684cb6] bg-[#fbf8ff] hover:bg-[#f4f2fe] text-xs font-bold transition-all cursor-pointer ${
            isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2'
          }`}
        >
          <div className="flex items-center gap-2">
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Moon className="w-4 h-4 text-[#684cb6] shrink-0" />
            )}
            {!isCollapsed && (
              <span className="text-slate-600 dark:text-slate-200">
                {theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
              </span>
            )}
          </div>
          {!isCollapsed && (
            <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/50 text-[#684cb6] dark:text-purple-300">
              {theme === 'dark' ? 'DARK' : 'LIGHT'}
            </span>
          )}
        </button>

        {/* Interactive Cashier Status Card */}
        {!isCollapsed ? (
          <div
            onClick={() => {
              if (onOpenRegisterModal) onOpenRegisterModal();
              else setShowOpenRegisterModal(true);
            }}
            title={
              isRegisterOpen
                ? `Kasir Terbuka (Modal: ${formatRupiah(registerStartingCash)}) - Klik untuk Rekap / Tutup Shift`
                : 'Kasir Tutup - Klik untuk Membuka Sesi Kasir'
            }
            className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
              isRegisterOpen
                ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-100/60'
                : 'bg-red-50/60 dark:bg-red-950/30 border-red-200 dark:border-red-800/40 hover:bg-red-100/60'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-[#1e1b4b] dark:text-white flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-[#684cb6]" />
                <span>Status Kasir</span>
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-extrabold text-[10px] ${
                  isRegisterOpen
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isRegisterOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                  }`}
                />
                {isRegisterOpen ? 'Terbuka' : 'Tutup'}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#5d5e6c] dark:text-[#a7a2cd]">
              <span>{isRegisterOpen ? `Modal: ${formatRupiah(registerStartingCash)}` : 'Sesi kasir nonaktif'}</span>
              <span className="text-[#684cb6] font-bold hover:underline">
                {isRegisterOpen ? 'Tutup Shift ›' : 'Buka Shift ›'}
              </span>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (onOpenRegisterModal) onOpenRegisterModal();
              else setShowOpenRegisterModal(true);
            }}
            title={isRegisterOpen ? 'Kasir Terbuka - Klik Rekap Shift' : 'Kasir Tutup - Klik Buka Kasir'}
            className={`w-full p-2 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
              isRegisterOpen
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {isRegisterOpen ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          </button>
        )}

        {/* Primary Action Button */}
        {!isRegisterOpen ? (
          <button
            id="btn-buka-kasir"
            type="button"
            onClick={() => {
              if (onOpenRegisterModal) onOpenRegisterModal();
              else setShowOpenRegisterModal(true);
              if (onCloseMobile) onCloseMobile();
            }}
            title="Buka Sesi Kasir Baru"
            className={`w-full bg-[#684cb6] hover:bg-[#5b3fa9] active:scale-[0.98] text-white font-extrabold rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
              isCollapsed ? 'p-2.5' : 'py-2.5 px-4 text-xs gap-2'
            }`}
          >
            <Unlock className="w-4 h-4 text-amber-300 shrink-0" />
            {!isCollapsed && <span>Buka Sesi Kasir</span>}
          </button>
        ) : (
          <button
            id="btn-buka-kasir"
            type="button"
            onClick={() => {
              setActiveTab('kasir');
              if (onCloseMobile) onCloseMobile();
            }}
            title="Buka Layar Kasir POS"
            className={`w-full bg-[#684cb6] hover:bg-[#5b3fa9] active:scale-[0.98] text-white font-semibold rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs ${
              isCollapsed ? 'p-2.5' : 'py-2.5 px-4 text-xs gap-2'
            }`}
          >
            <Store className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Layar Kasir (POS)</span>}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Flex Item - Not fixed, so it never overlaps content!) */}
      <aside
        className={`hidden md:flex flex-col h-full shrink-0 transition-all duration-300 z-20 ${
          sidebarCollapsed ? 'w-[72px]' : 'w-[250px]'
        }`}
      >
        {renderNavContent(sidebarCollapsed)}
      </aside>

      {/* Slide-in Hamburger Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-[280px] max-w-[85vw] h-full z-10 animate-in slide-in-from-left duration-200 shadow-2xl">
            {renderNavContent(false)}
          </div>
        </div>
      )}
    </>
  );
};
