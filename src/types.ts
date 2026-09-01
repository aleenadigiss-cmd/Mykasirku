export type PaymentMethod = 'Tunai' | 'Transfer' | 'Kartu' | 'QRIS';

export type TransactionStatus = 'Sukses' | 'Batal' | 'Pending';

export interface Product {
  id: number | string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  minStock?: number;
  image: string;
  soldCount?: number;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  itemCount?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface TransactionItem {
  id: number | string;
  name: string;
  price: number;
  quantity: number;
  sku?: string;
}

export interface Transaction {
  id: string; // e.g. TRX-20231024-001 or TRX-00124
  timestamp: string; // e.g. "24 Okt 2023, 14:30"
  cashier: string; // e.g. "Budi Santoso"
  items: TransactionItem[];
  subtotal: number;
  tax: number;
  taxRate: number; // e.g. 0.11 or 0
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  status: TransactionStatus;
  notes?: string;
}

export interface CashierUser {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export type CashierProfile = CashierUser;

export interface StoreSettings {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  receiptFooter: string;
  taxRate: number; // 0.11 for 11%
  enableTax: boolean;
  currency: string;
}

export interface StockLog {
  id: string;
  productId: number | string;
  productName: string;
  previousStock: number;
  adjustedAmount: number;
  newStock: number;
  reason: 'Restock / Pembelian' | 'Penjualan' | 'Penyesuaian Manual' | 'Barang Rusak / Hilang';
  date: string;
  user: string;
}
