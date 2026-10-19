import React, { useState, useMemo } from 'react';
import {
  Banknote,
  X,
  CheckCircle2,
  Lock,
  Unlock,
  Store,
  Clock,
  User,
  Calculator,
  AlertTriangle,
  Receipt,
  ArrowRight,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { usePos } from '../context/PosContext';
import { formatRupiah, formatNumber, parseRupiahInput } from '../utils/formatters';

interface OpenRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OpenRegisterModal: React.FC<OpenRegisterModalProps> = ({ isOpen, onClose }) => {
  const {
    isRegisterOpen,
    registerStartingCash,
    registerOpenedAt,
    registerOpenedBy,
    openRegister,
    closeRegister,
    activeCashier,
    cashiers,
    setActiveCashier,
    transactions,
    showToast,
  } = usePos();

  // Form states for Opening Register
  const [openingBalanceText, setOpeningBalanceText] = useState('200000');
  const [selectedStaff, setSelectedStaff] = useState(activeCashier.name);
  const [openNotes, setOpenNotes] = useState('');

  // Form states for Closing Register
  const [actualCashText, setActualCashText] = useState('');
  const [closeNotes, setCloseNotes] = useState('');

  // Shift Sales Calculations
  const shiftMetrics = useMemo(() => {
    // Filter transactions created after registerOpenedAt (or today if not set)
    const openTime = registerOpenedAt ? new Date(registerOpenedAt).getTime() : new Date().setHours(0, 0, 0, 0);
    const shiftTransactions = transactions.filter((t) => {
      const txTime = new Date(t.timestamp).getTime();
      return txTime >= openTime && t.status !== 'cancelled';
    });

    const cashSales = shiftTransactions
      .filter((t) => t.paymentMethod === 'Tunai')
      .reduce((sum, t) => sum + t.total, 0);

    const nonCashSales = shiftTransactions
      .filter((t) => t.paymentMethod !== 'Tunai')
      .reduce((sum, t) => sum + t.total, 0);

    const totalSales = cashSales + nonCashSales;
    const expectedCashInDrawer = registerStartingCash + cashSales;

    return {
      count: shiftTransactions.length,
      cashSales,
      nonCashSales,
      totalSales,
      expectedCashInDrawer,
    };
  }, [transactions, registerOpenedAt, registerStartingCash]);

  if (!isOpen) return null;

  // Handle Open Register Submit
  const handleOpenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const startingAmount = parseRupiahInput(openingBalanceText) || 0;
    if (startingAmount < 0) {
      showToast('Modal awal kasir tidak valid', 'error');
      return;
    }

    // Match cashier profile if changed
    const matchedCashier = cashiers.find((c) => c.name === selectedStaff);
    if (matchedCashier) {
      setActiveCashier(matchedCashier);
    }

    openRegister(startingAmount, selectedStaff);
    onClose();
  };

  // Handle Close Register Submit
  const handleCloseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const actualAmount = actualCashText ? parseRupiahInput(actualCashText) : shiftMetrics.expectedCashInDrawer;
    closeRegister(actualAmount, closeNotes);
    onClose();
  };

  // Calculate Cash Variance (Selisih Kas)
  const actualCashNumber = actualCashText ? parseRupiahInput(actualCashText) : null;
  const cashDifference = actualCashNumber !== null ? actualCashNumber - shiftMetrics.expectedCashInDrawer : 0;

  // Quick Nominal Chips for Opening Cash
  const quickNominals = [100000, 200000, 300000, 500000, 1000000];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-[#17152b] rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-[#e2e1f2] dark:border-[#2f2a52] shadow-2xl animate-in zoom-in-95 duration-150 my-6 relative z-10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-[#e2e1f2] dark:border-[#2f2a52] shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                isRegisterOpen
                  ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                  : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {isRegisterOpen ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-black text-[#1e1b4b] dark:text-white">
                {isRegisterOpen ? 'Tutup Sesi Kasir (Rekap Shift)' : 'Buka Sesi Kasir Baru (Shift Mulai)'}
              </h3>
              <p className="text-xs text-[#5d5e6c] dark:text-[#a7a2cd]">
                {isRegisterOpen
                  ? 'Verifikasi uang fisik kasir & selesaikan sesi kerja'
                  : 'Siapkan modal uang fisik di laci kasir (Cash Drawer)'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#5d5e6c] hover:text-[#1e1b4b] hover:bg-[#f4f2fe] dark:hover:bg-[#221f3d] cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {!isRegisterOpen ? (
          /* ========================================================================= */
          /* FORM BUKA KASIR */
          /* ========================================================================= */
          <form onSubmit={handleOpenSubmit} className="py-4 space-y-4 text-xs overflow-y-auto">
            {/* Petugas Kasir Selection */}
            <div>
              <label className="block font-bold text-[#1e1b4b] dark:text-[#f3f1ff] mb-1.5">
                Petugas Kasir yang Bertugas *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {cashiers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedStaff(c.name)}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      selectedStaff === c.name
                        ? 'border-[#684cb6] bg-purple-50/60 dark:bg-purple-950/40 ring-1 ring-[#684cb6]'
                        : 'border-[#e2e1f2] dark:border-[#2f2a52] hover:bg-[#fbf8ff] dark:hover:bg-[#1f1c3a]'
                    }`}
                  >
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#e2e1f2] dark:border-transparent shrink-0"
                    />
                    <div className="truncate">
                      <p className="font-bold text-[#1e1b4b] dark:text-white truncate">{c.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{c.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Awal Kasir Input */}
            <div>
              <label className="block font-bold text-[#1e1b4b] dark:text-[#f3f1ff] mb-1.5">
                Modal Uang Tunai Awal di Laci (Cash Drawer) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-extrabold text-[#684cb6]">
                  Rp
                </span>
                <input
                  type="text"
                  value={
                    openingBalanceText
                      ? formatNumber(parseRupiahInput(openingBalanceText))
                      : ''
                  }
                  onChange={(e) =>
                    setOpeningBalanceText(e.target.value.replace(/[^0-9]/g, ''))
                  }
                  placeholder="0"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#e2e1f2] dark:border-[#2f2a52] text-base font-extrabold focus:border-[#684cb6] outline-hidden bg-white dark:bg-[#1d1a36] text-[#1e1b4b] dark:text-white"
                  required
                />
              </div>

              {/* Quick Nominal Chips */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[11px] text-slate-500 font-semibold mr-1">Nominal Cepat:</span>
                {quickNominals.map((nom) => (
                  <button
                    key={nom}
                    type="button"
                    onClick={() => setOpeningBalanceText(nom.toString())}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                      parseRupiahInput(openingBalanceText) === nom
                        ? 'bg-[#684cb6] text-white border-[#684cb6]'
                        : 'border-[#e2e1f2] dark:border-[#2f2a52] hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {formatRupiah(nom)}
                  </button>
                ))}
              </div>
            </div>

            {/* Catatan Shift Awal */}
            <div>
              <label className="block font-bold text-[#1e1b4b] dark:text-[#f3f1ff] mb-1">
                Catatan Shift Kasir (Opsional)
              </label>
              <input
                type="text"
                value={openNotes}
                onChange={(e) => setOpenNotes(e.target.value)}
                placeholder="Contoh: Shift Pagi, uang pecahan kecil lengkap Rp 100.000"
                className="w-full px-3.5 py-2 rounded-xl border border-[#e2e1f2] dark:border-[#2f2a52] text-xs outline-hidden focus:border-[#684cb6] bg-white dark:bg-[#1d1a36]"
              />
            </div>

            {/* Shift Confirmation Note */}
            <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Siap Melayani Pelanggan</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Setelah tombol ditekan, status kasir akan berubah menjadi <strong>Terbuka (Aktif)</strong> dan Anda dapat langsung melayani transaksi checkout dan scan barcode produk.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 justify-end pt-3 border-t border-[#e2e1f2] dark:border-[#2f2a52]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[#e2e1f2] dark:border-[#2f2a52] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#221f3d] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#684cb6] hover:bg-[#5b3fa9] active:scale-[0.98] text-white font-extrabold shadow-md flex items-center gap-2 cursor-pointer transition-all"
              >
                <Unlock className="w-4 h-4 text-amber-300" />
                <span>Buka Kasir Sekarang</span>
              </button>
            </div>
          </form>
        ) : (
          /* ========================================================================= */
          /* FORM TUTUP KASIR (REKAP SHIFT) */
          /* ========================================================================= */
          <form onSubmit={handleCloseSubmit} className="py-4 space-y-4 text-xs overflow-y-auto">
            {/* Shift Summary Cards */}
            <div className="bg-[#fbf8ff] dark:bg-[#1f1c3a] p-4 rounded-2xl border border-[#e2e1f2] dark:border-[#2f2a52] space-y-3">
              <div className="flex items-center justify-between border-b border-[#e2e1f2] dark:border-[#2f2a52] pb-2">
                <span className="font-bold text-[#1e1b4b] dark:text-white flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-[#684cb6]" />
                  <span>Ringkasan Transaksi Shift Berjalan</span>
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {shiftMetrics.count} Transaksi
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                <div className="p-2.5 bg-white dark:bg-[#17152b] rounded-xl border border-slate-200 dark:border-transparent">
                  <span className="text-slate-500 block">Modal Awal Kasir:</span>
                  <span className="font-extrabold text-[#1e1b4b] dark:text-white block mt-0.5">
                    {formatRupiah(registerStartingCash)}
                  </span>
                </div>
                <div className="p-2.5 bg-white dark:bg-[#17152b] rounded-xl border border-slate-200 dark:border-transparent">
                  <span className="text-slate-500 block">Penjualan Tunai:</span>
                  <span className="font-extrabold text-emerald-600 block mt-0.5">
                    +{formatRupiah(shiftMetrics.cashSales)}
                  </span>
                </div>
                <div className="p-2.5 bg-white dark:bg-[#17152b] rounded-xl border border-slate-200 dark:border-transparent">
                  <span className="text-slate-500 block">Penjualan Non-Tunai (QRIS):</span>
                  <span className="font-extrabold text-blue-600 block mt-0.5">
                    {formatRupiah(shiftMetrics.nonCashSales)}
                  </span>
                </div>
                <div className="p-2.5 bg-purple-50 dark:bg-purple-950/50 rounded-xl border border-purple-200 dark:border-purple-800">
                  <span className="text-[#684cb6] font-semibold block">Total Uang Kas di Laci:</span>
                  <span className="font-black text-sm text-[#1e1b4b] dark:text-purple-200 block mt-0.5">
                    {formatRupiah(shiftMetrics.expectedCashInDrawer)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actual Cash Input (Uang Fisik Kasir) */}
            <div>
              <label className="block font-bold text-[#1e1b4b] dark:text-[#f3f1ff] mb-1">
                Hitung Uang Fisik Aktual di Laci Kasir
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-extrabold text-[#684cb6]">
                  Rp
                </span>
                <input
                  type="text"
                  value={
                    actualCashText
                      ? formatNumber(parseRupiahInput(actualCashText))
                      : ''
                  }
                  onChange={(e) => setActualCashText(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder={formatNumber(shiftMetrics.expectedCashInDrawer)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#e2e1f2] dark:border-[#2f2a52] text-base font-extrabold focus:border-[#684cb6] outline-hidden bg-white dark:bg-[#1d1a36] text-[#1e1b4b] dark:text-white"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Kosongkan bila uang fisik di laci pas dengan perhitungan sistem ({formatRupiah(shiftMetrics.expectedCashInDrawer)}).
              </p>
            </div>

            {/* Difference / Selisih Indicator */}
            {actualCashNumber !== null && (
              <div
                className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                  cashDifference === 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 border-emerald-200'
                    : cashDifference > 0
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 border-blue-200'
                    : 'bg-red-50 dark:bg-red-950/40 text-red-800 border-red-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {cashDifference === 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  )}
                  <span>
                    {cashDifference === 0
                      ? 'Kas Fisik Sempurna (Pas / Seimbang)'
                      : cashDifference > 0
                      ? `Selisih Lebih: +${formatRupiah(cashDifference)}`
                      : `Selisih Kurang: ${formatRupiah(cashDifference)}`}
                  </span>
                </div>
              </div>
            )}

            {/* Catatan Penutupan */}
            <div>
              <label className="block font-bold text-[#1e1b4b] dark:text-[#f3f1ff] mb-1">
                Catatan Penutupan Shift (Opsional)
              </label>
              <input
                type="text"
                value={closeNotes}
                onChange={(e) => setCloseNotes(e.target.value)}
                placeholder="Contoh: Shift sore selesai, uang disetor ke brankas toko"
                className="w-full px-3.5 py-2 rounded-xl border border-[#e2e1f2] dark:border-[#2f2a52] text-xs outline-hidden focus:border-[#684cb6] bg-white dark:bg-[#1d1a36]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 justify-end pt-3 border-t border-[#e2e1f2] dark:border-[#2f2a52]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[#e2e1f2] dark:border-[#2f2a52] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#221f3d] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#a8364b] hover:bg-[#8e2538] active:scale-[0.98] text-white font-extrabold shadow-md flex items-center gap-2 cursor-pointer transition-all"
              >
                <Lock className="w-4 h-4" />
                <span>Konfirmasi Tutup Kasir</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
