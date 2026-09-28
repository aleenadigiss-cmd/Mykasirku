import { createClient, Client } from '@libsql/client';
import {
  INITIAL_AUTH_USERS,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_TRANSACTIONS,
  INITIAL_SETTINGS,
} from '../src/mockData';
import { Product, Category, Transaction, AuthUser, StoreSettings, StockLog } from '../src/types';

const TURSO_URL =
  process.env.TURSO_DATABASE_URL ||
  'libsql://mykasirdb-aleenadigiss.aws-ap-northeast-1.turso.io';

const TURSO_AUTH_TOKEN =
  process.env.TURSO_AUTH_TOKEN ||
  'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODk5NTEyOTMsImlkIjoiMDFhMGMxNjctMjUwMS03Yzk4LWJiNDYtYTRlNzQ2NTRlZjNhIiwia2lkIjoiMGtjYXd0QTVRc08xX0xsT01tMVFVcVVDUVRFVzU1NjRnSmkzcUEtUmRlSSIsInJpZCI6ImJhZTIyM2MwLTc2ZjctNDhiMC05NmVjLTM2MGE0YmRkZmE0YSJ9.nKuegWkPCFFXFfLmLSfAAayOwBpTxeATYsWJkyMp_8t1HC8Bs4BKXIGqHUIT8dyoPgqKM5Gqv3dDnf4jkmdvBQ';

let clientInstance: Client | null = null;

export function getTursoClient(): Client {
  if (!clientInstance) {
    clientInstance = createClient({
      url: TURSO_URL,
      authToken: TURSO_AUTH_TOKEN,
    });
  }
  return clientInstance;
}

export async function initDatabase() {
  const client = getTursoClient();

  // Create tables if not exist
  await client.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT,
      itemCount INTEGER DEFAULT 0
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sku TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      minStock INTEGER DEFAULT 5,
      image TEXT NOT NULL,
      soldCount INTEGER DEFAULT 0
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      cashier TEXT NOT NULL,
      items TEXT NOT NULL,
      subtotal REAL NOT NULL,
      tax REAL NOT NULL,
      taxRate REAL NOT NULL,
      total REAL NOT NULL,
      paymentMethod TEXT NOT NULL,
      amountPaid REAL NOT NULL,
      change REAL NOT NULL,
      status TEXT NOT NULL,
      notes TEXT
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      avatar TEXT,
      createdAt TEXT
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS stock_logs (
      id TEXT PRIMARY KEY,
      productId TEXT NOT NULL,
      productName TEXT NOT NULL,
      previousStock INTEGER NOT NULL,
      adjustedAmount INTEGER NOT NULL,
      newStock INTEGER NOT NULL,
      reason TEXT NOT NULL,
      date TEXT NOT NULL,
      user TEXT NOT NULL
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      storeName TEXT NOT NULL,
      storeAddress TEXT NOT NULL,
      storePhone TEXT NOT NULL,
      receiptFooter TEXT NOT NULL,
      taxRate REAL NOT NULL,
      enableTax INTEGER NOT NULL DEFAULT 1,
      currency TEXT NOT NULL DEFAULT 'Rp'
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS register_shift (
      id TEXT PRIMARY KEY,
      isOpen INTEGER NOT NULL DEFAULT 0,
      startingCash REAL NOT NULL DEFAULT 0,
      openedAt TEXT,
      closedAt TEXT,
      openedBy TEXT
    );
  `);

  // Seed default data if empty
  const catCount = await client.execute('SELECT COUNT(*) as count FROM categories;');
  if (Number(catCount.rows[0].count) === 0) {
    for (const cat of INITIAL_CATEGORIES) {
      await client.execute({
        sql: 'INSERT INTO categories (id, name, icon, itemCount) VALUES (?, ?, ?, ?)',
        args: [cat.id, cat.name, cat.icon || null, cat.itemCount || 0],
      });
    }
  }

  const prodCount = await client.execute('SELECT COUNT(*) as count FROM products;');
  if (Number(prodCount.rows[0].count) === 0 && INITIAL_PRODUCTS.length > 0) {
    for (const p of INITIAL_PRODUCTS) {
      await client.execute({
        sql: 'INSERT INTO products (id, name, sku, category, price, stock, minStock, image, soldCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: [
          String(p.id),
          p.name,
          p.sku,
          p.category,
          p.price,
          p.stock,
          p.minStock ?? 5,
          p.image,
          p.soldCount ?? 0,
        ],
      });
    }
  }

  const txCount = await client.execute('SELECT COUNT(*) as count FROM transactions;');
  if (Number(txCount.rows[0].count) === 0) {
    for (const tx of INITIAL_TRANSACTIONS) {
      await client.execute({
        sql: 'INSERT INTO transactions (id, timestamp, cashier, items, subtotal, tax, taxRate, total, paymentMethod, amountPaid, change, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: [
          tx.id,
          tx.timestamp,
          tx.cashier,
          JSON.stringify(tx.items),
          tx.subtotal,
          tx.tax,
          tx.taxRate,
          tx.total,
          tx.paymentMethod,
          tx.amountPaid,
          tx.change,
          tx.status,
          tx.notes || null,
        ],
      });
    }
  }

  const userCount = await client.execute('SELECT COUNT(*) as count FROM users;');
  if (Number(userCount.rows[0].count) === 0) {
    for (const u of INITIAL_AUTH_USERS) {
      await client.execute({
        sql: 'INSERT INTO users (id, username, password, name, role, email, phone, avatar, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: [
          u.id,
          u.username,
          u.password || 'kasir123',
          u.name,
          u.role,
          u.email || null,
          u.phone || null,
          u.avatar,
          u.createdAt || new Date().toISOString(),
        ],
      });
    }
  }

  const settingsCount = await client.execute('SELECT COUNT(*) as count FROM settings;');
  if (Number(settingsCount.rows[0].count) === 0) {
    await client.execute({
      sql: 'INSERT INTO settings (id, storeName, storeAddress, storePhone, receiptFooter, taxRate, enableTax, currency) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      args: [
        'default',
        INITIAL_SETTINGS.storeName,
        INITIAL_SETTINGS.storeAddress,
        INITIAL_SETTINGS.storePhone,
        INITIAL_SETTINGS.receiptFooter,
        INITIAL_SETTINGS.taxRate,
        INITIAL_SETTINGS.enableTax ? 1 : 0,
        INITIAL_SETTINGS.currency,
      ],
    });
  }

  const shiftCount = await client.execute('SELECT COUNT(*) as count FROM register_shift;');
  if (Number(shiftCount.rows[0].count) === 0) {
    await client.execute({
      sql: 'INSERT INTO register_shift (id, isOpen, startingCash) VALUES (?, ?, ?)',
      args: ['current', 0, 0],
    });
  }

  console.log('✅ Turso LibSQL database initialized successfully!');
}
