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
  Coins,
  X,
} from 'lucide-react';
import { usePos, ActiveNavTab } from '../context/PosContext';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, setShowOpenRegisterModal, isRegisterOpen, cartItemCount } = usePos();

  const navItems: { id: ActiveNavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'kasir',
      label: 'Kasir',
      icon: <Store className="w-5 h-5" />,
      badge: cartItemCount > 0 ? cartItemCount : undefined,
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

  const navContent = (
    <div className="flex flex-col h-full bg-white border-r border-[#e2e1f2] shadow-sm select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#e2e1f2]/60 flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-2xl tracking-tight text-[#684cb6] font-['Geist',sans-serif]">
              KASIRKU
            </span>
          </div>
          <span className="text-xs font-semibold text-[#5d5e6c] tracking-wider uppercase mt-0.5">
            Point of Sale
          </span>
        </div>
        {mobileOpen && (
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-[#5d5e6c] hover:bg-[#f4f2fe] md:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 text-sm rounded-r-full font-medium transition-all duration-150 relative ${
                isActive
                  ? 'border-l-4 border-[#684cb6] bg-[#a589f8] text-[#230062] font-bold shadow-sm'
                  : 'text-[#5d5e6c] hover:bg-[#f4f2fe] hover:text-[#30323e]'
              }`}
            >
              <span className={`shrink-0 ${isActive ? 'text-[#230062]' : 'text-[#797988]'}`}>
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={`ml-auto text-xs px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-[#230062] text-white' : 'bg-[#684cb6] text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Action Button */}
      <div className="p-5 border-t border-[#e2e1f2]">
        <div className="mb-2.5 flex items-center justify-between text-xs text-[#5d5e6c] px-1">
          <span>Status Kasir:</span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-[#006d4b]">
            <span className="w-2 h-2 rounded-full bg-[#006d4b] animate-pulse"></span>
            {isRegisterOpen ? 'Register Terbuka' : 'Tutup'}
          </span>
        </div>
        <button
          id="btn-buka-kasir"
          onClick={() => {
            setActiveTab('kasir');
            if (!isRegisterOpen) {
              setShowOpenRegisterModal(true);
            }
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full bg-[#684cb6] hover:bg-[#5b3fa9] active:scale-[0.98] text-[#fdf7ff] font-semibold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Store className="w-4 h-4" />
          <span>Buka Kasir</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden md:block w-[280px] h-screen fixed left-0 top-0 z-40">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-[280px] max-w-[85vw] h-full z-10 animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
