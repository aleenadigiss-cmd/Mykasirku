import React, { useState } from 'react';
import {
  Printer,
  Bluetooth,
  X,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Usb,
  Battery,
  Sliders,
  Sparkles,
  Zap,
  HelpCircle,
  Radio,
  FileText,
  Volume2,
  Power,
  RotateCcw,
} from 'lucide-react';
import { usePos } from '../context/PosContext';
import { PrinterPaperWidth } from '../types';

export const PrinterDetectionModal: React.FC = () => {
  const {
    showPrinterModal,
    setShowPrinterModal,
    printerStatus,
    printerDevice,
    isBluetoothSupported,
    isScanningPrinters,
    autoDetectPrinter,
    connectBluetoothPrinter,
    connectVirtualPrinter,
    disconnectPrinter,
    setPrinterPaperWidth,
    setAutoPrintOnCheckout,
    printTestReceipt,
    showToast,
  } = usePos();

  const [customNameInput, setCustomNameInput] = useState('');
  const [isPrintingTest, setIsPrintingTest] = useState(false);

  if (!showPrinterModal) return null;

  const handleTestPrint = async () => {
    setIsPrintingTest(true);
    await printTestReceipt();
    setTimeout(() => setIsPrintingTest(false), 800);
  };

  const commonPrinters = [
    { name: 'POS-58 Mini Thermal Bluetooth', width: '58mm' as PrinterPaperWidth, brand: 'POS-58 / Zjiang' },
    { name: 'RPP02N Mini Mobile Printer', width: '58mm' as PrinterPaperWidth, brand: 'Rongta / RPP' },
    { name: 'Panda PRJ-58D Bluetooth', width: '58mm' as PrinterPaperWidth, brand: 'Panda POS' },
    { name: 'EPPOS EP-5802AI Bluetooth', width: '58mm' as PrinterPaperWidth, brand: 'EPPOS' },
    { name: 'Sunmi V2 / Built-in Thermal', width: '58mm' as PrinterPaperWidth, brand: 'Sunmi POS' },
    { name: 'Epson TM-T82 Thermal POS (80mm)', width: '80mm' as PrinterPaperWidth, brand: 'Epson POS' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowPrinterModal(false);
      }}
    >
      <div className="bg-white dark:bg-[#17152b] rounded-3xl max-w-xl w-full p-6 sm:p-7 border border-[#e2e1f2] dark:border-[#2f2a52] shadow-2xl animate-in zoom-in-95 duration-150 my-6 relative z-10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-[#e2e1f2] dark:border-[#2f2a52] shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                printerStatus === 'connected'
                  ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                  : printerStatus === 'connecting' || isScanningPrinters
                  ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
                  : 'bg-purple-100 dark:bg-purple-950/50 text-[#684cb6] dark:text-purple-300'
              }`}
            >
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-[#1e1b4b] dark:text-white">
                  Sistem Printer Mini & Bluetooth
                </h3>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase ${
                    printerStatus === 'connected'
                      ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                      : printerStatus === 'connecting' || isScanningPrinters
                      ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      printerStatus === 'connected'
                        ? 'bg-emerald-500 animate-pulse'
                        : printerStatus === 'connecting' || isScanningPrinters
                        ? 'bg-amber-500 animate-spin'
                        : 'bg-slate-400'
                    }`}
                  />
                  {printerStatus === 'connected'
                    ? 'Tersambung'
                    : printerStatus === 'connecting' || isScanningPrinters
                    ? 'Menghubungkan...'
                    : 'Terputus'}
                </span>
              </div>
              <p className="text-xs text-[#5d5e6c] dark:text-[#a7a2cd]">
                Deteksi otomatis printer kasir 58mm / 80mm via Bluetooth, USB & Serial
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPrinterModal(false)}
            className="p-2 rounded-xl text-[#5d5e6c] hover:text-[#1e1b4b] hover:bg-[#f4f2fe] dark:hover:bg-[#221f3d] cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-4 space-y-4 text-xs overflow-y-auto">
          {/* Hardware Detection Bar */}
          <div className="p-3.5 rounded-2xl bg-[#fbf8ff] dark:bg-[#1f1c3a] border border-[#e2e1f2] dark:border-[#2f2a52] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-[#684cb6] dark:text-purple-300">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <p className="font-extrabold text-[#1e1b4b] dark:text-white">
                  Deteksi Hardware Global: {isBluetoothSupported ? 'Web Bluetooth Aktif' : 'Mode Universal Ready'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Sistem otomatis mendeteksi printer mini saat kasir membuka aplikasi
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => autoDetectPrinter()}
              title="Pindai ulang hardware sekarang"
              className="p-2 rounded-xl border border-[#e2e1f2] dark:border-[#2f2a52] hover:bg-white dark:hover:bg-[#262244] text-[#684cb6] cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${printerStatus === 'connecting' ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Active Printer Details Card */}
          {printerDevice && printerStatus === 'connected' ? (
            <div className="p-4 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20 space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-200/60 dark:border-emerald-800/40 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                    {printerDevice.type === 'bluetooth' ? (
                      <Bluetooth className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Usb className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-[#1e1b4b] dark:text-white">
                      {printerDevice.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      ID: {printerDevice.id} • Tipe: {printerDevice.type.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {printerDevice.batteryLevel !== undefined && (
                    <span className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <Battery className="w-3.5 h-3.5" />
                      <span>{printerDevice.batteryLevel}%</span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={disconnectPrinter}
                    title="Putuskan Printer"
                    className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 dark:border-red-900/60 dark:hover:bg-red-950/40 cursor-pointer"
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Settings for Connected Printer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Paper Width Selector */}
                <div>
                  <label className="block font-bold text-[#1e1b4b] dark:text-[#f3f1ff] mb-1.5">
                    Lebar Kertas Thermal:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPrinterPaperWidth('58mm')}
                      className={`py-2 px-3 rounded-xl border text-center font-bold cursor-pointer transition-all ${
                        printerDevice.paperWidth === '58mm'
                          ? 'border-[#684cb6] bg-purple-50 dark:bg-purple-950/50 text-[#684cb6] dark:text-purple-300 ring-1 ring-[#684cb6]'
                          : 'border-[#e2e1f2] dark:border-[#2f2a52] text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <span>58mm (Mini POS)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrinterPaperWidth('80mm')}
                      className={`py-2 px-3 rounded-xl border text-center font-bold cursor-pointer transition-all ${
                        printerDevice.paperWidth === '80mm'
                          ? 'border-[#684cb6] bg-purple-50 dark:bg-purple-950/50 text-[#684cb6] dark:text-purple-300 ring-1 ring-[#684cb6]'
                          : 'border-[#e2e1f2] dark:border-[#2f2a52] text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <span>80mm (Standar POS)</span>
                    </button>
                  </div>
                </div>

                {/* Auto Print Toggle */}
                <div>
                  <label className="block font-bold text-[#1e1b4b] dark:text-[#f3f1ff] mb-1.5">
                    Otomatisasi Cetak:
                  </label>
                  <div
                    onClick={() => setAutoPrintOnCheckout(!printerDevice.isAutoPrintEnabled)}
                    className="p-2.5 rounded-xl border border-[#e2e1f2] dark:border-[#2f2a52] bg-white dark:bg-[#1a1736] flex items-center justify-between cursor-pointer select-none"
                  >
                    <div>
                      <p className="font-bold text-[#1e1b4b] dark:text-white">Auto-Print Checkout</p>
                      <p className="text-[10px] text-slate-500">Cetak otomatis saat bayar</p>
                    </div>
                    <span
                      className={`w-10 h-6 rounded-full flex items-center p-0.5 transition-colors ${
                        printerDevice.isAutoPrintEnabled ? 'bg-[#059669] justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Connected Printer */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleTestPrint}
                  disabled={isPrintingTest}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#684cb6] hover:bg-[#5b3fa9] active:scale-[0.98] text-white font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
                >
                  <FileText className="w-4 h-4 text-amber-300" />
                  <span>{isPrintingTest ? 'Mencetak Struk Tes...' : 'Cetak Struk Uji Coba (Test Print)'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => connectBluetoothPrinter()}
                  className="py-2.5 px-3 rounded-xl border border-[#e2e1f2] dark:border-[#2f2a52] hover:bg-[#f4f2fe] dark:hover:bg-[#262244] text-[#1e1b4b] dark:text-white font-bold cursor-pointer"
                  title="Ganti ke Printer Bluetooth Lain"
                >
                  Ganti Printer
                </button>
              </div>
            </div>
          ) : (
            /* Disconnected State Hero Connect */
            <div className="p-5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border-2 border-dashed border-purple-300 dark:border-purple-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/60 text-[#684cb6] dark:text-purple-300 flex items-center justify-center mx-auto">
                <Bluetooth className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#1e1b4b] dark:text-white">
                  Printer Belum Terhubung
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-0.5">
                  Nyalakan printer Bluetooth atau hubungkan kabel USB printer mini Anda, lalu klik tombol di bawah untuk menyambungkan.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => connectBluetoothPrinter()}
                  disabled={isScanningPrinters}
                  className="px-6 py-3 rounded-xl bg-[#684cb6] hover:bg-[#5b3fa9] active:scale-[0.98] text-white font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Bluetooth className="w-4 h-4 text-amber-300" />
                  <span>{isScanningPrinters ? 'Memindai Bluetooth...' : 'Pindai & Sambungkan Printer Bluetooth'}</span>
                </button>

                <button
                  type="button"
                  onClick={connectVirtualPrinter}
                  className="px-4 py-3 rounded-xl border border-[#e2e1f2] dark:border-[#2f2a52] bg-white dark:bg-[#1a1736] hover:bg-slate-50 dark:hover:bg-[#221f3d] text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Usb className="w-4 h-4 text-[#684cb6]" />
                  <span>Hubungkan Printer USB 80mm</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Connect Popular Mini Printers */}
          <div>
            <label className="block font-bold text-[#1e1b4b] dark:text-[#f3f1ff] mb-2 flex items-center justify-between">
              <span>Preset Model Printer Kasir Populer (1-Klik Cepat):</span>
              <span className="text-[10px] text-slate-500 font-normal">Kompatibel 99% Printer Thermal</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {commonPrinters.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => connectBluetoothPrinter(p.name)}
                  className="p-3 rounded-xl border border-[#e2e1f2] dark:border-[#2f2a52] hover:border-[#684cb6] hover:bg-purple-50/40 dark:hover:bg-purple-950/30 flex items-center justify-between cursor-pointer transition-all select-none"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Printer className="w-4 h-4 text-[#684cb6] shrink-0" />
                    <div className="truncate">
                      <p className="font-extrabold text-[#1e1b4b] dark:text-white truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-500">{p.brand} • {p.width}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold text-[#684cb6] px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/60 shrink-0">
                    Sambung
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Troubleshooting Guide Accordion */}
          <div className="p-3.5 bg-slate-50 dark:bg-[#1a1736] rounded-2xl border border-slate-200 dark:border-slate-800 text-[11px] space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
              <HelpCircle className="w-4 h-4 text-[#684cb6]" />
              <span>Petunjuk Koneksi Printer Bluetooth & Mini POS:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-500 dark:text-slate-400 pl-1 leading-relaxed">
              <li>Pastikan Bluetooth di smartphone / tablet / laptop Anda dalam posisi <strong>AKTIF</strong>.</li>
              <li>Nyalakan printer mini hingga lampu indikator LED power / Bluetooth berkedip atau berwarna biru/hijau.</li>
              <li>Jika meminta PIN pairing Bluetooth, gunakan <strong>0000</strong> atau <strong>1234</strong>.</li>
              <li>Kertas thermal kasir harus terpasang dengan benar (sisi licin/peka panas menghadap head pemanas).</li>
              <li>Mendukung sistem cetak ESC/POS standar internasional tanpa driver rumit.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-[#e2e1f2] dark:border-[#2f2a52] shrink-0">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>ESC/POS Standard • 58mm & 80mm Ready</span>
          </div>
          <button
            type="button"
            onClick={() => setShowPrinterModal(false)}
            className="px-5 py-2 rounded-xl bg-[#684cb6] hover:bg-[#5b3fa9] text-white font-bold text-xs cursor-pointer shadow-xs"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
