const express = require('express');
const router = express.Router();
const db = require('../db');

// List all invoices
router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM invoices ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Search invoices
router.get('/search', async (req, res) => {
    const { name, from, to } = req.query;
    try {
        let query = 'SELECT * FROM invoices WHERE 1=1';
        const params = [];
        let index = 1;

        if (name) {
            query += ` AND customer ILIKE $${index}`;
            params.push(`%${name}%`);
            index++;
        }
        if (from) {
            query += ` AND date >= $${index}`;
            params.push(from);
            index++;
        }
        if (to) {
            query += ` AND date <= $${index}`;
            params.push(to);
            index++;
        }

        query += ' ORDER BY created_at DESC';
        const { rows } = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Detail invoice + items
router.get('/:id', async (req, res) => {
    try {
        const invoiceRes = await db.query('SELECT * FROM invoices WHERE id = $1', [req.params.id]);
        if (invoiceRes.rows.length === 0) return res.status(404).json({ error: 'Invoice not found' });

        const itemsRes = await db.query('SELECT * FROM invoice_items WHERE invoice_id = $1', [req.params.id]);
        res.json({ ...invoiceRes.rows[0], items: itemsRes.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Save new invoice
router.post('/', async (req, res) => {
    const { customer, date, dp, discount, grand_total, remaining, items } = req.body;

    try {
        await db.query('BEGIN');

        const insertInvoice = `
            INSERT INTO invoices (customer, date, dp, discount, grand_total, remaining)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
        `;
        const invoiceRes = await db.query(insertInvoice, [customer, date, dp || 0, discount || 0, grand_total || 0, remaining || 0]);
        const invoiceId = invoiceRes.rows[0].id;

        const insertItem = `
            INSERT INTO invoice_items (invoice_id, product, color, size, quantity, price, amount)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        for (const item of items) {
            await db.query(insertItem, [invoiceId, item.product, item.color, item.size, item.quantity || 0, item.price || 0, item.amount || 0]);
        }

        await db.query('COMMIT');
        res.status(201).json({ id: invoiceId });
    } catch (err) {
        await db.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    }
});

// Update invoice
router.put('/:id', async (req, res) => {
    const { customer, date, dp, discount, grand_total, remaining, items } = req.body;
    const invoiceId = req.params.id;

    try {
        await db.query('BEGIN');

        const updateInvoice = `
            UPDATE invoices SET customer = $1, date = $2, dp = $3, discount = $4, grand_total = $5, remaining = $6
            WHERE id = $7
        `;
        await db.query(updateInvoice, [customer, date, dp || 0, discount || 0, grand_total || 0, remaining || 0, invoiceId]);

        await db.query('DELETE FROM invoice_items WHERE invoice_id = $1', [invoiceId]);

        const insertItem = `
            INSERT INTO invoice_items (invoice_id, product, color, size, quantity, price, amount)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        for (const item of items) {
            await db.query(insertItem, [invoiceId, item.product, item.color, item.size, item.quantity || 0, item.price || 0, item.amount || 0]);
        }

        await db.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await db.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    }
});

// Delete invoice
router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await db.query('BEGIN');
        await db.query('DELETE FROM invoice_items WHERE invoice_id = $1', [id]);
        await db.query('DELETE FROM invoices WHERE id = $1', [id]);
        await db.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await db.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
