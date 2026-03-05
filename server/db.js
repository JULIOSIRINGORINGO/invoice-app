const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS invoices (
      id SERIAL PRIMARY KEY,
      customer TEXT NOT NULL,
      date TEXT NOT NULL,
      dp INTEGER DEFAULT 0,
      discount INTEGER DEFAULT 0,
      grand_total INTEGER DEFAULT 0,
      remaining INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS invoice_items (
      id SERIAL PRIMARY KEY,
      invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
      product TEXT,
      color TEXT,
      size TEXT,
      quantity INTEGER DEFAULT 0,
      price INTEGER DEFAULT 0,
      amount INTEGER DEFAULT 0
    );
  `);
}

initDB();
module.exports = pool;
