import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  X,
  Banknote,
  Building2,
  CreditCard,
  QrCode,
  Check,
  AlertCircle,
  Receipt,
  Scan,
  ChevronLeft,
  ChevronRight,
  PanelRightClose,
  PanelRightOpen,
  LayoutGrid,
  Grid3x3,
  ShoppingBag,
  ArrowLeft,
  GripVertical,
  SlidersHorizontal,
  PackageX,
  Crown,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { usePos } from '../context/PosContext';
import { formatRupiah, formatNumber, parseRupiahInput } from '../utils/formatters';
import { PaymentMethod, Product } from '../types';
import { BarcodeScannerModal, playScanSound } from './BarcodeScannerModal';
import { QrisBarcodeCard } from './QrisBarcodeCard';
import { QrisModal } from './QrisModal';
import { MemberSelectModal } from './MemberSelectModal';

export const PosView: React.FC = () => {
  const {
    products,
    categories,
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartSubtotal,
    cartTax,
    cartTotal,
    cartItemCount,
    completeCheckout,
    searchQuery,
    setSearchQuery,
    setActiveTab,
    settings,
    activePosMember,
    setActivePosMember,
    findMember,
  } = usePos();

  // Filters & Payment states
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('Tunai');
  const [cashGivenText, setCashGivenText] = useState<string>('150000');
  const [notes, setNotes] = useState<string>('');
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState<boolean>(false);
  const [skuFeedback, setSkuFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isQrisModalOpen, setIsQrisModalOpen] = useState<boolean>(false);

  // Layout sliding & resizing states
  const [cartPanelWidth, setCartPanelWidth] = useState<number>(() => {
    const saved = localStorage.getItem('kasirku_pos_cart_width');
    return saved ? parseInt(saved, 10) : 400;
  });
  const [isCartCollapsed, setIsCartCollapsed] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [gridDensity, setGridDensity] = useState<'normal' | 'compact'>('normal');
  const [mobileViewTab, setMobileViewTab] = useState<'katalog' | 'keranjang'>('katalog');

  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Save width preference
  useEffect(() => {
    localStorage.setItem('kasirku_pos_cart_width', cartPanelWidth.toString());
  }, [cartPanelWidth]);

  // Cash given calculation
  const cashGivenNumber = useMemo(() => {
    return parseRupiahInput(cashGivenText);
  }, [cashGivenText]);

  const changeAmount = useMemo(() => {
    if (selectedPaymentMethod !== 'Tunai') return 0;
    return Math.max(0, cashGivenNumber - cartTotal);
  }, [cashGivenNumber, cartTotal, selectedPaymentMethod]);

  const isCashInsufficient =
    selectedPaymentMethod === 'Tunai' && cartTotal > 0 && cashGivenNumber < cartTotal;

  // Hardware barcode scanner buffer & global listener (USB / Wireless handheld scanner)
  const barcodeBufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if modals are open
      if (isScannerOpen || isQrisModalOpen) return;

      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      // If user is focused on the search input itself, let handleSearchKeyDown handle Enter
      if (target?.id === 'search-produk-pos') return;

      // If typing in another text field manually, ignore
      if (isInput && target?.id !== 'search-produk-pos') {
        const now = Date.now();
        const diff = now - lastKeyTimeRef.current;
        lastKeyTimeRef.current = now;
        if (diff > 50 && e.key !== 'Enter') {
          return;
        }
      }

      const now = Date.now();
      const interval = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (e.key === 'Enter') {
        const scanned = barcodeBufferRef.current.trim();
        barcodeBufferRef.current = '';

        if (scanned.length >= 2) {
          e.preventDefault();

          // Check if scanned is a member barcode or member ID
          const matchedMember = findMember(scanned);
          if (matchedMember) {
            setActivePosMember(matchedMember);
            playScanSound(true);
            setSkuFeedback({
              message: `👑 Member VIP: ${matchedMember.name} (${matchedMember.tier}) terpasang!`,
              type: 'success',
            });
            setTimeout(() => setSkuFeedback(null), 3500);
            return;
          }

          const matched = products.find(
            (p) =>
              p.sku.toLowerCase() === scanned.toLowerCase() ||
              String(p.id).toLowerCase() === scanned.toLowerCase() ||
              p.name.toLowerCase() === scanned.toLowerCase()
          );

          if (matched) {
            if (matched.stock <= 0) {
              playScanSound(false);
              setSkuFeedback({
                message: `⚠️ Stok ${matched.name} (${matched.sku}) Habis!`,
                type: 'error',
              });
            } else {
              addToCart(matched);
              playScanSound(true);
              setSkuFeedback({
                message: `✅ Discan (Scanner Fisik): +1 ${matched.name} (${matched.sku})`,
                type: 'success',
              });
            }
          } else {
            playScanSound(false);
            setSkuFeedback({
              message: `❌ Barcode "${scanned}" tidak ditemukan dalam katalog!`,
              type: 'error',
            });
          }
          setTimeout(() => setSkuFeedback(null), 3500);
        }
        return;
      }

      if (e.ctrlKey || e.altKey || e.metaKey) return;

      if (e.key.length === 1) {
        if (!isInput) {
          barcodeBufferRef.current += e.key;
          setTimeout(() => {
            if (Date.now() - lastKeyTimeRef.current > 400) {
              barcodeBufferRef.current = '';
            }
          }, 450);
        } else if (interval < 50) {
          barcodeBufferRef.current += e.key;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [products, addToCart, isScannerOpen, isQrisModalOpen]);

  // Handle hardware barcode gun or Enter key inside search box
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const q = searchQuery.trim();
      if (!q) return;

      // Check if query is a member barcode, phone, or ID
      const maybeMember = findMember(q);
      if (maybeMember) {
        setActivePosMember(maybeMember);
        playScanSound(true);
        setSkuFeedback({
          message: `👑 Member VIP: ${maybeMember.name} (${maybeMember.tier}) terpasang!`,
          type: 'success',
        });
        setSearchQuery('');
        setTimeout(() => setSkuFeedback(null), 3500);
        return;
      }

      const matched = products.find(
        (p) =>
          p.sku.toLowerCase() === q.toLowerCase() ||
          String(p.id).toLowerCase() === q.toLowerCase() ||
          p.name.toLowerCase() === q.toLowerCase()
      );

      if (matched) {
        if (matched.stock <= 0) {
          playScanSound(false);
          setSkuFeedback({ message: `Stok ${matched.name} (${matched.sku}) Habis!`, type: 'error' });
        } else {
          addToCart(matched);
          playScanSound(true);
          setSkuFeedback({ message: `+1 ${matched.name} (${matched.sku}) ditambahkan`, type: 'success' });
          setSearchQuery('');
        }
      } else {
        playScanSound(false);
        setSkuFeedback({ message: `Produk / Barcode "${q}" tidak ditemukan!`, type: 'error' });
      }
      setTimeout(() => setSkuFeedback(null), 3500);
    }
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat =
        selectedCategory === 'Semua' ||
        p.category.toLowerCase() === selectedCategory.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Handle Pay Action
  const handlePay = () => {
    if (cart.length === 0) return;
    if (isCashInsufficient) {
      alert('Jumlah uang yang dibayarkan kurang dari total belanja.');
      return;
    }

    const effectivePaid =
      selectedPaymentMethod === 'Tunai' ? cashGivenNumber : cartTotal;

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    completeCheckout(selectedPaymentMethod, effectivePaid, notes);
    // On mobile, slide back to catalog after checkout
    setMobileViewTab('katalog');
  };

  const setQuickCash = (amount: number) => {
    setCashGivenText(amount.toString());
  };

  // Draggable Splitter mouse handler
  const handleSplitterMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const startX = e.clientX;
    const startWidth = cartPanelWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      // Dragging left makes cart wider; dragging right makes cart narrower (and products wider)
      const deltaX = startX - moveEvent.clientX;
      const newWidth = Math.min(Math.max(startWidth + deltaX, 290), 680);
      setCartPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Touch drag support
  const handleSplitterTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    const startX = touch.clientX;
    const startWidth = cartPanelWidth;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      const currentTouch = moveEvent.touches[0];
      const deltaX = startX - currentTouch.clientX;
      const newWidth = Math.min(Math.max(startWidth + deltaX, 290), 680);
      setCartPanelWidth(newWidth);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };

    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
  };

  // Scroll categories left/right
  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const amount = direction === 'left' ? -220 : 220;
      categoryScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#fbf8ff] overflow-hidden select-none">
      {/* Barcode Scanner Camera Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />

      {/* Member Selection & Registration Modal */}
      <MemberSelectModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        onSelectMember={(m) => setActivePosMember(m)}
      />

      {/* QRIS Fullscreen / Customer Display Modal */}
      <QrisModal
        isOpen={isQrisModalOpen}
        onClose={() => setIsQrisModalOpen(false)}
        amount={cartTotal > 0 ? cartTotal : 50000}
        storeName={settings.storeName || 'TOKO INDAH'}
        storeCity={settings.storeAddress ? settings.storeAddress.split(',')[0] : 'JAKARTA'}
        nmid="ID1020039201948"
        onConfirmPayment={() => {
          if (cart.length > 0) {
            completeCheckout('QRIS', cartTotal, notes);
          }
        }}
      />

      {/* Mobile / Tablet Segmented Slide Switcher (Shown on screens < lg) */}
      <div className="lg:hidden flex items-center border-b border-[#e2e1f2] bg-white shrink-0 shadow-xs z-10">
        <button
          type="button"
          onClick={() => setMobileViewTab('katalog')}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
            mobileViewTab === 'katalog'
              ? 'border-[#684cb6] text-[#684cb6] bg-[#a589f8]/10'
              : 'border-transparent text-[#5d5e6c] hover:bg-[#fbf8ff]'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Katalog Produk ({filteredProducts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileViewTab('keranjang')}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all relative cursor-pointer ${
            mobileViewTab === 'keranjang'
              ? 'border-[#684cb6] text-[#684cb6] bg-[#a589f8]/10'
              : 'border-transparent text-[#5d5e6c] hover:bg-[#fbf8ff]'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Keranjang & Bayar</span>
          {cartItemCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-[#684cb6] text-white animate-pulse">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>

      {/* Main Dual Area Container */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden relative">
        {/* ========================================================= */}
        {/* PRODUCT CATALOG (Left Area on Desktop, Tab 1 on Mobile)  */}
        {/* ========================================================= */}
        <section
          className={`flex-1 flex flex-col min-w-0 overflow-hidden bg-[#fbf8ff] ${
            mobileViewTab === 'katalog' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Top Control Bar: Search + Actions + View Customizers */}
          <div className="p-3 sm:p-4 md:px-6 md:pt-5 md:pb-3 space-y-3 bg-[#fbf8ff] border-b border-[#e2e1f2]/70 shrink-0">
            {/* Row 1: Search Bar & Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Search Input */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#797988]" />
                <input
                  id="search-produk-pos"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Cari nama produk, SKU, kategori, atau scan barcode..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e2e1f2] rounded-xl text-sm text-[#30323e] placeholder-[#797988] focus:outline-none focus:border-[#684cb6] focus:ring-1 focus:ring-[#684cb6] shadow-xs transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#797988] hover:text-[#30323e]"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Scan Barcode Camera Trigger Button */}
              <button
                id="btn-scan-barcode"
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="px-3.5 py-2.5 bg-[#684cb6] hover:bg-[#583ca4] active:scale-98 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer shrink-0"
                title="Buka Pemindai Barcode Kamera"
              >
                <Scan className="w-4 h-4" />
                <span className="hidden sm:inline">Scan Barcode</span>
              </button>

              {/* Tampilkan Barcode QRIS Button */}
              <button
                id="btn-tampilkan-barcode-qris"
                type="button"
                onClick={() => {
                  setSelectedPaymentMethod('QRIS');
                  setIsQrisModalOpen(true);
                }}
                className="px-3.5 py-2.5 bg-white border border-[#b91c1c]/30 hover:bg-[#fee2e2]/40 text-[#b91c1c] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
                title="Tampilkan Barcode QRIS Toko (Standar Pembayaran Nasional)"
              >
                <QrCode className="w-4 h-4 text-[#b91c1c]" />
                <span className="hidden sm:inline">Barcode QRIS</span>
              </button>

              {/* Grid Density Toggle (Desktop & Mobile) */}
              <button
                type="button"
                onClick={() => setGridDensity(gridDensity === 'normal' ? 'compact' : 'normal')}
                className="px-3 py-2.5 bg-white border border-[#e2e1f2] hover:bg-[#f4f2fe] text-[#5d5e6c] hover:text-[#684cb6] rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
                title="Ubah Kerapatan Tampilan Produk (Bisa muat lebih banyak produk)"
              >
                {gridDensity === 'compact' ? (
                  <LayoutGrid className="w-4 h-4 text-[#684cb6]" />
                ) : (
                  <Grid3x3 className="w-4 h-4" />
                )}
                <span className="hidden md:inline">
                  {gridDensity === 'compact' ? 'Kisi Padat' : 'Kisi Standar'}
                </span>
              </button>

              {/* Desktop Slide/Collapse Cart Button */}
              <button
                type="button"
                onClick={() => setIsCartCollapsed(!isCartCollapsed)}
                className={`hidden lg:flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
                  isCartCollapsed
                    ? 'bg-[#684cb6] text-white border-[#684cb6] shadow-xs animate-pulse'
                    : 'bg-white border-[#e2e1f2] text-[#5d5e6c] hover:bg-[#f4f2fe] hover:text-[#684cb6]'
                }`}
                title={
                  isCartCollapsed
                    ? 'Buka Panel Keranjang (Geser Keluar)'
                    : 'Tutup Keranjang (Perluas Tampilan Produk ke Layar Penuh)'
                }
              >
                {isCartCollapsed ? (
                  <>
                    <PanelRightOpen className="w-4 h-4" />
                    <span>Buka Keranjang ({cartItemCount})</span>
                  </>
                ) : (
                  <>
                    <PanelRightClose className="w-4 h-4" />
                    <span>Perluas Produk</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick SKU notification feedback banner */}
            {skuFeedback && (
              <div
                className={`text-xs px-3 py-2 rounded-xl font-semibold flex items-center gap-2 animate-in fade-in duration-150 ${
                  skuFeedback.type === 'success'
                    ? 'bg-emerald-50 text-[#006d4b] border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {skuFeedback.type === 'success' ? (
                  <Check className="w-4 h-4 text-[#006d4b]" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                )}
                <span>{skuFeedback.message}</span>
              </div>
            )}

            {/* Row 2: Category Filter Horizontal Slider with Navigation Arrows */}
            <div className="flex items-center gap-1.5">
              {/* Slide Left Button */}
              <button
                type="button"
                onClick={() => scrollCategories('left')}
                className="w-7 h-7 rounded-full bg-white border border-[#e2e1f2] hover:bg-[#f4f2fe] text-[#5d5e6c] hover:text-[#684cb6] flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-xs"
                title="Geser kategori ke kiri"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Category Filter Pills Container */}
              <div
                ref={categoryScrollRef}
                className="flex-1 flex gap-2 overflow-x-auto pb-1 scrollbar-none scroll-smooth"
              >
                {categories.map((cat) => {
                  const isActive =
                    selectedCategory === cat.name ||
                    (cat.id === 'all' && selectedCategory === 'Semua');
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.name === 'Semua' ? 'Semua' : cat.name)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                        isActive
                          ? 'bg-[#684cb6] text-white shadow-xs font-bold scale-[1.02]'
                          : 'bg-white border border-[#e2e1f2] text-[#5d5e6c] hover:bg-[#f4f2fe]'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>

              {/* Slide Right Button */}
              <button
                type="button"
                onClick={() => scrollCategories('right')}
                className="w-7 h-7 rounded-full bg-white border border-[#e2e1f2] hover:bg-[#f4f2fe] text-[#5d5e6c] hover:text-[#684cb6] flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-xs"
                title="Geser kategori ke kanan"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Product Cards Grid with Smooth Scrolling */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:px-6">
            {filteredProducts.length > 0 ? (
              <div
                className={`grid pb-12 transition-all ${
                  gridDensity === 'compact'
                    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5'
                    : 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5'
                }`}
              >
                {filteredProducts.map((prod) => {
                  const isOutOfStock = prod.stock <= 0;
                  const cartItem = cart.find((ci) => ci.product.id === prod.id);

                  return (
                    <div
                      key={prod.id}
                      onClick={() => !isOutOfStock && addToCart(prod)}
                      className={`bg-white rounded-2xl border transition-all flex flex-col h-full overflow-hidden select-none relative group ${
                        isOutOfStock
                          ? 'border-[#e2e1f2] opacity-65 cursor-not-allowed'
                          : 'border-[#e2e1f2] hover:border-[#684cb6] hover:shadow-md cursor-pointer active:scale-[0.99]'
                      } ${cartItem ? 'ring-2 ring-[#684cb6] border-transparent shadow-xs' : ''}`}
                    >
                      {/* Image container */}
                      <div
                        className={`bg-[#f4f2fe] w-full relative overflow-hidden transition-all ${
                          gridDensity === 'compact' ? 'h-24 sm:h-28' : 'h-32 sm:h-36'
                        }`}
                      >
                        <img
                          src={prod.image}
                          alt={prod.name}
                          loading="lazy"
                          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                            isOutOfStock ? 'grayscale' : ''
                          }`}
                        />

                        {/* Stock status badge */}
                        {isOutOfStock ? (
                          <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center">
                            <span className="bg-white text-[#a8364b] border border-[#f97386] px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold shadow-xs">
                              Stok Habis
                            </span>
                          </div>
                        ) : (
                          <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-lg text-[10px] font-bold text-[#006d4b] border border-[#6bffc1] shadow-xs">
                            Stok: {prod.stock}
                          </div>
                        )}

                        {/* Badge if item in cart */}
                        {cartItem && (
                          <div className="absolute top-2 left-2 bg-[#684cb6] text-white px-2 py-0.5 rounded-lg text-[11px] font-bold shadow-xs animate-in zoom-in-50">
                            {cartItem.quantity}x
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className={`flex flex-col flex-1 justify-between ${gridDensity === 'compact' ? 'p-2.5' : 'p-3'}`}>
                        <div>
                          <span className="text-[10px] text-[#797988] font-mono block">
                            {prod.sku}
                          </span>
                          <h3
                            className={`font-bold text-[#30323e] mt-0.5 line-clamp-2 leading-tight ${
                              gridDensity === 'compact' ? 'text-xs' : 'text-xs md:text-sm'
                            }`}
                          >
                            {prod.name}
                          </h3>
                        </div>

                        <div className="mt-2 pt-1.5 border-t border-[#e2e1f2]/40 flex items-center justify-between">
                          <p
                            className={`font-extrabold text-[#684cb6] ${
                              gridDensity === 'compact' ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
                            }`}
                          >
                            {formatRupiah(prod.price)}
                          </p>
                          {!isOutOfStock && (
                            <div className="w-6 h-6 rounded-full bg-[#f4f2fe] text-[#684cb6] group-hover:bg-[#684cb6] group-hover:text-white flex items-center justify-center transition-colors">
                              <Plus className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : products.length === 0 ? (
              <div className="h-72 flex flex-col items-center justify-center text-center p-6 text-[#5d5e6c]">
                <div className="w-16 h-16 rounded-2xl bg-[#f4f2fe] text-[#684cb6] flex items-center justify-center mb-3">
                  <PackageX className="w-8 h-8" />
                </div>
                <p className="text-base font-bold text-[#30323e]">Katalog Produk Kosong</p>
                <p className="text-xs text-[#797988] mt-1 max-w-sm">
                  Semua produk telah dikosongkan dari sistem. Buka menu Produk untuk menambahkan barang baru ke katalog.
                </p>
                <button
                  type="button"
                  id="btn-pos-ke-produk"
                  onClick={() => setActiveTab('produk')}
                  className="mt-4 px-5 py-2.5 text-xs text-white font-semibold bg-[#684cb6] hover:bg-[#5b3fa9] rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ke Menu Produk</span>
                </button>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-[#5d5e6c]">
                <Search className="w-12 h-12 text-[#e2e1f2] mb-3" />
                <p className="text-base font-bold text-[#30323e]">Tidak Ada Produk Ditemukan</p>
                <p className="text-xs text-[#797988] mt-1 max-w-xs">
                  Coba ubah kata kunci pencarian atau pilih kategori lain.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('Semua');
                  }}
                  className="mt-3 px-3 py-1.5 text-xs text-[#684cb6] font-semibold bg-[#a589f8]/15 hover:bg-[#a589f8]/25 rounded-lg transition-colors cursor-pointer"
                >
                  Reset Filter & Pencarian
                </button>
              </div>
            )}
          </div>

          {/* Floating Mobile Bottom Checkout Bar (Shown only when items exist and in mobile katalog tab) */}
          {cartItemCount > 0 && (
            <div className="lg:hidden p-3 bg-white border-t border-[#e2e1f2] shadow-xl flex items-center justify-between shrink-0 z-20 animate-in slide-in-from-bottom duration-200">
              <div className="flex flex-col">
                <span className="text-xs text-[#5d5e6c] font-medium">
                  {cartItemCount} item dalam pesanan
                </span>
                <span className="text-lg font-black text-[#684cb6]">
                  {formatRupiah(cartTotal)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileViewTab('keranjang')}
                className="px-4 py-2.5 bg-[#684cb6] hover:bg-[#583ca4] active:scale-98 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <span>Lihat Keranjang & Bayar</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* DRAGGABLE RESIZABLE SPLITTER (Desktop only, visible when cart not collapsed) */}
        {/* ========================================================= */}
        {!isCartCollapsed && (
          <div
            onMouseDown={handleSplitterMouseDown}
            onTouchStart={handleSplitterTouchStart}
            onDoubleClick={() => setCartPanelWidth(400)}
            title="Geser pembatas kiri-kanan untuk mengatur lebar katalog produk dan keranjang kasir (Klik ganda untuk reset ke 400px)"
            className={`hidden lg:flex w-2.5 hover:w-3.5 bg-[#e2e1f2] hover:bg-[#684cb6] transition-all cursor-col-resize items-center justify-center relative group select-none shrink-0 z-30 ${
              isDragging ? '!bg-[#684cb6] !w-3.5 ring-2 ring-[#a589f8]' : ''
            }`}
          >
            {/* Grip handle visual dots */}
            <div className="flex flex-col items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
              <div className="w-1 h-1 rounded-full bg-[#5d5e6c] group-hover:bg-white" />
              <div className="w-1 h-1 rounded-full bg-[#5d5e6c] group-hover:bg-white" />
              <div className="w-1 h-1 rounded-full bg-[#5d5e6c] group-hover:bg-white" />
              <div className="w-1 h-1 rounded-full bg-[#5d5e6c] group-hover:bg-white" />
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* CART & CHECKOUT PANEL (Right Area on Desktop, Tab 2 on Mobile) */}
        {/* ========================================================= */}
        {!isCartCollapsed && (
          <section
            style={{
              width: window.innerWidth >= 1024 ? `${cartPanelWidth}px` : '100%',
            }}
            className={`bg-white border-l border-[#e2e1f2] flex flex-col shadow-lg z-20 shrink-0 h-full overflow-hidden ${
              mobileViewTab === 'keranjang' ? 'flex w-full' : 'hidden lg:flex'
            }`}
          >
            {/* Cart Header */}
            <div className="p-3.5 sm:p-4 border-b border-[#e2e1f2] flex justify-between items-center bg-white shrink-0">
              <div className="flex items-center gap-2">
                {/* Mobile Back to Catalog Button */}
                <button
                  type="button"
                  onClick={() => setMobileViewTab('katalog')}
                  className="p-1.5 -ml-1 text-[#5d5e6c] hover:bg-[#f4f2fe] rounded-lg lg:hidden cursor-pointer"
                  title="Kembali ke Katalog Produk"
                >
                  <ArrowLeft className="w-5 h-5 text-[#684cb6]" />
                </button>

                <h2 className="text-base font-bold text-[#30323e] flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[#684cb6]" />
                  <span>Pesanan Kasir</span>
                  {cartItemCount > 0 && (
                    <span className="text-xs px-2 py-0.5 bg-[#a589f8]/20 text-[#684cb6] font-bold rounded-full">
                      {cartItemCount} item
                    </span>
                  )}
                </h2>
              </div>

              <div className="flex items-center gap-1">
                {/* Quick Split Width Presets (Desktop) */}
                <div className="hidden xl:flex items-center gap-1 mr-1 text-[11px] text-[#797988]">
                  <button
                    type="button"
                    onClick={() => setCartPanelWidth(340)}
                    title="Atur lebar keranjang kompak (340px) agar katalog lebih luas"
                    className={`px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                      cartPanelWidth <= 350
                        ? 'bg-[#684cb6] text-white border-[#684cb6]'
                        : 'bg-[#f4f2fe] border-[#e2e1f2] hover:bg-[#e2e1f2]'
                    }`}
                  >
                    Kompak
                  </button>
                  <button
                    type="button"
                    onClick={() => setCartPanelWidth(420)}
                    title="Atur lebar seimbang (420px)"
                    className={`px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                      cartPanelWidth > 350 && cartPanelWidth <= 450
                        ? 'bg-[#684cb6] text-white border-[#684cb6]'
                        : 'bg-[#f4f2fe] border-[#e2e1f2] hover:bg-[#e2e1f2]'
                    }`}
                  >
                    Standar
                  </button>
                  <button
                    type="button"
                    onClick={() => setCartPanelWidth(520)}
                    title="Atur lebar luas (520px) untuk fokus kasir"
                    className={`px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                      cartPanelWidth > 450
                        ? 'bg-[#684cb6] text-white border-[#684cb6]'
                        : 'bg-[#f4f2fe] border-[#e2e1f2] hover:bg-[#e2e1f2]'
                    }`}
                  >
                    Luas
                  </button>
                </div>

                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-[#a8364b] hover:bg-[#f97386]/20 p-1.5 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    title="Kosongkan Semua Pesanan"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Kosongkan</span>
                  </button>
                )}
              </div>
            </div>

            {/* Customer Member Loyalty Banner */}
            <div className="px-3.5 py-2 bg-[#fbf8ff] border-b border-[#e2e1f2] flex items-center justify-between gap-2 shrink-0">
              {activePosMember ? (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center shrink-0 shadow-2xs">
                      <Crown className="w-4 h-4 fill-amber-400 text-amber-700" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#1e1b4b] truncate">
                          {activePosMember.name}
                        </span>
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full uppercase bg-amber-200 text-amber-950">
                          {activePosMember.tier}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#684cb6] font-semibold block">
                        Saldo: {formatNumber(activePosMember.points)} Pts (
                        +{Math.floor(
                          (cartTotal / 1000) *
                            (activePosMember.tier === 'Diamond'
                              ? 3
                              : activePosMember.tier === 'Platinum'
                              ? 2
                              : activePosMember.tier === 'Gold'
                              ? 1.5
                              : 1)
                        )}{' '}
                        Pts didapat)
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActivePosMember(null)}
                    title="Lepas Member dari Pesanan"
                    className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(true)}
                  className="w-full py-1.5 px-2.5 rounded-xl border border-dashed border-[#684cb6]/40 hover:border-[#684cb6] bg-white hover:bg-[#f4f2fe] text-xs font-bold text-[#684cb6] flex items-center justify-between transition-all cursor-pointer shadow-2xs group"
                >
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-500 fill-amber-400 group-hover:scale-110 transition-transform" />
                    <span>Pasang Member VIP</span>
                  </div>
                  <span className="text-[10px] text-amber-900 font-bold bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                    +Poin & Promo
                  </span>
                </button>
              )}
            </div>

            {/* Cart Items List (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-[#e2e1f2]/60 min-h-[140px]">
              {cart.length > 0 ? (
                cart.map(({ product, quantity }) => (
                  <div key={product.id} className="pt-3 first:pt-0 flex flex-col gap-2 group">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-2">
                        <h4 className="text-xs md:text-sm font-bold text-[#30323e] leading-snug">
                          {product.name}
                        </h4>
                        <span className="text-[11px] text-[#5d5e6c]">
                          {formatRupiah(product.price)} / item
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(product.id)}
                        className="text-[#797988] hover:text-[#a8364b] p-1 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                        title="Hapus dari pesanan"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex justify-between items-center">
                      {/* Quantity Control Pill */}
                      <div className="flex items-center border border-[#e2e1f2] rounded-lg bg-[#fbf8ff] h-8 overflow-hidden shadow-xs">
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="w-8 h-full flex items-center justify-center text-[#5d5e6c] hover:bg-[#e2e1f2] transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={product.stock}
                          value={quantity}
                          onChange={(e) => updateQuantity(product.id, parseInt(e.target.value, 10) || 1)}
                          className="w-10 h-full text-center border-x border-[#e2e1f2] bg-transparent text-xs font-bold p-0 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          disabled={quantity >= product.stock}
                          className="w-8 h-full flex items-center justify-center text-[#5d5e6c] hover:bg-[#e2e1f2] disabled:opacity-30 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-[#684cb6]">
                        {formatRupiah(product.price * quantity)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-10 text-[#5d5e6c]">
                  <ShoppingCart className="w-12 h-12 text-[#e2e1f2] mb-2" />
                  <p className="text-sm font-semibold text-[#30323e]">Keranjang Masih Kosong</p>
                  <p className="text-xs text-[#797988] mt-1 max-w-[240px]">
                    Pilih produk dari katalog untuk menambahkan ke pesanan kasir.
                  </p>
                  <button
                    type="button"
                    onClick={() => setMobileViewTab('katalog')}
                    className="mt-3 px-3.5 py-1.5 bg-[#684cb6] text-white rounded-xl text-xs font-bold lg:hidden cursor-pointer"
                  >
                    Buka Katalog Produk
                  </button>
                </div>
              )}
            </div>

            {/* Payment & Checkout Section (Bottom) */}
            <div className="bg-[#f4f2fe] border-t border-[#e2e1f2] p-3.5 sm:p-4 flex flex-col gap-2.5 shadow-lg shrink-0 overflow-y-auto max-h-[58vh]">
              {/* Subtotals breakdown */}
              <div className="flex justify-between items-center text-xs text-[#5d5e6c]">
                <span>Subtotal ({cartItemCount} item)</span>
                <span className="font-semibold text-[#30323e]">{formatRupiah(cartSubtotal)}</span>
              </div>

              <div className="flex justify-between items-center text-xs text-[#5d5e6c]">
                <span>Pajak PPN (11%)</span>
                <span className="font-semibold text-[#30323e]">{formatRupiah(cartTax)}</span>
              </div>

              <div className="flex justify-between items-center border-t border-[#e2e1f2] pt-2">
                <span className="text-base font-extrabold text-[#30323e]">Total Belanja</span>
                <span className="text-2xl font-black text-[#684cb6]">
                  {formatRupiah(cartTotal)}
                </span>
              </div>

              {/* Payment Method Selector (4 Grid Buttons) */}
              <div className="mt-1">
                <span className="text-[11px] font-semibold text-[#5d5e6c] block mb-1.5">
                  Pilih Metode Pembayaran
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {(
                    [
                      { id: 'Tunai', label: 'Tunai', icon: <Banknote className="w-4 h-4" /> },
                      { id: 'Transfer', label: 'Transfer', icon: <Building2 className="w-4 h-4" /> },
                      { id: 'Kartu', label: 'Kartu', icon: <CreditCard className="w-4 h-4" /> },
                      { id: 'QRIS', label: 'QRIS', icon: <QrCode className="w-4 h-4" /> },
                    ] as { id: PaymentMethod; label: string; icon: React.ReactNode }[]
                  ).map((pm) => {
                    const isSelected = selectedPaymentMethod === pm.id;
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setSelectedPaymentMethod(pm.id)}
                        className={`py-2 px-1 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#684cb6] text-white border-[#684cb6] shadow-xs scale-[1.02]'
                            : 'bg-white text-[#5d5e6c] border-[#e2e1f2] hover:bg-[#eeecfa]'
                        }`}
                      >
                        {pm.icon}
                        <span className="text-[11px]">{pm.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cash Specific Controls */}
              {selectedPaymentMethod === 'Tunai' ? (
                <div className="mt-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#5d5e6c]">Jumlah Uang Diterima</span>
                    <div className="flex gap-1 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setQuickCash(cartTotal)}
                        className="text-[10px] font-bold px-2 py-0.5 bg-white border border-[#e2e1f2] rounded text-[#684cb6] hover:bg-[#eeecfa] cursor-pointer"
                      >
                        Pas
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickCash(50000)}
                        className="text-[10px] font-bold px-1.5 py-0.5 bg-white border border-[#e2e1f2] rounded text-[#5d5e6c] hover:bg-[#eeecfa] cursor-pointer"
                      >
                        50rb
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickCash(100000)}
                        className="text-[10px] font-bold px-1.5 py-0.5 bg-white border border-[#e2e1f2] rounded text-[#5d5e6c] hover:bg-[#eeecfa] cursor-pointer"
                      >
                        100rb
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickCash(200000)}
                        className="text-[10px] font-bold px-1.5 py-0.5 bg-white border border-[#e2e1f2] rounded text-[#5d5e6c] hover:bg-[#eeecfa] cursor-pointer"
                      >
                        200rb
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#5d5e6c]">
                      Rp
                    </span>
                    <input
                      type="text"
                      value={
                        cashGivenText ? formatNumber(parseRupiahInput(cashGivenText)) : ''
                      }
                      onChange={(e) => setCashGivenText(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="0"
                      className="w-full bg-white border border-[#e2e1f2] text-[#30323e] text-lg font-bold rounded-xl pl-9 pr-3 py-2 text-right focus:border-[#684cb6] focus:ring-1 focus:ring-[#684cb6] outline-none"
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#5d5e6c]">Kembalian:</span>
                    <span
                      className={`font-bold text-sm ${
                        isCashInsufficient ? 'text-[#a8364b]' : 'text-[#006d4b]'
                      }`}
                    >
                      {isCashInsufficient ? 'Uang Kurang' : formatRupiah(changeAmount)}
                    </span>
                  </div>
                </div>
              ) : selectedPaymentMethod === 'QRIS' ? (
                <div className="mt-1">
                  <QrisBarcodeCard
                    amount={cartTotal}
                    storeName={settings.storeName || 'TOKO INDAH'}
                    storeCity={settings.storeAddress ? settings.storeAddress.split(',')[0] : 'JAKARTA'}
                    nmid="ID1020039201948"
                    compact={true}
                    onExpand={() => setIsQrisModalOpen(true)}
                    onSimulateSuccess={() => {
                      completeCheckout('QRIS', cartTotal, notes);
                    }}
                  />
                </div>
              ) : (
                <div className="mt-1 p-2 bg-white rounded-xl border border-[#e2e1f2] flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#eeecfa] rounded-lg flex items-center justify-center text-[#684cb6] shrink-0">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-[#30323e]">
                      {selectedPaymentMethod === 'Transfer' ? 'Transfer Bank' : 'Mesin EDC / Debit'}
                    </p>
                    <p className="text-[#5d5e6c] text-[11px]">Pastikan pembayaran telah terverifikasi.</p>
                  </div>
                </div>
              )}

              {/* Pay Button (Emerald Green #059669) */}
              <button
                id="btn-bayar-sekarang"
                type="button"
                disabled={cart.length === 0 || isCashInsufficient}
                onClick={handlePay}
                className="w-full mt-1 bg-[#059669] hover:bg-[#047857] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Receipt className="w-5 h-5" />
                <span>PROSES PEMBAYARAN</span>
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
