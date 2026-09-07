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
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { usePos, ActiveNavTab } from '../context/PosContext';

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
    cartItemCount,
    sidebarCollapsed,
    toggleSidebar,
  } = usePos();

  const navItems: { id: ActiveNavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
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
              onClick={toggleSidebar}
              title="Perluas Menu Sidebar (Geser Keluar)"
              className="p-1.5 rounded-lg text-[#5d5e6c] hover:text-[#684cb6] hover:bg-[#f4f2fe] transition-colors cursor-pointer mt-1"
            >
              <ChevronRight className="w-4 h-4" />
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
              {/* Desktop Slide Collapse Button */}
              <button
                onClick={toggleSidebar}
                title="Sembunyikan / Kecilkan Sidebar (Geser ke Kiri)"
                className="hidden md:flex p-1.5 rounded-lg text-[#5d5e6c] hover:text-[#684cb6] hover:bg-[#f4f2fe] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
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
      <div className={`border-t border-[#e2e1f2] ${isCollapsed ? 'p-2' : 'p-4'}`}>
        {!isCollapsed && (
          <div className="mb-2.5 flex items-center justify-between text-xs text-[#5d5e6c] px-1">
            <span>Status Kasir:</span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#006d4b]">
              <span className="w-2 h-2 rounded-full bg-[#006d4b] animate-pulse" />
              {isRegisterOpen ? 'Terbuka' : 'Tutup'}
            </span>
          </div>
        )}
        <button
          id="btn-buka-kasir"
          onClick={() => {
            setActiveTab('kasir');
            if (!isRegisterOpen) {
              if (onOpenRegisterModal) onOpenRegisterModal();
              else setShowOpenRegisterModal(true);
            }
            if (onCloseMobile) onCloseMobile();
          }}
          title="Buka Layar Kasir"
          className={`w-full bg-[#684cb6] hover:bg-[#5b3fa9] active:scale-[0.98] text-[#fdf7ff] font-semibold rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs ${
            isCollapsed ? 'p-2.5' : 'py-2.5 px-4 text-xs gap-2'
          }`}
        >
          <Store className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Buka Kasir</span>}
        </button>
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

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
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
