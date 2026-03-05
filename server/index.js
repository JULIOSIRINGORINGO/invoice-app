const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const invoiceRoutes = require('./routes/invoices');
app.use('/api/invoices', invoiceRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
