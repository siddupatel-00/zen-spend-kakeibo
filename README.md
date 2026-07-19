# Zen Spend — Kakeibo Financial Habit Tracker

**Zen Spend** is a beautiful, dark-mode glassmorphic financial habit and progress tracker MVP inspired by the traditional 1904 Japanese **Kakeibo (家計簿)** method developed by Hani Motoko. 

The core philosophy of Kakeibo is to transition from **mindless consumption** to **mindful spending**, emphasizing savings first (creating "artificial scarcity") and reflecting deeply on our desires.

---

## Key Features

1. **Artificial Scarcity Dashboard**:
   - Set monthly Income & Savings Goals.
   - Automatically calculates your **Spending Pool** (Income - Savings Goal), enforcing savings upfront.
   - Computes **Hourly Wage / Labor Cost Equivalence** dynamically so you know exactly how many hours of work a purchase costs.

2. **The Four Pillars (Envelope Method)**:
   - Categorizes spending into **Needs** (essential), **Wants** (optional comforts), **Experience & Growth** (books, courses, travel), and **Extra** (emergency costs).
   - Tracks a strict **Wants Envelope** budget. The card turns red with an "Envelope Empty" warning if you go over budget.

3. **24-48h Cooling-off Tracker**:
   - Place items you want to buy on a cooldown timer (24h, 48h, etc.).
   - A live countdown forces a pause. Once complete, decide to **"Mindfully Buy"** or **"Safely Dismiss"** (celebrate how much money you saved!).

4. **Monozukuri Inventory**:
   - A list of cherished belongings you own (like your laptop).
   - Log care activities (e.g. cleaning, maintenance) to foster gratitude and reduce disposable habits.

5. **Financial Protection indicators**:
   - A checklist for Term Insurance & Health Insurance (displays warnings if either is missing, keeping household security locked down).

6. **Promises & Reflections**:
   - Set monthly commitments (e.g., "No takeout during weekdays") and reflect at the end of the month.

---

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript
- **Styling**: Vanilla CSS (High-fidelity glassmorphism, responsive, custom scrollbars, animations)
- **Database**: Turso SQLite / Neon PostgreSQL (falls back to a local `local.db` file for zero-setup local development out of the box)
- **Icons**: Lucide React

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the application.

---

## Production Deployment

You can deploy this application directly to **Vercel** or **Netlify**:

### Environment Variables
Configure the following env variables in your deployment dashboard:
- `TURSO_URL`: Your remote Turso database URL.
- `TURSO_TOKEN`: Your Turso authorization token.
- *Or* `NEON_DATABASE_URL` (for PostgreSQL).

If no environment variables are provided, it will write database schemas and logs to a local file database (`local.db`) in the root directory.
