const express = require('express');
const router = express.Router();
const db = require('../db');

// List all invoices
router.get('/', (req, res) => {
    try {
        const invoices = db.prepare('SELECT * FROM invoices ORDER BY created_at DESC').all();
        res.json(invoices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Search invoices
router.get('/search', (req, res) => {
    const { name, from, to } = req.query;
    try {
        let query = 'SELECT * FROM invoices WHERE 1=1';
        const params = [];

        if (name) {
            query += ' AND customer LIKE ?';
            params.push(`%${name}%`);
        }
        if (from) {
            query += ' AND date >= ?';
            params.push(from);
        }
        if (to) {
            query += ' AND date <= ?';
            params.push(to);
        }

        query += ' ORDER BY created_at DESC';
        const invoices = db.prepare(query).all(...params);
        res.json(invoices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Detail invoice + items
router.get('/:id', (req, res) => {
    try {
        const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id);
        if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

        const items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(req.params.id);
        res.json({ ...invoice, items });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Save new invoice
router.post('/', (req, res) => {
    const { customer, date, dp, discount, grand_total, remaining, items } = req.body;

    const insertInvoice = db.prepare(`
    INSERT INTO invoices (customer, date, dp, discount, grand_total, remaining)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

    const insertItem = db.prepare(`
    INSERT INTO invoice_items (invoice_id, product, color, size, quantity, price, amount)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

    const transaction = db.transaction(() => {
        const info = insertInvoice.run(customer, date, dp || 0, discount || 0, grand_total || 0, remaining || 0);
        const invoiceId = info.lastInsertRowid;

        for (const item of items) {
            insertItem.run(invoiceId, item.product, item.color, item.size, item.quantity || 0, item.price || 0, item.amount || 0);
        }
        return invoiceId;
    });

    try {
        const id = transaction();
        res.status(201).json({ id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update invoice
router.put('/:id', (req, res) => {
    const { customer, date, dp, discount, grand_total, remaining, items } = req.body;
    const invoiceId = req.params.id;

    const updateInvoice = db.prepare(`
    UPDATE invoices SET customer = ?, date = ?, dp = ?, discount = ?, grand_total = ?, remaining = ?
    WHERE id = ?
  `);

    const deleteItems = db.prepare('DELETE FROM invoice_items WHERE invoice_id = ?');
    const insertItem = db.prepare(`
    INSERT INTO invoice_items (invoice_id, product, color, size, quantity, price, amount)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

    const transaction = db.transaction(() => {
        updateInvoice.run(customer, date, dp || 0, discount || 0, grand_total || 0, remaining || 0, invoiceId);
        deleteItems.run(invoiceId);
        for (const item of items) {
            insertItem.run(invoiceId, item.product, item.color, item.size, item.quantity || 0, item.price || 0, item.amount || 0);
        }
    });

    try {
        transaction();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete invoice
router.delete('/:id', (req, res) => {
    try {
        const id = req.params.id;
        const deleteItems = db.prepare('DELETE FROM invoice_items WHERE invoice_id = ?');
        const deleteInvoice = db.prepare('DELETE FROM invoices WHERE id = ?');

        const transaction = db.transaction(() => {
            deleteItems.run(id);
            deleteInvoice.run(id);
        });

        transaction();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
