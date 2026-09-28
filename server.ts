import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { getTursoClient, initDatabase } from './server/turso';
import {
  INITIAL_AUTH_USERS,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
  INITIAL_TRANSACTIONS,
} from './src/mockData';
import { Product, Transaction, Category, AuthUser, StoreSettings, StockLog } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Turso tables and seed if necessary
  try {
    await initDatabase();
  } catch (err) {
    console.error('Failed to initialize Turso database:', err);
  }

  const client = getTursoClient();

  // 1. Health check & Turso status
  app.get('/api/health', async (_req: Request, res: Response) => {
    try {
      const result = await client.execute('SELECT 1 as ping;');
      res.json({
        status: 'ok',
        database: 'turso',
        connected: true,
        ping: result.rows[0].ping,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        database: 'turso',
        connected: false,
        error: err.message,
      });
    }
  });

  // 2. Full Sync Endpoint
  app.get('/api/sync', async (_req: Request, res: Response) => {
    try {
      const [prodsRes, catsRes, txsRes, usersRes, settingsRes, logsRes, shiftRes] =
        await Promise.all([
          client.execute('SELECT * FROM products;'),
          client.execute('SELECT * FROM categories;'),
          client.execute('SELECT * FROM transactions ORDER BY rowid DESC;'),
          client.execute('SELECT * FROM users;'),
          client.execute("SELECT * FROM settings WHERE id = 'default';"),
          client.execute('SELECT * FROM stock_logs ORDER BY rowid DESC LIMIT 100;'),
          client.execute("SELECT * FROM register_shift WHERE id = 'current';"),
        ]);

      const products: Product[] = prodsRes.rows.map((row: any) => ({
        id: isNaN(Number(row.id)) ? row.id : Number(row.id),
        name: String(row.name),
        sku: String(row.sku),
        category: String(row.category),
        price: Number(row.price),
        stock: Number(row.stock),
        minStock: Number(row.minStock ?? 5),
        image: String(row.image),
        soldCount: Number(row.soldCount ?? 0),
      }));

      const categories: Category[] = catsRes.rows.map((row: any) => ({
        id: String(row.id),
        name: String(row.name),
        icon: row.icon ? String(row.icon) : undefined,
        itemCount: Number(row.itemCount ?? 0),
      }));

      const transactions: Transaction[] = txsRes.rows.map((row: any) => {
        let parsedItems = [];
        try {
          parsedItems = JSON.parse(String(row.items));
        } catch {
          parsedItems = [];
        }
        return {
          id: String(row.id),
          timestamp: String(row.timestamp),
          cashier: String(row.cashier),
          items: parsedItems,
          subtotal: Number(row.subtotal),
          tax: Number(row.tax),
          taxRate: Number(row.taxRate),
          total: Number(row.total),
          paymentMethod: row.paymentMethod as any,
          amountPaid: Number(row.amountPaid),
          change: Number(row.change),
          status: row.status as any,
          notes: row.notes ? String(row.notes) : undefined,
        };
      });

      const users: AuthUser[] = usersRes.rows.map((row: any) => ({
        id: String(row.id),
        username: String(row.username),
        password: String(row.password),
        name: String(row.name),
        role: row.role as any,
        email: row.email ? String(row.email) : undefined,
        phone: row.phone ? String(row.phone) : undefined,
        avatar: String(row.avatar),
        createdAt: row.createdAt ? String(row.createdAt) : undefined,
      }));

      const settingsRow: any = settingsRes.rows[0] || {};
      const settings: StoreSettings = {
        storeName: String(settingsRow.storeName || INITIAL_SETTINGS.storeName),
        storeAddress: String(settingsRow.storeAddress || INITIAL_SETTINGS.storeAddress),
        storePhone: String(settingsRow.storePhone || INITIAL_SETTINGS.storePhone),
        receiptFooter: String(settingsRow.receiptFooter || INITIAL_SETTINGS.receiptFooter),
        taxRate: Number(settingsRow.taxRate ?? INITIAL_SETTINGS.taxRate),
        enableTax: Boolean(settingsRow.enableTax ?? INITIAL_SETTINGS.enableTax),
        currency: String(settingsRow.currency || 'Rp'),
      };

      const stockLogs: StockLog[] = logsRes.rows.map((row: any) => ({
        id: String(row.id),
        productId: String(row.productId),
        productName: String(row.productName),
        previousStock: Number(row.previousStock),
        adjustedAmount: Number(row.adjustedAmount),
        newStock: Number(row.newStock),
        reason: row.reason as any,
        date: String(row.date),
        user: String(row.user),
      }));

      const shiftRow: any = shiftRes.rows[0] || {};
      const shift = {
        isOpen: Boolean(shiftRow.isOpen),
        startingCash: Number(shiftRow.startingCash || 0),
        openedAt: shiftRow.openedAt || null,
        closedAt: shiftRow.closedAt || null,
        openedBy: shiftRow.openedBy || null,
      };

      res.json({
        success: true,
        source: 'turso',
        data: {
          products,
          categories,
          transactions,
          users,
          settings,
          stockLogs,
          shift,
        },
      });
    } catch (err: any) {
      console.error('Error syncing from Turso:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. Products Endpoints
  app.post('/api/products', async (req: Request, res: Response) => {
    try {
      const p = req.body;
      const id = p.id ? String(p.id) : `prod-${Date.now()}`;
      await client.execute({
        sql: `INSERT INTO products (id, name, sku, category, price, stock, minStock, image, soldCount)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        args: [
          id,
          p.name,
          p.sku,
          p.category,
          Number(p.price) || 0,
          Number(p.stock) || 0,
          Number(p.minStock ?? 5),
          p.image || 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=400&q=80',
          Number(p.soldCount || 0),
        ],
      });
      res.json({ success: true, id });
    } catch (err: any) {
      console.error('Error creating product in Turso:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/products/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const p = req.body;
      await client.execute({
        sql: `UPDATE products SET
                name = COALESCE(?, name),
                sku = COALESCE(?, sku),
                category = COALESCE(?, category),
                price = COALESCE(?, price),
                stock = COALESCE(?, stock),
                minStock = COALESCE(?, minStock),
                image = COALESCE(?, image),
                soldCount = COALESCE(?, soldCount)
              WHERE id = ?;`,
        args: [
          p.name ?? null,
          p.sku ?? null,
          p.category ?? null,
          p.price !== undefined ? Number(p.price) : null,
          p.stock !== undefined ? Number(p.stock) : null,
          p.minStock !== undefined ? Number(p.minStock) : null,
          p.image ?? null,
          p.soldCount !== undefined ? Number(p.soldCount) : null,
          String(id),
        ],
      });
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error updating product in Turso:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/products', async (_req: Request, res: Response) => {
    try {
      await client.execute('DELETE FROM products;');
      res.json({ success: true, message: 'All products cleared from Turso' });
    } catch (err: any) {
      console.error('Error clearing all products from Turso:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/products/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await client.execute({
        sql: 'DELETE FROM products WHERE id = ?;',
        args: [String(id)],
      });
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error deleting product from Turso:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/products/:id/restock', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { amount, reason, user } = req.body;
      const amountNum = Number(amount) || 0;

      // Get current product
      const cur = await client.execute({
        sql: 'SELECT * FROM products WHERE id = ?;',
        args: [String(id)],
      });

      if (cur.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Product not found' });
        return;
      }

      const prod: any = cur.rows[0];
      const prevStock = Number(prod.stock);
      const newStock = Math.max(0, prevStock + amountNum);

      await client.execute({
        sql: 'UPDATE products SET stock = ? WHERE id = ?;',
        args: [newStock, String(id)],
      });

      const logId = `log-${Date.now()}`;
      await client.execute({
        sql: `INSERT INTO stock_logs (id, productId, productName, previousStock, adjustedAmount, newStock, reason, date, user)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        args: [
          logId,
          String(id),
          String(prod.name),
          prevStock,
          amountNum,
          newStock,
          reason || 'Penyesuaian Manual',
          new Date().toLocaleString('id-ID'),
          user || 'Kasir',
        ],
      });

      res.json({ success: true, newStock });
    } catch (err: any) {
      console.error('Error restocking product in Turso:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. Categories Endpoints
  app.post('/api/categories', async (req: Request, res: Response) => {
    try {
      const { name, icon } = req.body;
      const id = name.toLowerCase().replace(/\s+/g, '-');
      await client.execute({
        sql: 'INSERT INTO categories (id, name, icon, itemCount) VALUES (?, ?, ?, 0);',
        args: [id, name, icon || 'tag'],
      });
      res.json({ success: true, id, name, icon });
    } catch (err: any) {
      console.error('Error adding category in Turso:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/categories/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await client.execute({
        sql: 'DELETE FROM categories WHERE id = ?;',
        args: [String(id)],
      });
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error deleting category from Turso:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/categories/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, icon } = req.body;
      const prev = await client.execute({
        sql: 'SELECT name FROM categories WHERE id = ?;',
        args: [String(id)],
      });
      const oldName = prev.rows[0]?.name ? String(prev.rows[0].name) : null;

      await client.execute({
        sql: `UPDATE categories SET
                name = COALESCE(?, name),
                icon = COALESCE(?, icon)
              WHERE id = ?;`,
        args: [name ?? null, icon ?? null, String(id)],
      });

      if (name && oldName && oldName !== name) {
        await client.execute({
          sql: 'UPDATE products SET category = ? WHERE category = ?;',
          args: [String(name), String(oldName)],
        });
      }

      res.json({ success: true, id, name, icon });
    } catch (err: any) {
      console.error('Error updating category in Turso:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. Transactions Endpoints
  app.post('/api/transactions', async (req: Request, res: Response) => {
    try {
      const tx: Transaction = req.body;
      await client.execute({
        sql: `INSERT INTO transactions (id, timestamp, cashier, items, subtotal, tax, taxRate, total, paymentMethod, amountPaid, change, status, notes)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
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

      // Deduct stock and increment soldCount for each item
      for (const item of tx.items) {
        await client.execute({
          sql: `UPDATE products
                SET stock = MAX(0, stock - ?),
                    soldCount = soldCount + ?
                WHERE id = ?;`,
          args: [item.quantity, item.quantity, String(item.id)],
        });

        // Add to stock_logs
        const logId = `log-${Date.now()}-${item.id}`;
        await client.execute({
          sql: `INSERT INTO stock_logs (id, productId, productName, previousStock, adjustedAmount, newStock, reason, date, user)
                SELECT ?, id, name, stock + ?, -?, stock, 'Penjualan', ?, ?
                FROM products WHERE id = ?;`,
          args: [
            logId,
            item.quantity,
            item.quantity,
            tx.timestamp,
            tx.cashier,
            String(item.id),
          ],
        });
      }

      res.json({ success: true, transaction: tx });
    } catch (err: any) {
      console.error('Error recording transaction in Turso:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/transactions/:id/cancel', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const txRes = await client.execute({
        sql: 'SELECT * FROM transactions WHERE id = ?;',
        args: [String(id)],
      });

      if (txRes.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Transaction not found' });
        return;
      }

      const txRow: any = txRes.rows[0];
      if (txRow.status === 'Batal') {
        res.json({ success: true, message: 'Already cancelled' });
        return;
      }

      await client.execute({
        sql: "UPDATE transactions SET status = 'Batal' WHERE id = ?;",
        args: [String(id)],
      });

      // Restore product stock
      let items = [];
      try {
        items = JSON.parse(String(txRow.items));
      } catch {
        items = [];
      }

      for (const item of items) {
        await client.execute({
          sql: `UPDATE products
                SET stock = stock + ?,
                    soldCount = MAX(0, soldCount - ?)
                WHERE id = ?;`,
          args: [item.quantity, item.quantity, String(item.id)],
        });
      }

      res.json({ success: true });
    } catch (err: any) {
      console.error('Error cancelling transaction in Turso:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/transactions/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { notes, status } = req.body;
      await client.execute({
        sql: `UPDATE transactions SET
                notes = COALESCE(?, notes),
                status = COALESCE(?, status)
              WHERE id = ?;`,
        args: [notes ?? null, status ?? null, String(id)],
      });
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error updating transaction in Turso:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/transactions/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await client.execute({
        sql: 'DELETE FROM transactions WHERE id = ?;',
        args: [String(id)],
      });
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error deleting transaction from Turso:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. Settings Endpoints
  app.put('/api/settings', async (req: Request, res: Response) => {
    try {
      const s = req.body;
      await client.execute({
        sql: `UPDATE settings SET
                storeName = COALESCE(?, storeName),
                storeAddress = COALESCE(?, storeAddress),
                storePhone = COALESCE(?, storePhone),
                receiptFooter = COALESCE(?, receiptFooter),
                taxRate = COALESCE(?, taxRate),
                enableTax = COALESCE(?, enableTax),
                currency = COALESCE(?, currency)
              WHERE id = 'default';`,
        args: [
          s.storeName ?? null,
          s.storeAddress ?? null,
          s.storePhone ?? null,
          s.receiptFooter ?? null,
          s.taxRate !== undefined ? Number(s.taxRate) : null,
          s.enableTax !== undefined ? (s.enableTax ? 1 : 0) : null,
          s.currency ?? null,
        ],
      });
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error updating settings in Turso:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 7. Users Endpoints
  app.post('/api/users', async (req: Request, res: Response) => {
    try {
      const u = req.body;
      const id = u.id || `usr-${Date.now()}`;
      await client.execute({
        sql: `INSERT INTO users (id, username, password, name, role, email, phone, avatar, createdAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        args: [
          id,
          u.username,
          u.password,
          u.name,
          u.role,
          u.email || null,
          u.phone || null,
          u.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFIOLuCKLDnyIIJU4BbW8BxkuFYQ0Lz1Sgr4djBuFlAVWvTDXVSPcpNPYFVAsUAHOp7tEOzeKxSb4URdt82aMCFMjp9G_Zin6rLG6_KfZWoV0bXB2Fagh-8xfVGoGaqkcUnaISTJsTneQGZfhWi-wKqfVrkm1CKrkK7TcryqeiMQJmb-9-UG0BRt-ft4JxQrA4HJkint0zXZPP9xvHqGCWSeM9u90yg5kF9TEzmDDsXtGgKvesKOzy',
          new Date().toISOString(),
        ],
      });
      res.json({ success: true, id });
    } catch (err: any) {
      console.error('Error creating user in Turso:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const u = req.body;
      await client.execute({
        sql: `UPDATE users SET
                name = COALESCE(?, name),
                username = COALESCE(?, username),
                password = COALESCE(?, password),
                role = COALESCE(?, role),
                email = COALESCE(?, email),
                phone = COALESCE(?, phone),
                avatar = COALESCE(?, avatar)
              WHERE id = ?;`,
        args: [
          u.name ?? null,
          u.username ?? null,
          u.password ?? null,
          u.role ?? null,
          u.email ?? null,
          u.phone ?? null,
          u.avatar ?? null,
          String(id),
        ],
      });
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error updating user in Turso:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await client.execute({
        sql: 'DELETE FROM users WHERE id = ?;',
        args: [String(id)],
      });
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error deleting user from Turso:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 8. Register Shift Endpoints
  app.post('/api/shift/open', async (req: Request, res: Response) => {
    try {
      const { startingCash, cashier } = req.body;
      await client.execute({
        sql: `UPDATE register_shift SET
                isOpen = 1,
                startingCash = ?,
                openedAt = ?,
                closedAt = NULL,
                openedBy = ?
              WHERE id = 'current';`,
        args: [Number(startingCash) || 0, new Date().toISOString(), cashier || 'Kasir'],
      });
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error opening register in Turso:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/shift/close', async (_req: Request, res: Response) => {
    try {
      await client.execute({
        sql: `UPDATE register_shift SET
                isOpen = 0,
                closedAt = ?
              WHERE id = 'current';`,
        args: [new Date().toISOString()],
      });
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error closing register in Turso:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 9. Reset Demo Data
  app.post('/api/reset', async (_req: Request, res: Response) => {
    try {
      await client.execute('DELETE FROM products;');
      await client.execute('DELETE FROM categories;');
      await client.execute('DELETE FROM transactions;');
      await client.execute('DELETE FROM stock_logs;');

      for (const cat of INITIAL_CATEGORIES) {
        await client.execute({
          sql: 'INSERT INTO categories (id, name, icon, itemCount) VALUES (?, ?, ?, ?)',
          args: [cat.id, cat.name, cat.icon || null, cat.itemCount || 0],
        });
      }

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

      res.json({ success: true, message: 'Database reset to default seed' });
    } catch (err: any) {
      console.error('Error resetting Turso data:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
