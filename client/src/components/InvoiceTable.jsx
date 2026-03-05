import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Lock, Unlock } from 'lucide-react';
import { formatCurrency, parseCurrency } from '../utils/format';

const InvoiceTable = ({ products, setProducts, dp, setDp, discount, setDiscount, grandTotal, remaining }) => {

    const [isDiscountLocked, setIsDiscountLocked] = useState(true);
    const [isDpLocked, setIsDpLocked] = useState(true);

    useEffect(() => {
        if (discount > 0) setIsDiscountLocked(false);
    }, [discount]);

    useEffect(() => {
        if (dp > 0) setIsDpLocked(false);
    }, [dp]);

    const toggleDiscountLock = () => {
        if (!isDiscountLocked) {
            setDiscount(0);
        }
        setIsDiscountLocked(!isDiscountLocked);
    };

    const toggleDpLock = () => {
        if (!isDpLocked) {
            setDp(0);
        }
        setIsDpLocked(!isDpLocked);
    };

    const updateProduct = (index, field, value) => {
        const newProducts = [...products];
        newProducts[index][field] = value;
        setProducts(newProducts);
    };

    const updateSize = (prodIndex, sizeIndex, field, value) => {
        const newProducts = [...products];
        const size = newProducts[prodIndex].sizes[sizeIndex];

        if (field === 'price') {
            const parsed = parseCurrency(value);
            size[field] = parsed;
        } else if (field === 'quantity') {
            if (value === '') {
                size[field] = '';
            } else {
                let numericValue = parseInt(value.replace(/\D/g, ''), 10);
                if (!isNaN(numericValue)) {
                    // Minimum value is 1, not 0
                    size[field] = numericValue === 0 ? 1 : numericValue;
                }
            }
        } else {
            size[field] = value;
        }

        const activeQty = size.quantity === '' ? 0 : size.quantity;
        size.amount = activeQty * size.price;
        setProducts(newProducts);
    };

    const handleQuantityBlur = (prodIndex, sizeIndex) => {
        const newProducts = [...products];
        const size = newProducts[prodIndex].sizes[sizeIndex];
        if (size.quantity === '') {
            size.quantity = 1;
            size.amount = size.quantity * size.price;
            setProducts(newProducts);
        }
    };

    const addProduct = () => {
        setProducts([...products, {
            id: Date.now(),
            product: '',
            color: '',
            sizes: [{ id: Date.now() + 1, size: '', quantity: 1, price: 0, amount: 0 }]
        }]);
    };

    const addSize = (prodIndex) => {
        const newProducts = [...products];
        newProducts[prodIndex].sizes.push({
            id: Date.now(),
            size: '',
            quantity: 1,
            price: 0,
            amount: 0
        });
        setProducts(newProducts);
    };

    const removeSize = (prodIndex, sizeIndex) => {
        const newProducts = [...products];
        if (newProducts[prodIndex].sizes.length > 1) {
            newProducts[prodIndex].sizes.splice(sizeIndex, 1);
        } else {
            newProducts.splice(prodIndex, 1);
        }
        setProducts(newProducts);
    };

    const handleFocus = (e) => e.target.select();

    return (
        <div className="mb-6">
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-brand text-white">
                        <th className="border border-gray-300 p-2 text-left w-1/4">PRODUK</th>
                        <th className="border border-gray-300 p-2 w-1/6">COLOR</th>
                        <th className="border border-gray-300 p-2 w-16 text-center">SIZE</th>
                        <th className="border border-gray-300 p-2 w-16 text-center">QTY</th>
                        <th className="border border-gray-300 p-2 w-1/5 text-center">HARGA</th>
                        <th className="border border-gray-300 p-2 w-1/5 text-center">JUMLAH</th>
                        <th className="border border-gray-300 p-2 no-print w-20 text-center">AKSI</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product, pIndex) => (
                        product.sizes.map((size, sIndex) => (
                            <tr key={`${product.id}-${size.id}`}>
                                {sIndex === 0 && (
                                    <>
                                        <td className="border border-gray-300 p-2 align-top" rowSpan={product.sizes.length}>
                                            <input
                                                type="text"
                                                placeholder="Nama Produk"
                                                className="w-full outline-none font-semibold focus:bg-yellow-50 p-1 transition-colors duration-200"
                                                value={product.product}
                                                onChange={(e) => updateProduct(pIndex, 'product', e.target.value)}
                                                onFocus={handleFocus}
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-2 text-center align-top" rowSpan={product.sizes.length}>
                                            <input
                                                type="text"
                                                placeholder="Warna"
                                                className="w-full text-center outline-none font-semibold focus:bg-yellow-50 p-1 transition-colors duration-200"
                                                value={product.color}
                                                onChange={(e) => updateProduct(pIndex, 'color', e.target.value)}
                                                onFocus={handleFocus}
                                            />
                                        </td>
                                    </>
                                )}
                                <td className="border border-gray-300 p-2 text-center">
                                    <select
                                        className="w-full text-center appearance-none outline-none focus:bg-yellow-50 p-1 transition-colors duration-200 bg-transparent"
                                        value={size.size}
                                        onChange={(e) => updateSize(pIndex, sIndex, 'size', e.target.value)}
                                        onFocus={handleFocus}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Backspace' || e.key === 'Delete') {
                                                updateSize(pIndex, sIndex, 'size', '');
                                            }
                                        }}
                                    >
                                        <option value="" disabled>Size</option>
                                        <option value="XS">XS</option>
                                        <option value="S">S</option>
                                        <option value="M">M</option>
                                        <option value="L">L</option>
                                        <option value="XL">XL</option>
                                        <option value="2XL">2XL</option>
                                        <option value="3XL">3XL</option>
                                        <option value="4XL">4XL</option>
                                        <option value="5XL">5XL</option>
                                    </select>
                                </td>
                                <td className="border border-gray-300 p-2 text-center">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        placeholder="0"
                                        className="w-full text-center outline-none focus:bg-yellow-50 p-1 transition-colors duration-200"
                                        value={size.quantity}
                                        onChange={(e) => updateSize(pIndex, sIndex, 'quantity', e.target.value)}
                                        onFocus={handleFocus}
                                        onBlur={() => handleQuantityBlur(pIndex, sIndex)}
                                    />
                                </td>
                                <td className="border border-gray-300 p-2 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <input
                                            type="text"
                                            placeholder="Harga"
                                            className="w-full text-right outline-none focus:bg-yellow-50 p-1 transition-colors duration-200"
                                            value={formatCurrency(size.price)}
                                            onChange={(e) => updateSize(pIndex, sIndex, 'price', e.target.value)}
                                            onFocus={handleFocus}
                                        />
                                    </div>
                                </td>
                                <td className="border border-gray-300 p-2 text-right font-medium">
                                    {formatCurrency(size.amount)}
                                </td>
                                <td className="border border-gray-300 p-2 text-center no-print">
                                    <div className="flex justify-center gap-2">
                                        <button
                                            onClick={() => addSize(pIndex)}
                                            className="text-green-600 hover:bg-green-50 p-1 rounded transition-colors duration-200"
                                            title="Tambah Size"
                                        >
                                            <Plus size={16} />
                                        </button>
                                        <button
                                            onClick={() => removeSize(pIndex, sIndex)}
                                            className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors duration-200"
                                            title="Hapus"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan="5" className="border border-gray-300 p-2 text-left font-bold">TOTAL</td>
                        <td className="border border-gray-300 p-2 text-right font-bold">
                            {formatCurrency(grandTotal)}
                        </td>
                        <td className="border border-gray-300 p-2 no-print bg-gray-50"></td>
                    </tr>
                    <tr className={!isDiscountLocked && discount > 0 ? "" : "print:hidden"}>
                        <td colSpan="5" className="border border-gray-300 p-2 text-left font-bold">DISKON</td>
                        <td className="border border-gray-300 p-2 text-right font-bold">
                            <div className="flex items-center justify-end gap-2">
                                <button
                                    onClick={toggleDiscountLock}
                                    className="p-1.5 text-gray-500 hover:text-gray-800 transition-colors focus:outline-none no-print"
                                    title={isDiscountLocked ? "Buka kuncian" : "Kunci dan reset ke 0"}
                                >
                                    {isDiscountLocked ? <Lock size={16} /> : <Unlock size={16} />}
                                </button>
                                <input
                                    type="text"
                                    placeholder="Diskon"
                                    className={`w-full text-right outline-none font-bold transition-colors duration-200 p-1 rounded-sm ${isDiscountLocked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'focus:bg-yellow-50 bg-white cursor-text'}`}
                                    value={formatCurrency(discount)}
                                    onChange={(e) => setDiscount(parseCurrency(e.target.value))}
                                    onFocus={handleFocus}
                                    disabled={isDiscountLocked}
                                />
                            </div>
                        </td>
                        <td className="border border-gray-300 p-2 no-print bg-gray-50"></td>
                    </tr>
                    <tr className={!isDpLocked && dp > 0 ? "" : "print:hidden"}>
                        <td colSpan="5" className="border border-gray-300 p-2 text-left font-bold">DP PEMBAYARAN</td>
                        <td className="border border-gray-300 p-2 text-right font-bold">
                            <div className="flex items-center justify-end gap-2">
                                <button
                                    onClick={toggleDpLock}
                                    className="p-1.5 text-gray-500 hover:text-gray-800 transition-colors focus:outline-none no-print"
                                    title={isDpLocked ? "Buka kuncian" : "Kunci dan reset ke 0"}
                                >
                                    {isDpLocked ? <Lock size={16} /> : <Unlock size={16} />}
                                </button>
                                <input
                                    type="text"
                                    placeholder="DP"
                                    className={`w-full text-right outline-none transition-colors duration-200 p-1 rounded-sm ${isDpLocked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'focus:bg-yellow-50 bg-white cursor-text'}`}
                                    value={formatCurrency(dp)}
                                    onChange={(e) => setDp(parseCurrency(e.target.value))}
                                    onFocus={handleFocus}
                                    disabled={isDpLocked}
                                />
                            </div>
                        </td>
                        <td className="border border-gray-300 p-2 no-print bg-gray-50"></td>
                    </tr>
                    <tr>
                        <td colSpan="5" className="border border-gray-300 p-2 text-left font-bold">SISA PEMBAYARAN</td>
                        <td className="border border-gray-300 p-2 text-right font-bold text-brand">
                            {formatCurrency(remaining)}
                        </td>
                        <td className="border border-gray-300 p-2 no-print bg-gray-50"></td>
                    </tr>
                </tfoot>
            </table>
            <div className="mt-4 no-print">
                <button
                    onClick={addProduct}
                    className="bg-brand text-white px-4 py-2 rounded flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                    <Plus size={18} /> Tambah Produk
                </button>
            </div>
        </div>
    );
};

export default InvoiceTable;
