import { createClient } from '@libsql/client';

const url = process.env.TURSO_URL || 'file:local.db';
const authToken = process.env.TURSO_TOKEN;

export const db = createClient({
  url,
  authToken,
});

/**
 * Initialize database tables and seed demo data for hackathon judges.
 */
export async function initDatabase() {
  // 1. Create Tables
  await db.execute(`
    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month TEXT UNIQUE, -- YYYY-MM
      income REAL DEFAULT 0,
      savings_goal REAL DEFAULT 0,
      hourly_rate REAL DEFAULT 0,
      insurance_term INTEGER DEFAULT 0, -- boolean 0/1
      insurance_health INTEGER DEFAULT 0, -- boolean 0/1
      wants_limit REAL DEFAULT 0
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL,
      category TEXT, -- 'needs', 'wants', 'experience', 'unexpected'
      description TEXT,
      date TEXT -- YYYY-MM-DD
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS cooling_off_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      cost REAL,
      added_date TEXT, -- ISO string
      duration_hours INTEGER,
      status TEXT -- 'pending', 'purchased', 'dismissed'
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS monozukuri_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      description TEXT,
      purchase_date TEXT,
      care_log TEXT -- JSON string array
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS promises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month TEXT UNIQUE, -- YYYY-MM
      promise_text TEXT,
      reflection TEXT
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS daily_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE, -- YYYY-MM-DD
      habits TEXT -- JSON string list of checked habits
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT DEFAULT 'Hani Motoko',
      currency TEXT DEFAULT '$',
      avatar TEXT DEFAULT '🧘'
    );
  `);

  // 2. Seeding logic
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  try {
    // A. Seed settings
    const settingsCheck = await db.execute('SELECT id FROM settings LIMIT 1');
    if (settingsCheck.rows.length === 0) {
      await db.execute(`
        INSERT INTO settings (username, currency, avatar) 
        VALUES ('Hani Motoko', '$', '🧘')
      `);
    }

    // B. Seed default budgets
    const budgetCheck = await db.execute({
      sql: 'SELECT id FROM budgets WHERE month = ?',
      args: [currentMonth]
    });
    if (budgetCheck.rows.length === 0) {
      await db.execute({
        sql: `INSERT INTO budgets (month, income, savings_goal, hourly_rate, insurance_term, insurance_health, wants_limit) 
              VALUES (?, 4500, 1000, 25, 1, 1, 600)`,
        args: [currentMonth]
      });
    }

    // C. Seed default promises
    const promiseCheck = await db.execute({
      sql: 'SELECT id FROM promises WHERE month = ?',
      args: [currentMonth]
    });
    if (promiseCheck.rows.length === 0) {
      await db.execute({
        sql: `INSERT INTO promises (month, promise_text, reflection) 
              VALUES (?, 'I promise to think about the labor cost in hours for every Wants item and respect the cooling-off period.', 'I feel more mindful about my spending this month. The countdown timer helped me save over $300!')`,
        args: [currentMonth]
      });
    }

    // D. Seed expenses (2-3 weeks of data)
    const expenseCheck = await db.execute('SELECT id FROM expenses LIMIT 1');
    if (expenseCheck.rows.length === 0) {
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      
      const seedExpenses = [
        { amount: 1200, category: 'needs', description: 'Rent / Home Insurance', day: '01' },
        { amount: 145, category: 'needs', description: 'Organic Groceries', day: '04' },
        { amount: 80, category: 'needs', description: 'Electricity & Gas bill', day: '08' },
        { amount: 250, category: 'wants', description: 'Dinner with friends at Omakase', day: '10' },
        { amount: 65, category: 'experience', description: 'Zen Meditation Course', day: '12' },
        { amount: 35, category: 'experience', description: 'Japanese Cooking Book', day: '15' },
        { amount: 120, category: 'needs', description: 'Health & Pharmacy Prescriptions', day: '16' },
        { amount: 180, category: 'unexpected', description: 'Emergency Car Tire Replacement', day: '18' },
        { amount: 95, category: 'wants', description: 'Premium Coffee Beans & Mug', day: '19' },
      ];

      for (const item of seedExpenses) {
        const dateStr = `${year}-${month}-${item.day}`;
        await db.execute({
          sql: 'INSERT INTO expenses (amount, category, description, date) VALUES (?, ?, ?, ?)',
          args: [item.amount, item.category, item.description, dateStr]
        });
      }
    }

    // E. Seed cooling off items
    const coolingCheck = await db.execute('SELECT id FROM cooling_off_items LIMIT 1');
    if (coolingCheck.rows.length === 0) {
      // 1. A pending cooling off item (added 10h ago, active timer)
      const date1 = new Date();
      date1.setHours(date1.getHours() - 10);
      await db.execute({
        sql: 'INSERT INTO cooling_off_items (name, cost, added_date, duration_hours, status) VALUES (?, ?, ?, ?, ?)',
        args: ['Wireless Noise-cancelling Headphones', 299, date1.toISOString(), 48, 'pending']
      });

      // 2. An expired cooling off item (added 72h ago, ready to decide)
      const date2 = new Date();
      date2.setHours(date2.getHours() - 72);
      await db.execute({
        sql: 'INSERT INTO cooling_off_items (name, cost, added_date, duration_hours, status) VALUES (?, ?, ?, ?, ?)',
        args: ['Designer Mechanical Keyboard', 180, date2.toISOString(), 24, 'pending']
      });

      // 3. A dismissed cooling off item (saved money!)
      const date3 = new Date();
      date3.setHours(date3.getHours() - 120);
      await db.execute({
        sql: 'INSERT INTO cooling_off_items (name, cost, added_date, duration_hours, status) VALUES (?, ?, ?, ?, ?)',
        args: ['Smart Sports Watch v5', 350, date3.toISOString(), 48, 'dismissed']
      });
    }

    // F. Seed monozukuri items
    const monoCheck = await db.execute('SELECT id FROM monozukuri_items LIMIT 1');
    if (monoCheck.rows.length === 0) {
      await db.execute({
        sql: 'INSERT INTO monozukuri_items (name, description, purchase_date, care_log) VALUES (?, ?, ?, ?)',
        args: [
          'MacBook Pro 14"',
          'Primary work computer. Kept clean and well maintained.',
          '2024-11-20',
          JSON.stringify([
            '2026-07-15: Cleaned ports and wiped down keyboard and display',
            '2026-05-10: Ran software diagnostic and cleared cache files'
          ])
        ]
      });

      await db.execute({
        sql: 'INSERT INTO monozukuri_items (name, description, purchase_date, care_log) VALUES (?, ?, ?, ?)',
        args: [
          'Leather Office Bag',
          'Handcrafted Japanese leather bag. Worn with character.',
          '2025-03-01',
          JSON.stringify([
            '2026-07-02: Treated with mink oil and leather conditioner',
            '2026-02-12: Cleaned internal lining'
          ])
        ]
      });
    }

    // G. Seed daily logs (a few checklist check-ins)
    const logsCheck = await db.execute('SELECT id FROM daily_logs LIMIT 1');
    if (logsCheck.rows.length === 0) {
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      
      const seedLogs = [
        { day: '15', habits: ['budget', 'no_spend', 'cooking'] },
        { day: '16', habits: ['budget', 'monozukuri', 'growth', 'cooking'] },
        { day: '17', habits: ['budget', 'no_spend', 'monozukuri', 'growth', 'cooking'] }, // 5/5 complete!
        { day: '18', habits: ['budget', 'growth'] },
        { day: '19', habits: ['budget', 'no_spend', 'cooking'] }
      ];

      for (const log of seedLogs) {
        const dateStr = `${year}-${month}-${log.day}`;
        await db.execute({
          sql: 'INSERT INTO daily_logs (date, habits) VALUES (?, ?)',
          args: [dateStr, JSON.stringify(log.habits)]
        });
      }
    }

  } catch (e) {
    console.error('Seeding database error:', e);
  }
}
