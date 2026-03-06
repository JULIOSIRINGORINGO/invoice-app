import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Lock, Unlock } from 'lucide-react';
import { formatCurrency, parseCurrency } from '../utils/format';

const InvoiceTable = ({ products, setProducts, dp, setDp, discount, setDiscount, grandTotal, remaining, onSave }) => {

    const [isDiscountLocked, setIsDiscountLocked] = useState(true);
    const [isDpLocked, setIsDpLocked] = useState(true);

    // Refs for auto-focus
    const lastFocusedField = useRef(null);

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
        const newId = Date.now();
        setProducts([...products, {
            id: newId,
            product: '',
            color: '',
            sizes: [{ id: newId + 1, size: '', quantity: 1, price: 0, amount: 0 }]
        }]);
        lastFocusedField.current = { type: 'product', pIndex: products.length };
    };

    const addSize = (prodIndex) => {
        const newProducts = [...products];
        const sIndex = newProducts[prodIndex].sizes.length;
        newProducts[prodIndex].sizes.push({
            id: Date.now(),
            size: '',
            quantity: 1,
            price: 0,
            amount: 0
        });
        setProducts(newProducts);
        lastFocusedField.current = { type: 'size', pIndex: prodIndex, sIndex };
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

    // Auto-focus logic for new items
    useEffect(() => {
        if (lastFocusedField.current) {
            const { type, pIndex, sIndex } = lastFocusedField.current;
            let selector = '';
            if (type === 'product') {
                selector = `input[data-prod="${pIndex}"]`;
            } else if (type === 'size') {
                selector = `select[data-ps="${pIndex}-${sIndex}"]`;
            }

            if (selector) {
                const el = document.querySelector(selector);
                if (el) el.focus();
            }
            lastFocusedField.current = null;
        }
    }, [products]);

    // Keyboard Navigation Logic
    const handleKeyDown = (e, pIndex, sIndex, field) => {
        const moveFocus = (selector) => {
            const el = document.querySelector(selector);
            if (el) {
                e.preventDefault();
                el.focus();
                if (el.tagName === 'INPUT') el.select();
            }
        };

        const fields = ['product', 'color', 'size', 'quantity', 'price'];
        const colIndex = fields.indexOf(field);

        if (e.key === 'ArrowRight') {
            if (colIndex < fields.length - 1) {
                moveFocus(`[data-field="${fields[colIndex + 1]}"][data-ps="${pIndex}-${sIndex}"]`);
            }
        } else if (e.key === 'ArrowLeft') {
            if (colIndex > 0) {
                moveFocus(`[data-field="${fields[colIndex - 1]}"][data-ps="${pIndex}-${sIndex}"]`);
            }
        } else if (e.key === 'ArrowDown') {
            const nextSIndex = sIndex + 1;
            if (nextSIndex < products[pIndex].sizes.length) {
                moveFocus(`[data-field="${field}"][data-ps="${pIndex}-${nextSIndex}"]`);
            } else if (pIndex + 1 < products.length) {
                moveFocus(`[data-field="${field}"][data-ps="${pIndex + 1}-0"]`);
            } else if (field === 'price') {
                moveFocus('[data-field="discount"]');
            }
        } else if (e.key === 'ArrowUp') {
            const prevSIndex = sIndex - 1;
            if (prevSIndex >= 0) {
                moveFocus(`[data-field="${field}"][data-ps="${pIndex}-${prevSIndex}"]`);
            } else if (pIndex > 0) {
                const lastSIndexPrev = products[pIndex - 1].sizes.length - 1;
                moveFocus(`[data-field="${field}"][data-ps="${pIndex - 1}-${lastSIndexPrev}"]`);
            }
        } else if (e.key === 'Enter') {
            // Sequential navigation
            if (field === 'product') moveFocus(`[data-field="color"][data-ps="${pIndex}-${sIndex}"]`);
            else if (field === 'color') moveFocus(`[data-field="size"][data-ps="${pIndex}-${sIndex}"]`);
            else if (field === 'size') moveFocus(`[data-field="quantity"][data-ps="${pIndex}-${sIndex}"]`);
            else if (field === 'quantity') moveFocus(`[data-field="price"][data-ps="${pIndex}-${sIndex}"]`);
            else if (field === 'price') {
                const nextSIndex = sIndex + 1;
                if (nextSIndex < products[pIndex].sizes.length) {
                    moveFocus(`[data-field="size"][data-ps="${pIndex}-${nextSIndex}"]`);
                } else if (pIndex + 1 < products.length) {
                    moveFocus(`[data-field="product"][data-ps="${pIndex + 1}-0"]`);
                } else if (!isDiscountLocked) {
                    moveFocus(`[data-field="discount"]`);
                } else if (!isDpLocked) {
                    moveFocus(`[data-field="dp"]`);
                } else {
                    onSave();
                }
            }
        }
    };

    return (
        <div className="mb-6">
            <table className="w-full border-collapse border border-gray-300 shadow-sm rounded-lg overflow-hidden">
                <thead>
                    <tr className="bg-[#325C74] text-white">
                        <th className="border border-gray-300 p-3 text-left w-1/4">PRODUK</th>
                        <th className="border border-gray-300 p-3 w-1/6">COLOR</th>
                        <th className="border border-gray-300 p-3 w-16 text-center">SIZE</th>
                        <th className="border border-gray-300 p-3 w-16 text-center">QTY</th>
                        <th className="border border-gray-300 p-3 w-1/5 text-center">HARGA</th>
                        <th className="border border-gray-300 p-3 w-1/5 text-center">JUMLAH</th>
                        <th className="border border-gray-300 p-3 no-print w-20 text-center">AKSI</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product, pIndex) => (
                        product.sizes.map((size, sIndex) => (
                            <tr key={`${product.id}-${size.id}`} className="hover:bg-gray-50 transition-colors">
                                {sIndex === 0 && (
                                    <>
                                        <td className="border border-gray-300 p-2 align-top" rowSpan={product.sizes.length}>
                                            <input
                                                type="text"
                                                data-field="product"
                                                data-prod={pIndex}
                                                data-ps={`${pIndex}-${sIndex}`}
                                                placeholder="Nama Produk"
                                                className="w-full outline-none font-bold p-1 transition-all duration-200 focus:bg-yellow-50 focus:ring-2 focus:ring-blue-300 rounded-sm"
                                                value={product.product}
                                                onChange={(e) => updateProduct(pIndex, 'product', e.target.value)}
                                                onFocus={handleFocus}
                                                onKeyDown={(e) => handleKeyDown(e, pIndex, sIndex, 'product')}
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-2 text-center align-top" rowSpan={product.sizes.length}>
                                            <input
                                                type="text"
                                                data-field="color"
                                                data-ps={`${pIndex}-${sIndex}`}
                                                placeholder="Warna"
                                                className="w-full text-center outline-none font-semibold p-1 transition-all duration-200 focus:bg-yellow-50 focus:ring-2 focus:ring-blue-300 rounded-sm"
                                                value={product.color}
                                                onChange={(e) => updateProduct(pIndex, 'color', e.target.value)}
                                                onFocus={handleFocus}
                                                onKeyDown={(e) => handleKeyDown(e, pIndex, sIndex, 'color')}
                                            />
                                        </td>
                                    </>
                                )}
                                <td className="border border-gray-300 p-2 text-center">
                                    <select
                                        data-field="size"
                                        data-ps={`${pIndex}-${sIndex}`}
                                        className="w-full text-center appearance-none outline-none p-1 transition-all duration-200 bg-transparent focus:bg-yellow-50 focus:ring-2 focus:ring-blue-300 rounded-sm"
                                        value={size.size}
                                        onChange={(e) => updateSize(pIndex, sIndex, 'size', e.target.value)}
                                        onFocus={handleFocus}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Backspace' || e.key === 'Delete') {
                                                updateSize(pIndex, sIndex, 'size', '');
                                            } else {
                                                handleKeyDown(e, pIndex, sIndex, 'size');
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
                                        data-field="quantity"
                                        data-ps={`${pIndex}-${sIndex}`}
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        placeholder="0"
                                        className="w-full text-center outline-none p-1 transition-all duration-200 focus:bg-yellow-50 focus:ring-2 focus:ring-blue-300 rounded-sm"
                                        value={size.quantity}
                                        onChange={(e) => updateSize(pIndex, sIndex, 'quantity', e.target.value)}
                                        onFocus={handleFocus}
                                        onBlur={() => handleQuantityBlur(pIndex, sIndex)}
                                        onKeyDown={(e) => handleKeyDown(e, pIndex, sIndex, 'quantity')}
                                    />
                                </td>
                                <td className="border border-gray-300 p-2 text-right">
                                    <input
                                        type="text"
                                        data-field="price"
                                        data-ps={`${pIndex}-${sIndex}`}
                                        placeholder="Harga"
                                        className="w-full text-right outline-none p-1 transition-all duration-200 focus:bg-yellow-50 focus:ring-2 focus:ring-blue-300 rounded-sm font-medium focus:font-bold"
                                        value={formatCurrency(size.price)}
                                        onChange={(e) => updateSize(pIndex, sIndex, 'price', e.target.value)}
                                        onFocus={handleFocus}
                                        onKeyDown={(e) => handleKeyDown(e, pIndex, sIndex, 'price')}
                                    />
                                </td>
                                <td className="border border-gray-300 p-2 text-right font-bold text-[#325C74]">
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
                    <tr className="bg-gray-50">
                        <td colSpan="5" className="border border-gray-300 p-3 text-left font-bold">TOTAL</td>
                        <td className="border border-gray-300 p-3 text-right font-bold text-xl">
                            {formatCurrency(grandTotal)}
                        </td>
                        <td className="border border-gray-300 p-3 no-print"></td>
                    </tr>
                    <tr className={!isDiscountLocked && discount > 0 ? "" : "print:hidden"}>
                        <td colSpan="5" className="border border-gray-300 p-3 text-left font-bold">DISKON</td>
                        <td className="border border-gray-300 p-3 text-right font-bold">
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
                                    data-field="discount"
                                    placeholder="Diskon"
                                    className={`w-full text-right outline-none font-bold transition-all duration-200 p-1 rounded-sm ${isDiscountLocked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'focus:bg-yellow-50 focus:ring-2 focus:ring-blue-300 bg-white cursor-text'}`}
                                    value={formatCurrency(discount)}
                                    onChange={(e) => setDiscount(parseCurrency(e.target.value))}
                                    onFocus={handleFocus}
                                    disabled={isDiscountLocked}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            if (!isDpLocked) {
                                                const el = document.querySelector('[data-field="dp"]');
                                                if (el) el.focus();
                                            } else onSave();
                                        }
                                        if (e.key === 'ArrowDown' && !isDpLocked) {
                                            e.preventDefault();
                                            const el = document.querySelector('[data-field="dp"]');
                                            if (el) el.focus();
                                        }
                                    }}
                                />
                            </div>
                        </td>
                        <td className="border border-gray-300 p-3 no-print bg-gray-50"></td>
                    </tr>
                    <tr className={!isDpLocked && dp > 0 ? "" : "print:hidden"}>
                        <td colSpan="5" className="border border-gray-300 p-3 text-left font-bold">DP PEMBAYARAN</td>
                        <td className="border border-gray-300 p-3 text-right font-bold">
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
                                    data-field="dp"
                                    placeholder="DP"
                                    className={`w-full text-right outline-none font-bold transition-all duration-200 p-1 rounded-sm ${isDpLocked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'focus:bg-yellow-50 focus:ring-2 focus:ring-blue-300 bg-white cursor-text'}`}
                                    value={formatCurrency(dp)}
                                    onChange={(e) => setDp(parseCurrency(e.target.value))}
                                    onFocus={handleFocus}
                                    disabled={isDpLocked}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            onSave();
                                        }
                                        if (e.key === 'ArrowUp') {
                                            e.preventDefault();
                                            const el = document.querySelector('[data-field="discount"]');
                                            if (el) el.focus();
                                        }
                                    }}
                                />
                            </div>
                        </td>
                        <td className="border border-gray-300 p-3 no-print bg-gray-50"></td>
                    </tr>
                    <tr>
                        <td colSpan="5" className="border border-gray-300 p-3 text-left font-bold">SISA PEMBAYARAN</td>
                        <td className="border border-gray-300 p-3 text-right font-bold text-xl whitespace-nowrap">
                            {formatCurrency(remaining)}
                        </td>
                        <td className="border border-gray-300 p-3 no-print bg-gray-50"></td>
                    </tr>
                </tfoot>
            </table>
            <div className="mt-4 no-print flex justify-between items-center text-xs text-gray-400">
                <button
                    onClick={addProduct}
                    className="bg-[#325C74] text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:opacity-90 transition-all shadow-md transform active:scale-95"
                >
                    <Plus size={18} /> Tambah Produk Baru
                </button>
                <div className="flex gap-4 italic font-medium">
                    <span>Arrows: Navigasi Grid</span>
                    <span>Enter: Selanjutnya / Save</span>
                </div>
            </div>
        </div>
    );
};

export default InvoiceTable;
