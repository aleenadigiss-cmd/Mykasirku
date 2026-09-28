import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  UserPlus,
  Crown,
  Check,
  Phone,
  Barcode,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { usePos } from '../context/PosContext';
import { Member, MemberTier } from '../types';
import { formatNumber, formatRupiah } from '../utils/formatters';

interface MemberSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMember: (member: Member) => void;
}

export const MemberSelectModal: React.FC<MemberSelectModalProps> = ({
  isOpen,
  onClose,
  onSelectMember,
}) => {
  const { members, activePosMember, addMember } = usePos();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'search' | 'create'>('search');

  // Form states for new member
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newBirthDate, setNewBirthDate] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Filter members
  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    const cleanNum = q.replace(/[^0-9]/g, '');
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (cleanNum && m.phone.replace(/[^0-9]/g, '').includes(cleanNum)) ||
        m.id.toLowerCase().includes(q) ||
        m.barcode.includes(q)
    );
  }, [members, search]);

  const handleCreateNewMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setErrorMsg('Nama lengkap member wajib diisi.');
      return;
    }
    if (!newPhone.trim() || newPhone.replace(/[^0-9]/g, '').length < 8) {
      setErrorMsg('Nomor HP/WhatsApp minimal 8 digit.');
      return;
    }

    // Check duplicate phone
    const existing = members.find(
      (m) => m.phone.replace(/[^0-9]/g, '') === newPhone.replace(/[^0-9]/g, '')
    );
    if (existing) {
      setErrorMsg(`Nomor HP ini sudah terdaftar atas nama ${existing.name}.`);
      return;
    }

    const created = addMember({
      name: newName,
      phone: newPhone,
      email: newEmail,
      birthDate: newBirthDate,
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });

    onSelectMember(created);
    onClose();
  };

  const tierColors: Record<MemberTier, { bg: string; text: string; border: string }> = {
    Silver: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' },
    Gold: { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300' },
    Platinum: { bg: 'bg-purple-100', text: 'text-purple-900', border: 'border-purple-300' },
    Diamond: { bg: 'bg-emerald-100', text: 'text-emerald-950', border: 'border-emerald-300' },
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#e2e1f2] flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#e2e1f2] flex items-center justify-between bg-linear-to-r from-[#684cb6]/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#684cb6] text-white flex items-center justify-center shadow-md">
              <Crown className="w-5 h-5 text-amber-300 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1e1b4b]">
                Pilih Member Kasirku VIP
              </h3>
              <p className="text-xs text-[#5d5e6c]">
                Tambahkan member untuk akumulasi poin & promo spesial
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#5d5e6c] hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls: Search vs Register New */}
        <div className="flex border-b border-[#e2e1f2] bg-slate-50 px-5 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer ${
              activeTab === 'search'
                ? 'border-[#684cb6] text-[#684cb6] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Cari Member Terdaftar
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'border-[#684cb6] text-[#684cb6] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
            <span>Daftar Member Baru (+500 Poin)</span>
          </button>
        </div>

        {/* Tab 1: Search Existing Members */}
        {activeTab === 'search' && (
          <div className="flex-1 flex flex-col p-5 overflow-hidden">
            {/* Search Input Box */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Ketik Nama, Nomor HP (WhatsApp), atau ID Member..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#684cb6] focus:bg-white transition-all"
              />
            </div>

            {/* Quick Helper Note */}
            <div className="text-[11px] text-slate-500 mb-2 flex items-center justify-between">
              <span>Menampilkan {filteredMembers.length} member</span>
              <span className="text-[#684cb6] font-semibold">
                Tips: Gunakan barcode scanner di kasir
              </span>
            </div>

            {/* Members List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((m) => {
                  const isCurrent = activePosMember?.id === m.id;
                  const tStyle = tierColors[m.tier] || tierColors.Silver;

                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        onSelectMember(m);
                        onClose();
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                        isCurrent
                          ? 'border-[#684cb6] bg-[#f4f2fe] ring-2 ring-[#684cb6]/20'
                          : 'border-slate-200 hover:border-[#684cb6] hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={m.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                          alt={m.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-[#1e1b4b] group-hover:text-[#684cb6] transition-colors">
                              {m.name}
                            </h4>
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${tStyle.bg} ${tStyle.text} ${tStyle.border}`}
                            >
                              {m.tier}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                            <span className="flex items-center gap-1 font-mono">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {m.phone}
                            </span>
                            <span>•</span>
                            <span className="text-[#684cb6] font-bold">
                              {formatNumber(m.points)} Poin
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCurrent ? (
                          <span className="px-2.5 py-1 bg-[#684cb6] text-white rounded-lg text-xs font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            Aktif
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="px-3 py-1.5 bg-slate-100 hover:bg-[#684cb6] hover:text-white text-slate-700 rounded-xl text-xs font-bold transition-colors"
                          >
                            Pilih
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500 font-medium">
                    Tidak menemukan member dengan kata kunci &quot;{search}&quot;.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setNewPhone(search.replace(/[^0-9]/g, ''));
                      setNewName(search);
                      setActiveTab('create');
                    }}
                    className="mt-3 text-xs font-bold text-[#684cb6] hover:underline inline-flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Daftarkan sebagai member baru sekarang
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Create New Member Form */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateNewMember} className="p-5 flex-1 overflow-y-auto space-y-3.5">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-start gap-2.5">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-900">
                  Welcome Bonus 500 Poin Gratis
                </h4>
                <p className="text-[11px] text-emerald-700">
                  Member baru otomatis mendapatkan 500 poin selamat datang dan kartu digital resmi.
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200 font-medium">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Lengkap Pelanggan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Rina Anggraini"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#684cb6] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nomor WhatsApp / HP <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="Contoh: 081234567890"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#684cb6] focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email (Opsional)
                </label>
                <input
                  type="email"
                  placeholder="rina@gmail.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#684cb6] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tanggal Lahir (Kado Ultah)
                </label>
                <input
                  type="date"
                  value={newBirthDate}
                  onChange={(e) => setNewBirthDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#684cb6] focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-[#684cb6] hover:bg-[#583ca4] active:scale-[0.98] text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Daftarkan & Pasang ke Pesanan Ini</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#e2e1f2] bg-slate-50 flex items-center justify-between">
          {activePosMember ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600">Member Aktif:</span>
              <span className="text-xs font-bold text-[#1e1b4b]">
                {activePosMember.name}
              </span>
              <button
                type="button"
                onClick={() => {
                  onSelectMember(null as any);
                  onClose();
                }}
                className="text-xs text-red-600 hover:underline font-bold ml-1 cursor-pointer"
              >
                Lepas Member
              </button>
            </div>
          ) : (
            <span className="text-xs text-slate-500">
              Belum ada member yang dipilih
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
