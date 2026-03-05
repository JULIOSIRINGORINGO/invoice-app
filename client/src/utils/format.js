export const formatCurrency = (amount) => {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(amount);
};

export const parseCurrency = (str) => {
    return parseInt(str.replace(/\D/g, '')) || 0;
};

export const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
};
