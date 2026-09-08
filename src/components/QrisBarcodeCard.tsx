import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Maximize2,
  Download,
  Copy,
  Check,
  RotateCw,
  Sparkles,
  ShieldCheck,
  Smartphone,
  CreditCard,
  Banknote,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

interface QrisBarcodeCardProps {
  amount: number;
  storeName: string;
  storeCity?: string;
  nmid?: string;
  compact?: boolean;
  onExpand?: () => void;
  onSimulateSuccess?: () => void;
}

export const QrisBarcodeCard: React.FC<QrisBarcodeCardProps> = ({
  amount,
  storeName,
  storeCity = 'JAKARTA',
  nmid = 'ID1020039201948',
  compact = false,
  onExpand,
  onSimulateSuccess,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(900); // 15 minutes in seconds
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Generate QR string (Standard QRIS compatible format)
  const qrisPayload = `00020101021226680016ID.CO.QRIS.WWW01189360000201102003920215${nmid}52045499530336054${amount.toFixed(2).length.toString().padStart(2, '0')}${amount.toFixed(2)}5802ID59${storeName.slice(0, 25).length.toString().padStart(2, '0')}${storeName.slice(0, 25)}60${storeCity.length.toString().padStart(2, '0')}${storeCity}62180714TRX${Date.now()}6304`;

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(qrisPayload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: compact ? 220 : 320,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate QRIS QR code', err);
      });

    return () => {
      isMounted = false;
    };
  }, [qrisPayload, compact, refreshKey]);

  // Countdown timer for dynamic QRIS expiry
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 900));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const handleCopyNmid = () => {
    navigator.clipboard.writeText(nmid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QRIS-${storeName.replace(/\s+/g, '_')}-${amount}.png`;
    link.click();
  };

  return (
    <div
      id="qris-barcode-card"
      className="bg-white rounded-2xl border-2 border-[#e2e1f2] shadow-sm overflow-hidden flex flex-col transition-all duration-200"
    >
      {/* Official Indonesian QRIS Header Banner */}
      <div className="bg-white px-3.5 py-2.5 border-b border-[#e2e1f2] flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* QRIS Red Badge */}
          <div className="bg-[#b91c1c] text-white px-2 py-0.5 rounded font-black text-xs tracking-wider flex items-center gap-1 shadow-2xs">
            <span>QRIS</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold text-[#30323e] tracking-tight leading-none uppercase">
              Standar Pembayaran Nasional
            </span>
            <span className="text-[9px] text-[#797988] leading-tight">
              Bank Indonesia & GPN
            </span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          {onExpand && (
            <button
              type="button"
              onClick={onExpand}
              title="Perbesar Barcode QRIS (Layar Penuh / Tampilan Pelanggan)"
              className="p-1.5 rounded-lg text-[#5d5e6c] hover:text-[#684cb6] hover:bg-[#f4f2fe] transition-colors cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setCountdown(900);
              setRefreshKey((k) => k + 1);
            }}
            title="Perbarui Barcode QRIS"
            className="p-1.5 rounded-lg text-[#5d5e6c] hover:text-[#684cb6] hover:bg-[#f4f2fe] transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Merchant Title & NMID */}
      <div className="px-3.5 pt-2 pb-1 text-center bg-[#fdfcff] border-b border-[#f4f2fe]">
        <h4 className="font-extrabold text-sm text-[#1e1b4b] uppercase tracking-wide">
          {storeName}
        </h4>
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#5d5e6c] mt-0.5">
          <span>NMID:</span>
          <span className="font-mono font-semibold text-[#30323e]">{nmid}</span>
          <button
            type="button"
            onClick={handleCopyNmid}
            className="text-[#684cb6] hover:underline cursor-pointer p-0.5"
            title="Salin NMID"
          >
            {copied ? <Check className="w-3 h-3 text-[#006d4b]" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* QR Code Canvas Area */}
      <div className="p-3 bg-white flex flex-col items-center justify-center relative select-none">
        {qrDataUrl ? (
          <div className="relative p-2 bg-white rounded-xl border border-[#e2e1f2] shadow-2xs group cursor-pointer" onClick={onExpand}>
            <img
              src={qrDataUrl}
              alt="Barcode QRIS Toko Indah"
              className={`object-contain transition-transform duration-200 group-hover:scale-[1.02] ${
                compact ? 'w-44 h-44 sm:w-48 sm:h-48' : 'w-56 h-56 sm:w-64 sm:h-64'
              }`}
            />
            {/* Center QRIS logo indicator overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-[#b91c1c] shadow-xs flex items-center justify-center">
                <span className="text-[8px] font-black text-[#b91c1c]">QRIS</span>
              </div>
            </div>

            {/* Click to expand hover overlay hint */}
            {onExpand && (
              <div className="absolute inset-0 bg-[#684cb6]/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center backdrop-blur-[0.5px]">
                <span className="bg-white/95 text-[#684cb6] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5">
                  <Maximize2 className="w-3 h-3" />
                  Klik untuk Perbesar
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="w-48 h-48 bg-[#f4f2fe] rounded-xl flex flex-col items-center justify-center text-[#797988] gap-2">
            <RotateCw className="w-6 h-6 animate-spin text-[#684cb6]" />
            <span className="text-xs">Membuat Barcode QRIS...</span>
          </div>
        )}

        {/* Dynamic Amount Badge */}
        <div className="mt-2.5 text-center">
          <span className="text-[10px] font-semibold text-[#5d5e6c] uppercase tracking-wider block">
            Nominal Tagihan
          </span>
          <span className="text-xl sm:text-2xl font-black text-[#b91c1c] tracking-tight">
            {formatRupiah(amount)}
          </span>
        </div>

        {/* Expiry countdown badge */}
        <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#fee2e2] text-[#991b1b] text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#b91c1c] animate-pulse" />
          <span>Berlaku {timeFormatted}</span>
        </div>
      </div>

      {/* Supported E-Wallets & Mobile Banking Footer */}
      <div className="bg-[#f8f7fd] border-t border-[#e2e1f2] px-3 py-2 text-center">
        <p className="text-[10px] font-semibold text-[#5d5e6c] mb-1">
          Bisa di-scan menggunakan seluruh aplikasi:
        </p>
        <div className="flex flex-wrap items-center justify-center gap-1 text-[9px] font-bold text-[#475569]">
          <span className="px-1.5 py-0.5 bg-white border border-[#e2e1f2] rounded">BCA</span>
          <span className="px-1.5 py-0.5 bg-white border border-[#e2e1f2] rounded">Mandiri</span>
          <span className="px-1.5 py-0.5 bg-white border border-[#e2e1f2] rounded">BRI</span>
          <span className="px-1.5 py-0.5 bg-white border border-[#e2e1f2] rounded">BNI</span>
          <span className="px-1.5 py-0.5 bg-white border border-[#e2e1f2] rounded text-[#059669]">GoPay</span>
          <span className="px-1.5 py-0.5 bg-white border border-[#e2e1f2] rounded text-[#7c3aed]">OVO</span>
          <span className="px-1.5 py-0.5 bg-white border border-[#e2e1f2] rounded text-[#0284c7]">DANA</span>
          <span className="px-1.5 py-0.5 bg-white border border-[#e2e1f2] rounded text-[#ea580c]">ShopeePay</span>
        </div>
      </div>

      {/* Quick Action Footer Buttons */}
      <div className="p-2.5 bg-white border-t border-[#e2e1f2] flex gap-2">
        <button
          type="button"
          onClick={handleDownload}
          title="Unduh Gambar Barcode QRIS"
          className="flex-1 py-1.5 px-2 bg-white hover:bg-[#f4f2fe] border border-[#e2e1f2] rounded-xl text-[11px] font-bold text-[#5d5e6c] hover:text-[#684cb6] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Simpan QR</span>
        </button>

        {onExpand && (
          <button
            type="button"
            onClick={onExpand}
            className="flex-1 py-1.5 px-2 bg-[#f4f2fe] hover:bg-[#eeecfa] text-[#684cb6] rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Perbesar Layar</span>
          </button>
        )}
      </div>

      {/* Simulated Customer Payment Success Button (Cashier testing aid) */}
      {onSimulateSuccess && (
        <div className="px-2.5 pb-2.5 bg-white">
          <button
            type="button"
            id="btn-simulate-qris-paid"
            onClick={onSimulateSuccess}
            className="w-full py-2 px-3 bg-[#006d4b]/10 hover:bg-[#006d4b]/20 text-[#006d4b] border border-[#006d4b]/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs group"
          >
            <ShieldCheck className="w-4 h-4 text-[#006d4b] group-hover:scale-110 transition-transform" />
            <span>Simulasi Pelanggan Selesai Scan & Bayar</span>
          </button>
        </div>
      )}
    </div>
  );
};
