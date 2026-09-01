import React, { useState } from 'react';
import { Tag, Plus, Edit2, Trash2, CheckCircle2, Folder, Layers } from 'lucide-react';
import { usePos } from '../context/PosContext';
import { Category } from '../types';

export const CategoriesView: React.FC = () => {
  const { categories, products, addCategory, updateCategory, deleteCategory } = usePos();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    if (editingCategory) {
      updateCategory(editingCategory.id, catName.trim());
    } else {
      addCategory(catName.trim());
    }
    setShowAddModal(false);
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#30323e] tracking-tight">
            Kategori Produk
          </h2>
          <p className="text-xs md:text-sm text-[#5d5e6c] mt-1">
            Atur pengelompokan produk untuk mempermudah pencarian kasir.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-[#684cb6] hover:bg-[#5b3fa9] active:scale-[0.98] text-[#fdf7ff] font-semibold text-xs md:text-sm px-5 h-11 rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori</span>
        </button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categoriesWithCounts.map((cat) => (
          <div
            key={cat.id}
            className="bg-white p-5 rounded-2xl border border-[#e2e1f2] shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#a589f8]/15 text-[#684cb6] flex items-center justify-center">
                <Folder className="w-6 h-6" />
              </div>
              <div className="flex gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="p-1.5 rounded-lg text-[#5d5e6c] hover:text-[#684cb6] hover:bg-[#f4f2fe]"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Hapus kategori "${cat.name}"?`)) {
                      deleteCategory(cat.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-[#5d5e6c] hover:text-[#a8364b] hover:bg-[#f97386]/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
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

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-[#e2e1f2] shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-[#30323e] mb-4">
              {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5d5e6c] mb-1.5">
                  Nama Kategori
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
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#e2e1f2] text-xs font-semibold text-[#5d5e6c] hover:bg-[#f4f2fe]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#684cb6] hover:bg-[#5b3fa9] text-white text-xs font-bold shadow-xs"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
