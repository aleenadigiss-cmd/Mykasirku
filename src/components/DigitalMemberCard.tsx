import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { Crown, Sparkles, Wifi, ShieldCheck, QrCode as QrIcon, Barcode as BarcodeIcon, Copy, Check, Eye } from 'lucide-react';
import { Member, MemberTier } from '../types';
import { formatNumber, formatRupiah } from '../utils/formatters';

interface DigitalMemberCardProps {
  member: Member;
  interactive?: boolean;
  onShowFullBarcode?: () => void;
  size?: 'normal' | 'large' | 'compact';
}

export const DigitalMemberCard: React.FC<DigitalMemberCardProps> = ({
  member,
  interactive = true,
  onShowFullBarcode,
  size = 'normal',
}) => {
  const [activeBarcodeView, setActiveBarcodeView] = useState<'barcode' | 'qr'>('barcode');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const barcodeSvgRef = useRef<SVGSVGElement>(null);

  // Render Barcode via JsBarcode
  useEffect(() => {
    if (barcodeSvgRef.current && member.barcode) {
      try {
        JsBarcode(barcodeSvgRef.current, member.barcode, {
          format: 'CODE128',
          lineColor: '#1e1b4b',
          width: size === 'compact' ? 1.3 : 1.7,
          height: size === 'compact' ? 36 : 46,
          displayValue: true,
          fontSize: size === 'compact' ? 11 : 13,
          fontOptions: 'bold',
          font: 'monospace',
          margin: 4,
          background: '#ffffff',
        });
      } catch (err) {
        console.warn('JsBarcode render error:', err);
      }
    }
  }, [member.barcode, member.tier, activeBarcodeView, size]);

  // Generate QR Code via QRCode
  useEffect(() => {
    const payload = member.qrCode || `KASIRKU-MBR-${member.id}-${member.phone}`;
    QRCode.toDataURL(payload, {
      width: 200,
      margin: 1,
      color: {
        dark: '#1e1b4b',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.warn('QRCode generate error:', err));
  }, [member.id, member.phone, member.qrCode]);

  const copyCardNumber = () => {
    navigator.clipboard.writeText(member.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Styling based on Tier
  const tierConfig: Record<
    MemberTier,
    {
      bgGradient: string;
      cardBorder: string;
      tierBadgeBg: string;
      textColor: string;
      subColor: string;
      chipColor: string;
      shimmer: string;
      label: string;
      crownColor: string;
    }
  > = {
    Silver: {
      bgGradient: 'bg-linear-to-br from-[#475569] via-[#64748b] to-[#334155]',
      cardBorder: 'border-slate-300/40 shadow-slate-900/20',
      tierBadgeBg: 'bg-slate-200 text-slate-800 border-slate-300',
      textColor: 'text-white',
      subColor: 'text-slate-200',
      chipColor: 'from-amber-200 to-amber-400',
      shimmer: 'from-white/10 via-white/20 to-transparent',
      label: 'SILVER CLUB',
      crownColor: 'text-slate-300',
    },
    Gold: {
      bgGradient: 'bg-linear-to-br from-[#854d0e] via-[#ca8a04] to-[#713f12]',
      cardBorder: 'border-amber-300/50 shadow-amber-900/30',
      tierBadgeBg: 'bg-linear-to-r from-amber-300 to-yellow-200 text-amber-950 border-amber-200',
      textColor: 'text-white',
      subColor: 'text-amber-100',
      chipColor: 'from-yellow-100 to-amber-300',
      shimmer: 'from-amber-200/20 via-yellow-100/30 to-transparent',
      label: 'GOLD PRIVILEGE',
      crownColor: 'text-amber-300',
    },
    Platinum: {
      bgGradient: 'bg-linear-to-br from-[#3b0764] via-[#581c87] to-[#1e1b4b]',
      cardBorder: 'border-purple-300/40 shadow-purple-950/40',
      tierBadgeBg: 'bg-linear-to-r from-purple-200 to-indigo-200 text-purple-950 border-purple-300',
      textColor: 'text-white',
      subColor: 'text-purple-200',
      chipColor: 'from-indigo-100 to-purple-300',
      shimmer: 'from-purple-200/20 via-indigo-100/20 to-transparent',
      label: 'PLATINUM ELITE',
      crownColor: 'text-purple-300',
    },
    Diamond: {
      bgGradient: 'bg-linear-to-br from-[#064e3b] via-[#0f172a] to-[#042f2e]',
      cardBorder: 'border-emerald-300/50 shadow-emerald-950/50',
      tierBadgeBg: 'bg-linear-to-r from-emerald-300 to-teal-200 text-emerald-950 border-emerald-300',
      textColor: 'text-white',
      subColor: 'text-emerald-200',
      chipColor: 'from-teal-100 to-emerald-300',
      shimmer: 'from-emerald-300/25 via-cyan-200/20 to-transparent',
      label: 'VIP DIAMOND ROYAL',
      crownColor: 'text-emerald-300',
    },
  };

  const config = tierConfig[member.tier] || tierConfig.Silver;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-3xl border ${config.cardBorder} ${config.bgGradient} shadow-2xl transition-all duration-300 ${
        interactive ? 'hover:scale-[1.01] hover:shadow-3xl' : ''
      } ${size === 'large' ? 'p-6 sm:p-8' : size === 'compact' ? 'p-4' : 'p-5 sm:p-6'}`}
      style={{
        aspectRatio: size === 'compact' ? 'auto' : '1.586 / 1',
        minHeight: size === 'compact' ? 'auto' : '260px',
      }}
    >
      {/* Background Decorative Metallic Patterns */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-linear-to-b from-white/30 to-transparent blur-2xl" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-linear-to-t from-white/20 to-transparent blur-2xl" />
        <svg
          className="absolute inset-0 w-full h-full opacity-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="card-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 0 10 L 10 0 L 20 10 L 10 20 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#card-pattern)" />
        </svg>
      </div>

      {/* Card Content Layout */}
      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* Top Card Row: Brand + Chip + Tier Badge */}
        <div className="flex items-start justify-between gap-2">
          {/* Brand Identity */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-inner">
              <Crown className={`w-5 h-5 ${config.crownColor} fill-current`} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-black tracking-wider text-white font-sans">
                  KASIRKU
                </span>
                <span className="text-[10px] tracking-widest uppercase font-bold text-white/70 bg-white/10 px-1.5 py-0.5 rounded">
                  VIP CLUB
                </span>
              </div>
              <p className={`text-[10px] font-semibold tracking-wider uppercase ${config.subColor}`}>
                Loyalty & Rewards
              </p>
            </div>
          </div>

          {/* Tier Badge & Contactless Icon */}
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-white/60 rotate-90 hidden sm:block" />
            <span
              className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider border shadow-sm ${config.tierBadgeBg}`}
            >
              {config.label}
            </span>
          </div>
        </div>

        {/* Middle Row: Smart Chip & Points Balance */}
        <div className="my-3 sm:my-4 flex items-center justify-between">
          {/* Smart Chip Graphic */}
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-8 rounded-lg bg-linear-to-br ${config.chipColor} border border-white/40 shadow-sm relative overflow-hidden flex items-center justify-center`}
            >
              <div className="w-full h-[1px] bg-amber-900/40 absolute top-2.5" />
              <div className="w-full h-[1px] bg-amber-900/40 absolute bottom-2.5" />
              <div className="h-full w-[1px] bg-amber-900/40 absolute left-3.5" />
              <div className="h-full w-[1px] bg-amber-900/40 absolute right-3.5" />
              <div className="w-2.5 h-2.5 rounded-full border border-amber-900/40" />
            </div>
            <div className="flex flex-col">
              <span className={`text-[10px] uppercase font-bold tracking-widest ${config.subColor}`}>
                Saldo Poin
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {formatNumber(member.points)}
                </span>
                <span className="text-xs font-bold text-amber-300">Poin</span>
              </div>
            </div>
          </div>

          {/* Quick Toggle for Barcode vs QR */}
          {interactive && (
            <div className="flex items-center bg-black/25 backdrop-blur-md p-1 rounded-xl border border-white/20">
              <button
                type="button"
                onClick={() => setActiveBarcodeView('barcode')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  activeBarcodeView === 'barcode'
                    ? 'bg-white text-[#1e1b4b] shadow-sm font-bold'
                    : 'text-white/70 hover:text-white'
                }`}
                title="Tampilkan Barcode Garis"
              >
                <BarcodeIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setActiveBarcodeView('qr')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  activeBarcodeView === 'qr'
                    ? 'bg-white text-[#1e1b4b] shadow-sm font-bold'
                    : 'text-white/70 hover:text-white'
                }`}
                title="Tampilkan QR Code"
              >
                <QrIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Integrated Live Barcode / QR Code Plate */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 shadow-lg border border-white/80 my-2 flex items-center justify-between gap-3">
          {activeBarcodeView === 'barcode' ? (
            <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
              <svg ref={barcodeSvgRef} className="max-w-full h-auto" />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center gap-3 py-0.5">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="Member QR Code"
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-lg border border-slate-200"
                />
              )}
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  Scan QR di Meja Kasir
                </span>
                <span className="text-xs sm:text-sm font-mono font-bold text-[#1e1b4b]">
                  {member.id}
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Terverifikasi Otomatis
                </span>
              </div>
            </div>
          )}

          {/* Action buttons on the card */}
          {interactive && (
            <div className="flex flex-col gap-1.5 shrink-0 border-l border-slate-200 pl-2">
              {onShowFullBarcode && (
                <button
                  type="button"
                  onClick={onShowFullBarcode}
                  title="Perbesar Barcode Layar Penuh untuk Kasir"
                  className="p-1.5 text-slate-600 hover:text-[#684cb6] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Perbesar</span>
                </button>
              )}
              <button
                type="button"
                onClick={copyCardNumber}
                title="Salin Nomor ID Member"
                className="p-1.5 text-slate-600 hover:text-[#684cb6] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Tersalin' : 'Salin ID'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom Card Row: Member Name, ID, & Join Date */}
        <div className="flex items-end justify-between pt-1">
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${config.subColor}`}>
              Nama Anggota
            </span>
            <h4 className="text-base sm:text-lg font-black text-white tracking-wide truncate max-w-[200px] sm:max-w-[260px]">
              {member.name}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-mono font-bold text-white/90">
                {member.phone}
              </span>
              <span className="text-[10px] text-white/60">•</span>
              <span className="text-[10px] text-white/80 font-mono">
                ID: {member.id}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${config.subColor}`}>
              Terdaftar Sejak
            </span>
            <p className="text-xs sm:text-sm font-bold text-white font-mono">
              {member.joinDate || 'Jan 2024'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
