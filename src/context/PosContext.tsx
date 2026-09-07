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
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_TRANSACTIONS,
  INITIAL_CASHIERS,
  INITIAL_SETTINGS,
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
  restockProduct: (id: number | string, amount: number, reason?: string) => void;

  // Categories
  categories: Category[];
  addCategory: (name: string, icon?: string) => void;
  deleteCategory: (id: string) => void;

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

  // Modal helpers
  lastCompletedTransaction: Transaction | null;
  setLastCompletedTransaction: (t: Transaction | null) => void;
  showCheckoutSuccessModal: boolean;
  setShowCheckoutSuccessModal: (show: boolean) => void;

  // Reset to initial
  resetDemoData: () => void;
}

const PosContext = createContext<PosContextType | undefined>(undefined);

export const PosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  // Initial local state with localStorage caching
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('kasirku_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('kasirku_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('kasirku_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [cashiers] = useState<CashierUser[]>(INITIAL_CASHIERS);
  const [activeCashier, setActiveCashier] = useState<CashierUser>(INITIAL_CASHIERS[0]);

  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('kasirku_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [stockLogs, setStockLogs] = useState<StockLog[]>(() => {
    const saved = localStorage.getItem('kasirku_stock_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Initial cart with items shown in Screen 3 mockup: Kertas HVS A4 (qty 2) + Air Mineral (qty 3)
  const [cart, setCart] = useState<CartItem[]>(() => {
    const initialHvs = INITIAL_PRODUCTS.find((p) => p.sku === 'SKU-AT-042') || INITIAL_PRODUCTS[4];
    const initialAir = INITIAL_PRODUCTS.find((p) => p.sku === 'SKU-MN-005') || INITIAL_PRODUCTS[6];
    return [
      { product: initialHvs, quantity: 2 },
      { product: initialAir, quantity: 3 },
    ];
  });

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

  // Product management
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
  };

  const updateProduct = (id: number | string, updated: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
  };

  const deleteProduct = (id: number | string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    removeFromCart(id);
  };

  const restockProduct = (id: number | string, amount: number, reason = 'Restock / Pembelian') => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;

    const previousStock = prod.stock;
    const newStock = Math.max(0, previousStock + amount);

    updateProduct(id, { stock: newStock });

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
  };

  // Category management
  const addCategory = (name: string, icon = 'category') => {
    const id = name.toLowerCase().replace(/\s+/g, '-');
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) return;
    setCategories((prev) => [...prev, { id, name, icon }]);
  };

  const deleteCategory = (id: string) => {
    if (id === 'all') return;
    setCategories((prev) => prev.filter((c) => c.id !== id));
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

    return newTx;
  };

  const cancelTransaction = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'Batal' } : t))
    );
  };

  const openRegister = (startingCash: number) => {
    setIsRegisterOpen(true);
    setRegisterStartingCash(startingCash);
    setShowOpenRegisterModal(false);
  };

  const closeRegister = () => {
    setIsRegisterOpen(false);
  };

  const updateSettings = (updated: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...updated }));
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
        restockProduct,
        categories,
        addCategory,
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
        cashiers,
        activeCashier,
        setActiveCashier,
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
