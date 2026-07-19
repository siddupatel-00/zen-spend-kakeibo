'use server';

import { db, initDatabase } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Helper to format date as YYYY-MM-DD
function getTodayString() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export async function getKakeiboData(month: string) {
  await initDatabase();

  // 1. Fetch budget for this month
  let budgetResult = await db.execute({
    sql: 'SELECT * FROM budgets WHERE month = ?',
    args: [month],
  });

  if (budgetResult.rows.length === 0) {
    await db.execute({
      sql: 'INSERT INTO budgets (month, income, savings_goal, hourly_rate, insurance_term, insurance_health, wants_limit) VALUES (?, 0, 0, 0, 0, 0, 0)',
      args: [month],
    });
    budgetResult = await db.execute({
      sql: 'SELECT * FROM budgets WHERE month = ?',
      args: [month],
    });
  }
  const budget = budgetResult.rows[0];

  // 2. Fetch expenses for this month (date starts with YYYY-MM)
  const expensesResult = await db.execute({
    sql: 'SELECT * FROM expenses WHERE date LIKE ? ORDER BY date DESC, id DESC',
    args: [`${month}%`],
  });
  const expenses = expensesResult.rows;

  // 3. Fetch cooling off items
  const coolingOffResult = await db.execute('SELECT * FROM cooling_off_items ORDER BY id DESC');
  const coolingOffItems = coolingOffResult.rows;

  // 4. Fetch monozukuri items
  const monozukuriResult = await db.execute('SELECT * FROM monozukuri_items ORDER BY id DESC');
  const monozukuriItems = monozukuriResult.rows.map(row => {
    let careLog: string[] = [];
    try {
      careLog = JSON.parse(row.care_log as string || '[]');
    } catch (e) {
      careLog = [];
    }
    return {
      ...row,
      care_log: careLog
    };
  });

  // 5. Fetch promise/reflection for this month
  let promiseResult = await db.execute({
    sql: 'SELECT * FROM promises WHERE month = ?',
    args: [month],
  });

  if (promiseResult.rows.length === 0) {
    await db.execute({
      sql: "INSERT INTO promises (month, promise_text, reflection) VALUES (?, '', '')",
      args: [month],
    });
    promiseResult = await db.execute({
      sql: 'SELECT * FROM promises WHERE month = ?',
      args: [month],
    });
  }
  const promise = promiseResult.rows[0];

  // 6. Fetch settings
  let settingsResult = await db.execute('SELECT * FROM settings LIMIT 1');
  if (settingsResult.rows.length === 0) {
    await db.execute("INSERT INTO settings (username, currency, avatar) VALUES ('Zen User', '$', '🧘')");
    settingsResult = await db.execute('SELECT * FROM settings LIMIT 1');
  }
  const settings = settingsResult.rows[0];

  // 7. Fetch daily logs for the month
  const dailyLogsResult = await db.execute({
    sql: 'SELECT * FROM daily_logs WHERE date LIKE ?',
    args: [`${month}%`],
  });
  const dailyLogs = dailyLogsResult.rows.map(row => {
    let habits: string[] = [];
    try {
      habits = JSON.parse(row.habits as string || '[]');
    } catch (e) {
      habits = [];
    }
    return { ...row, habits };
  });

  return JSON.parse(JSON.stringify({
    budget,
    expenses,
    coolingOffItems,
    monozukuriItems,
    promise,
    settings,
    dailyLogs,
    dbType: process.env.DATABASE_URL 
      ? 'Neon Serverless PostgreSQL' 
      : (process.env.TURSO_URL && !process.env.TURSO_URL.startsWith('file:') ? 'Turso Cloud SQLite' : 'SQLite Local File'),
    dbPath: process.env.DATABASE_URL 
      ? (process.env.DATABASE_URL.split('@')[1] || 'neon.tech') 
      : (process.env.TURSO_URL ? process.env.TURSO_URL : 'local.db')
  }));
}

export async function updateBudget(
  month: string,
  income: number,
  savingsGoal: number,
  hourlyRate: number,
  wantsLimit: number
) {
  await db.execute({
    sql: 'UPDATE budgets SET income = ?, savings_goal = ?, hourly_rate = ?, wants_limit = ? WHERE month = ?',
    args: [income, savingsGoal, hourlyRate, wantsLimit, month],
  });
  revalidatePath('/');
}

export async function toggleInsurance(
  month: string,
  type: 'term' | 'health',
  checked: boolean
) {
  const column = type === 'term' ? 'insurance_term' : 'insurance_health';
  const val = checked ? 1 : 0;
  await db.execute({
    sql: `UPDATE budgets SET ${column} = ? WHERE month = ?`,
    args: [val, month],
  });
  revalidatePath('/');
}

export async function addExpense(
  amount: number,
  category: string,
  description: string,
  date: string
) {
  await db.execute({
    sql: 'INSERT INTO expenses (amount, category, description, date) VALUES (?, ?, ?, ?)',
    args: [amount, category, description, date || getTodayString()],
  });
  revalidatePath('/');
}

export async function deleteExpense(id: number) {
  await db.execute({
    sql: 'DELETE FROM expenses WHERE id = ?',
    args: [id],
  });
  revalidatePath('/');
}

export async function addCoolingOffItem(
  name: string,
  cost: number,
  durationHours: number
) {
  await db.execute({
    sql: 'INSERT INTO cooling_off_items (name, cost, added_date, duration_hours, status) VALUES (?, ?, ?, ?, ?)',
    args: [name, cost, new Date().toISOString(), durationHours, 'pending'],
  });
  revalidatePath('/');
}

export async function resolveCoolingOffItem(
  id: number,
  action: 'buy' | 'dismiss'
) {
  const itemResult = await db.execute({
    sql: 'SELECT * FROM cooling_off_items WHERE id = ?',
    args: [id],
  });
  if (itemResult.rows.length === 0) return;
  const item = itemResult.rows[0];

  if (action === 'buy') {
    // Convert to Wants expense
    await db.execute({
      sql: 'INSERT INTO expenses (amount, category, description, date) VALUES (?, ?, ?, ?)',
      args: [
        item.cost,
        'wants',
        `Cooling-off Buy: ${item.name}`,
        getTodayString()
      ],
    });
    await db.execute({
      sql: "UPDATE cooling_off_items SET status = 'purchased' WHERE id = ?",
      args: [id],
    });
  } else {
    // Dismiss
    await db.execute({
      sql: "UPDATE cooling_off_items SET status = 'dismissed' WHERE id = ?",
      args: [id],
    });
  }
  revalidatePath('/');
}

export async function addMonozukuriItem(
  name: string,
  description: string,
  purchaseDate: string
) {
  await db.execute({
    sql: 'INSERT INTO monozukuri_items (name, description, purchase_date, care_log) VALUES (?, ?, ?, ?)',
    args: [name, description, purchaseDate || getTodayString(), JSON.stringify([])],
  });
  revalidatePath('/');
}

export async function addCareLog(id: number, logMessage: string) {
  const itemResult = await db.execute({
    sql: 'SELECT care_log FROM monozukuri_items WHERE id = ?',
    args: [id],
  });
  if (itemResult.rows.length === 0) return;
  
  let careLog: string[] = [];
  try {
    careLog = JSON.parse(itemResult.rows[0].care_log as string || '[]');
  } catch (e) {
    careLog = [];
  }
  
  const today = getTodayString();
  careLog.unshift(`${today}: ${logMessage}`); // Add new log at the start
  
  await db.execute({
    sql: 'UPDATE monozukuri_items SET care_log = ? WHERE id = ?',
    args: [JSON.stringify(careLog), id],
  });
  revalidatePath('/');
}

export async function updatePromise(
  month: string,
  promiseText: string,
  reflectionText: string
) {
  await db.execute({
    sql: 'INSERT INTO promises (month, promise_text, reflection) VALUES (?, ?, ?) ON CONFLICT(month) DO UPDATE SET promise_text = ?, reflection = ?',
    args: [month, promiseText, reflectionText, promiseText, reflectionText],
  });
  revalidatePath('/');
}

export async function updateSettings(
  username: string,
  currency: string,
  avatar: string
) {
  await db.execute({
    sql: 'UPDATE settings SET username = ?, currency = ?, avatar = ? WHERE id = 1',
    args: [username, currency, avatar],
  });
  revalidatePath('/');
}

export async function updateDailyLog(
  date: string,
  habits: string[]
) {
  await db.execute({
    sql: 'INSERT INTO daily_logs (date, habits) VALUES (?, ?) ON CONFLICT(date) DO UPDATE SET habits = ?',
    args: [date, JSON.stringify(habits), JSON.stringify(habits)],
  });
  revalidatePath('/');
}
