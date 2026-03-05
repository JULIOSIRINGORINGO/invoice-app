const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'invoice.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer TEXT NOT NULL,
    date TEXT NOT NULL,
    dp INTEGER DEFAULT 0,
    discount INTEGER DEFAULT 0,
    grand_total INTEGER DEFAULT 0,
    remaining INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    product TEXT,
    color TEXT,
    size TEXT,
    quantity INTEGER DEFAULT 0,
    price INTEGER DEFAULT 0,
    amount INTEGER DEFAULT 0,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
  );
`);

module.exports = db;
