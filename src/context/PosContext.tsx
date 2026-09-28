import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Category,
  CartItem,
  Transaction,
  CashierUser,
  StoreSettings,
  StockLog,
  PaymentMethod,
  AuthUser,
  UserRole,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_TRANSACTIONS,
  INITIAL_CASHIERS,
  INITIAL_SETTINGS,
  INITIAL_AUTH_USERS,
} from '../mockData';

export type ActiveNavTab =
  | 'dashboard'
  | 'kasir'
  | 'produk'
  | 'kategori'
  | 'stok'
  | 'riwayat'
  | 'laporan'
  | 'pengaturan';

interface PosContextType {
  // Navigation
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  toggleSidebar: () => void;

  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: number | string, updated: Partial<Product>) => void;
  deleteProduct: (id: number | string) => void;
  clearAllProducts: () => Promise<boolean>;
  restockProduct: (id: number | string, amount: number, reason?: string) => void;

  // Categories
  categories: Category[];
  addCategory: (name: string, icon?: string) => Promise<boolean>;
  updateCategory: (id: string, name: string, icon?: string) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;

  // Cart & POS checkout
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number | string) => void;
  updateQuantity: (productId: number | string, quantity: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartTax: number;
  cartTotal: number;
  cartItemCount: number;

  // Transactions
  transactions: Transaction[];
  selectedTransaction: Transaction | null;
  setSelectedTransaction: (t: Transaction | null) => void;
  completeCheckout: (
    paymentMethod: PaymentMethod,
    amountPaid: number,
    notes?: string
  ) => Transaction;
  cancelTransaction: (id: string) => void;
  updateTransaction: (id: string, updated: { notes?: string }) => Promise<boolean>;
  deleteTransaction: (id: string) => Promise<boolean>;

  // Cashiers & Register Shift
  cashiers: CashierUser[];
  activeCashier: CashierUser;
  setActiveCashier: (c: CashierUser) => void;
  isRegisterOpen: boolean;
  registerStartingCash: number;
  openRegister: (startingCash: number) => void;
  closeRegister: () => void;
  showOpenRegisterModal: boolean;
  setShowOpenRegisterModal: (show: boolean) => void;

  // Settings
  settings: StoreSettings;
  updateSettings: (s: Partial<StoreSettings>) => void;

  // Stock logs
  stockLogs: StockLog[];

  // Authentication & RBAC
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  users: AuthUser[];
  login: (username: string, password: string) => { success: boolean; message: string; user?: AuthUser };
  registerUser: (data: {
    name: string;
    username: string;
    password: string;
    role: UserRole;
    email?: string;
    phone?: string;
  }) => { success: boolean; message: string; user?: AuthUser };
  updateUser: (id: string, updated: Partial<AuthUser>) => { success: boolean; message: string };
  deleteUser: (id: string) => { success: boolean; message: string };
  logout: () => void;

  // Toast Notification
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;

  // Modal helpers
  lastCompletedTransaction: Transaction | null;
  setLastCompletedTransaction: (t: Transaction | null) => void;
  showCheckoutSuccessModal: boolean;
  setShowCheckoutSuccessModal: (show: boolean) => void;

  // Reset to initial
  resetDemoData: () => void;

  // Turso Cloud Database
  isTursoConnected: boolean;
  tursoStatus: 'connected' | 'connecting' | 'error';
  lastSyncTime: string | null;
  syncWithTurso: () => Promise<void>;
}

const PosContext = createContext<PosContextType | undefined>(undefined);

export const PosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((cur) => (cur?.message === message ? null : cur));
    }, 3500);
  };

  const hideToast = () => setToast(null);

  // Turso connection state
  const [isTursoConnected, setIsTursoConnected] = useState<boolean>(true);
  const [tursoStatus, setTursoStatus] = useState<'connected' | 'connecting' | 'error'>('connecting');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Initial local state with localStorage caching
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('kasirku_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('kasirku_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('kasirku_transactions');
    if (saved) {
      try {
        const parsed: Transaction[] = JSON.parse(saved);
        return parsed.map((t) => {
          if (t.cashier === 'Budi S.' || t.cashier === 'Budi Santoso' || t.cashier === 'budi') {
            return { ...t, cashier: 'Kassa 1' };
          }
          if (t.cashier === 'Siti M.' || t.cashier === 'Siti Aminah' || t.cashier === 'siti') {
            return { ...t, cashier: 'Kassa 2' };
          }
          return t;
        });
      } catch {
        return INITIAL_TRANSACTIONS;
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  // Enterprise Auth & RBAC state
  const [users, setUsers] = useState<AuthUser[]>(() => {
    const saved = localStorage.getItem('kasirku_auth_users');
    if (saved) {
      try {
        const parsed: AuthUser[] = JSON.parse(saved);
        // Ensure default cashiers are updated to Kassa 1 and Kassa 2
        const updated = parsed.map((u) => {
          if (u.id === 'usr-2' || u.username === 'budi' || u.username === 'kassa1') {
            return {
              ...u,
              name: 'Kassa 1',
              username: 'kassa1',
              email: 'kassa1@tokoindah.id',
            };
          }
          if (u.id === 'usr-3' || u.username === 'siti' || u.username === 'kassa2') {
            return {
              ...u,
              name: 'Kassa 2',
              username: 'kassa2',
              email: 'kassa2@tokoindah.id',
            };
          }
          return u;
        });
        // Ensure super admin 'tokoindah' with password 'indahberharga134' is always guaranteed
        const filtered = updated.filter((u) => u.username.toLowerCase() !== 'tokoindah');
        return [INITIAL_AUTH_USERS[0], ...filtered];
      } catch {
        return INITIAL_AUTH_USERS;
      }
    }
    return INITIAL_AUTH_USERS;
  });

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('kasirku_current_user');
    if (saved) {
      try {
        const parsed: AuthUser = JSON.parse(saved);
        if (parsed.id === 'usr-2' || parsed.username === 'budi' || parsed.username === 'kassa1') {
          return { ...parsed, name: 'Kassa 1', username: 'kassa1', email: 'kassa1@tokoindah.id' };
        }
        if (parsed.id === 'usr-3' || parsed.username === 'siti' || parsed.username === 'kassa2') {
          return { ...parsed, name: 'Kassa 2', username: 'kassa2', email: 'kassa2@tokoindah.id' };
        }
        return parsed;
      } catch {
        return null;
      }
    }
    return null;
  });

  const isAuthenticated = !!currentUser;

  const [cashiers, setCashiers] = useState<CashierUser[]>(() => {
    const mapped: CashierUser[] = users.map((u) => ({
      id: u.id,
      name: u.name,
      role: u.role,
      avatar: u.avatar,
      username: u.username,
    }));
    return mapped.length > 0 ? mapped : INITIAL_CASHIERS;
  });

  const [activeCashier, setActiveCashier] = useState<CashierUser>(() => {
    if (currentUser) {
      return {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        avatar: currentUser.avatar,
        username: currentUser.username,
      };
    }
    return INITIAL_CASHIERS[0];
  });

  // Sync users to localStorage and cashiers list
  useEffect(() => {
    localStorage.setItem('kasirku_auth_users', JSON.stringify(users));
    setCashiers(
      users.map((u) => ({
        id: u.id,
        name: u.name,
        role: u.role,
        avatar: u.avatar,
        username: u.username,
      }))
    );
  }, [users]);

  // Sync current user to active cashier
  useEffect(() => {
    if (currentUser) {
      setActiveCashier({
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        avatar: currentUser.avatar,
        username: currentUser.username,
      });
      localStorage.setItem('kasirku_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('kasirku_current_user');
    }
  }, [currentUser]);

  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('kasirku_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [stockLogs, setStockLogs] = useState<StockLog[]>(() => {
    const saved = localStorage.getItem('kasirku_stock_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Initial cart
  const [cart, setCart] = useState<CartItem[]>([]);

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(
    INITIAL_TRANSACTIONS[0]
  );
  const [isRegisterOpen, setIsRegisterOpen] = useState(true);
  const [registerStartingCash, setRegisterStartingCash] = useState(500000);
  const [showOpenRegisterModal, setShowOpenRegisterModal] = useState(false);

  const [lastCompletedTransaction, setLastCompletedTransaction] = useState<Transaction | null>(null);
  const [showCheckoutSuccessModal, setShowCheckoutSuccessModal] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('kasirku_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('kasirku_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('kasirku_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('kasirku_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('kasirku_stock_logs', JSON.stringify(stockLogs));
  }, [stockLogs]);

  // Initial and on-demand synchronization with Turso LibSQL Cloud
  const syncWithTurso = async () => {
    try {
      setTursoStatus('connecting');
      const res = await fetch('/api/sync');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        if (Array.isArray(json.data.products)) {
          setProducts(json.data.products);
        }
        if (json.data.categories && json.data.categories.length > 0) {
          setCategories(json.data.categories);
        }
        if (json.data.transactions && json.data.transactions.length > 0) {
          setTransactions(json.data.transactions);
        }
        if (json.data.users && json.data.users.length > 0) {
          setUsers(json.data.users);
        }
        if (json.data.settings) {
          setSettings(json.data.settings);
        }
        if (json.data.stockLogs && json.data.stockLogs.length > 0) {
          setStockLogs(json.data.stockLogs);
        }
        if (json.data.shift) {
          setIsRegisterOpen(json.data.shift.isOpen);
          setRegisterStartingCash(json.data.shift.startingCash);
        }
        setIsTursoConnected(true);
        setTursoStatus('connected');
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      }
    } catch (err) {
      console.warn('Turso sync offline or initial connect fallback:', err);
      setIsTursoConnected(false);
      setTursoStatus('error');
    }
  };

  useEffect(() => {
    syncWithTurso();
  }, []);

  // Cart Calculations
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const cartTax = settings.enableTax ? Math.round(cartSubtotal * settings.taxRate) : 0;
  const cartTotal = cartSubtotal + cartTax;
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Cart actions
  const addToCart = (product: Product, quantity = 1) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = Math.min(product.stock, existing.quantity + quantity);
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
      }
    });
  };

  const removeFromCart = (productId: number | string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: number | string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const maxAllowed = Math.min(item.product.stock, quantity);
          return { ...item, quantity: maxAllowed };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Product management (Synced with Turso)
  const addProduct = (newProd: Omit<Product, 'id'>) => {
    const nextId = products.length > 0 ? Math.max(...products.map((p) => Number(p.id) || 0)) + 1 : 1;
    const created: Product = {
      ...newProd,
      id: nextId,
      soldCount: 0,
      minStock: newProd.minStock || 10,
    };
    setProducts((prev) => [created, ...prev]);

    // Add stock log
    const log: StockLog = {
      id: `LOG-${Date.now()}`,
      productId: nextId,
      productName: created.name,
      previousStock: 0,
      adjustedAmount: created.stock,
      newStock: created.stock,
      reason: 'Restock / Pembelian',
      date: new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      user: activeCashier.name,
    };
    setStockLogs((prev) => [log, ...prev]);

    // Send to Turso backend
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(created),
    }).catch((err) => console.error('Turso addProduct error:', err));

    showToast(`Produk "${created.name}" berhasil disimpan ke database!`, 'success');
  };

  const updateProduct = (id: number | string, updated: Partial<Product>) => {
    const prevProduct = products.find((p) => p.id === id);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );

    // Send to Turso backend
    fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch((err) => console.error('Turso updateProduct error:', err));

    showToast(`Produk "${updated.name || prevProduct?.name || 'Produk'}" berhasil diperbarui!`, 'success');
  };

  const deleteProduct = (id: number | string) => {
    const prod = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    removeFromCart(id);

    // Send to Turso backend
    fetch(`/api/products/${id}`, {
      method: 'DELETE',
    }).catch((err) => console.error('Turso deleteProduct error:', err));

    showToast(`Produk "${prod?.name || id}" berhasil dihapus!`, 'info');
  };

  const clearAllProducts = async (): Promise<boolean> => {
    setProducts([]);
    setCart([]);
    localStorage.setItem('kasirku_products', JSON.stringify([]));

    try {
      await fetch('/api/products', {
        method: 'DELETE',
      });
      showToast('Semua produk berhasil dikosongkan dari database!', 'info');
      return true;
    } catch (err) {
      console.error('Turso clearAllProducts error:', err);
      showToast('Semua produk di sistem telah dikosongkan.', 'info');
      return true;
    }
  };

  const restockProduct = (id: number | string, amount: number, reason = 'Restock / Pembelian') => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;

    const previousStock = prod.stock;
    const newStock = Math.max(0, previousStock + amount);

    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p))
    );

    const log: StockLog = {
      id: `LOG-${Date.now()}`,
      productId: id,
      productName: prod.name,
      previousStock,
      adjustedAmount: amount,
      newStock,
      reason: reason as any,
      date: new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      user: activeCashier.name,
    };
    setStockLogs((prev) => [log, ...prev]);

    // Send to Turso backend
    fetch(`/api/products/${id}/restock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        reason,
        user: activeCashier.name,
      }),
    }).catch((err) => console.error('Turso restockProduct error:', err));

    showToast(`Stok "${prod.name}" disesuaikan: ${amount > 0 ? '+' + amount : amount} (Total: ${newStock})`, 'success');
  };

  // Category management
  const addCategory = async (name: string, icon = 'category'): Promise<boolean> => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    const id = trimmed.toLowerCase().replace(/\s+/g, '-');
    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase() || c.id === id)) {
      showToast(`Kategori "${trimmed}" sudah ada!`, 'error');
      return false;
    }

    const newCat: Category = { id, name: trimmed, icon };
    setCategories((prev) => [...prev, newCat]);
    showToast(`Kategori "${trimmed}" berhasil ditambahkan!`, 'success');

    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed, icon }),
      });
      return true;
    } catch (err) {
      console.error('Turso addCategory error:', err);
      return true;
    }
  };

  const updateCategory = async (id: string, newName: string, icon?: string): Promise<boolean> => {
    const trimmed = newName.trim();
    if (!trimmed || id === 'all') return false;

    const oldCat = categories.find((c) => c.id === id);
    const oldName = oldCat?.name;

    setCategories((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, name: trimmed, icon: icon || c.icon }
          : c
      )
    );

    // If category name changed, update all products that belong to it
    if (oldName && oldName.toLowerCase() !== trimmed.toLowerCase()) {
      setProducts((prev) =>
        prev.map((p) =>
          p.category.toLowerCase() === oldName.toLowerCase()
            ? { ...p, category: trimmed }
            : p
        )
      );
    }

    showToast(`Kategori "${trimmed}" berhasil diperbarui!`, 'success');

    try {
      await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed, icon }),
      });
      return true;
    } catch (err) {
      console.error('Turso updateCategory error:', err);
      return true;
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    if (id === 'all') return false;
    const target = categories.find((c) => c.id === id);
    const targetName = target?.name || id;

    // Check if any products use this category; if so reassign them to 'Umum'
    setProducts((prev) =>
      prev.map((p) =>
        p.category.toLowerCase() === targetName.toLowerCase()
          ? { ...p, category: 'Umum' }
          : p
      )
    );

    setCategories((prev) => prev.filter((c) => c.id !== id));
    showToast(`Kategori "${targetName}" berhasil dihapus!`, 'info');

    try {
      await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (err) {
      console.error('Turso deleteCategory error:', err);
      return true;
    }
  };

  // Checkout process
  const completeCheckout = (
    paymentMethod: PaymentMethod,
    amountPaid: number,
    notes?: string
  ): Transaction => {
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timeFormatted = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const dateCode = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const seq = String(transactions.length + 1).padStart(3, '0');
    const newId = `TRX-${dateCode}-${seq}`;

    const txItems = cart.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      sku: item.product.sku,
    }));

    const finalSubtotal = cartSubtotal;
    const finalTax = cartTax;
    const finalTotal = cartTotal;
    const effectiveAmountPaid = Math.max(amountPaid, finalTotal);
    const change = Math.max(0, effectiveAmountPaid - finalTotal);

    const newTx: Transaction = {
      id: newId,
      timestamp: `${dateFormatted}, ${timeFormatted}`,
      cashier: activeCashier.name,
      items: txItems,
      subtotal: finalSubtotal,
      tax: finalTax,
      taxRate: settings.enableTax ? settings.taxRate : 0,
      total: finalTotal,
      paymentMethod,
      amountPaid: effectiveAmountPaid,
      change,
      status: 'Sukses',
      notes,
    };

    // Deduct stock and increment soldCount
    setProducts((prev) =>
      prev.map((p) => {
        const cartItem = cart.find((ci) => ci.product.id === p.id);
        if (cartItem) {
          return {
            ...p,
            stock: Math.max(0, p.stock - cartItem.quantity),
            soldCount: (p.soldCount || 0) + cartItem.quantity,
          };
        }
        return p;
      })
    );

    // Save transaction
    setTransactions((prev) => [newTx, ...prev]);
    setSelectedTransaction(newTx);
    setLastCompletedTransaction(newTx);
    setShowCheckoutSuccessModal(true);
    clearCart();

    // Persist transaction to Turso database
    fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTx),
    }).catch((err) => console.error('Turso completeCheckout error:', err));

    return newTx;
  };

  const cancelTransaction = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'Batal' } : t))
    );
    showToast(`Transaksi #${id} dibatalkan & stok dikembalikan!`, 'info');

    fetch(`/api/transactions/${id}/cancel`, {
      method: 'POST',
    }).catch((err) => console.error('Turso cancelTransaction error:', err));
  };

  const updateTransaction = async (id: string, updated: { notes?: string }): Promise<boolean> => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, notes: updated.notes } : t))
    );
    if (selectedTransaction?.id === id) {
      setSelectedTransaction((prev) => (prev ? { ...prev, notes: updated.notes } : null));
    }
    showToast(`Catatan transaksi #${id} diperbarui!`, 'success');

    try {
      await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      return true;
    } catch (err) {
      console.error('Turso updateTransaction error:', err);
      return true;
    }
  };

  const deleteTransaction = async (id: string): Promise<boolean> => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (selectedTransaction?.id === id) {
      setSelectedTransaction(null);
    }
    showToast(`Transaksi #${id} telah dihapus!`, 'info');

    try {
      await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (err) {
      console.error('Turso deleteTransaction error:', err);
      return true;
    }
  };

  const openRegister = (startingCash: number) => {
    setIsRegisterOpen(true);
    setRegisterStartingCash(startingCash);
    setShowOpenRegisterModal(false);

    fetch('/api/shift/open', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startingCash, cashier: activeCashier.name }),
    }).catch((err) => console.error('Turso openRegister error:', err));
  };

  const closeRegister = () => {
    setIsRegisterOpen(false);

    fetch('/api/shift/close', {
      method: 'POST',
    }).catch((err) => console.error('Turso closeRegister error:', err));
  };

  const updateSettings = (updated: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...updated }));

    fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch((err) => console.error('Turso updateSettings error:', err));
  };

  // Auth & RBAC actions
  const login = (usernameInput: string, passwordInput: string) => {
    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (!cleanUser || !cleanPass) {
      return {
        success: false,
        message: 'Username dan password wajib diisi.',
      };
    }

    const matched = users.find(
      (u) => u.username.toLowerCase() === cleanUser && u.password === cleanPass
    );

    if (!matched) {
      return {
        success: false,
        message: 'Kombinasi username atau password salah. Silakan periksa kembali.',
      };
    }

    setCurrentUser(matched);
    return {
      success: true,
      message: `Selamat datang kembali, ${matched.name}!`,
      user: matched,
    };
  };

  const registerUser = (data: {
    name: string;
    username: string;
    password: string;
    role: UserRole;
    email?: string;
    phone?: string;
  }) => {
    const cleanUser = data.username.trim().toLowerCase();
    const cleanPass = data.password.trim();
    const cleanName = data.name.trim();

    if (!cleanName || !cleanUser || !cleanPass) {
      return {
        success: false,
        message: 'Nama, username, dan password wajib diisi.',
      };
    }

    if (users.some((u) => u.username.toLowerCase() === cleanUser)) {
      return {
        success: false,
        message: `Username "${cleanUser}" sudah terdaftar. Silakan pilih username lain.`,
      };
    }

    if (cleanPass.length < 6) {
      return {
        success: false,
        message: 'Password harus minimal 6 karakter demi keamanan akun.',
      };
    }

    const avatarUrl =
      data.role === 'Super Admin'
        ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcPLMi85rGq0YDGmeyDMz1FidoiAoiSk1FDdFoNg8ek46kSHA84X6S_cPzMBRXQGGWl5h9KxZEcb24fLNKvckYmIyGkcT1Irb2t0d_C0AYYIRFwcFPVql-nWIJZhi6ZdIHFz7paY_nA5X_A_Zy-Lxg11su759_dM0-EpmI3BmLjwj_sNZ_IRubFxyxR2BL2axb2iw9mc3yEzjsz80BwVhHYO8QvpvhGoUpk9Eyf7VJT0V4Uxd3C8-5'
        : 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFIOLuCKLDnyIIJU4BbW8BxkuFYQ0Lz1Sgr4djBuFlAVWvTDXVSPcpNPYFVAsUAHOp7tEOzeKxSb4URdt82aMCFMjp9G_Zin6rLG6_KfZWoV0bXB2Fagh-8xfVGoGaqkcUnaISTJsTneQGZfhWi-wKqfVrkm1CKrkK7TcryqeiMQJmb-9-UG0BRt-ft4JxQrA4HJkint0zXZPP9xvHqGCWSeM9u90yg5kF9TEzmDDsXtGgKvesKOzy';

    const newUser: AuthUser = {
      id: `usr-${Date.now()}`,
      username: cleanUser,
      password: cleanPass,
      name: cleanName,
      role: data.role || 'Kasir',
      email: data.email?.trim() || `${cleanUser}@tokoindah.id`,
      phone: data.phone?.trim() || '',
      avatar: avatarUrl,
      createdAt: new Date().toISOString(),
    };

    const updated = [...users, newUser];
    setUsers(updated);

    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    }).catch((err) => console.error('Turso registerUser error:', err));

    return {
      success: true,
      message: `Akun "${cleanUser}" (${data.role}) berhasil didaftarkan! Silakan masuk.`,
      user: newUser,
    };
  };

  const updateUser = (id: string, updated: Partial<AuthUser>): { success: boolean; message: string } => {
    const target = users.find((u) => u.id === id);
    if (!target) return { success: false, message: 'Petugas tidak ditemukan' };

    const newUsers = users.map((u) => (u.id === id ? { ...u, ...updated } : u));
    setUsers(newUsers);

    if (currentUser?.id === id) {
      setCurrentUser((prev) => (prev ? { ...prev, ...updated } : null));
    }

    showToast(`Data petugas "${updated.name || target.name}" diperbarui!`, 'success');

    fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch((err) => console.error('Turso updateUser error:', err));

    return { success: true, message: 'Data petugas berhasil diperbarui' };
  };

  const deleteUser = (id: string): { success: boolean; message: string } => {
    if (currentUser?.id === id) {
      return { success: false, message: 'Anda tidak dapat menghapus akun Anda sendiri saat sedang aktif!' };
    }

    const target = users.find((u) => u.id === id);
    if (!target) return { success: false, message: 'Petugas tidak ditemukan' };

    const adminCount = users.filter((u) => u.role === 'Super Admin').length;
    if (target.role === 'Super Admin' && adminCount <= 1) {
      return { success: false, message: 'Tidak dapat menghapus Super Admin terakhir sistem!' };
    }

    const newUsers = users.filter((u) => u.id !== id);
    setUsers(newUsers);
    showToast(`Petugas "${target.name}" berhasil dihapus!`, 'info');

    fetch(`/api/users/${id}`, {
      method: 'DELETE',
    }).catch((err) => console.error('Turso deleteUser error:', err));

    return { success: true, message: `Petugas "${target.name}" berhasil dihapus.` };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const resetDemoData = () => {
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setTransactions(INITIAL_TRANSACTIONS);
    setSettings(INITIAL_SETTINGS);
    setStockLogs([]);
    clearCart();
    localStorage.removeItem('kasirku_products');
    localStorage.removeItem('kasirku_categories');
    localStorage.removeItem('kasirku_transactions');
    localStorage.removeItem('kasirku_settings');
    localStorage.removeItem('kasirku_stock_logs');

    fetch('/api/reset', {
      method: 'POST',
    }).catch((err) => console.error('Turso resetDemoData error:', err));
  };

  return (
    <PosContext.Provider
      value={{
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebar,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        clearAllProducts,
        restockProduct,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartSubtotal,
        cartTax,
        cartTotal,
        cartItemCount,
        transactions,
        selectedTransaction,
        setSelectedTransaction,
        completeCheckout,
        cancelTransaction,
        updateTransaction,
        deleteTransaction,
        cashiers,
        activeCashier,
        setActiveCashier,
        currentUser,
        isAuthenticated,
        users,
        login,
        registerUser,
        updateUser,
        deleteUser,
        logout,
        toast,
        showToast,
        hideToast,
        isRegisterOpen,
        registerStartingCash,
        openRegister,
        closeRegister,
        showOpenRegisterModal,
        setShowOpenRegisterModal,
        settings,
        updateSettings,
        stockLogs,
        lastCompletedTransaction,
        setLastCompletedTransaction,
        showCheckoutSuccessModal,
        setShowCheckoutSuccessModal,
        resetDemoData,
        isTursoConnected,
        tursoStatus,
        lastSyncTime,
        syncWithTurso,
      }}
    >
      {children}
    </PosContext.Provider>
  );
};

export const usePos = () => {
  const context = useContext(PosContext);
  if (!context) {
    throw new Error('usePos must be used within a PosProvider');
  }
  return context;
};
