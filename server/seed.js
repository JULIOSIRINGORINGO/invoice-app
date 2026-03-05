const pool = require('./db');

async function seed() {
    try {
        // Clear existing data
        await pool.query('DELETE FROM invoice_items');
        await pool.query('DELETE FROM invoices');

        // Insert test invoice
        const { rows } = await pool.query(`
      INSERT INTO invoices (customer, date, dp, discount, grand_total, remaining)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, ['Test Customer', '2026-03-05', 50000, 10000, 210000, 150000]);

        const invoiceId = rows[0].id;

        // Insert test items
        await pool.query(`
      INSERT INTO invoice_items (invoice_id, product, color, size, quantity, price, amount)
      VALUES 
        ($1, 'Kaos Polos', 'Hitam', 'M', 2, 50000, 100000),
        ($1, 'Kaos Polos', 'Hitam', 'L', 1, 50000, 50000),
        ($1, 'Kaos Sablon', 'Putih', 'XL', 3, 20000, 60000)
    `, [invoiceId]);

        console.log('✅ Seed berhasil!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed gagal:', err);
        process.exit(1);
    }
}

seed();
