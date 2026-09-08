import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  X,
  CheckCircle2,
  Maximize2,
  Download,
  Copy,
  Check,
  RotateCw,
  Smartphone,
  ShieldCheck,
  ExternalLink,
  Receipt,
  Store,
} from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

interface QrisModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  storeName: string;
  storeCity?: string;
  nmid?: string;
  onConfirmPayment: () => void;
}

export const QrisModal: React.FC<QrisModalProps> = ({
  isOpen,
  onClose,
  amount,
  storeName,
  storeCity = 'JAKARTA',
  nmid = 'ID1020039201948',
  onConfirmPayment,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(900);

  const qrisPayload = `00020101021226680016ID.CO.QRIS.WWW01189360000201102003920215${nmid}52045499530336054${amount.toFixed(2).length.toString().padStart(2, '0')}${amount.toFixed(2)}5802ID59${storeName.slice(0, 25).length.toString().padStart(2, '0')}${storeName.slice(0, 25)}60${storeCity.length.toString().padStart(2, '0')}${storeCity}62180714TRX${Date.now()}6304`;

  useEffect(() => {
    if (!isOpen) return;
    QRCode.toDataURL(qrisPayload, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 480,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate high-res QRIS', err));
  }, [isOpen, qrisPayload]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 900));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-[#e2e1f2] shadow-2xl overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-[#b91c1c] text-white p-4 sm:p-5 flex items-center justify-between relative">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
              <span className="text-[#b91c1c] font-black text-sm tracking-wider">QRIS</span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold tracking-tight leading-tight">
                Scan QRIS untuk Membayar
              </h3>
              <p className="text-xs text-white/90">
                Standar Pembayaran Nasional Bank Indonesia & ASPI
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup Layar QRIS"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-5 sm:p-6 bg-[#fbf8ff] flex flex-col items-center text-center overflow-y-auto max-h-[75vh]">
          {/* Merchant Profile Header */}
          <div className="w-full bg-white p-3.5 rounded-2xl border border-[#e2e1f2] shadow-2xs mb-4">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] font-semibold text-[#5d5e6c] uppercase tracking-wider block">
                  Nama Toko / Merchant
                </span>
                <span className="font-extrabold text-base text-[#1e1b4b]">
                  {storeName}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-semibold text-[#5d5e6c] uppercase tracking-wider block">
                  NMID
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-xs font-bold text-[#30323e]">{nmid}</span>
                  <button
                    onClick={handleCopyNmid}
                    className="text-[#684cb6] hover:underline cursor-pointer p-0.5"
                    title="Salin NMID"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#006d4b]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Large QR Code Container */}
          <div className="bg-white p-4 rounded-3xl border-2 border-[#e2e1f2] shadow-md flex flex-col items-center justify-center relative">
            {qrDataUrl ? (
              <div className="relative">
                <img
                  src={qrDataUrl}
                  alt="Barcode QRIS Toko Indah"
                  className="w-64 h-64 sm:w-72 sm:h-72 object-contain"
                />
                {/* Center QRIS logo badge */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-11 h-11 rounded-full bg-white border-2 border-[#b91c1c] shadow-md flex items-center justify-center">
                    <span className="text-[10px] font-black text-[#b91c1c]">QRIS</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-64 h-64 flex flex-col items-center justify-center gap-2">
                <RotateCw className="w-8 h-8 animate-spin text-[#684cb6]" />
                <span className="text-xs text-[#5d5e6c]">Membuat QRIS...</span>
              </div>
            )}

            {/* Nominal Tagihan */}
            <div className="mt-3 pt-3 border-t border-[#f4f2fe] w-full text-center">
              <span className="text-xs text-[#5d5e6c] font-semibold block">Total yang Harus Dibayar:</span>
              <span className="text-2xl sm:text-3xl font-black text-[#b91c1c]">
                {formatRupiah(amount)}
              </span>
            </div>

            {/* Countdown Badge */}
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fee2e2] text-[#991b1b] text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-[#b91c1c] animate-pulse" />
              <span>Berlaku {timeFormatted}</span>
            </div>
          </div>

          {/* Steps for customer */}
          <div className="w-full mt-4 bg-white p-3.5 rounded-2xl border border-[#e2e1f2] text-left text-xs space-y-1.5">
            <p className="font-bold text-[#30323e]">Cara Pembayaran:</p>
            <ol className="list-decimal list-inside text-[#5d5e6c] space-y-1 text-[11px]">
              <li>Buka aplikasi m-Banking atau E-Wallet favorit Anda (BCA, Mandiri, BRI, GoPay, OVO, DANA, dll).</li>
              <li>Pilih menu <strong>Scan / Bayar QRIS</strong>.</li>
              <li>Arahkan kamera ke barcode di atas, lalu konfirmasi pembayaran nominal <strong>{formatRupiah(amount)}</strong>.</li>
            </ol>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#e2e1f2] flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={handleDownload}
            className="py-3 px-4 border border-[#e2e1f2] hover:bg-[#f4f2fe] text-[#5d5e6c] hover:text-[#684cb6] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh QR</span>
          </button>

          <button
            type="button"
            id="btn-modal-confirm-qris"
            onClick={() => {
              onConfirmPayment();
              onClose();
            }}
            className="flex-1 py-3 px-4 bg-[#059669] hover:bg-[#047857] active:scale-[0.99] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Konfirmasi Pembayaran Diterima</span>
          </button>
        </div>
      </div>
    </div>
  );
};
