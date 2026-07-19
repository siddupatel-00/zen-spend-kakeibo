import { createClient } from '@libsql/client';

const url = process.env.TURSO_URL || 'file:local.db';
const authToken = process.env.TURSO_TOKEN;

export const db = createClient({
  url,
  authToken,
});

/**
 * Helper to initialize database tables if they do not exist.
 * This is called during app initialization/actions to ensure zero-config setup.
 */
export async function initDatabase() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month TEXT UNIQUE, -- YYYY-MM
      income REAL,
      savings_goal REAL,
      hourly_rate REAL,
      insurance_term INTEGER DEFAULT 0, -- boolean 0/1
      insurance_health INTEGER DEFAULT 0, -- boolean 0/1
      wants_limit REAL DEFAULT 0
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL,
      category TEXT, -- 'needs', 'wants', 'experience', 'extra'
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

  // Insert default/initial values if table is empty
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  try {
    const budgetCheck = await db.execute({
      sql: 'SELECT id FROM budgets WHERE month = ?',
      args: [currentMonth]
    });

    if (budgetCheck.rows.length === 0) {
      await db.execute({
        sql: 'INSERT INTO budgets (month, income, savings_goal, hourly_rate) VALUES (?, 0, 0, 0)',
        args: [currentMonth]
      });
    }
  } catch (e) {
    console.error('Failed to seed initial budget:', e);
  }
}
