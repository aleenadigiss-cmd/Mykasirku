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
} from 'lucide-react';
import { usePos } from '../context/PosContext';
import { formatRupiah } from '../utils/formatters';
import { Product } from '../types';

export const ProductsView: React.FC = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct, searchQuery } = usePos();

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showAddEditModal, setShowAddEditModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

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

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `SKU-${Date.now().toString().slice(-4)}`,
      category: categories[1]?.name || 'Alat Tulis',
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
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        price: Number(formData.price),
        stock: Number(formData.stock),
        minStock: Number(formData.minStock),
        image: formData.image || presetImages[0].url,
      });
    } else {
      addProduct({
        name: formData.name,
        sku: formData.sku,
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

  // Filter products by category and global/local search
  const filteredProducts = products.filter((p) => {
    const matchesCat = !selectedCategory || p.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
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
            Produk
          </h2>
          <p className="text-xs md:text-sm text-[#5d5e6c] mt-1">
            Kelola data produk, harga, dan stok.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-52">
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
                      </td>
                      <td className="p-4 text-xs font-mono text-[#5d5e6c]">
                        {product.sku}
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
                              : product.stock <= (product.minStock || 10)
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-[#6bffc1]/20 text-[#006d4b] border-[#6bffc1]/30'
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="p-2 text-[#5d5e6c] hover:text-[#684cb6] hover:bg-[#f4f2fe] rounded-lg transition-colors cursor-pointer"
                            title="Edit Produk"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
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
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
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
                  <label className="block text-xs font-semibold text-[#5d5e6c] mb-1.5">
                    SKU (Kode Unik) <span className="text-[#a8364b]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Contoh: KRT-A4-01"
                    className="w-full h-11 px-4 rounded-xl border border-[#e2e1f2] focus:border-[#684cb6] focus:ring-1 focus:ring-[#684cb6] outline-none text-sm font-mono"
                  />
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
                    Stok Awal <span className="text-[#a8364b]">*</span>
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
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-[#e2e1f2] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="px-5 h-11 rounded-xl border border-[#e2e1f2] text-xs font-semibold text-[#5d5e6c] hover:bg-[#f4f2fe] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 h-11 rounded-xl bg-[#684cb6] hover:bg-[#5b3fa9] text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  {editingProduct ? 'Simpan Perubahan' : 'Simpan Produk'}
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
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 h-11 rounded-xl border border-[#e2e1f2] text-xs font-semibold text-[#5d5e6c] hover:bg-[#f4f2fe] transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 h-11 rounded-xl bg-[#a8364b] hover:bg-[#6e0523] text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
