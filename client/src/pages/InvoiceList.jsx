import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../utils/format';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { getInvoices, searchInvoices, deleteInvoice } from '../lib/invoiceService';

const InvoiceList = () => {
    const [invoices, setInvoices] = useState([]);
    const [search, setSearch] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState(null);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const data = await getInvoices();
            setInvoices(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        }
    };

    const handleSearch = async () => {
        try {
            const data = await searchInvoices({ name: search, from: dateFrom, to: dateTo });
            setInvoices(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error searching invoices:', error);
        }
    };

    const handleDeleteClick = (id, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setInvoiceToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!invoiceToDelete) return;

        try {
            await deleteInvoice(invoiceToDelete);
            fetchInvoices();
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Terjadi kesalahan saat menghapus invoice');
        } finally {
            setDeleteModalOpen(false);
            setInvoiceToDelete(null);
        }
    };

    const cancelDelete = () => {
        setDeleteModalOpen(false);
        setInvoiceToDelete(null);
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8 no-print">
                <h1 className="text-2xl font-bold text-gray-800">Daftar Invoice</h1>
                <Link to="/new" className="bg-brand text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <Plus size={20} /> Buat Invoice Baru
                </Link>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm mb-6 no-print">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Customer</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#325C74]"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
                        <input
                            type="date"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#325C74]"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
                        <input
                            type="date"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#325C74]"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="bg-gray-800 text-white px-6 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-700"
                    >
                        <Search size={18} /> Cari
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-brand text-white">
                            <th className="px-6 py-4 font-semibold">No</th>
                            <th className="px-6 py-4 font-semibold">Customer</th>
                            <th className="px-6 py-4 font-semibold">Tanggal</th>
                            <th className="px-6 py-4 font-semibold text-right">Total</th>
                            <th className="px-6 py-4 font-semibold text-right">Sisa Bayar</th>
                            <th className="px-6 py-4 font-semibold text-center no-print">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {invoices.map((inv, index) => (
                            <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">{index + 1}</td>
                                <td className="px-6 py-4 font-medium">{inv.customer}</td>
                                <td className="px-6 py-4">{formatDate(inv.date)}</td>
                                <td className="px-6 py-4 text-right">{formatCurrency(inv.grand_total)}</td>
                                <td className="px-6 py-4 text-right font-bold text-red-600">{formatCurrency(inv.remaining)}</td>
                                <td className="px-6 py-4 no-print">
                                    <div className="flex justify-center gap-2">
                                        <Link to={`/edit/${inv.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                            <Edit2 size={18} />
                                        </Link>
                                        <button onClick={(e) => handleDeleteClick(inv.id, e)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {invoices.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">Tidak ada data invoice.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {deleteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="mb-6 text-center">
                            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <Trash2 className="text-red-600 w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Invoice?</h3>
                            <p className="text-gray-500 text-sm">
                                Apakah kamu yakin ingin menghapus invoice ini? Data yang sudah dihapus tidak dapat dikembalikan.
                            </p>
                        </div>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={cancelDelete}
                                className="px-5 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoiceList;
