import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  AlertTriangle,
  X,
  Upload,
  Search,
  Filter,
  PackagePlus,
  PackageX,
  Wand2,
  Printer,
  Scan,
  Barcode as BarcodeIcon,
} from 'lucide-react';
import { usePos } from '../context/PosContext';
import { formatRupiah } from '../utils/formatters';
import { Product } from '../types';
import { BarcodeLabelModal } from './BarcodeLabelModal';
import { BarcodeScannerModal } from './BarcodeScannerModal';

export const ProductsView: React.FC = () => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    clearAllProducts,
    restockProduct,
    searchQuery,
  } = usePos();

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [localSearch, setLocalSearch] = useState<string>('');
  const [showAddEditModal, setShowAddEditModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);

  // Barcode Label & Scanner states
  const [showBarcodeModal, setShowBarcodeModal] = useState<boolean>(false);
  const [barcodeModalProduct, setBarcodeModalProduct] = useState<Product | null>(null);
  const [isFormScannerOpen, setIsFormScannerOpen] = useState<boolean>(false);

  // Quick Restock state
  const [restockTarget, setRestockTarget] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState<number>(10);
  const [restockReason, setRestockReason] = useState<string>('Restock / Pembelian');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Alat Tulis',
    price: 0,
    stock: 0,
    minStock: 10,
    image: '',
  });

  const presetImages = [
    {
      label: 'Buku Tulis',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9ua04qDIwT1f16PEFxvScHywVE6slqxYUr6ZzRArUIwPae_G67fpimRPIEdaeCxGp_XZrx_A5WoF8hwaYczqvUJyXnwGB-S11DhTeWE3dabKdBihce8W1yj9RqhmYFJ8rV-w5n3txKTsaykGDP4l8YjSHusWSu8BNqRubU3jNuDXU5Bk8K0xALpV_Uu644vTg2HdWuyjzH-lonaycom5HVQeIxxFlt96XpzC5GxryN_Lz2yA1py-R',
    },
    {
      label: 'Pensil',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfCazuFJdCIz6yf5pPi1x2AloRf2iFPnDZZqBjuAkDaYaESC3PkfCHD1U0oomvREExjrW1IF90pwTvNjmKTJnt4mRpZeSjcdbK8m_Y0yG15GPz8N-1lVBEAhjm4-1N44j_J08K8hZgoHKwNb1v8bn5hsA3OXlYSKYIqwkHw07_lTrzw8HaUk7ZGRCQHexRiJcLfmXy4mfF27upENsUS1YmxkNwnEbGj8DhKIR4hxQkhKYQbPfq5Ord',
    },
    {
      label: 'Penghapus',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArCrDomoMj7-QuJirQVLm64Tdq0R-NWccD84xjoFJL4D2uwy0-_kCNEHwcWDdDNGlKRe8vh4D3wWAvJdETFgjfyTHvhesgzVHuWEyjyA-_p-l-DC5XhptypFxYsZfrS5nBmQUntE00TdeJ-S-1gPck39dASngW_J5kTsfqrypY4U6h6zYBJoj0-m4MiS43rPVU8iS66LXsj88DKnsgaoMA7Her5U87cdIttnTxqQeA5VClcKjTa1DZ',
    },
    {
      label: 'Bolpoin',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqj4vey4rT0p7XVl1sd6abaJ9pRPYdgXKSbxez6Mjpqxefm1IX32BmRXs32FD9dW42NklHtHOPkLxHHGa5YQA8pHsnIsYmAWNJHohQmgObp8jrP7pSONY7-WV47tKnL07IFXSfOZsV21dRFrWGIeMG9GHASG2AYwf6FeKBLBfzXCbSpLyvF3fz7olfKKaVeX17W0NHSLFAhENVcDddPIbfxhmollAu-idhmESOFyzSkKuKMu51G-8P',
    },
    {
      label: 'Kertas HVS',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3SpatViRlg63lFCYyn31w1T8-Aj2E2pRQBliHBm-S-daAwdbVaqoYVY08J05eb0HRdFZhsFjc6gb9O2bWWVBKuEhYXo_4bH2Uu-eCuwkyzJVe3FD3Eqb0tz6zvksIIFza6iwvDMMW3kC7yHCu2Ae1r-JUfX8lQ2btYXGugfzvpblWn3GboscZG-UvS5YLEulJkezh-ghY2-Bkw_kZGkbx7ovEOkaouPQ0tdJqJkc1f_tplzemV30p',
    },
    {
      label: 'Makanan / Snack',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUOl0t-7PpULOdfBtMc5PgTNHprzse61NKK8els2O2d5xvidff14zz9xcSBPsovTSuPr-Si8S_wOvPub6pbWTvMMR7VDLlmSkztEa6Pa6IxHEX6LFfugA7B0rVfeTHnIBfvdtgAZ5JEs5M0jclQMEbyIAU3komqXFSet_NEfljTyai5i77US-hbNw2W9Sz7_JS0PeG_PhUxJYa4PE6rX-ZA4hVM26krI5tgl0kSnp6048SOrsTAo7s',
    },
    {
      label: 'Minuman Air Mineral',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB76irBNx0cKIUMg6M9qyjPJSUi4edba9KGMoPUGsm4qwMYGRb5C2L2cbhJ7gTIa9aC7NHB1ypwrNOWFrIEs6v5aG0IW-KEftq8P_kHJqycP77Paok69cQZznuwDevZBeOojhlbr-X8yhVaKoGSLg6xxVD6SbtosvGJOdqcYfZNUFvkmv8YQU9i-bGnvWpIjL7kKXcxrJBBjCjgZuuj50_Cw75_XS4gYSY64Nx1D8DtOduYwrrKlNPR',
    },
  ];

  const handleGenerateSku = () => {
    // Generate clean Indonesian retail standard barcode (899...) or category SKU
    const isEan = Math.random() > 0.4;
    if (isEan) {
      const randDigits = Math.floor(100000000 + Math.random() * 900000000);
      setFormData((prev) => ({ ...prev, sku: `899${randDigits}` }));
    } else {
      const prefix = (formData.category || 'PRD').slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'PRD');
      const rand = Math.floor(10000 + Math.random() * 90000);
      setFormData((prev) => ({ ...prev, sku: `${prefix}-${rand}` }));
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    const defCat = categories.find((c) => c.id !== 'all')?.name || 'Umum';
    setFormData({
      name: '',
      sku: `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
      category: defCat,
      price: 10000,
      stock: 50,
      minStock: 10,
      image: presetImages[0].url,
    });
    setShowAddEditModal(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      sku: prod.sku,
      category: prod.category,
      price: prod.price,
      stock: prod.stock,
      minStock: prod.minStock || 10,
      image: prod.image,
    });
    setShowAddEditModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim()) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        category: formData.category,
        price: Number(formData.price),
        stock: Number(formData.stock),
        minStock: Number(formData.minStock),
        image: formData.image || presetImages[0].url,
      });
    } else {
      addProduct({
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        category: formData.category,
        price: Number(formData.price),
        stock: Number(formData.stock),
        minStock: Number(formData.minStock),
        image: formData.image || presetImages[0].url,
      });
    }
    setShowAddEditModal(false);
  };

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      setProductToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const handleClearAllConfirm = async () => {
    setIsClearing(true);
    try {
      await clearAllProducts();
      setShowClearAllModal(false);
    } finally {
      setIsClearing(false);
    }
  };

  const handleQuickRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockTarget || restockQty === 0) return;
    restockProduct(restockTarget.id, Number(restockQty), restockReason);
    setRestockTarget(null);
  };

  // Filter products by category and global/local search
  const filteredProducts = products.filter((p) => {
    const matchesCat = !selectedCategory || p.category === selectedCategory;
    const q = (localSearch || searchQuery).toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#30323e] tracking-tight">
            Katalog Produk
          </h2>
          <p className="text-xs md:text-sm text-[#5d5e6c] mt-1">
            Kelola data produk, harga jual, barcode/SKU, dan mutasi stok barang.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Local Search Input */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#797988]" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Cari nama atau SKU..."
              className="w-full h-11 pl-9 pr-3 rounded-xl border border-[#e2e1f2] bg-white text-xs md:text-sm text-[#30323e] focus:border-[#684cb6] outline-none"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => setLocalSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#797988] hover:text-[#30323e]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="relative flex-1 sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-11 pl-4 pr-10 rounded-xl border border-[#e2e1f2] bg-white text-xs md:text-sm text-[#30323e] focus:border-[#684cb6] focus:ring-1 focus:ring-[#684cb6] outline-none appearance-none cursor-pointer"
            >
              <option value="">Semua Kategori</option>
              {categories
                .filter((c) => c.id !== 'all')
                .map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
            </select>
            <Filter className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#797988] pointer-events-none" />
          </div>

          {products.length > 0 && (
            <button
              id="btn-cetak-label-barcode"
              type="button"
              onClick={() => {
                setBarcodeModalProduct(null);
                setShowBarcodeModal(true);
              }}
              className="bg-white border border-[#684cb6]/40 hover:bg-[#f4f2fe] active:scale-[0.98] text-[#684cb6] font-semibold text-xs md:text-sm px-4 h-11 rounded-xl flex items-center gap-2 shadow-xs transition-all whitespace-nowrap cursor-pointer"
              title="Cetak Stiker Label Barcode Harga untuk Rak / Display Toko"
            >
              <Printer className="w-4 h-4 text-[#684cb6]" />
              <span>Cetak Label Barcode</span>
            </button>
          )}

          {products.length > 0 && (
            <button
              id="btn-kosongkan-produk"
              type="button"
              onClick={() => setShowClearAllModal(true)}
              className="border border-[#f97386]/60 hover:bg-[#f97386]/15 active:scale-[0.98] text-[#a8364b] font-semibold text-xs md:text-sm px-4 h-11 rounded-xl flex items-center gap-1.5 shadow-xs transition-all whitespace-nowrap cursor-pointer"
              title="Kosongkan Semua Produk dari Database"
            >
              <Trash2 className="w-4 h-4 text-[#a8364b]" />
              <span>Kosongkan Semua</span>
            </button>
          )}

          <button
            id="btn-tambah-produk"
            onClick={handleOpenAddModal}
            className="bg-[#684cb6] hover:bg-[#5b3fa9] active:scale-[0.98] text-[#fdf7ff] font-semibold text-xs md:text-sm px-5 h-11 rounded-xl flex items-center gap-2 shadow-xs transition-all whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* Product Table Container */}
      <div className="bg-white rounded-2xl border border-[#e2e1f2] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f4f2fe]/60 border-b border-[#e2e1f2]">
                <th className="p-4 text-xs font-semibold text-[#5d5e6c]">ID</th>
                <th className="p-4 text-xs font-semibold text-[#5d5e6c]">Gambar</th>
                <th className="p-4 text-xs font-semibold text-[#5d5e6c]">Nama Produk</th>
                <th className="p-4 text-xs font-semibold text-[#5d5e6c]">SKU</th>
                <th className="p-4 text-xs font-semibold text-[#5d5e6c]">Kategori</th>
                <th className="p-4 text-xs font-semibold text-[#5d5e6c]">Harga</th>
                <th className="p-4 text-xs font-semibold text-[#5d5e6c]">Stok</th>
                <th className="p-4 text-xs font-semibold text-[#5d5e6c] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e1f2]/60 text-sm">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const isOutOfStock = product.stock === 0;
                  const isLowStock = product.stock <= (product.minStock || 10);
                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-[#f4f2fe]/70 transition-colors group"
                    >
                      <td className="p-4 text-xs font-medium text-[#5d5e6c]">
                        {product.id}
                      </td>
                      <td className="p-4">
                        <div className="w-12 h-12 rounded-xl bg-[#f4f2fe] overflow-hidden border border-[#e2e1f2] shrink-0">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-[#30323e]">
                        {product.name}
                        {isLowStock && !isOutOfStock && (
                          <span className="block text-[10px] text-amber-700 font-normal">
                            Stok menipis (&le; {product.minStock || 10})
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-xs font-mono">
                        <button
                          type="button"
                          onClick={() => {
                            setBarcodeModalProduct(product);
                            setShowBarcodeModal(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#f4f2fe] hover:bg-[#a589f8]/20 text-[#684cb6] border border-[#e2e1f2] transition-colors cursor-pointer group/barcode"
                          title="Klik untuk lihat & cetak barcode produk ini"
                        >
                          <BarcodeIcon className="w-3.5 h-3.5 text-[#684cb6] shrink-0" />
                          <span>{product.sku}</span>
                        </button>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#e3e1ec] text-[#515159] text-xs font-medium">
                          {product.category}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-[#684cb6]">
                        {formatRupiah(product.price)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold border ${
                            isOutOfStock
                              ? 'bg-[#f97386]/20 text-[#a8364b] border-[#f97386]/40'
                              : isLowStock
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-[#6bffc1]/20 text-[#006d4b] border-[#6bffc1]/30'
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          {/* Quick Restock Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setRestockTarget(product);
                              setRestockQty(10);
                              setRestockReason('Restock / Pembelian');
                            }}
                            className="p-2 text-[#5d5e6c] hover:text-[#006d4b] hover:bg-[#6bffc1]/20 rounded-lg transition-colors cursor-pointer"
                            title="Atur / Tambah Stok Cepat"
                          >
                            <PackagePlus className="w-4 h-4" />
                          </button>

                          {/* Cetak Barcode Produk */}
                          <button
                            type="button"
                            onClick={() => {
                              setBarcodeModalProduct(product);
                              setShowBarcodeModal(true);
                            }}
                            className="p-2 text-[#5d5e6c] hover:text-[#684cb6] hover:bg-[#a589f8]/15 rounded-lg transition-colors cursor-pointer"
                            title="Tampilkan & Cetak Label Barcode"
                          >
                            <BarcodeIcon className="w-4 h-4 text-[#684cb6]" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(product)}
                            className="p-2 text-[#5d5e6c] hover:text-[#684cb6] hover:bg-[#f4f2fe] rounded-lg transition-colors cursor-pointer"
                            title="Edit Produk"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setProductToDelete(product);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-[#5d5e6c] hover:text-[#a8364b] hover:bg-[#f97386]/20 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                      <div className="w-16 h-16 rounded-2xl bg-[#f4f2fe] text-[#684cb6] flex items-center justify-center mb-4">
                        <PackageX className="w-8 h-8" />
                      </div>
                      <h4 className="text-base font-bold text-[#30323e] mb-1">Semua Produk Telah Dikosongkan</h4>
                      <p className="text-xs text-[#5d5e6c] mb-5 leading-relaxed">
                        Basis data produk saat ini kosong (0 barang). Silakan tambahkan produk baru untuk mulai mencatat stok dan transaksi penjualan.
                      </p>
                      <button
                        id="btn-tambah-produk-empty"
                        onClick={handleOpenAddModal}
                        className="bg-[#684cb6] hover:bg-[#5b3fa9] active:scale-[0.98] text-[#fdf7ff] font-semibold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Produk Baru</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-sm text-[#5d5e6c]">
                    Tidak ada produk yang cocok dengan pencarian atau filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-[#e2e1f2] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#e2e1f2] flex items-center justify-between bg-[#fbf8ff]">
              <h3 className="text-lg font-bold text-[#30323e]">
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddEditModal(false)}
                className="p-1 rounded-lg text-[#5d5e6c] hover:bg-[#f4f2fe]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-sm">
              {/* Product Image Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#5d5e6c] mb-2">
                  Gambar Produk
                </label>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-16 h-16 rounded-xl border border-[#e2e1f2] overflow-hidden bg-[#f4f2fe] shrink-0">
                    {formData.image ? (
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#797988]">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-semibold text-[#30323e] mb-1">Pilih Gambar Preset Cepat:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {presetImages.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setFormData({ ...formData, image: img.url })}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
                            formData.image === img.url
                              ? 'bg-[#684cb6] text-white border-[#684cb6]'
                              : 'bg-[#f4f2fe] text-[#5d5e6c] border-[#e2e1f2] hover:bg-[#e2e1f2]'
                          }`}
                        >
                          {img.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="Atau masukkan URL Gambar Produk..."
                    className="w-full h-10 px-3 rounded-xl border border-[#e2e1f2] text-xs focus:border-[#684cb6] focus:ring-1 focus:ring-[#684cb6] outline-none"
                  />
                </div>
              </div>

              {/* Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#5d5e6c] mb-1.5">
                    Nama Produk <span className="text-[#a8364b]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Kertas HVS A4 80gr"
                    className="w-full h-11 px-4 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] focus:ring-1 focus:ring-[#684cb6] outline-none text-sm"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#5d5e6c]">
                      Barcode / SKU <span className="text-[#a8364b]">*</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsFormScannerOpen(true)}
                        className="text-[11px] font-semibold text-[#684cb6] hover:bg-[#a589f8]/15 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        title="Scan Barcode Kemasan Fisik Menggunakan Kamera"
                      >
                        <Scan className="w-3 h-3" /> Scan Barcode
                      </button>
                      <button
                        type="button"
                        onClick={handleGenerateSku}
                        className="text-[11px] font-semibold text-[#684cb6] hover:underline flex items-center gap-1 cursor-pointer"
                        title="Generate Barcode / SKU Otomatis"
                      >
                        <Wand2 className="w-3 h-3" /> Auto
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="Contoh: 8991002102938 atau KRT-A4-01"
                      className="w-full h-11 pl-4 pr-10 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] focus:ring-1 focus:ring-[#684cb6] outline-none text-sm font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setIsFormScannerOpen(true)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#797988] hover:text-[#684cb6] transition-colors cursor-pointer"
                      title="Buka Kamera Barcode"
                    >
                      <Scan className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-[#797988] mt-1">
                    Bisa scan langsung barcode kemasan fisik barang atau generate otomatis.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5d5e6c] mb-1.5">
                    Kategori <span className="text-[#a8364b]">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] focus:ring-1 focus:ring-[#684cb6] outline-none text-sm bg-white cursor-pointer"
                  >
                    {categories
                      .filter((c) => c.id !== 'all')
                      .map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5d5e6c] mb-1.5">
                    Harga Jual (Rp) <span className="text-[#a8364b]">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full h-11 px-4 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] focus:ring-1 focus:ring-[#684cb6] outline-none text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5d5e6c] mb-1.5">
                    Stok Sekarang <span className="text-[#a8364b]">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full h-11 px-4 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] focus:ring-1 focus:ring-[#684cb6] outline-none text-sm font-semibold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#5d5e6c] mb-1.5">
                    Batas Minimum Stok (Peringatan Menipis)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                    className="w-full h-11 px-4 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] outline-none text-sm"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-[#e2e1f2] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="px-5 h-11 rounded-xl border border-[#e2e1f2] text-xs font-semibold text-[#5d5e6c] hover:bg-[#f4f2fe] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 h-11 rounded-xl bg-[#684cb6] hover:bg-[#5b3fa9] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {editingProduct ? 'Simpan Perubahan' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Restock Modal */}
      {restockTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-[#e2e1f2] shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-[#30323e] flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-[#684cb6]" />
                Atur Stok Barang
              </h3>
              <button
                type="button"
                onClick={() => setRestockTarget(null)}
                className="p-1 rounded-lg text-[#797988] hover:text-[#30323e]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#fbf8ff] p-3 rounded-xl border border-[#e2e1f2] mb-4">
              <p className="font-semibold text-xs text-[#30323e]">{restockTarget.name}</p>
              <p className="text-[11px] text-[#5d5e6c]">Stok saat ini: <strong className="text-[#684cb6] font-bold">{restockTarget.stock} unit</strong></p>
            </div>

            <form onSubmit={handleQuickRestockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5d5e6c] mb-1.5">
                  Jumlah Tambahan / Penyesuaian (+ atau -)
                </label>
                <input
                  type="number"
                  required
                  value={restockQty}
                  onChange={(e) => setRestockQty(Number(e.target.value))}
                  className="w-full h-11 px-4 rounded-xl border border-[#e2e1f2] text-sm font-bold text-[#30323e] focus:border-[#684cb6] outline-none"
                  placeholder="Contoh: 20 atau -5"
                />
                <p className="text-[11px] text-[#797988] mt-1">
                  Stok baru akan menjadi: <strong className="text-[#30323e]">{Math.max(0, restockTarget.stock + Number(restockQty || 0))} unit</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5d5e6c] mb-1.5">
                  Alasan Penyesuaian
                </label>
                <select
                  value={restockReason}
                  onChange={(e) => setRestockReason(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-[#e2e1f2] text-xs text-[#30323e] bg-white outline-none cursor-pointer"
                >
                  <option value="Restock / Pembelian">Restock / Pembelian Supplier</option>
                  <option value="Koreksi Stok">Koreksi Stok Opname</option>
                  <option value="Barang Rusak / Kadaluarsa">Barang Rusak / Kadaluarsa</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setRestockTarget(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#e2e1f2] text-xs font-semibold text-[#5d5e6c] hover:bg-[#f4f2fe] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#684cb6] hover:bg-[#5b3fa9] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Terapkan Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-[#e2e1f2] shadow-2xl text-center animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-full bg-[#f97386]/20 text-[#a8364b] mx-auto flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-[#30323e] mb-2">Hapus Produk?</h3>
            <p className="text-xs text-[#5d5e6c] mb-6">
              Apakah Anda yakin ingin menghapus <strong className="text-[#30323e]">"{productToDelete.name}"</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 h-11 rounded-xl border border-[#e2e1f2] text-xs font-semibold text-[#5d5e6c] hover:bg-[#f4f2fe] transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 h-11 rounded-xl bg-[#a8364b] hover:bg-[#6e0523] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-[#e2e1f2] shadow-2xl text-center animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-full bg-[#f97386]/20 text-[#a8364b] mx-auto flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-[#30323e] mb-2">Kosongkan Semua Produk?</h3>
            <p className="text-xs text-[#5d5e6c] mb-6 leading-relaxed">
              Tindakan ini akan <strong className="text-[#a8364b]">menghapus seluruh {products.length} produk</strong> dari database. Produk yang sudah dihapus tidak dapat dipulihkan. Apakah Anda yakin?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={isClearing}
                onClick={() => setShowClearAllModal(false)}
                className="flex-1 h-11 rounded-xl border border-[#e2e1f2] text-xs font-semibold text-[#5d5e6c] hover:bg-[#f4f2fe] transition-colors cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isClearing}
                onClick={handleClearAllConfirm}
                className="flex-1 h-11 rounded-xl bg-[#a8364b] hover:bg-[#6e0523] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isClearing ? (
                  <span>Mengosongkan...</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Ya, Kosongkan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Barcode Label Generator & Print Modal */}
      {showBarcodeModal && (
        <BarcodeLabelModal
          isOpen={showBarcodeModal}
          onClose={() => {
            setShowBarcodeModal(false);
            setBarcodeModalProduct(null);
          }}
          product={barcodeModalProduct}
          allProducts={products}
        />
      )}

      {/* Form Barcode Camera Scanner Modal */}
      {isFormScannerOpen && (
        <BarcodeScannerModal
          isOpen={isFormScannerOpen}
          onClose={() => setIsFormScannerOpen(false)}
          onScanResult={(scannedCode) => {
            setFormData((prev) => ({ ...prev, sku: scannedCode }));
            setIsFormScannerOpen(false);
          }}
          title="Scan Barcode Kemasan Produk"
          subtitle="Arahkan kamera ke barcode kemasan barang untuk otomatis mengisi kolom SKU"
        />
      )}
    </div>
  );
};
