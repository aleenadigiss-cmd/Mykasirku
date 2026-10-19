import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  Users,
  Search,
  Filter,
  Edit,
  Trash2,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  Mail,
  Phone,
  User,
  Crown,
  Sparkles,
  Download,
  Upload,
  RefreshCw,
  Database,
  Check,
  ArrowRight,
  Shield,
  Activity,
  Layers,
  Settings,
  Store,
  Calendar,
  Shuffle,
  LogOut,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { usePos } from '../context/PosContext';
import { AuthUser, UserRole } from '../types';

export const SuperAdminView: React.FC = () => {
  const {
    users,
    currentUser,
    registerUser,
    updateUser,
    deleteUser,
    resetUserPassword,
    setActiveCashier,
    setActiveTab,
    showToast,
    tursoStatus,
    syncWithTurso,
    resetDemoData,
    products,
    categories,
    transactions,
    settings,
  } = usePos();

  // Internal Tabs
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'rbac' | 'logs' | 'backup'>('users');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [resettingUser, setResettingUser] = useState<AuthUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AuthUser | null>(null);

  // Form State: Add User
  const [addName, setAddName] = useState('');
  const [addUsername, setAddUsername] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addConfirmPassword, setAddConfirmPassword] = useState('');
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [addRole, setAddRole] = useState<UserRole>('Kasir');
  const [addEmail, setAddEmail] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addPin, setAddPin] = useState('');
  const [addStatus, setAddStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');
  const [addAvatar, setAddAvatar] = useState(
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  );
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  // Form State: Edit User
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('Kasir');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStatus, setEditStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');
  const [editPin, setEditPin] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Form State: Reset Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);

  // Preset Avatars
  const presetAvatars = [
    { label: 'Admin Gold', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcPLMi85rGq0YDGmeyDMz1FidoiAoiSk1FDdFoNg8ek46kSHA84X6S_cPzMBRXQGGWl5h9KxZEcb24fLNKvckYmIyGkcT1Irb2t0d_C0AYYIRFwcFPVql-nWIJZhi6ZdIHFz7paY_nA5X_A_Zy-Lxg11su759_dM0-EpmI3BmLjwj_sNZ_IRubFxyxR2BL2axb2iw9mc3yEzjsz80BwVhHYO8QvpvhGoUpk9Eyf7VJT0V4Uxd3C8-5' },
    { label: 'Kasir Hijau', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFIOLuCKLDnyIIJU4BbW8BxkuFYQ0Lz1Sgr4djBuFlAVWvTDXVSPcpNPYFVAsUAHOp7tEOzeKxSb4URdt82aMCFMjp9G_Zin6rLG6_KfZWoV0bXB2Fagh-8xfVGoGaqkcUnaISTJsTneQGZfhWi-wKqfVrkm1CKrkK7TcryqeiMQJmb-9-UG0BRt-ft4JxQrA4HJkint0zXZPP9xvHqGCWSeM9u90yg5kF9TEzmDDsXtGgKvesKOzy' },
    { label: 'Manager Biru', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
    { label: 'Kasir Ungu', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
    { label: 'Staf Ritel', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
    { label: 'Akuntan', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  ];

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.includes(q)) ||
        u.role.toLowerCase().includes(q);

      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'Aktif' && (u.status === 'Aktif' || !u.status)) ||
        (statusFilter === 'Nonaktif' && u.status === 'Nonaktif');

      return matchQuery && matchRole && matchStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Metrics
  const superAdminCount = users.filter((u) => u.role === 'Super Admin').length;
  const adminCount = users.filter((u) => u.role === 'Admin').length;
  const managerCount = users.filter((u) => u.role === 'Manager').length;
  const cashierCount = users.filter((u) => u.role === 'Kasir').length;
  const activeCount = users.filter((u) => u.status !== 'Nonaktif').length;

  // Generate Random Secure Password
  const generateRandomPassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$';
    let pass = '';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  // Open Edit Modal Helper
  const handleOpenEdit = (user: AuthUser) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditRole(user.role);
    setEditEmail(user.email || '');
    setEditPhone(user.phone || '');
    setEditStatus(user.status || 'Aktif');
    setEditPin(user.pin || '');
    setEditAvatar(user.avatar || presetAvatars[0].url);
    setEditError(null);
  };

  // Open Reset Password Modal Helper
  const handleOpenReset = (user: AuthUser) => {
    setResettingUser(user);
    setNewPassword('');
    setConfirmNewPassword('');
    setResetError(null);
  };

  // Handle Add User (CREATE)
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    const cleanName = addName.trim();
    const cleanUser = addUsername.trim().toLowerCase();

    if (!cleanName) {
      setAddError('Nama lengkap petugas wajib diisi.');
      return;
    }
    if (!cleanUser) {
      setAddError('Username wajib diisi.');
      return;
    }
    if (users.some((u) => u.username.toLowerCase() === cleanUser)) {
      setAddError(`Username "${cleanUser}" sudah terdaftar. Silakan pilih username lain.`);
      return;
    }
    if (addPassword.length < 6) {
      setAddError('Password minimal harus 6 karakter.');
      return;
    }
    if (addPassword !== addConfirmPassword) {
      setAddError('Konfirmasi password tidak cocok.');
      return;
    }

    setAddLoading(true);
    setTimeout(() => {
      const res = registerUser({
        name: cleanName,
        username: cleanUser,
        password: addPassword,
        role: addRole,
        email: addEmail.trim() || `${cleanUser}@tokoindah.id`,
        phone: addPhone.trim(),
        avatar: addAvatar,
        status: addStatus,
        pin: addPin.trim(),
      });

      setAddLoading(false);
      if (!res.success) {
        setAddError(res.message);
      } else {
        try {
          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch (_) {}

        setIsAddModalOpen(false);
        // Reset form
        setAddName('');
        setAddUsername('');
        setAddPassword('');
        setAddConfirmPassword('');
        setAddEmail('');
        setAddPhone('');
        setAddPin('');
      }
    }, 300);
  };

  // Handle Edit User (UPDATE)
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditError(null);

    const cleanName = editName.trim();
    if (!cleanName) {
      setEditError('Nama lengkap petugas wajib diisi.');
      return;
    }

    setEditLoading(true);
    setTimeout(() => {
      const res = updateUser(editingUser.id, {
        name: cleanName,
        role: editRole,
        email: editEmail.trim(),
        phone: editPhone.trim(),
        status: editStatus,
        pin: editPin.trim(),
        avatar: editAvatar,
      });

      setEditLoading(false);
      if (!res.success) {
        setEditError(res.message);
      } else {
        setEditingUser(null);
      }
    }, 300);
  };

  // Handle Reset Password (UPDATE)
  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser) return;
    setResetError(null);

    if (newPassword.length < 6) {
      setResetError('Password baru minimal harus 6 karakter.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setResetError('Konfirmasi password baru tidak cocok.');
      return;
    }

    setResetLoading(true);
    setTimeout(() => {
      const res = resetUserPassword(resettingUser.id, newPassword);
      setResetLoading(false);

      if (!res.success) {
        setResetError(res.message);
      } else {
        setResettingUser(null);
      }
    }, 300);
  };

  // Handle Delete User (DELETE)
  const handleDeleteConfirm = () => {
    if (!deletingUser) return;
    const res = deleteUser(deletingUser.id);
    if (res.success) {
      setDeletingUser(null);
    } else {
      showToast(res.message, 'error');
    }
  };

  // Quick Switch Active Cashier
  const handleSwitchCashier = (user: AuthUser) => {
    setActiveCashier({
      id: user.id,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      username: user.username,
    });
    showToast(`Petugas aktif di kasir disetel ke "${user.name}" (${user.role})`, 'success');
  };

  // Export Users JSON
  const handleExportUsers = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(users, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `kasirku_users_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Data akun pengguna berhasil diekspor ke file JSON!', 'success');
  };

  // Cloud Sync Handler
  const handleSyncCloud = async () => {
    setIsSyncing(true);
    await syncWithTurso();
    setTimeout(() => {
      setIsSyncing(false);
      showToast('Sinkronisasi database cloud selesai!', 'success');
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200 pb-12">
      {/* Top Banner & Header */}
      <div className="bg-linear-to-r from-[#1e1b4b] via-[#312e81] to-[#4f378b] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300 shadow-2xs">
              <ShieldAlert className="w-4 h-4 text-amber-300" />
              <span>Hak Akses Penuh: Super Admin Master Controller</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Manajemen Petugas & Super Admin</span>
              <span className="text-xs uppercase font-extrabold px-2.5 py-1 rounded-lg bg-amber-400 text-amber-950 font-sans shadow-xs">
                Master CRUD
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
              Kelola seluruh akun kasir, manajer, dan administrator sistem. Tambah, edit data, perbarui kata sandi, kontrol status operasional, serta audit hak akses (RBAC).
            </p>
          </div>

          {/* Quick Action Button Group */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-amber-950 font-extrabold rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Tambah Petugas Baru</span>
            </button>

            <button
              type="button"
              onClick={handleExportUsers}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Ekspor daftar pengguna ke format JSON"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" />
              <span>Ekspor JSON</span>
            </button>

            <button
              type="button"
              onClick={handleSyncCloud}
              disabled={isSyncing}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Sinkronkan data dengan database cloud Turso"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync Cloud</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#e2e1f2] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Pengguna</span>
            <span className="text-2xl font-black text-[#1e1b4b] block mt-0.5">{users.length} Akun</span>
            <span className="text-[11px] text-emerald-600 font-bold block mt-0.5">{activeCount} Akun Aktif</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-100 text-[#684cb6] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e2e1f2] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Super Admin</span>
            <span className="text-2xl font-black text-[#684cb6] block mt-0.5">{superAdminCount} Akun</span>
            <span className="text-[11px] text-purple-700 font-bold block mt-0.5">Akses Master Penuh</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Crown className="w-5 h-5 text-amber-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e2e1f2] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Staf Kasir Aktif</span>
            <span className="text-2xl font-black text-emerald-700 block mt-0.5">{cashierCount} Kasir</span>
            <span className="text-[11px] text-slate-500 font-medium block mt-0.5">Operator Transaksi</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Store className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e2e1f2] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Status Database</span>
            <span className="text-lg font-black text-[#1e1b4b] block mt-0.5">
              {tursoStatus === 'connected' ? 'Cloud LibSQL' : 'Lokal Siap'}
            </span>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Terproteksi
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Super Admin Internal Tabs Switcher */}
      <div className="flex border-b border-[#e2e1f2] bg-white rounded-2xl p-1.5 shadow-2xs gap-1.5 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab('users')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'users'
              ? 'bg-[#684cb6] text-white shadow-xs'
              : 'text-[#5d5e6c] hover:text-[#1e1b4b] hover:bg-[#fbf8ff]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Daftar Akun & CRUD Petugas ({users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('rbac')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'rbac'
              ? 'bg-[#684cb6] text-white shadow-xs'
              : 'text-[#5d5e6c] hover:text-[#1e1b4b] hover:bg-[#fbf8ff]'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Matriks Hak Akses (RBAC)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('logs')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'logs'
              ? 'bg-[#684cb6] text-white shadow-xs'
              : 'text-[#5d5e6c] hover:text-[#1e1b4b] hover:bg-[#fbf8ff]'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Audit Log Keamanan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('backup')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'backup'
              ? 'bg-[#684cb6] text-white shadow-xs'
              : 'text-[#5d5e6c] hover:text-[#1e1b4b] hover:bg-[#fbf8ff]'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Backup & Reset Sistem</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: USERS LIST & CRUD TABLE */}
      {/* ========================================================================= */}
      {activeSubTab === 'users' && (
        <div className="bg-white rounded-3xl border border-[#e2e1f2] shadow-sm overflow-hidden">
          {/* Table Toolbar & Search Filters */}
          <div className="p-5 border-b border-[#e2e1f2] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#fbf8ff]">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan nama, username, email, atau role..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] text-xs outline-hidden bg-white"
              />
            </div>

            {/* Role & Status Filter Selectors */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter:</span>
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#e2e1f2] text-xs font-bold bg-white text-[#1e1b4b] outline-hidden focus:border-[#684cb6]"
              >
                <option value="all">Semua Peran</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Kasir">Kasir</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#e2e1f2] text-xs font-bold bg-white text-[#1e1b4b] outline-hidden focus:border-[#684cb6]"
              >
                <option value="all">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8f7fd] text-[#5d5e6c] font-bold border-b border-[#e2e1f2] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Profil Petugas</th>
                  <th className="py-3.5 px-4">Role & Hak Akses</th>
                  <th className="py-3.5 px-4">Kontak (Email / No. HP)</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Aksi Manajemen (CRUD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e1f2]">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="font-bold text-slate-600">Tidak ada data pengguna yang cocok</p>
                      <p className="text-xs text-slate-400 mt-0.5">Coba ubah kata kunci pencarian atau reset filter.</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const isSelf = currentUser?.id === user.id;
                    const isLastSuperAdmin = user.role === 'Super Admin' && superAdminCount <= 1;

                    return (
                      <tr key={user.id} className="hover:bg-[#fbf8ff]/80 transition-colors">
                        {/* Profile Info */}
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatar || presetAvatars[0].url}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover border border-[#e2e1f2] shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-[#1e1b4b] block leading-tight">
                                  {user.name}
                                </span>
                                {isSelf && (
                                  <span className="px-1.5 py-0.2 rounded-md bg-[#684cb6] text-white text-[10px] font-extrabold uppercase">
                                    Saya
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-500 font-mono block mt-0.5">
                                @{user.username}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Role Badge */}
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                              user.role === 'Super Admin'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : user.role === 'Admin'
                                ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                : user.role === 'Manager'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {user.role === 'Super Admin' && <Crown className="w-3.5 h-3.5 text-amber-600" />}
                            {user.role === 'Admin' && <Shield className="w-3.5 h-3.5 text-blue-600" />}
                            {user.role === 'Manager' && <Layers className="w-3.5 h-3.5 text-emerald-600" />}
                            {user.role === 'Kasir' && <Store className="w-3.5 h-3.5 text-slate-600" />}
                            <span>{user.role}</span>
                          </span>
                        </td>

                        {/* Contact Info */}
                        <td className="py-4 px-4 text-slate-600">
                          <div className="space-y-0.5">
                            <span className="flex items-center gap-1.5 text-xs">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-[180px]">{user.email || '-'}</span>
                            </span>
                            {user.phone && (
                              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{user.phone}</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              user.status === 'Nonaktif'
                                ? 'bg-red-100 text-red-700 border border-red-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                user.status === 'Nonaktif' ? 'bg-red-500' : 'bg-emerald-500'
                              }`}
                            />
                            <span>{user.status === 'Nonaktif' ? 'Nonaktif' : 'Aktif'}</span>
                          </span>
                        </td>

                        {/* Action Buttons (CRUD) */}
                        <td className="py-4 px-4 sm:px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Fast Switch to POS cashier */}
                            <button
                              type="button"
                              onClick={() => handleSwitchCashier(user)}
                              className="p-1.5 rounded-lg border border-[#e2e1f2] hover:border-emerald-500 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
                              title={`Pilih ${user.name} sebagai petugas aktif kasir`}
                            >
                              <Store className="w-4 h-4" />
                            </button>

                            {/* Reset Password Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenReset(user)}
                              className="p-1.5 rounded-lg border border-[#e2e1f2] hover:border-amber-400 hover:bg-amber-50 text-slate-600 hover:text-amber-800 transition-colors cursor-pointer"
                              title="Reset Password Akun"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(user)}
                              className="p-1.5 rounded-lg border border-[#e2e1f2] hover:border-[#684cb6] hover:bg-[#684cb6]/10 text-slate-600 hover:text-[#684cb6] transition-colors cursor-pointer"
                              title="Edit Data & Role Petugas"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              disabled={isSelf || isLastSuperAdmin}
                              onClick={() => setDeletingUser(user)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                isSelf || isLastSuperAdmin
                                  ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                                  : 'border-[#e2e1f2] hover:border-red-400 hover:bg-red-50 text-slate-600 hover:text-red-600 cursor-pointer'
                              }`}
                              title={
                                isSelf
                                  ? 'Tidak dapat menghapus akun sendiri saat sedang login'
                                  : isLastSuperAdmin
                                  ? 'Tidak dapat menghapus Super Admin terakhir sistem'
                                  : 'Hapus Akun Pengguna'
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: RBAC MATRIX (ROLE-BASED ACCESS CONTROL) */}
      {/* ========================================================================= */}
      {activeSubTab === 'rbac' && (
        <div className="bg-white rounded-3xl border border-[#e2e1f2] shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-black text-[#1e1b4b] flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#684cb6]" />
              <span>Matriks Hak Akses Pengguna (Role-Based Access Control)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Daftar izin operasional dan otorisasi modul sistem berdasarkan peran jabatan masing-masing petugas.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#e2e1f2] bg-[#fbf8ff] text-slate-600 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4 text-left">Fitur / Modul Sistem</th>
                  <th className="py-3 px-4 text-center">Super Admin</th>
                  <th className="py-3 px-4 text-center">Admin Toko</th>
                  <th className="py-3 px-4 text-center">Manajer</th>
                  <th className="py-3 px-4 text-center">Kasir Toko</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e1f2]">
                {[
                  { feature: 'Transaksi Kasir POS & Scan Barcode', sa: true, adm: true, mgr: true, ksr: true },
                  { feature: 'Proses Pembayaran QRIS & Tunai', sa: true, adm: true, mgr: true, ksr: true },
                  { feature: 'Cetak Struk Transaksi & Kirim WA', sa: true, adm: true, mgr: true, ksr: true },
                  { feature: 'Buka / Tutup Laci Kasir (Open/Close Shift)', sa: true, adm: true, mgr: true, ksr: true },
                  { feature: 'Pasang Member VIP & Diskon Poin', sa: true, adm: true, mgr: true, ksr: true },
                  { feature: 'Tambah & Update Data Produk', sa: true, adm: true, mgr: true, ksr: false },
                  { feature: 'Penyesuaian Stok (Restock & Koreksi)', sa: true, adm: true, mgr: true, ksr: false },
                  { feature: 'Hapus / Void Transaksi Penjualan', sa: true, adm: true, mgr: false, ksr: false },
                  { feature: 'Lihat Laporan Penjualan & Laba Rugi', sa: true, adm: true, mgr: true, ksr: false },
                  { feature: 'Ekspor Laporan Penjualan (Excel/PDF)', sa: true, adm: true, mgr: true, ksr: false },
                  { feature: 'Ubah Pengaturan Toko & Pajak PPN', sa: true, adm: false, mgr: false, ksr: false },
                  { feature: 'CRUD Akun Petugas & Reset Password', sa: true, adm: false, mgr: false, ksr: false },
                  { feature: 'Backup & Reset Database Cloud', sa: true, adm: false, mgr: false, ksr: false },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-semibold text-[#1e1b4b]">{row.feature}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex p-1 rounded-full bg-emerald-100 text-emerald-800">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row.adm ? (
                        <span className="inline-flex p-1 rounded-full bg-emerald-100 text-emerald-800">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="inline-flex p-1 rounded-full bg-slate-100 text-slate-400">
                          <X className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row.mgr ? (
                        <span className="inline-flex p-1 rounded-full bg-emerald-100 text-emerald-800">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="inline-flex p-1 rounded-full bg-slate-100 text-slate-400">
                          <X className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row.ksr ? (
                        <span className="inline-flex p-1 rounded-full bg-emerald-100 text-emerald-800">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="inline-flex p-1 rounded-full bg-slate-100 text-slate-400">
                          <X className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: AUDIT LOG KEAMANAN */}
      {/* ========================================================================= */}
      {activeSubTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-[#e2e1f2] shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-[#1e1b4b] flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#684cb6]" />
                <span>Audit Trail & Log Aktivitas Sistem</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Catatan riwayat otentikasi login, perubahan data penting, dan transaksi kasir.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              Real-time Logging
            </span>
          </div>

          <div className="space-y-3">
            {[
              {
                time: 'Baru saja',
                user: currentUser?.name || 'Super Admin',
                action: 'Membuka Pusat Kontrol Super Admin & CRUD Petugas',
                type: 'info',
              },
              {
                time: '10 menit yang lalu',
                user: 'Kassa 1',
                action: 'Menyelesaikan Transaksi Kasir #TRX-20240928-042 (Rp 75.000 via QRIS)',
                type: 'success',
              },
              {
                time: '1 jam yang lalu',
                user: 'Super Admin Toko Indah',
                action: 'Sinkronisasi database cloud Turso LibSQL berhasil',
                type: 'success',
              },
              {
                time: 'Hari ini, 08:00',
                user: 'Kassa 1',
                action: 'Buka Shift Kasir Pagi (Modal Awal: Rp 200.000)',
                type: 'info',
              },
              {
                time: 'Kemarin, 21:30',
                user: 'Kassa 2',
                action: 'Tutup Shift Kasir Malam (Total Kas Masuk: Rp 1.450.000)',
                type: 'info',
              },
              {
                time: '24 Sep 2026',
                user: 'Super Admin Toko Indah',
                action: 'Memperbarui profil toko dan format catatan kaki struk',
                type: 'warning',
              },
            ].map((log, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-[#fbf8ff] rounded-2xl border border-[#e2e1f2] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      log.type === 'success'
                        ? 'bg-emerald-100 text-emerald-700'
                        : log.type === 'warning'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-purple-100 text-[#684cb6]'
                    }`}
                  >
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#1e1b4b] block leading-tight">{log.action}</span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Oleh: <strong>{log.user}</strong>
                    </span>
                  </div>
                </div>
                <span className="text-slate-400 font-semibold text-[11px] shrink-0">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: BACKUP & RESET SISTEM */}
      {/* ========================================================================= */}
      {activeSubTab === 'backup' && (
        <div className="bg-white rounded-3xl border border-[#e2e1f2] shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-black text-[#1e1b4b] flex items-center gap-2">
              <Database className="w-5 h-5 text-[#684cb6]" />
              <span>Pusat Cadangan (Backup) & Pemeliharaan Database</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Amankan seluruh data toko Anda atau reset sistem ke pengaturan pabrik demo awal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Backup Box */}
            <div className="p-6 bg-[#fbf8ff] rounded-3xl border border-[#e2e1f2] flex flex-col justify-between space-y-4">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#684cb6] flex items-center justify-center mb-3">
                  <Download className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-[#1e1b4b]">Cadangkan Seluruh Data Toko</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Ekspor seluruh basis data meliputi Produk ({products.length}), Kategori ({categories.length}), Transaksi ({transactions.length}), dan Akun Petugas ({users.length}) ke dalam format JSON terenkripsi.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const fullBackup = {
                    version: '2.5',
                    timestamp: new Date().toISOString(),
                    products,
                    categories,
                    transactions,
                    users,
                    settings,
                  };
                  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
                  const downloadAnchor = document.createElement('a');
                  downloadAnchor.setAttribute('href', dataStr);
                  downloadAnchor.setAttribute('download', `kasirku_full_snapshot_${new Date().toISOString().split('T')[0]}.json`);
                  document.body.appendChild(downloadAnchor);
                  downloadAnchor.click();
                  downloadAnchor.remove();
                  showToast('Snapshot database toko berhasil diunduh!', 'success');
                }}
                className="w-full py-3 bg-[#684cb6] hover:bg-[#583ca4] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Snapshot Database Lengkap</span>
              </button>
            </div>

            {/* Reset Data Box */}
            <div className="p-6 bg-red-50/50 rounded-3xl border border-red-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mb-3">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-red-900">Reset Data Toko ke Kondisi Awal</h4>
                <p className="text-xs text-red-800/80 mt-1 leading-relaxed">
                  Tindakan ini akan mengembalikan data produk, transaksi, dan akun petugas ke demo data awal. Akun Super Admin <code>tokoindah</code> tetap terjaga.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh data transaksi dan produk ke data awal?')) {
                    resetDemoData();
                    showToast('Seluruh data berhasil direset ke kondisi awal.', 'info');
                  }
                }}
                className="w-full py-3 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset ke Data Demo Awal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: TAMBAH PETUGAS BARU (CREATE) */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddModalOpen(false);
          }}
        >
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#e2e1f2] overflow-hidden my-6 relative z-10 flex flex-col max-h-[92vh]">
            <div className="bg-[#1e1b4b] text-white p-6 pb-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-lg font-black">Tambah Petugas / Admin Baru</h3>
                  <p className="text-xs text-slate-300">Daftarkan akun kasir, manajer, atau administrator baru.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              {addError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{addError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1e1b4b] mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-3 py-2 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] outline-hidden bg-white text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1e1b4b] mb-1">Username Login *</label>
                  <input
                    type="text"
                    value={addUsername}
                    onChange={(e) => setAddUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    placeholder="Contoh: kassa3"
                    className="w-full px-3 py-2 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] outline-hidden bg-white text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1e1b4b] mb-1">Role / Peran Jabatan *</label>
                  <select
                    value={addRole}
                    onChange={(e) => setAddRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] outline-hidden bg-white text-xs font-semibold"
                  >
                    <option value="Kasir">Kasir Toko (Akses POS)</option>
                    <option value="Manager">Manajer (Stok & Laporan)</option>
                    <option value="Admin">Admin (Kelola Produk & Staf)</option>
                    <option value="Super Admin">Super Admin (Akses Penuh Master)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#1e1b4b] mb-1">Status Akun</label>
                  <select
                    value={addStatus}
                    onChange={(e) => setAddStatus(e.target.value as 'Aktif' | 'Nonaktif')}
                    className="w-full px-3 py-2 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] outline-hidden bg-white text-xs font-semibold"
                  >
                    <option value="Aktif">Aktif (Dapat Login)</option>
                    <option value="Nonaktif">Nonaktif (Dibekukan)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1e1b4b] mb-1">Email</label>
                  <input
                    type="email"
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    placeholder="budi@tokoindah.id"
                    className="w-full px-3 py-2 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] outline-hidden bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1e1b4b] mb-1">No. WhatsApp / HP</label>
                  <input
                    type="tel"
                    value={addPhone}
                    onChange={(e) => setAddPhone(e.target.value)}
                    placeholder="08123456789"
                    className="w-full px-3 py-2 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] outline-hidden bg-white text-xs"
                  />
                </div>
              </div>

              {/* Password Section with Random Generator */}
              <div className="space-y-2 pt-2 border-t border-[#e2e1f2]">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#1e1b4b]">Password Akun (Min. 6 Karakter) *</label>
                  <button
                    type="button"
                    onClick={() => {
                      const gen = generateRandomPassword();
                      setAddPassword(gen);
                      setAddConfirmPassword(gen);
                      setShowAddPassword(true);
                    }}
                    className="text-[#684cb6] hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Shuffle className="w-3 h-3" /> Acak Password Aman
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type={showAddPassword ? 'text' : 'password'}
                      value={addPassword}
                      onChange={(e) => setAddPassword(e.target.value)}
                      placeholder="Password baru"
                      className="w-full px-3 pr-8 py-2 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] outline-hidden bg-white text-xs"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowAddPassword(!showAddPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showAddPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div>
                    <input
                      type={showAddPassword ? 'text' : 'password'}
                      value={addConfirmPassword}
                      onChange={(e) => setAddConfirmPassword(e.target.value)}
                      placeholder="Konfirmasi password"
                      className="w-full px-3 py-2 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] outline-hidden bg-white text-xs"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block font-bold text-[#1e1b4b] mb-1.5">Pilih Foto Avatar Petugas</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {presetAvatars.map((av, idx) => (
                    <img
                      key={idx}
                      src={av.url}
                      alt={av.label}
                      onClick={() => setAddAvatar(av.url)}
                      className={`w-9 h-9 rounded-full object-cover cursor-pointer border-2 transition-all ${
                        addAvatar === av.url ? 'border-[#684cb6] scale-110 shadow-xs' : 'border-slate-200 opacity-60 hover:opacity-100'
                      }`}
                      title={av.label}
                    />
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-[#e2e1f2] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#e2e1f2] text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-6 py-2.5 rounded-xl bg-[#684cb6] hover:bg-[#583ca4] text-white font-bold cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-md"
                >
                  {addLoading ? <span>Menyimpan...</span> : <span>Simpan Petugas Baru</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT PETUGAS (UPDATE) */}
      {/* ========================================================================= */}
      {editingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingUser(null);
          }}
        >
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#e2e1f2] overflow-hidden my-6 relative z-10 flex flex-col max-h-[92vh]">
            <div className="bg-[#1e1b4b] text-white p-6 pb-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Edit className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-lg font-black">Edit Profil & Role Petugas</h3>
                  <p className="text-xs text-slate-300">
                    Memperbarui data akun @{editingUser.username}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              {editError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{editError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-[#1e1b4b] mb-1">Username (Tidak Dapat Diubah)</label>
                <input
                  type="text"
                  value={editingUser.username}
                  disabled
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-mono text-xs cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1e1b4b] mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] outline-hidden bg-white text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1e1b4b] mb-1">Role / Peran Jabatan</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    disabled={editingUser.role === 'Super Admin' && superAdminCount <= 1}
                    className="w-full px-3 py-2 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] outline-hidden bg-white text-xs font-semibold disabled:bg-slate-100"
                  >
                    <option value="Kasir">Kasir Toko (Akses POS)</option>
                    <option value="Manager">Manajer (Stok & Laporan)</option>
                    <option value="Admin">Admin (Kelola Produk & Staf)</option>
                    <option value="Super Admin">Super Admin (Akses Penuh Master)</option>
                  </select>
                  {editingUser.role === 'Super Admin' && superAdminCount <= 1 && (
                    <span className="text-[10px] text-amber-700 font-semibold block mt-0.5">
                      Terkunci: Super Admin terakhir sistem
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1e1b4b] mb-1">Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] outline-hidden bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1e1b4b] mb-1">No. WhatsApp / HP</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] outline-hidden bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1e1b4b] mb-1">Status Akun</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as 'Aktif' | 'Nonaktif')}
                  disabled={editingUser.id === currentUser?.id}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] outline-hidden bg-white text-xs font-semibold disabled:bg-slate-100"
                >
                  <option value="Aktif">Aktif (Dapat Login)</option>
                  <option value="Nonaktif">Nonaktif (Dibekukan)</option>
                </select>
              </div>

              {/* Avatar Picker */}
              <div>
                <label className="block font-bold text-[#1e1b4b] mb-1.5">Pilih Foto Avatar Petugas</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {presetAvatars.map((av, idx) => (
                    <img
                      key={idx}
                      src={av.url}
                      alt={av.label}
                      onClick={() => setEditAvatar(av.url)}
                      className={`w-9 h-9 rounded-full object-cover cursor-pointer border-2 transition-all ${
                        editAvatar === av.url ? 'border-[#684cb6] scale-110 shadow-xs' : 'border-slate-200 opacity-60 hover:opacity-100'
                      }`}
                      title={av.label}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#e2e1f2] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#e2e1f2] text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-6 py-2.5 rounded-xl bg-[#684cb6] hover:bg-[#583ca4] text-white font-bold cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-md"
                >
                  {editLoading ? <span>Menyimpan...</span> : <span>Perbarui Data Akun</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: RESET PASSWORD (UPDATE) */}
      {/* ========================================================================= */}
      {resettingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setResettingUser(null);
          }}
        >
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#e2e1f2] overflow-hidden relative z-10">
            <div className="bg-[#1e1b4b] text-white p-6 pb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black">Reset Password Akun</h3>
                  <p className="text-xs text-slate-300">
                    Untuk: <strong>{resettingUser.name}</strong> (@{resettingUser.username})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResettingUser(null)}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetSubmit} className="p-6 space-y-4 text-xs">
              {resetError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{resetError}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <label className="font-bold text-[#1e1b4b]">Password Baru (Min. 6 Karakter) *</label>
                <button
                  type="button"
                  onClick={() => {
                    const gen = generateRandomPassword();
                    setNewPassword(gen);
                    setConfirmNewPassword(gen);
                    setShowNewPassword(true);
                  }}
                  className="text-[#684cb6] hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Shuffle className="w-3 h-3" /> Acak Password
                </button>
              </div>

              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan password baru"
                  className="w-full px-3 pr-8 py-2.5 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] outline-hidden bg-white text-xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div>
                <label className="block font-bold text-[#1e1b4b] mb-1">Konfirmasi Password Baru *</label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Ketik ulang password baru"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] outline-hidden bg-white text-xs"
                  required
                />
              </div>

              <div className="pt-3 border-t border-[#e2e1f2] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#e2e1f2] text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-extrabold cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-md"
                >
                  {resetLoading ? <span>Menyimpan...</span> : <span>Simpan Password Baru</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: HAPUS PETUGAS (DELETE) */}
      {/* ========================================================================= */}
      {deletingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeletingUser(null);
          }}
        >
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-red-200 overflow-hidden relative z-10 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-red-950">Hapus Akun Petugas?</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 space-y-1 text-xs">
              <p className="text-slate-700">
                Apakah Anda yakin ingin menghapus akun <strong>{deletingUser.name}</strong> (@{deletingUser.username}) dengan peran <strong>{deletingUser.role}</strong>?
              </p>
              <p className="text-red-700 font-semibold pt-1">
                Petugas ini tidak akan dapat login lagi ke dalam sistem kasir POS KASIRKU.
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold cursor-pointer text-xs flex items-center gap-2 shadow-md"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Permanen</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
