const products = [];

const itemsBody = document.getElementById('itemsBody');
const addProductBtn = document.getElementById('addProduct');
const currentDate = document.getElementById('currentDate');
const btnPrint = document.getElementById('btnPrint');
const grandTotalAmount = document.getElementById('grandTotalAmount');
const dpPayment = document.getElementById('dpPayment');
const remainingPayment = document.getElementById('remainingPayment');

function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID').format(amount);
}

function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

currentDate.value = getCurrentDate();

function calculateProductTotal(product) {
  return product.sizes.reduce((sum, s) => sum + (s.quantity * s.price), 0);
}

function calculateGrandTotal() {
  return products.reduce((sum, p) => sum + calculateProductTotal(p), 0);
}

function render() {
  itemsBody.innerHTML = '';

  products.forEach((product, prodIndex) => {
    product.sizes.forEach((size, sizeIndex) => {
      const tr = document.createElement('tr');

      if (sizeIndex === 0) {
        const tdProduct = document.createElement('td');
        tdProduct.className = 'border border-gray-300 p-2 align-top';
        tdProduct.rowSpan = product.sizes.length;
        const inputProd = document.createElement('input');
        inputProd.type = 'text';
        inputProd.value = product.product;
        inputProd.placeholder = 'Nama Produk';
        inputProd.className = 'w-full outline-none font-semibold focus:bg-yellow-50';
        inputProd.addEventListener('input', (e) => {
          product.product = e.target.value;
        });
        tdProduct.appendChild(inputProd);

        const tdColor = document.createElement('td');
        tdColor.className = 'border border-gray-300 p-2 text-center align-top';
        tdColor.rowSpan = product.sizes.length;
        const inputColor = document.createElement('input');
        inputColor.type = 'text';
        inputColor.value = product.color;
        inputColor.placeholder = 'Warna';
        inputColor.className = 'w-full text-center outline-none font-semibold focus:bg-yellow-50';
        inputColor.addEventListener('input', (e) => {
          product.color = e.target.value;
        });
        tdColor.appendChild(inputColor);

        tr.appendChild(tdProduct);
        tr.appendChild(tdColor);
      }

      const tdSize = document.createElement('td');
      tdSize.className = 'border border-gray-300 p-2 text-center';
      const inputSize = document.createElement('input');
      inputSize.type = 'text';
      inputSize.value = size.size;
      inputSize.placeholder = 'Size';
      inputSize.className = 'w-full text-center outline-none focus:bg-yellow-50';
      inputSize.addEventListener('input', (e) => { 
        size.size = e.target.value; 
        updateTotals(); 
      });
      tdSize.appendChild(inputSize);
      tr.appendChild(tdSize);

      const tdQty = document.createElement('td');
      tdQty.className = 'border border-gray-300 p-2 text-center';
      const inputQty = document.createElement('input');
      inputQty.type = 'number';
      inputQty.value = size.quantity;
      inputQty.min = 0;
      inputQty.className = 'w-full text-center outline-none focus:bg-yellow-50';
      inputQty.addEventListener('input', (e) => { 
        size.quantity = parseInt(e.target.value) || 0; 
        updateTotals(); 
      });
      tdQty.appendChild(inputQty);
      tr.appendChild(tdQty);

      const tdPrice = document.createElement('td');
      tdPrice.className = 'border border-gray-300 p-2 text-right';
      const priceWrap = document.createElement('div');
      priceWrap.className = 'flex items-center justify-end gap-1';
      const spanRp = document.createElement('span');
      spanRp.textContent = 'Rp';
      const inputPrice = document.createElement('input');
      inputPrice.type = 'text';
      inputPrice.value = formatCurrency(size.price / 1000);
      inputPrice.className = 'w-24 text-right outline-none focus:bg-yellow-50';
      inputPrice.addEventListener('input', (e) => { 
        let value = e.target.value.replace(/\D/g, '');
        size.price = (parseInt(value) || 0) * 1000;
        e.target.value = formatCurrency(value);
        updateTotals(); 
      });
      const spanK = document.createElement('span');
      spanK.textContent = '.000';
      spanK.className = 'text-gray-900';
      priceWrap.appendChild(spanRp);
      priceWrap.appendChild(inputPrice);
      priceWrap.appendChild(spanK);
      tdPrice.appendChild(priceWrap);
      tr.appendChild(tdPrice);

      const tdAmount = document.createElement('td');
      tdAmount.className = 'border border-gray-300 p-2 text-right';
      tdAmount.id = `amount-${product.id}-${size.id}`;
      tdAmount.textContent = 'Rp ' + formatCurrency(size.quantity * size.price);
      tr.appendChild(tdAmount);

      const tdActions = document.createElement('td');
      tdActions.className = 'border border-gray-300 p-2 text-center no-print';
      
      const btnAddSize = document.createElement('button');
      btnAddSize.title = 'Tambah Size';
      btnAddSize.className = 'text-green-600 hover:text-green-800 icon-btn mr-2';
      btnAddSize.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
      btnAddSize.addEventListener('click', () => { addSize(prodIndex); });
      tdActions.appendChild(btnAddSize);

      const btnDeleteSize = document.createElement('button');
      btnDeleteSize.title = 'Hapus Size';
      btnDeleteSize.className = 'text-red-600 hover:text-red-800 icon-btn';
      btnDeleteSize.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>';
      btnDeleteSize.addEventListener('click', () => { removeSize(prodIndex, size.id); });
      tdActions.appendChild(btnDeleteSize);
      
      tr.appendChild(tdActions);
      itemsBody.appendChild(tr);
    });
  });

  updateTotals();
}

function updateTotals() {
  products.forEach(product => {
    product.sizes.forEach(size => {
      const el = document.getElementById(`amount-${product.id}-${size.id}`);
      if (el) el.textContent = 'Rp ' + formatCurrency(size.quantity * size.price);
    });
  });
  
  const grand = calculateGrandTotal();
  if (grandTotalAmount) grandTotalAmount.textContent = 'Rp ' + formatCurrency(grand);
  
  const dpValue = dpPayment.value.replace(/\D/g, '');
  const dp = parseInt(dpValue) || 0;
  const remaining = grand - dp;
  if (remainingPayment) remainingPayment.textContent = 'Rp ' + formatCurrency(remaining);
}

function addProduct() {
  products.push({ 
    id: crypto.randomUUID(), 
    product: '', 
    color: '', 
    sizes: [{ id: crypto.randomUUID(), size: '', quantity: 1, price: 0 }] 
  });
  render();
}

function addSize(productIndex) {
  products[productIndex].sizes.push({ 
    id: crypto.randomUUID(), 
    size: '', 
    quantity: 1, 
    price: 0 
  });
  render();
}

function removeSize(productIndex, sizeId) {
  const sizes = products[productIndex].sizes;
  if (sizes.length > 1) {
    products[productIndex].sizes = sizes.filter(s => s.id !== sizeId);
    render();
  } else {
    products.splice(productIndex, 1);
    render();
  }
}

addProductBtn.addEventListener('click', addProduct);
btnPrint.addEventListener('click', () => window.print());

dpPayment.addEventListener('input', (e) => {
  let value = e.target.value.replace(/\D/g, '');
  e.target.value = formatCurrency(value);
  updateTotals();
});

render();

btnPrint.addEventListener('click', () => {
  const element = document.querySelector('.print-area');
  const opt = {
    margin: 0.5,
    filename: 'invoice.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };
  
  html2pdf().set(opt).from(element).save();
});