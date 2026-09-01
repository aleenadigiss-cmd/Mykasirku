import React, { useState } from 'react';
import {
  Layers,
  AlertTriangle,
  Plus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { usePos } from '../context/PosContext';
import { formatRupiah } from '../utils/formatters';
import { Product } from '../types';

export const StockView: React.FC = () => {
  const { products, restockProduct, stockLogs, activeCashier } = usePos();

  const [filterType, setFilterType] = useState<'all' | 'low' | 'out'>('all');
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState<number>(50);
  const [reason, setReason] = useState<string>('Restock / Pembelian');

  const filteredProducts = products.filter((p) => {
    const isOut = p.stock === 0;
    const isLow = p.stock > 0 && p.stock <= (p.minStock || 10);

    if (filterType === 'low' && !isLow) return false;
    if (filterType === 'out' && !isOut) return false;

    const q = search.toLowerCase().trim();
    return (
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  const lowCount = products.filter((p) => p.stock > 0 && p.stock <= (p.minStock || 10)).length;
  const outCount = products.filter((p) => p.stock === 0).length;

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProduct && restockQty > 0) {
      restockProduct(selectedProduct.id, restockQty, reason);
      setSelectedProduct(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#30323e] tracking-tight">
            Manajemen Stok & Inventaris
          </h2>
          <p className="text-xs md:text-sm text-[#5d5e6c] mt-1">
            Pantau ketersediaan produk dan lakukan restock barang masuk.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filterType === 'all'
                ? 'bg-[#684cb6] text-white'
                : 'bg-white border border-[#e2e1f2] text-[#5d5e6c] hover:bg-[#f4f2fe]'
            }`}
          >
            Semua ({products.length})
          </button>
          <button
            onClick={() => setFilterType('low')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 ${
              filterType === 'low'
                ? 'bg-amber-600 text-white'
                : 'bg-white border border-[#e2e1f2] text-amber-700 hover:bg-amber-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Menipis ({lowCount})
          </button>
          <button
            onClick={() => setFilterType('out')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 ${
              filterType === 'out'
                ? 'bg-[#a8364b] text-white'
                : 'bg-white border border-[#e2e1f2] text-[#a8364b] hover:bg-red-50'
            }`}
          >
            Habis ({outCount})
          </button>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="bg-white rounded-2xl border border-[#e2e1f2] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#e2e1f2] flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#797988]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama produk atau SKU..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e2e1f2] bg-[#fbf8ff] text-xs font-medium text-[#30323e] focus:border-[#684cb6] outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f4f2fe]/60 border-b border-[#e2e1f2]">
                <th className="p-4 text-xs font-semibold text-[#5d5e6c]">Produk</th>
                <th className="p-4 text-xs font-semibold text-[#5d5e6c]">SKU</th>
                <th className="p-4 text-xs font-semibold text-[#5d5e6c]">Kategori</th>
                <th className="p-4 text-xs font-semibold text-[#5d5e6c]">Stok Saat Ini</th>
                <th className="p-4 text-xs font-semibold text-[#5d5e6c]">Batas Minimum</th>
                <th className="p-4 text-xs font-semibold text-[#5d5e6c]">Status</th>
                <th className="p-4 text-xs font-semibold text-[#5d5e6c] text-right">Aksi Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e1f2]/60 text-sm">
              {filteredProducts.map((p) => {
                const isOut = p.stock === 0;
                const isLow = p.stock > 0 && p.stock <= (p.minStock || 10);
                return (
                  <tr key={p.id} className="hover:bg-[#f4f2fe]/70 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#e2e1f2] bg-[#f4f2fe] shrink-0">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-semibold text-[#30323e]">{p.name}</span>
                    </td>
                    <td className="p-4 text-xs font-mono text-[#5d5e6c]">{p.sku}</td>
                    <td className="p-4 text-xs text-[#5d5e6c]">{p.category}</td>
                    <td className="p-4 font-bold text-[#30323e]">{p.stock} Unit</td>
                    <td className="p-4 text-xs text-[#5d5e6c]">{p.minStock || 10} Unit</td>
                    <td className="p-4">
                      {isOut ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#f97386]/20 text-[#a8364b] border border-[#f97386]/40">
                          Habis
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          Menipis
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#6bffc1]/20 text-[#006d4b] border border-[#6bffc1]/30">
                          Aman
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedProduct(p);
                          setRestockQty(50);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#684cb6] hover:bg-[#5b3fa9] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Restock</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#e2e1f2] shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-[#30323e] mb-1">
              Restock: {selectedProduct.name}
            </h3>
            <p className="text-xs text-[#5d5e6c] mb-4">
              Stok saat ini: <strong className="text-[#30323e]">{selectedProduct.stock} unit</strong>
            </p>

            <form onSubmit={handleRestockSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-[#5d5e6c] mb-1">
                  Jumlah Penambahan Stok (Unit)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={restockQty}
                  onChange={(e) => setRestockQty(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5d5e6c] mb-1">
                  Alasan Penyesuaian
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e2e1f2] bg-white focus:border-[#684cb6] outline-none text-xs"
                >
                  <option value="Restock / Pembelian">Restock / Pembelian Baru</option>
                  <option value="Penyesuaian Manual">Penyesuaian Stok Fisik</option>
                  <option value="Barang Rusak / Hilang">Barang Rusak / Hilang</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-[#e2e1f2]">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 rounded-xl border border-[#e2e1f2] text-xs font-semibold text-[#5d5e6c] hover:bg-[#f4f2fe]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#684cb6] hover:bg-[#5b3fa9] text-white text-xs font-bold shadow-xs"
                >
                  Simpan Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
