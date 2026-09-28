import React, { useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  Filter,
  Printer,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Banknote,
  Receipt,
  RotateCcw,
  Send,
  CheckCircle2,
  Share2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { usePos } from '../context/PosContext';
import { formatRupiah, formatNumber } from '../utils/formatters';
import { Transaction, PaymentMethod } from '../types';

interface HistoryReportViewProps {
  initialTab?: 'history' | 'reports';
}

export const HistoryReportView: React.FC<HistoryReportViewProps> = ({ initialTab = 'history' }) => {
  const {
    transactions,
    selectedTransaction,
    setSelectedTransaction,
    cancelTransaction,
    deleteTransaction,
    products,
    cashiers,
    settings,
    setActiveTab,
  } = usePos();

  const [activeSubTab, setActiveSubTab] = useState<'history' | 'reports'>(initialTab);
  const [filterDate, setFilterDate] = useState('01 Okt 2023 - 31 Okt 2023');
  const [filterMethod, setFilterMethod] = useState<string>('Semua Metode');
  const [filterCashier, setFilterCashier] = useState<string>('Semua Kasir');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [reportTimeframe, setReportTimeframe] = useState<'Minggu Ini' | 'Bulan Ini' | 'Tahun Ini'>(
    'Minggu Ini'
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'cancel' | 'delete';
    transactionId: string;
  }>({ isOpen: false, type: 'cancel', transactionId: '' });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesMethod =
      filterMethod === 'Semua Metode' || t.paymentMethod === filterMethod;
    const matchesCashier =
      filterCashier === 'Semua Kasir' ||
      t.cashier.toLowerCase().includes(filterCashier.toLowerCase()) ||
      filterCashier.toLowerCase().includes(t.cashier.toLowerCase().split(' ')[0]);
    return matchesMethod && matchesCashier;
  });

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeReceipt = selectedTransaction || transactions[0] || null;

  // Chart data for Reports
  const salesTrendWeekly = [
    { name: 'Sen', sales: 2.1, amount: 2100000 },
    { name: 'Sel', sales: 2.5, amount: 2500000 },
    { name: 'Rab', sales: 2.2, amount: 2200000 },
    { name: 'Kam', sales: 3.0, amount: 3000000 },
    { name: 'Jum', sales: 4.2, amount: 4200000 },
    { name: 'Sab', sales: 5.5, amount: 5500000 },
    { name: 'Min', sales: 5.0, amount: 5000000 },
  ];

  const salesTrendMonthly = [
    { name: 'Minggu 1', sales: 18.5, amount: 18500000 },
    { name: 'Minggu 2', sales: 22.1, amount: 22100000 },
    { name: 'Minggu 3', sales: 19.8, amount: 19800000 },
    { name: 'Minggu 4', sales: 24.5, amount: 24500000 },
  ];

  const salesTrendYearly = [
    { name: 'Jan', sales: 65, amount: 65000000 },
    { name: 'Feb', sales: 72, amount: 72000000 },
    { name: 'Mar', sales: 68, amount: 68000000 },
    { name: 'Apr', sales: 85, amount: 85000000 },
    { name: 'Mei', sales: 94, amount: 94000000 },
    { name: 'Jun', sales: 91, amount: 91000000 },
    { name: 'Jul', sales: 104, amount: 104000000 },
    { name: 'Agu', sales: 118, amount: 118000000 },
  ];

  const trendData =
    reportTimeframe === 'Minggu Ini'
      ? salesTrendWeekly
      : reportTimeframe === 'Bulan Ini'
      ? salesTrendMonthly
      : salesTrendYearly;

  // Export handlers
  const handleExport = (type: 'Excel' | 'PDF') => {
    showToast(`Berhasil mengekspor data transaksi ke format ${type}.`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#30323e] text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-[#6bffc1]" />
          {toastMessage}
        </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex gap-4 border-b border-[#e2e1f2] w-full md:w-auto">
          <button
            onClick={() => setActiveSubTab('history')}
            className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'history'
                ? 'border-[#684cb6] text-[#684cb6]'
                : 'border-transparent text-[#5d5e6c] hover:text-[#30323e]'
            }`}
          >
            Riwayat Transaksi
          </button>
          <button
            onClick={() => setActiveSubTab('reports')}
            className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'reports'
                ? 'border-[#684cb6] text-[#684cb6]'
                : 'border-transparent text-[#5d5e6c] hover:text-[#30323e]'
            }`}
          >
            Laporan Penjualan
          </button>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => handleExport('Excel')}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 border border-[#e2e1f2] rounded-xl bg-white text-[#5d5e6c] hover:bg-[#f4f2fe] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#006d4b]" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={() => handleExport('PDF')}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 border border-[#e2e1f2] rounded-xl bg-white text-[#5d5e6c] hover:bg-[#f4f2fe] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#a8364b]" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: Riwayat Transaksi */}
      {activeSubTab === 'history' && (
        <div className="flex flex-col xl:flex-row gap-6 pb-6">
          {/* Data Table Section */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-2xl border border-[#e2e1f2] shadow-xs flex flex-wrap gap-3 items-end">
              <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                <label className="text-xs font-semibold text-[#5d5e6c]">Tanggal</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#797988]" />
                  <input
                    type="text"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e2e1f2] bg-white text-xs font-medium text-[#30323e] focus:ring-1 focus:ring-[#684cb6] focus:border-[#684cb6] outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
                <label className="text-xs font-semibold text-[#5d5e6c]">Metode Pembayaran</label>
                <select
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2e1f2] bg-white text-xs font-medium text-[#30323e] focus:ring-1 focus:ring-[#684cb6] focus:border-[#684cb6] outline-none cursor-pointer"
                >
                  <option value="Semua Metode">Semua Metode</option>
                  <option value="Tunai">Tunai</option>
                  <option value="QRIS">QRIS</option>
                  <option value="Kartu">Kartu Debit</option>
                  <option value="Transfer">Transfer</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
                <label className="text-xs font-semibold text-[#5d5e6c]">Kasir</label>
                <select
                  value={filterCashier}
                  onChange={(e) => setFilterCashier(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2e1f2] bg-white text-xs font-medium text-[#30323e] focus:ring-1 focus:ring-[#684cb6] focus:border-[#684cb6] outline-none cursor-pointer"
                >
                  <option value="Semua Kasir">Semua Kasir</option>
                  {cashiers.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => showToast('Filter diterapkan.')}
                className="bg-[#f4f2fe] text-[#684cb6] hover:bg-[#e2e1f2] border border-[#e2e1f2] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer h-10"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filter</span>
              </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-[#e2e1f2] shadow-xs overflow-hidden flex flex-col flex-1">
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f4f2fe]/60 border-b border-[#e2e1f2]">
                      <th className="p-4 text-xs font-semibold text-[#5d5e6c]">ID Transaksi</th>
                      <th className="p-4 text-xs font-semibold text-[#5d5e6c]">Tanggal & Waktu</th>
                      <th className="p-4 text-xs font-semibold text-[#5d5e6c] text-right">Total</th>
                      <th className="p-4 text-xs font-semibold text-[#5d5e6c] text-center">Pembayaran</th>
                      <th className="p-4 text-xs font-semibold text-[#5d5e6c]">Kasir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e1f2]/60 text-sm">
                    {paginatedTransactions.map((tx) => {
                      const isSelected = activeReceipt?.id === tx.id;
                      return (
                        <tr
                          key={tx.id}
                          onClick={() => setSelectedTransaction(tx)}
                          className={`hover:bg-[#f4f2fe]/70 cursor-pointer transition-colors ${
                            isSelected ? 'bg-[#a589f8]/15 font-semibold' : ''
                          }`}
                        >
                          <td className="p-4 text-xs font-bold text-[#684cb6]">{tx.id}</td>
                          <td className="p-4 text-xs text-[#30323e]">{tx.timestamp}</td>
                          <td className="p-4 text-xs font-bold text-right text-[#30323e]">
                            {formatRupiah(tx.total)}
                          </td>
                          <td className="p-4 text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                tx.paymentMethod === 'Tunai'
                                  ? 'bg-[#6bffc1]/20 text-[#006d4b] border-[#6bffc1]/40'
                                  : tx.paymentMethod === 'QRIS'
                                  ? 'bg-[#a589f8]/20 text-[#684cb6] border-[#a589f8]/40'
                                  : 'bg-[#e3e1ec] text-[#515159] border-[#d4d3dd]'
                              }`}
                            >
                              {tx.paymentMethod}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-[#5d5e6c]">{tx.cashier}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-[#e2e1f2] flex flex-col sm:flex-row justify-between items-center gap-2 bg-white">
                <span className="text-xs text-[#5d5e6c]">
                  Menampilkan {(currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} dari{' '}
                  {filteredTransactions.length} transaksi
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-[#e2e1f2] text-[#5d5e6c] hover:bg-[#f4f2fe] disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      onClick={() => setCurrentPage(num)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${
                        currentPage === num
                          ? 'bg-[#684cb6] text-white'
                          : 'border border-[#e2e1f2] text-[#5d5e6c] hover:bg-[#f4f2fe]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-[#e2e1f2] text-[#5d5e6c] hover:bg-[#f4f2fe] disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Thermal Receipt Detail Panel */}
          {activeReceipt && (
            <div className="w-full xl:w-[380px] flex flex-col sticky top-20 h-fit bg-white rounded-2xl border border-[#e2e1f2] shadow-sm overflow-hidden shrink-0">
              {/* Receipt Header Bar */}
              <div className="p-4 border-b border-[#e2e1f2] flex justify-between items-center bg-[#fbf8ff]">
                <h3 className="font-bold text-sm text-[#30323e]">Detail Transaksi</h3>
                <button
                  onClick={handlePrint}
                  className="p-1.5 rounded-lg text-[#5d5e6c] hover:text-[#684cb6] hover:bg-[#f4f2fe] transition-colors"
                  title="Cetak Struk"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>

              {/* White Receipt Canvas */}
              <div id="receipt-print-area" className="p-6 flex flex-col gap-4 bg-white font-mono text-xs">
                <div className="text-center">
                  <h4 className="font-extrabold text-base text-[#30323e] tracking-tight">
                    {settings.storeName}
                  </h4>
                  <p className="text-[#5d5e6c] text-[11px] mt-0.5">{settings.storeAddress}</p>
                  <p className="text-[#797988] text-[10px]">{settings.storePhone}</p>
                </div>

                <div className="flex justify-between border-b border-dashed border-[#b1b1c0] pb-2 text-[11px] text-[#5d5e6c]">
                  <div className="flex flex-col">
                    <span className="font-bold text-[#30323e]">{activeReceipt.id}</span>
                    <span>{activeReceipt.timestamp}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span>Kasir: {activeReceipt.cashier}</span>
                    <span className="font-bold text-[#684cb6]">
                      {activeReceipt.paymentMethod}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2 border-b border-dashed border-[#b1b1c0] pb-3">
                  {activeReceipt.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start">
                      <div className="flex flex-col max-w-[70%]">
                        <span className="font-bold text-[#30323e] leading-snug">{item.name}</span>
                        <span className="text-[#797988] text-[10px]">
                          {item.quantity} x {formatRupiah(item.price)}
                        </span>
                      </div>
                      <span className="font-bold text-[#30323e]">
                        {formatRupiah(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals Calculation */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-[#5d5e6c]">
                    <span>Subtotal</span>
                    <span>{formatRupiah(activeReceipt.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#5d5e6c]">
                    <span>Pajak ({activeReceipt.taxRate ? activeReceipt.taxRate * 100 : 0}%)</span>
                    <span>{formatRupiah(activeReceipt.tax)}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-[#30323e] text-sm pt-1 border-t border-[#eeecfa]">
                    <span>Total</span>
                    <span>{formatRupiah(activeReceipt.total)}</span>
                  </div>
                </div>

                {/* Payment & Change */}
                <div className="pt-2 border-t border-dashed border-[#b1b1c0] space-y-1 text-[11px]">
                  <div className="flex justify-between text-[#5d5e6c]">
                    <span>Bayar ({activeReceipt.paymentMethod})</span>
                    <span>{formatRupiah(activeReceipt.amountPaid)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#006d4b]">
                    <span>Kembali</span>
                    <span>{formatRupiah(activeReceipt.change)}</span>
                  </div>
                </div>

                <div className="text-center pt-2 text-[#797988] text-[10px] italic">
                  {settings.receiptFooter}
                </div>
              </div>

              {/* Receipt Action Footer */}
              <div className="p-4 border-t border-[#e2e1f2] bg-[#fbf8ff] flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setConfirmModal({
                      isOpen: true,
                      type: 'cancel',
                      transactionId: activeReceipt.id,
                    })
                  }
                  className="flex-1 py-2.5 border border-[#f97386] text-[#a8364b] hover:bg-[#f97386]/15 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Batalkan
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setConfirmModal({
                      isOpen: true,
                      type: 'delete',
                      transactionId: activeReceipt.id,
                    })
                  }
                  title="Hapus Transaksi Permanen"
                  className="p-2.5 border border-[#e2e1f2] text-[#797988] hover:text-[#a8364b] hover:bg-[#f97386]/10 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => showToast('Struk berhasil dibagikan.')}
                  className="flex-1 py-2.5 bg-[#684cb6] hover:bg-[#5b3fa9] text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Struk</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: Laporan Penjualan */}
      {activeSubTab === 'reports' && (
        <div className="space-y-6 pb-6 animate-in fade-in duration-200">
          {/* 3 KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-6 rounded-2xl border border-[#e2e1f2] shadow-xs flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <h3 className="text-xs font-semibold text-[#5d5e6c]">Total Penjualan</h3>
                <div className="p-2.5 bg-[#a589f8]/20 rounded-xl text-[#684cb6]">
                  <Banknote className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-[#30323e]">Rp 24.5M</div>
              <div className="flex items-center gap-1 text-xs font-bold text-[#006d4b]">
                <TrendingUp className="w-4 h-4" />
                <span>+12.5% vs bulan lalu</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#e2e1f2] shadow-xs flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <h3 className="text-xs font-semibold text-[#5d5e6c]">Total Transaksi</h3>
                <div className="p-2.5 bg-[#eeecfa] rounded-xl text-[#684cb6]">
                  <Receipt className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-[#30323e]">1,245</div>
              <div className="flex items-center gap-1 text-xs font-bold text-[#006d4b]">
                <TrendingUp className="w-4 h-4" />
                <span>+5.2% vs bulan lalu</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#e2e1f2] shadow-xs flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <h3 className="text-xs font-semibold text-[#5d5e6c]">Rata-rata Transaksi</h3>
                <div className="p-2.5 bg-[#eeecfa] rounded-xl text-[#684cb6]">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-[#30323e]">Rp 196k</div>
              <div className="flex items-center gap-1 text-xs font-medium text-[#5d5e6c]">
                <span>Stabil vs bulan lalu</span>
              </div>
            </div>
          </div>

          {/* Chart & Top Products Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Trend Chart (2/3 width) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#e2e1f2] shadow-xs flex flex-col min-h-[400px]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-[#30323e]">Tren Penjualan</h3>
                  <p className="text-xs text-[#5d5e6c]">Pergerakan omset berdasarkan waktu</p>
                </div>
                <select
                  value={reportTimeframe}
                  onChange={(e) => setReportTimeframe(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl border border-[#e2e1f2] bg-[#fbf8ff] text-xs font-semibold text-[#30323e] focus:border-[#684cb6] outline-none cursor-pointer"
                >
                  <option value="Minggu Ini">Minggu Ini</option>
                  <option value="Bulan Ini">Bulan Ini</option>
                  <option value="Tahun Ini">Tahun Ini</option>
                </select>
              </div>

              <div className="flex-1 w-full min-h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eeecfa" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={{ stroke: '#e2e1f2' }}
                      tick={{ fill: '#5d5e6c', fontSize: 12 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#5d5e6c', fontSize: 11 }}
                      tickFormatter={(val) => `Rp ${val}M`}
                    />
                    <Tooltip
                      formatter={(val: any) => [`Rp ${val} Juta`, 'Penjualan']}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        borderColor: '#e2e1f2',
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#684cb6"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#ffffff', stroke: '#684cb6', strokeWidth: 2 }}
                      activeDot={{ r: 7, fill: '#684cb6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Products Card */}
            <div className="bg-white p-6 rounded-2xl border border-[#e2e1f2] shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#30323e] mb-4">Produk Terlaris</h3>
                <div className="space-y-4">
                  {[
                    {
                      name: 'Kopi Arabica 200g',
                      sold: 142,
                      revenue: 'Rp 6.3M',
                      image:
                        'https://lh3.googleusercontent.com/aida-public/AB6AXuCYBsO90B8QrHFt1vLAInQ7qk64939YOtvssEcCIu6noXTKND-dEE_mRm65xNBnNMRBe-C_6YVCsSn2UPG4-uRRf16j-F4zZblVEErUzeFt9nWgboX1C3EuvzVDhCO6ELc9SM4H1LvBldIlSc2Z_Jf2SqC7lS4UaDhp7omXMO5kg3LXllkpcXob7M1hY8EWr6QJcdtXpTgYvf_pHe69xWbvxoNPZmg512HvkkXlD95E72fFHyg8KUlJ',
                    },
                    {
                      name: 'Susu Almond 1L',
                      sold: 98,
                      revenue: 'Rp 3.4M',
                      image:
                        'https://lh3.googleusercontent.com/aida-public/AB6AXuAyDzyGuNnw3jCVOeSUY38ePQk7kGYrgaFSzM-mExRnEvOjs12G9TPhNHUxq-ULX0EYdOYLL3eKigDTh4OFEY4pptbpHKoqVzV6TlGYxlQZCQi_mGN3bnfP1KG7yF4vqdczZRi-Lu8AkNE4B2f0ArRIpzGopCsrwp4ASw7lg1HEvMQsDuhUgPHpd-Rb3C9X3k6SZZfhxC3uEYBWitFecuFiZxzOHFMUm1BCO5TczDzkTfk0gIwV_UeY',
                    },
                    {
                      name: 'Roti Gandum',
                      sold: 85,
                      revenue: 'Rp 2.1M',
                      image:
                        'https://lh3.googleusercontent.com/aida-public/AB6AXuBSYBHA8XOJbv29KNKXN_c2Gd5fsTd3d7bXrlLx_WFLpGwZcLk-Otk8MOmaNVyjlhPe5QRedLuBMCgRJKQEuTSApZvwg7h5hgB1OBchBnO-5f2qBhKimXCUr4Mb3N9F7wlhRkb4px7Elqi48mFm1fzUCiApmonXAaFlZnS-UkOuPZ48gNEXhEyqyKX3D29fwjEqh4rC692ZQqD0GwdVlcTRpPMdxG5Pv38D0ps8PbqmEXEDDR_JJnfT',
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2 hover:bg-[#f4f2fe] rounded-xl transition-colors cursor-pointer"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover border border-[#e2e1f2] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#30323e] truncate">{item.name}</p>
                        <p className="text-[11px] text-[#5d5e6c]">{item.sold} terjual</p>
                      </div>
                      <span className="text-xs font-bold text-[#684cb6]">{item.revenue}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setActiveTab('produk')}
                className="w-full mt-4 py-2 text-center text-xs font-bold text-[#684cb6] hover:underline cursor-pointer"
              >
                Lihat Semua Produk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-[#e2e1f2] shadow-2xl text-center animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-full bg-[#f97386]/20 text-[#a8364b] mx-auto flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-[#30323e] mb-2">
              {confirmModal.type === 'cancel' ? 'Batalkan Transaksi?' : 'Hapus Transaksi?'}
            </h3>
            <p className="text-xs text-[#5d5e6c] mb-6 leading-relaxed">
              {confirmModal.type === 'cancel'
                ? `Apakah Anda yakin ingin membatalkan transaksi "${confirmModal.transactionId}"? Stok produk akan dikembalikan otomatis ke sistem.`
                : `Apakah Anda yakin ingin menghapus data transaksi "${confirmModal.transactionId}" dari database secara permanen?`}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, type: 'cancel', transactionId: '' })}
                className="flex-1 h-11 rounded-xl border border-[#e2e1f2] text-xs font-semibold text-[#5d5e6c] hover:bg-[#f4f2fe] transition-colors cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (confirmModal.type === 'cancel') {
                    await cancelTransaction(confirmModal.transactionId);
                    showToast('Transaksi berhasil dibatalkan.');
                  } else {
                    await deleteTransaction(confirmModal.transactionId);
                    showToast('Transaksi berhasil dihapus.');
                  }
                  setConfirmModal({ isOpen: false, type: 'cancel', transactionId: '' });
                }}
                className="flex-1 h-11 rounded-xl bg-[#a8364b] hover:bg-[#6e0523] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                {confirmModal.type === 'cancel' ? 'Ya, Batalkan' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
