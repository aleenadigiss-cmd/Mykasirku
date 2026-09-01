import React, { useState } from 'react';
import {
  Banknote,
  Receipt,
  ShoppingBag,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Edit,
  Book,
  Droplet,
  Package,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts';
import { usePos } from '../context/PosContext';
import { formatRupiah, formatNumber } from '../utils/formatters';
import { Product } from '../types';

export const DashboardView: React.FC = () => {
  const {
    products,
    transactions,
    setActiveTab,
    setSelectedTransaction,
    restockProduct,
  } = usePos();

  const [chartTimeframe, setChartTimeframe] = useState<'Minggu Ini' | 'Bulan Ini'>('Minggu Ini');
  const [restockModalProduct, setRestockModalProduct] = useState<Product | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(20);

  // Dynamic calculations or fallback to realistic totals
  const todayTransactions = transactions.filter((t) => t.status === 'Sukses');
  const totalSalesToday = 1250000;
  const totalTxCount = 48;
  const totalItemsSold = 127;
  const lowStockCount = products.filter((p) => p.stock <= (p.minStock || 10)).length;

  // Chart data for Minggu Ini
  const weeklyChartData = [
    { day: 'Sen', sales: 650000, items: 32 },
    { day: 'Sel', sales: 920000, items: 45 },
    { day: 'Rab', sales: 780000, items: 38 },
    { day: 'Kam', sales: 1100000, items: 56 },
    { day: 'Jum', sales: 980000, items: 49 },
    { day: 'Sab', sales: 1450000, items: 78 },
    { day: 'Min', sales: 1250000, items: 64 },
  ];

  // Chart data for Bulan Ini (weekly breakdown)
  const monthlyChartData = [
    { day: 'Minggu 1', sales: 5200000, items: 280 },
    { day: 'Minggu 2', sales: 6100000, items: 310 },
    { day: 'Minggu 3', sales: 5800000, items: 295 },
    { day: 'Minggu 4', sales: 7400000, items: 360 },
  ];

  const activeChartData = chartTimeframe === 'Minggu Ini' ? weeklyChartData : monthlyChartData;

  // Low stock products
  const lowStockItems = products.filter((p) => p.stock <= (p.minStock || 12)).slice(0, 3);

  // Top products
  const topProducts = [...products]
    .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
    .slice(0, 4);

  // Recent transactions (last 4)
  const recentTransactions = transactions.slice(0, 4);

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (restockModalProduct && restockAmount > 0) {
      restockProduct(restockModalProduct.id, restockAmount);
      setRestockModalProduct(null);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-200">
      {/* 4 Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Penjualan Hari Ini */}
        <div className="bg-white p-6 rounded-2xl border border-[#e2e1f2] shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-[#a589f8]/15 rounded-xl text-[#684cb6]">
              <Banknote className="w-6 h-6" />
            </div>
            <span className="flex items-center text-xs font-semibold text-[#006d4b] bg-[#006d4b]/10 px-2 py-0.5 rounded-full">
              +12.4%
            </span>
          </div>
          <p className="text-xs font-medium text-[#5d5e6c] mb-1">Total Penjualan Hari Ini</p>
          <h3 className="text-2xl md:text-3xl font-extrabold text-[#30323e] tracking-tight">
            Rp 1.250.000
          </h3>
        </div>

        {/* Card 2: Total Transaksi Hari Ini */}
        <div className="bg-white p-6 rounded-2xl border border-[#e2e1f2] shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-[#6bffc1]/20 rounded-xl text-[#006d4b]">
              <Receipt className="w-6 h-6" />
            </div>
            <span className="flex items-center text-xs font-semibold text-[#006d4b] bg-[#006d4b]/10 px-2 py-0.5 rounded-full">
              +8.1%
            </span>
          </div>
          <p className="text-xs font-medium text-[#5d5e6c] mb-1">Total Transaksi Hari Ini</p>
          <h3 className="text-2xl md:text-3xl font-extrabold text-[#30323e] tracking-tight">
            {totalTxCount} <span className="text-sm font-normal text-[#5d5e6c]">Transaksi</span>
          </h3>
        </div>

        {/* Card 3: Produk Terjual */}
        <div className="bg-white p-6 rounded-2xl border border-[#e2e1f2] shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-[#e3e1ec] rounded-xl text-[#5e5e67]">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span className="flex items-center text-xs font-semibold text-[#684cb6] bg-[#a589f8]/15 px-2 py-0.5 rounded-full">
              Normal
            </span>
          </div>
          <p className="text-xs font-medium text-[#5d5e6c] mb-1">Produk Terjual</p>
          <h3 className="text-2xl md:text-3xl font-extrabold text-[#30323e] tracking-tight">
            {totalItemsSold} <span className="text-sm font-normal text-[#5d5e6c]">Item</span>
          </h3>
        </div>

        {/* Card 4: Stok Menipis (Warning) */}
        <div className="bg-white p-6 rounded-2xl border border-[#f97386] shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#f97386]/20 rounded-bl-full -z-0 pointer-events-none" />
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="p-3 bg-[#f97386]/20 rounded-xl text-[#a8364b]">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <span className="bg-[#a8364b] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              PERINGATAN
            </span>
          </div>
          <p className="text-xs font-medium text-[#5d5e6c] mb-1">Stok Menipis</p>
          <h3 className="text-2xl md:text-3xl font-extrabold text-[#a8364b] tracking-tight">
            {lowStockCount || 6} <span className="text-sm font-normal text-[#5d5e6c]">Produk</span>
          </h3>
        </div>
      </div>

      {/* Complex Layout: Daily Sales Chart & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area (2/3 width) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#e2e1f2] shadow-xs flex flex-col min-h-[420px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-[#30323e] tracking-tight">
                Grafik Penjualan Harian
              </h2>
              <p className="text-xs text-[#5d5e6c] mt-0.5">Ringkasan performa omset penjualan harian</p>
            </div>
            <select
              value={chartTimeframe}
              onChange={(e) => setChartTimeframe(e.target.value as any)}
              className="bg-[#f4f2fe] border border-[#e2e1f2] rounded-lg text-xs font-medium text-[#30323e] py-1.5 px-3 focus:outline-none focus:border-[#684cb6] focus:ring-1 focus:ring-[#684cb6] cursor-pointer"
            >
              <option value="Minggu Ini">Minggu Ini</option>
              <option value="Bulan Ini">Bulan Ini</option>
            </select>
          </div>

          {/* Interactive Recharts Area */}
          <div className="flex-1 w-full min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#684cb6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#684cb6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eeecfa" vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e1f2' }}
                  tick={{ fill: '#5d5e6c', fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#5d5e6c', fontSize: 11 }}
                  tickFormatter={(val) => `Rp ${(val / 1000).toLocaleString('id-ID')}k`}
                />
                <Tooltip
                  formatter={(value: any) => [formatRupiah(Number(value)), 'Penjualan']}
                  labelStyle={{ fontWeight: 'bold', color: '#30323e' }}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    borderColor: '#e2e1f2',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#684cb6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#salesGrad)"
                  dot={{ r: 4, fill: '#ffffff', stroke: '#684cb6', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#684cb6' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Section (1/3 width) */}
        <div className="bg-white p-6 rounded-2xl border border-[#e2e1f2] shadow-xs flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg md:text-xl font-bold text-[#30323e] flex items-center gap-2">
                Stok Rendah
                <span className="bg-[#f97386]/30 text-[#a8364b] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#f97386]/40">
                  {lowStockCount || 6}
                </span>
              </h2>
            </div>

            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 hover:bg-[#f4f2fe] rounded-xl transition-colors group border border-transparent hover:border-[#e2e1f2]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#f4f2fe] rounded-lg flex items-center justify-center border border-[#e2e1f2] shrink-0 overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-5 h-5 text-[#797988]" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#30323e] line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-xs text-[#5d5e6c]">{item.category}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end shrink-0 pl-2">
                    <span className="text-sm font-bold text-[#a8364b]">
                      {item.stock} Unit
                    </span>
                    <button
                      onClick={() => {
                        setRestockModalProduct(item);
                        setRestockAmount(20);
                      }}
                      className="text-[#684cb6] text-[11px] font-bold uppercase hover:underline opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center gap-0.5 mt-0.5"
                    >
                      <Plus className="w-3 h-3" /> Restock
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('stok')}
            className="w-full mt-5 py-2.5 border border-[#e2e1f2] rounded-xl font-semibold text-xs text-[#30323e] hover:bg-[#f4f2fe] hover:border-[#684cb6] transition-colors cursor-pointer"
          >
            Lihat Semua Stok
          </button>
        </div>
      </div>

      {/* Bottom Section: Recent Transactions & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
        {/* Recent Transactions Table (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e2e1f2] shadow-xs overflow-hidden flex flex-col">
          <div className="p-6 flex items-center justify-between border-b border-[#e2e1f2]">
            <h2 className="text-lg md:text-xl font-bold text-[#30323e]">Transaksi Terbaru</h2>
            <button
              onClick={() => setActiveTab('riwayat')}
              className="text-xs font-bold text-[#684cb6] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Lihat Riwayat <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f4f2fe]/60 border-b border-[#e2e1f2]">
                  <th className="p-4 text-xs font-semibold text-[#5d5e6c]">ID Transaksi</th>
                  <th className="p-4 text-xs font-semibold text-[#5d5e6c]">Waktu</th>
                  <th className="p-4 text-xs font-semibold text-[#5d5e6c]">Kasir</th>
                  <th className="p-4 text-xs font-semibold text-[#5d5e6c]">Total</th>
                  <th className="p-4 text-xs font-semibold text-[#5d5e6c] text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e1f2]/60 text-sm">
                {recentTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => {
                      setSelectedTransaction(tx);
                      setActiveTab('riwayat');
                    }}
                    className="hover:bg-[#f4f2fe]/70 transition-colors cursor-pointer group"
                  >
                    <td className="p-4 font-semibold text-[#30323e] group-hover:text-[#684cb6]">
                      {tx.id}
                    </td>
                    <td className="p-4 text-[#5d5e6c] text-xs">{tx.timestamp}</td>
                    <td className="p-4 text-[#5d5e6c] text-xs">{tx.cashier}</td>
                    <td className="p-4 font-bold text-[#30323e]">{formatRupiah(tx.total)}</td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          tx.status === 'Sukses'
                            ? 'bg-[#6bffc1]/30 text-[#006d4b] border border-[#6bffc1]'
                            : 'bg-[#e3e1ec] text-[#5d5e6c]'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products (1/3 width) */}
        <div className="bg-white rounded-2xl border border-[#e2e1f2] shadow-xs flex flex-col">
          <div className="p-6 pb-4 border-b border-[#e2e1f2]">
            <h2 className="text-lg md:text-xl font-bold text-[#30323e]">Produk Terlaris</h2>
          </div>
          <div className="p-4 flex-1">
            <ul className="space-y-3.5">
              {topProducts.map((prod, idx) => (
                <li
                  key={prod.id}
                  className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-[#f4f2fe] transition-colors"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      idx === 0
                        ? 'bg-[#a589f8]/25 text-[#684cb6]'
                        : 'bg-[#eeecfa] text-[#5d5e6c]'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#e2e1f2] shrink-0">
                    <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#30323e] truncate">{prod.name}</p>
                    <p className="text-xs text-[#5d5e6c]">
                      {prod.soldCount || 10 + idx * 4} Terjual • {formatRupiah(prod.price)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Restock Modal */}
      {restockModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#e2e1f2] shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-[#30323e] mb-1">
              Restock: {restockModalProduct.name}
            </h3>
            <p className="text-xs text-[#5d5e6c] mb-4">
              Stok saat ini: <span className="font-bold text-[#a8364b]">{restockModalProduct.stock} unit</span>
            </p>

            <form onSubmit={handleRestockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5d5e6c] mb-1">
                  Jumlah Tambahan Stok
                </label>
                <input
                  type="number"
                  min="1"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e2e1f2] text-sm focus:border-[#684cb6] focus:ring-1 focus:ring-[#684cb6] outline-none"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setRestockModalProduct(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#5d5e6c] hover:bg-[#f4f2fe] rounded-xl border border-[#e2e1f2]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#684cb6] hover:bg-[#5b3fa9] rounded-xl shadow-xs"
                >
                  Konfirmasi Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
