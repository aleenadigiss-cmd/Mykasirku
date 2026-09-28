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
  QrCode,
  Download,
  Database,
  RefreshCw,
  Server,
} from 'lucide-react';
import { usePos } from '../context/PosContext';
import { CashierProfile } from '../types';
import { QrisBarcodeCard } from './QrisBarcodeCard';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    cashiers,
    activeCashier,
    setActiveCashier,
    resetDemoData,
    products,
    categories,
    transactions,
    users,
    tursoStatus,
    lastSyncTime,
    syncWithTurso,
  } = usePos();

  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncWithTurso();
    setTimeout(() => setIsSyncing(false), 600);
  };

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

        {/* Section 4: Barcode QRIS Toko (Standar Pembayaran Nasional) */}
        <div className="bg-white p-6 rounded-2xl border border-[#e2e1f2] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#e2e1f2] gap-2">
            <h3 className="text-base font-bold text-[#30323e] flex items-center gap-2">
              <QrCode className="w-5 h-5 text-[#b91c1c]" />
              <span>Barcode QRIS Toko (Akrilik Meja Kasir / Cetak)</span>
            </h3>
            <span className="text-[11px] font-semibold text-[#006d4b] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full w-fit">
              Terdaftar di Bank Indonesia (GPN)
            </span>
          </div>

          <p className="text-xs text-[#5d5e6c]">
            Barcode QRIS resmi ini dapat diunduh atau dicetak untuk dipajang di atas meja kasir toko. Pelanggan dapat memindai langsung menggunakan seluruh aplikasi m-Banking dan e-Wallet (BCA, Mandiri, BRI, BNI, GoPay, OVO, DANA, ShopeePay, LinkAja).
          </p>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pt-2">
            <div className="w-full max-w-xs">
              <QrisBarcodeCard
                amount={0}
                storeName={formData.storeName || settings.storeName || 'TOKO INDAH'}
                storeCity={formData.storeAddress ? formData.storeAddress.split(',')[0] : 'JAKARTA'}
                nmid="ID1020039201948"
                compact={false}
              />
            </div>

            <div className="flex-1 space-y-3 text-xs text-[#5d5e6c]">
              <div className="bg-[#f8f7fd] p-4 rounded-xl border border-[#e2e1f2] space-y-2">
                <h4 className="font-bold text-[#30323e]">Informasi Merchant QRIS</h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[#797988] block">Nama Merchant:</span>
                    <span className="font-semibold text-[#30323e]">{formData.storeName || settings.storeName}</span>
                  </div>
                  <div>
                    <span className="text-[#797988] block">NMID:</span>
                    <span className="font-mono font-semibold text-[#30323e]">ID1020039201948</span>
                  </div>
                  <div>
                    <span className="text-[#797988] block">Layanan:</span>
                    <span className="font-semibold text-[#30323e]">QRIS MPM Dinamis & Statis</span>
                  </div>
                  <div>
                    <span className="text-[#797988] block">Akseptasi:</span>
                    <span className="font-semibold text-[#006d4b]">Semua Bank & Dompet Digital</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#fff7ed] p-3.5 rounded-xl border border-[#ffedd5] text-[#9a3412] text-[11px] leading-relaxed">
                <strong>Tips Kasir:</strong> Pada layar Transaksi Kasir (POS), ketika metode <strong>QRIS</strong> dipilih, sistem secara otomatis menghasilkan Barcode QRIS Dinamis lengkap dengan nominal total belanja pelanggan. Kasir juga dapat menekan tombol <strong>"Barcode QRIS"</strong> di bilah atas untuk menampilkan QR ukuran besar kepada pelanggan.
              </div>
            </div>
          </div>
        </div>

        {/* Database Cloud: Turso LibSQL Section */}
        <div className="bg-white p-6 rounded-2xl border border-[#e2e1f2] shadow-xs">
          <div className="flex items-center justify-between border-b border-[#e2e1f2] pb-4 mb-4">
            <div className="flex items-center gap-2 text-base font-bold text-[#30323e]">
              <div className="w-8 h-8 rounded-lg bg-[#684cb6]/10 text-[#684cb6] flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3>Database Cloud (Turso LibSQL)</h3>
                <p className="text-xs font-normal text-[#797988]">
                  Penyimpanan cloud terdistribusi dengan latensi rendah dan sinkronisasi real-time
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#f4f2fe] text-[#684cb6] hover:bg-[#e2e1f2] border border-[#e2e1f2] transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-[#fbf8ff] rounded-xl border border-[#e2e1f2]/60 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[#797988]">Status Koneksi:</span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                    tursoStatus === 'connected'
                      ? 'bg-[#006d4b]/10 text-[#006d4b]'
                      : tursoStatus === 'connecting'
                      ? 'bg-amber-500/10 text-amber-700'
                      : 'bg-[#a8364b]/10 text-[#a8364b]'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      tursoStatus === 'connected'
                        ? 'bg-[#006d4b]'
                        : tursoStatus === 'connecting'
                        ? 'bg-amber-500 animate-ping'
                        : 'bg-[#a8364b]'
                    }`}
                  />
                  {tursoStatus === 'connected' ? 'Terhubung (Cloud LibSQL)' : tursoStatus === 'connecting' ? 'Menghubungkan...' : 'Mode Offline'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#797988]">Database URL:</span>
                <span className="font-mono text-[11px] font-semibold text-[#30323e] truncate max-w-[220px]" title="libsql://mykasirdb-aleenadigiss.aws-ap-northeast-1.turso.io">
                  libsql://mykasirdb-aleenadigiss.aws...
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#797988]">Wilayah Server:</span>
                <span className="font-semibold text-[#30323e]">AWS Tokyo (ap-northeast-1)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#797988]">Terakhir Sinkron:</span>
                <span className="font-semibold text-[#30323e]">{lastSyncTime || 'Baru saja'}</span>
              </div>
            </div>

            <div className="p-3.5 bg-[#fbf8ff] rounded-xl border border-[#e2e1f2]/60 flex flex-col justify-between">
              <span className="text-[#797988] mb-2 font-medium">Statistik Data Terdistribusi:</span>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 bg-white rounded-lg border border-[#e2e1f2]">
                  <p className="text-base font-bold text-[#684cb6]">{products.length}</p>
                  <p className="text-[10px] text-[#797988]">Produk</p>
                </div>
                <div className="p-2 bg-white rounded-lg border border-[#e2e1f2]">
                  <p className="text-base font-bold text-[#684cb6]">{categories.length}</p>
                  <p className="text-[10px] text-[#797988]">Kategori</p>
                </div>
                <div className="p-2 bg-white rounded-lg border border-[#e2e1f2]">
                  <p className="text-base font-bold text-[#684cb6]">{transactions.length}</p>
                  <p className="text-[10px] text-[#797988]">Transaksi</p>
                </div>
                <div className="p-2 bg-white rounded-lg border border-[#e2e1f2]">
                  <p className="text-base font-bold text-[#684cb6]">{users.length}</p>
                  <p className="text-[10px] text-[#797988]">Pengguna</p>
                </div>
              </div>
            </div>
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
