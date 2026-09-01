import React, { useState } from 'react';
import {
  Store,
  Receipt,
  Percent,
  Users,
  ShieldCheck,
  Save,
  CheckCircle2,
  RotateCcw,
  Plus,
  Trash2,
} from 'lucide-react';
import { usePos } from '../context/PosContext';
import { CashierProfile } from '../types';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, cashiers, activeCashier, setActiveCashier, resetDemoData } =
    usePos();

  const [formData, setFormData] = useState({
    storeName: settings.storeName,
    storeAddress: settings.storeAddress,
    storePhone: settings.storePhone,
    taxRate: settings.taxRate * 100, // percentage e.g. 11%
    receiptFooter: settings.receiptFooter,
    receiptHeader: settings.receiptHeader || 'KASIRKU MART',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName: formData.storeName,
      storeAddress: formData.storeAddress,
      storePhone: formData.storePhone,
      taxRate: Number(formData.taxRate) / 100,
      receiptFooter: formData.receiptFooter,
      receiptHeader: formData.receiptHeader,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200 pb-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#30323e] tracking-tight">
            Pengaturan Aplikasi
          </h2>
          <p className="text-xs md:text-sm text-[#5d5e6c] mt-1">
            Konfigurasi profil toko, tarif pajak, format struk, dan data petugas kasir.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#6bffc1]/20 text-[#006d4b] border border-[#6bffc1] rounded-xl text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Pengaturan Berhasil Disimpan!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Profil Toko */}
        <div className="bg-white p-6 rounded-2xl border border-[#e2e1f2] shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#30323e] flex items-center gap-2 pb-3 border-b border-[#e2e1f2]">
            <Store className="w-5 h-5 text-[#684cb6]" />
            <span>Profil & Identitas Toko</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#5d5e6c] mb-1.5">
                Nama Toko / Usaha
              </label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#e2e1f2] text-sm focus:border-[#684cb6] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5d5e6c] mb-1.5">
                Nomor Telepon Toko
              </label>
              <input
                type="text"
                value={formData.storePhone}
                onChange={(e) => setFormData({ ...formData, storePhone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#e2e1f2] text-sm focus:border-[#684cb6] outline-none"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#5d5e6c] mb-1.5">
                Alamat Toko (Dicetak di Struk)
              </label>
              <input
                type="text"
                value={formData.storeAddress}
                onChange={(e) => setFormData({ ...formData, storeAddress: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#e2e1f2] text-sm focus:border-[#684cb6] outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: Pajak & Struk */}
        <div className="bg-white p-6 rounded-2xl border border-[#e2e1f2] shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#30323e] flex items-center gap-2 pb-3 border-b border-[#e2e1f2]">
            <Percent className="w-5 h-5 text-[#684cb6]" />
            <span>Pajak & Format Struk</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#5d5e6c] mb-1.5">
                Tarif PPN / Pajak (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={formData.taxRate}
                  onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e2e1f2] text-sm focus:border-[#684cb6] outline-none font-bold"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#797988] font-bold">
                  %
                </span>
              </div>
              <p className="text-[11px] text-[#797988] mt-1">
                Atur 0% jika toko tidak memungut pajak pertambahan nilai.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5d5e6c] mb-1.5">
                Catatan Kaki Struk (Footer)
              </label>
              <input
                type="text"
                value={formData.receiptFooter}
                onChange={(e) => setFormData({ ...formData, receiptFooter: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#e2e1f2] text-sm focus:border-[#684cb6] outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: Daftar Petugas Kasir */}
        <div className="bg-white p-6 rounded-2xl border border-[#e2e1f2] shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#30323e] flex items-center gap-2 pb-3 border-b border-[#e2e1f2]">
            <Users className="w-5 h-5 text-[#684cb6]" />
            <span>Petugas Kasir & Pengguna Aktif</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cashiers.map((c) => (
              <div
                key={c.id}
                onClick={() => setActiveCashier(c)}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  activeCashier.id === c.id
                    ? 'border-[#684cb6] bg-[#a589f8]/10 ring-1 ring-[#684cb6]'
                    : 'border-[#e2e1f2] hover:bg-[#f4f2fe]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#e2e1f2]"
                  />
                  <div>
                    <p className="text-sm font-bold text-[#30323e]">{c.name}</p>
                    <p className="text-xs text-[#5d5e6c]">{c.role}</p>
                  </div>
                </div>

                {activeCashier.id === c.id ? (
                  <span className="text-xs font-bold text-[#684cb6] bg-white px-2.5 py-1 rounded-full border border-[#684cb6]/30">
                    Aktif
                  </span>
                ) : (
                  <span className="text-xs text-[#797988]">Klik untuk pilih</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[#684cb6] hover:bg-[#5b3fa9] active:scale-[0.99] text-white text-sm font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Pengaturan</span>
          </button>
        </div>
      </form>
    </div>
  );
};
