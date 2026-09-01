import React, { useState } from 'react';
import { Banknote, X, CheckCircle2, Lock, Unlock } from 'lucide-react';
import { usePos } from '../context/PosContext';
import { formatRupiah, formatNumber, parseRupiahInput } from '../utils/formatters';

interface OpenRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OpenRegisterModal: React.FC<OpenRegisterModalProps> = ({ isOpen, onClose }) => {
  const { isRegisterOpen, toggleRegister, activeCashier } = usePos();
  const [openingBalanceText, setOpeningBalanceText] = useState('200000');

  if (!isOpen) return null;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    toggleRegister();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#e2e1f2] shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center pb-4 border-b border-[#e2e1f2]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#a589f8]/20 text-[#684cb6] flex items-center justify-center">
              {isRegisterOpen ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#30323e]">
                {isRegisterOpen ? 'Tutup Sesi Kasir' : 'Buka Sesi Kasir'}
              </h3>
              <p className="text-xs text-[#5d5e6c]">Petugas: {activeCashier.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#5d5e6c] hover:bg-[#f4f2fe]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="py-5 space-y-4 text-sm">
          {!isRegisterOpen ? (
            <div>
              <label className="block text-xs font-semibold text-[#5d5e6c] mb-1.5">
                Modal Awal Kasir (Cash Drawer)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#5d5e6c]">
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e2e1f2] text-base font-bold focus:border-[#684cb6] outline-none"
                  required
                />
              </div>
              <p className="text-[11px] text-[#797988] mt-1">
                Masukkan saldo kas fisik awal untuk uang kembalian.
              </p>
            </div>
          ) : (
            <div className="bg-[#f4f2fe] p-4 rounded-xl text-xs space-y-2 text-[#5d5e6c]">
              <p className="font-semibold text-[#30323e]">
                Apakah Anda yakin ingin menutup sesi kasir saat ini?
              </p>
              <p>
                Sistem akan mengunci transaksi baru sampai sesi kasir berikutnya dibuka kembali.
              </p>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#e2e1f2] text-xs font-semibold text-[#5d5e6c] hover:bg-[#f4f2fe]"
            >
              Batal
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-xs transition-colors ${
                isRegisterOpen
                  ? 'bg-[#a8364b] hover:bg-[#8e2538]'
                  : 'bg-[#684cb6] hover:bg-[#5b3fa9]'
              }`}
            >
              {isRegisterOpen ? 'Konfirmasi Tutup Kasir' : 'Buka Kasir Sekarang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
