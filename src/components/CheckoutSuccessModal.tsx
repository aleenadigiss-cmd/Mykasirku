import React from 'react';
import {
  CheckCircle2,
  Printer,
  Receipt,
  Download,
  Share2,
  ArrowRight,
  X,
} from 'lucide-react';
import { usePos } from '../context/PosContext';
import { formatRupiah } from '../utils/formatters';

export const CheckoutSuccessModal: React.FC = () => {
  const { lastCompletedTransaction, setLastCompletedTransaction, settings } = usePos();

  if (!lastCompletedTransaction) return null;

  const tx = lastCompletedTransaction;

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    setLastCompletedTransaction(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full border border-[#e2e1f2] shadow-2xl overflow-hidden flex flex-col my-8 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#684cb6] text-white p-6 text-center relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 backdrop-blur-xs">
            <CheckCircle2 className="w-8 h-8 text-[#6bffc1]" />
          </div>
          <h3 className="text-xl font-extrabold tracking-tight">Pembayaran Berhasil!</h3>
          <p className="text-xs text-white/80 mt-1">Transaksi telah disimpan ke riwayat penjualan.</p>
        </div>

        {/* Thermal Receipt Paper View */}
        <div className="p-6 bg-[#fbf8ff] flex-1 overflow-y-auto max-h-[50vh]">
          <div className="bg-white p-5 rounded-2xl border border-[#e2e1f2] shadow-sm font-mono text-xs space-y-3">
            <div className="text-center">
              <h4 className="font-extrabold text-sm text-[#30323e]">{settings.storeName}</h4>
              <p className="text-[#5d5e6c] text-[11px]">{settings.storeAddress}</p>
              <p className="text-[#797988] text-[10px]">{settings.storePhone}</p>
            </div>

            <div className="border-t border-b border-dashed border-[#b1b1c0] py-2 flex justify-between text-[11px] text-[#5d5e6c]">
              <div>
                <p className="font-bold text-[#30323e]">{tx.id}</p>
                <p>{tx.timestamp}</p>
              </div>
              <div className="text-right">
                <p>Kasir: {tx.cashier}</p>
                <p className="font-bold text-[#684cb6]">{tx.paymentMethod}</p>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-1.5 border-b border-dashed border-[#b1b1c0] pb-2">
              {tx.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-[11px]">
                  <div className="flex-1 pr-2">
                    <p className="font-bold text-[#30323e] leading-snug">{item.name}</p>
                    <p className="text-[#797988] text-[10px]">
                      {item.quantity} x {formatRupiah(item.price)}
                    </p>
                  </div>
                  <p className="font-bold text-[#30323e]">
                    {formatRupiah(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* Subtotals & Taxes */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[#5d5e6c]">
                <span>Subtotal</span>
                <span>{formatRupiah(tx.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#5d5e6c]">
                <span>Pajak (11%)</span>
                <span>{formatRupiah(tx.tax)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-[#30323e] text-sm pt-1 border-t border-[#eeecfa]">
                <span>Total Belanja</span>
                <span className="text-[#684cb6]">{formatRupiah(tx.total)}</span>
              </div>
            </div>

            {/* Payment & Change */}
            <div className="pt-2 border-t border-dashed border-[#b1b1c0] space-y-1 text-[11px]">
              <div className="flex justify-between items-center text-[#5d5e6c]">
                <span>Metode Pembayaran</span>
                <span className="font-bold flex items-center gap-1.5 text-[#30323e]">
                  {tx.paymentMethod === 'QRIS' && (
                    <span className="bg-[#b91c1c] text-white text-[9px] px-1 py-0.2 rounded font-black">
                      QRIS
                    </span>
                  )}
                  <span>{tx.paymentMethod}</span>
                </span>
              </div>

              {tx.paymentMethod === 'QRIS' && (
                <div className="py-1 my-1 px-2 bg-[#fdf2f2] border border-[#fecaca] rounded-lg text-[10px] space-y-0.5">
                  <div className="flex justify-between text-[#991b1b] font-bold">
                    <span>NMID</span>
                    <span>ID1020039201948</span>
                  </div>
                  <div className="flex justify-between text-[#797988]">
                    <span>RRN / Reff</span>
                    <span className="font-mono">RRN-2026-{tx.id.replace(/[^0-9]/g, '').slice(-6) || '928401'}</span>
                  </div>
                  <div className="flex justify-between text-[#006d4b] font-bold">
                    <span>Status Transaksi</span>
                    <span>LUNAS (Auto Verified)</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between text-[#5d5e6c]">
                <span>Jumlah Bayar</span>
                <span className="font-semibold text-[#30323e]">{formatRupiah(tx.amountPaid)}</span>
              </div>
              <div className="flex justify-between font-bold text-[#006d4b]">
                <span>Kembalian</span>
                <span>{formatRupiah(tx.change)}</span>
              </div>
            </div>

            {/* Member VIP Points Info on Receipt */}
            {tx.memberName && (
              <div className="py-2 px-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] space-y-1">
                <div className="flex justify-between items-center text-amber-950 font-bold">
                  <span>Member VIP:</span>
                  <span>{tx.memberName} ({tx.memberTier})</span>
                </div>
                <div className="flex justify-between items-center text-emerald-700 font-bold">
                  <span>Poin Didapat:</span>
                  <span>+{tx.pointsEarned || 0} Pts</span>
                </div>
              </div>
            )}

            <div className="text-center pt-2 text-[#797988] text-[10px] italic">
              {settings.receiptFooter}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-5 bg-white border-t border-[#e2e1f2] flex flex-col gap-2.5">
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 py-3 border border-[#e2e1f2] hover:bg-[#f4f2fe] rounded-xl text-xs font-bold text-[#30323e] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#684cb6]" />
              <span>Cetak Struk</span>
            </button>
            <button
              onClick={handleClose}
              className="flex-1 py-3 bg-[#684cb6] hover:bg-[#5b3fa9] active:scale-[0.99] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <span>Transaksi Baru</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
