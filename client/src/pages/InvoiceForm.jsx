import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, FileText, Lock, Unlock } from 'lucide-react';
import InvoiceTable from '../components/InvoiceTable';
import { formatCurrency, parseCurrency, formatDate } from '../utils/format';
import { getInvoiceById, createInvoice, updateInvoice } from '../lib/invoiceService';

const InvoiceForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const printRef = useRef();
    const customerInputRef = useRef();

    const [customer, setCustomer] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [products, setProducts] = useState([
        {
            id: Date.now(),
            product: '',
            color: '',
            sizes: [{ id: Date.now() + 1, size: '', quantity: 1, price: 0, amount: 0 }]
        }
    ]);
    const [dp, setDp] = useState(0);
    const [discount, setDiscount] = useState(0);

    // New states for UX
    const [isSignatureLocked, setIsSignatureLocked] = useState(false);

    useEffect(() => {
        if (id) {
            fetchInvoiceDetail();
        }
        // Auto-focus on Nama Customer
        if (customerInputRef.current) {
            customerInputRef.current.focus();
        }

        // Global Keyboard Shortcuts
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                handleSave();
            } else if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                handlePrint();
            } else if (e.key === 'Escape') {
                navigate('/');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [id, navigate]);

    const fetchInvoiceDetail = async () => {
        try {
            const data = await getInvoiceById(id);
            setCustomer(data.customer);
            setDate(data.date);
            setDp(data.dp);
            setDiscount(data.discount);

            // Supabase returns invoice_items as the related table name
            const items = data.invoice_items || [];
            const grouped = items.reduce((acc, item) => {
                const key = `${item.product}-${item.color}`;
                if (!acc[key]) {
                    acc[key] = {
                        id: item.id,
                        product: item.product,
                        color: item.color,
                        sizes: []
                    };
                }
                acc[key].sizes.push({
                    id: item.id,
                    size: item.size,
                    quantity: item.quantity,
                    price: item.price,
                    amount: item.amount
                });
                return acc;
            }, {});

            setProducts(Object.values(grouped));
        } catch (error) {
            console.error('Error fetching invoice detail:', error);
        }
    };

    const calculateGrandTotal = () => {
        return products.reduce((sum, p) =>
            sum + p.sizes.reduce((sSum, s) => sSum + s.amount, 0), 0
        );
    };

    const grandTotal = calculateGrandTotal();
    const remaining = grandTotal - discount - dp;

    const handleSave = async (e) => {
        if (e) e.preventDefault();

        const invoiceData = {
            customer,
            date,
            dp,
            discount,
            grand_total: grandTotal,
            remaining: remaining,
        };

        const items = products.flatMap(p => p.sizes.map(s => ({
            product: p.product,
            color: p.color,
            size: s.size,
            quantity: s.quantity,
            price: s.price,
            amount: s.amount
        })));

        try {
            if (id) {
                await updateInvoice(id, invoiceData, items);
            } else {
                await createInvoice(invoiceData, items);
            }
            navigate('/');
        } catch (error) {
            console.error('Error saving invoice:', error);
            alert('Gagal menyimpan invoice');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen print:min-h-0 bg-gray-100 print:bg-transparent p-6 print:p-0">
            <div className="max-w-4xl mx-auto">
                <div className="mb-4 flex justify-between items-center no-print">
                    <div className="flex flex-col gap-1">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 transition-colors shadow-sm"
                        >
                            <ChevronLeft size={20} /> Kembali ke Dashboard
                        </button>
                        <span className="text-[10px] text-gray-400 ml-1">Hint: "Esc"</span>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex flex-col items-center gap-1">
                            <button
                                onClick={handlePrint}
                                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-md transition-colors"
                            >
                                <FileText size={20} /> Print/PDF
                            </button>
                            <span className="text-[10px] text-gray-400">Hint: "Ctrl+P"</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <button
                                onClick={handleSave}
                                className="bg-[#325C74] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:opacity-90 shadow-md transition-colors"
                            >
                                <Save size={20} /> Simpan Invoice
                            </button>
                            <span className="text-[10px] text-gray-400">Hint: "Ctrl+S"</span>
                        </div>
                    </div>
                </div>

                <div ref={printRef} className="bg-white p-8 shadow-lg print-area">
                    {/* Header Section */}
                    <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-4 relative group">
                            <img src="/logo.png" alt="Logo Custom Kekinian" className="w-24 h-24 object-cover rounded-full" />
                        </div>
                        <div className="text-right">
                            <h1 className="text-2xl font-bold mb-2 font-brand">CUSTOM KEKINIAN</h1>
                            <div className="text-xs text-gray-700 leading-relaxed">
                                <p className="font-bold">KAOS POLOS - SABLON - BORDIR</p>
                                <p>Komplek Permata Prima. Jl. B. Z, Jl. Brigjend Zein Hamid Gg. Rapi No.C 10</p>
                                <p>Titi Kuning, Kec. Medan Johor, Kota Medan,</p>
                                <p>Sumatera Utara 20211</p>
                                <p className="mt-2">Email: customkekinian@gmail.com</p>
                                <p>Telp / WA: 0811 6060 873</p>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold mb-6">INVOICE</h2>

                    {/* Customer Info Box */}
                    <div className="border-2 border-gray-300 p-4 mb-6">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col flex-grow">
                                <div className="text-sm text-gray-600">Kepada</div>
                                <input
                                    ref={customerInputRef}
                                    type="text"
                                    placeholder="Nama Customer"
                                    className="text-lg font-semibold outline-none border-none p-1 focus:input-focus rounded-sm transition-all duration-200"
                                    value={customer}
                                    onChange={(e) => setCustomer(e.target.value)}
                                    onFocus={(e) => e.target.select()}
                                />
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="text-sm text-gray-600">Tanggal</div>
                                <input
                                    type="date"
                                    className="text-lg font-semibold outline-none border-none p-1 text-right focus:input-focus rounded-sm no-print transition-all duration-200"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    onFocus={(e) => e.target.select()}
                                />
                                <span className="only-print text-lg font-semibold">{formatDate(date)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <InvoiceTable
                        products={products}
                        setProducts={setProducts}
                        dp={dp}
                        setDp={setDp}
                        discount={discount}
                        setDiscount={setDiscount}
                        grandTotal={grandTotal}
                        remaining={remaining}
                        onSave={handleSave}
                    />

                    {/* Footer / Pesan Section */}
                    <div className="flex justify-between items-end mt-12">
                        <div>
                            <h3 className="font-bold mb-2">Pesan</h3>
                            <p className="text-sm text-gray-700">No Rek BCA 8115085693</p>
                            <p className="text-sm text-gray-700">A/n Johanes Sinaga</p>
                            <p className="text-sm text-gray-700 mt-2">No rek BRI 033601118498506</p>
                            <p className="text-sm text-gray-700">A/n Johanes Sinaga</p>
                            <p className="text-sm text-gray-700 mt-2">No rek BNI 1694871050</p>
                            <p className="text-sm text-gray-700">A/n Johanes Sinaga</p>
                            <p className="text-sm text-gray-700 mt-2">Kirimkan bukti transfer jika pembayaran sudah dilakukan.</p>
                        </div>
                        <div className="text-center relative group">
                            <p className="text-sm mb-2" style={{ marginBottom: '-30px' }}>Dengan Hormat</p>
                            <div className="mt-4">
                                <img
                                    src="/tandaTangan.png"
                                    alt="Tanda Tangan"
                                    className={`w-36 h-36 mx-auto object-contain transition-all duration-300 ${isSignatureLocked ? 'locked-hidden' : ''}`}
                                    style={{ marginBottom: '-25px', marginLeft: '50px' }}
                                />
                                <p className="font-bold">Johanes Sinaga</p>
                            </div>
                            <button
                                onClick={() => setIsSignatureLocked(!isSignatureLocked)}
                                className="lock-toggle absolute top-0 -right-4 p-1.5 text-gray-500 hover:text-gray-800 transition-colors focus:outline-none no-print"
                                title={isSignatureLocked ? "Unlock Signature" : "Lock Signature (Hide on Print)"}
                            >
                                {isSignatureLocked ? <Lock size={16} /> : <Unlock size={16} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceForm;
