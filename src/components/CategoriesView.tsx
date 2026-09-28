import React, { useState } from 'react';
import { Tag, Plus, Edit2, Trash2, Folder, AlertTriangle, X } from 'lucide-react';
import { usePos } from '../context/PosContext';
import { Category } from '../types';

export const CategoriesView: React.FC = () => {
  const { categories, products, addCategory, updateCategory, deleteCategory } = usePos();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setCatName('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    if (editingCategory) {
      await updateCategory(editingCategory.id, catName.trim());
    } else {
      await addCategory(catName.trim());
    }
    setShowAddModal(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteCategory(deleteTarget.id);
    setDeleteTarget(null);
  };

  // Get product count per category
  const categoriesWithCounts = categories
    .filter((c) => c.id !== 'all')
    .map((cat) => {
      const count = products.filter(
        (p) => p.category.toLowerCase() === cat.name.toLowerCase()
      ).length;
      return { ...cat, count };
    });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#30323e] tracking-tight">
            Kategori Produk
          </h2>
          <p className="text-xs md:text-sm text-[#5d5e6c] mt-1">
            Atur pengelompokan produk untuk mempermudah pencarian dan transaksi kasir.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="bg-[#684cb6] hover:bg-[#5b3fa9] active:scale-[0.98] text-[#fdf7ff] font-semibold text-xs md:text-sm px-5 h-11 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori</span>
        </button>
      </div>

      {/* Grid of Categories */}
      {categoriesWithCounts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-[#e2e1f2] p-12 text-center">
          <Folder className="w-12 h-12 text-[#797988] mx-auto mb-3 opacity-40" />
          <h3 className="font-bold text-[#30323e] text-base">Belum Ada Kategori</h3>
          <p className="text-xs text-[#5d5e6c] mt-1 max-w-sm mx-auto">
            Tambahkan kategori produk pertama Anda untuk mengelompokkan stok dagangan.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="mt-4 px-4 py-2 rounded-xl bg-[#684cb6] text-white text-xs font-semibold hover:bg-[#5b3fa9] transition-all cursor-pointer"
          >
            Buat Kategori Baru
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categoriesWithCounts.map((cat) => (
            <div
              key={cat.id}
              className="bg-white p-5 rounded-2xl border border-[#e2e1f2] shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#a589f8]/15 text-[#684cb6] flex items-center justify-center font-bold text-lg">
                  {cat.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(cat)}
                    title="Edit Kategori"
                    className="p-1.5 rounded-lg text-[#5d5e6c] hover:text-[#684cb6] hover:bg-[#f4f2fe] transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(cat)}
                    title="Hapus Kategori"
                    className="p-1.5 rounded-lg text-[#5d5e6c] hover:text-[#a8364b] hover:bg-[#f97386]/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-base text-[#30323e]">{cat.name}</h3>
                <p className="text-xs text-[#5d5e6c] mt-0.5">{cat.count} Produk Terdaftar</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-[#e2e1f2] shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#30323e]">
                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-[#797988] hover:text-[#30323e] hover:bg-[#f4f2fe]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5d5e6c] mb-1.5">
                  Nama Kategori <span className="text-[#a8364b]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Contoh: Perlengkapan Kantor"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e2e1f2] text-sm focus:border-[#684cb6] outline-none"
                  autoFocus
                />
                {editingCategory && (
                  <p className="text-[11px] text-[#797988] mt-1.5">
                    Produk yang terhubung dengan kategori ini akan otomatis diperbarui.
                  </p>
                )}
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#e2e1f2] text-xs font-semibold text-[#5d5e6c] hover:bg-[#f4f2fe] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#684cb6] hover:bg-[#5b3fa9] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-[#e2e1f2] shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-[#a8364b]/10 text-[#a8364b] flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-center font-bold text-base text-[#30323e]">
              Hapus Kategori?
            </h3>
            <p className="text-center text-xs text-[#5d5e6c] mt-1.5 leading-relaxed">
              Kategori <span className="font-semibold text-[#30323e]">"{deleteTarget.name}"</span> akan dihapus dari sistem. Produk yang ada di dalamnya akan otomatis dialihkan ke kategori 'Umum'.
            </p>

            <div className="flex gap-2 justify-center mt-6">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 rounded-xl border border-[#e2e1f2] text-xs font-semibold text-[#5d5e6c] hover:bg-[#f4f2fe] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-[#a8364b] hover:bg-[#8e2b3e] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

