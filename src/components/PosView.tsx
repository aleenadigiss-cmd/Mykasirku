import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { usePos } from '../context/PosContext';
import { formatRupiah, formatNumber, parseRupiahInput } from '../utils/formatters';
import { PaymentMethod, Product } from '../types';

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
    settings,
    completeCheckout,
    searchQuery,
    setSearchQuery,
  } = usePos();

  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('Tunai');
  const [cashGivenText, setCashGivenText] = useState<string>('150000');
  const [notes, setNotes] = useState<string>('');

  // Cash given numerical calculation
  const cashGivenNumber = useMemo(() => {
    return parseRupiahInput(cashGivenText);
  }, [cashGivenText]);

  const changeAmount = useMemo(() => {
    if (selectedPaymentMethod !== 'Tunai') return 0;
    return Math.max(0, cashGivenNumber - cartTotal);
  }, [cashGivenNumber, cartTotal, selectedPaymentMethod]);

  const isCashInsufficient =
    selectedPaymentMethod === 'Tunai' && cartTotal > 0 && cashGivenNumber < cartTotal;

  // Filter products by category and query
  const filteredProducts = products.filter((p) => {
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

  // Handle Pay Action
  const handlePay = () => {
    if (cart.length === 0) return;
    if (isCashInsufficient) {
      alert('Jumlah uang yang dibayarkan kurang dari total belanja.');
      return;
    }

    const effectivePaid =
      selectedPaymentMethod === 'Tunai' ? cashGivenNumber : cartTotal;

    // Trigger celebration confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    completeCheckout(selectedPaymentMethod, effectivePaid, notes);
  };

  // Quick cash preset helper
  const setQuickCash = (amount: number) => {
    setCashGivenText(amount.toString());
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] -m-4 md:-m-8 bg-[#fbf8ff] overflow-hidden">
      {/* Product Catalog (Left Area) */}
      <section className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden min-w-0">
        {/* Search & Category Filter Bar */}
        <div className="space-y-3 pb-3 shrink-0">
          {/* Search Input for POS */}
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#797988]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk atau SKU..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e2e1f2] rounded-xl text-sm text-[#30323e] placeholder-[#797988] focus:outline-none focus:border-[#684cb6] focus:ring-1 focus:ring-[#684cb6] shadow-xs"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isActive =
                selectedCategory === cat.name ||
                (cat.id === 'all' && selectedCategory === 'Semua');
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name === 'Semua' ? 'Semua' : cat.name)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#684cb6] text-white shadow-xs'
                      : 'bg-white border border-[#e2e1f2] text-[#5d5e6c] hover:bg-[#f4f2fe]'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5 pb-6">
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
                  } ${cartItem ? 'ring-2 ring-[#684cb6] border-transparent' : ''}`}
                >
                  {/* Image container */}
                  <div className="h-32 bg-[#f4f2fe] w-full relative overflow-hidden">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                        isOutOfStock ? 'grayscale' : ''
                      }`}
                    />

                    {/* Stock status badge */}
                    {isOutOfStock ? (
                      <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="bg-white text-[#a8364b] border border-[#f97386] px-2.5 py-1 rounded-full text-[11px] font-bold shadow-xs">
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
                      <div className="absolute top-2 left-2 bg-[#684cb6] text-white px-2 py-0.5 rounded-lg text-[11px] font-bold shadow-xs">
                        {cartItem.quantity}x
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-3 flex flex-col flex-1 justify-between">
                    <div>
                      <span className="text-[10px] text-[#797988] font-mono block">
                        {prod.sku}
                      </span>
                      <h3 className="text-xs md:text-sm font-bold text-[#30323e] mt-0.5 line-clamp-2 leading-tight">
                        {prod.name}
                      </h3>
                    </div>

                    <div className="mt-2.5 pt-1.5 border-t border-[#e2e1f2]/40 flex items-center justify-between">
                      <p className="text-xs md:text-sm font-extrabold text-[#684cb6]">
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
        </div>
      </section>

      {/* Sidebar Cart (Right Area) */}
      <section className="w-full lg:w-[400px] xl:w-[420px] bg-white border-t lg:border-t-0 lg:border-l border-[#e2e1f2] flex flex-col shadow-lg z-20 shrink-0">
        {/* Cart Header */}
        <div className="p-4 border-b border-[#e2e1f2] flex justify-between items-center bg-white">
          <h2 className="text-base font-bold text-[#30323e] flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#684cb6]" />
            <span>Pesanan Saat Ini</span>
            {cartItemCount > 0 && (
              <span className="text-xs px-2 py-0.5 bg-[#a589f8]/20 text-[#684cb6] font-bold rounded-full">
                {cartItemCount} item
              </span>
            )}
          </h2>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-[#a8364b] hover:bg-[#f97386]/20 p-1.5 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
              title="Kosongkan Keranjang"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Kosongkan</span>
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-[#e2e1f2]/60 min-h-[160px]">
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
                    onClick={() => removeFromCart(product.id)}
                    className="text-[#797988] hover:text-[#a8364b] p-1 transition-colors opacity-70 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex justify-between items-center">
                  {/* Quantity Control Pill */}
                  <div className="flex items-center border border-[#e2e1f2] rounded-lg bg-[#fbf8ff] h-8 overflow-hidden shadow-xs">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="w-8 h-full flex items-center justify-center text-[#5d5e6c] hover:bg-[#e2e1f2] transition-colors"
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
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      disabled={quantity >= product.stock}
                      className="w-8 h-full flex items-center justify-center text-[#5d5e6c] hover:bg-[#e2e1f2] disabled:opacity-30 transition-colors"
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
              <p className="text-xs text-[#797988] mt-1">
                Pilih produk dari katalog di sebelah kiri untuk memulai pesanan.
              </p>
            </div>
          )}
        </div>

        {/* Payment & Checkout Section (Bottom) */}
        <div className="bg-[#f4f2fe] border-t border-[#e2e1f2] p-4 flex flex-col gap-2.5 shadow-md">
          {/* Subtotals breakdown */}
          <div className="flex justify-between items-center text-xs text-[#5d5e6c]">
            <span>Subtotal ({cartItemCount} item)</span>
            <span className="font-semibold text-[#30323e]">{formatRupiah(cartSubtotal)}</span>
          </div>

          <div className="flex justify-between items-center text-xs text-[#5d5e6c]">
            <span>Pajak (11%)</span>
            <span className="font-semibold text-[#30323e]">{formatRupiah(cartTax)}</span>
          </div>

          <div className="flex justify-between items-center border-t border-[#e2e1f2] pt-2">
            <span className="text-base font-extrabold text-[#30323e]">Total</span>
            <span className="text-2xl font-black text-[#684cb6]">
              {formatRupiah(cartTotal)}
            </span>
          </div>

          {/* Payment Method Selector (4 Grid Buttons) */}
          <div className="mt-1">
            <span className="text-[11px] font-semibold text-[#5d5e6c] block mb-1.5">
              Metode Pembayaran
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
                    onClick={() => setSelectedPaymentMethod(pm.id)}
                    className={`py-2 px-1 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#684cb6] text-white border-[#684cb6] shadow-xs'
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
                <span className="text-[11px] font-semibold text-[#5d5e6c]">Jumlah Dibayar</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setQuickCash(cartTotal)}
                    className="text-[10px] font-bold px-1.5 py-0.5 bg-white border border-[#e2e1f2] rounded text-[#684cb6] hover:bg-[#eeecfa]"
                  >
                    Pas
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickCash(50000)}
                    className="text-[10px] font-bold px-1.5 py-0.5 bg-white border border-[#e2e1f2] rounded text-[#5d5e6c] hover:bg-[#eeecfa]"
                  >
                    50rb
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickCash(100000)}
                    className="text-[10px] font-bold px-1.5 py-0.5 bg-white border border-[#e2e1f2] rounded text-[#5d5e6c] hover:bg-[#eeecfa]"
                  >
                    100rb
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickCash(150000)}
                    className="text-[10px] font-bold px-1.5 py-0.5 bg-white border border-[#e2e1f2] rounded text-[#5d5e6c] hover:bg-[#eeecfa]"
                  >
                    150rb
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
            <div className="mt-1 p-2 bg-white rounded-xl border border-[#e2e1f2] flex items-center gap-3">
              <div className="w-10 h-10 bg-[#eeecfa] rounded-lg flex items-center justify-center text-[#684cb6] shrink-0">
                <QrCode className="w-6 h-6" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-[#30323e]">QRIS Dinamis Siap</p>
                <p className="text-[#5d5e6c] text-[11px]">Tampilkan QR di struk atau monitor kasir.</p>
              </div>
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
            disabled={cart.length === 0 || isCashInsufficient}
            onClick={handlePay}
            className="w-full mt-1 bg-[#059669] hover:bg-[#047857] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Receipt className="w-5 h-5" />
            <span>BAYAR SEKARANG</span>
          </button>
        </div>
      </section>
    </div>
  );
};
