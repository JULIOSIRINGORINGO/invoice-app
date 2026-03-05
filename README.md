# Invoice Generator - Custom Kekinian (Migrated)

This project has been migrated from a static HTML/JS/CSS implementation to a modern React + Tailwind + Express + SQLite stack.

## Tech Stack
- **Frontend**: React (Vite) + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **PDF Generation**: html2pdf.js

## Project Structure
```
project/
├── client/                  # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── InvoiceForm.jsx     # Create/edit invoice
│   │   │   └── InvoiceList.jsx     # List + search invoice
│   │   ├── components/
│   │   │   └── InvoiceTable.jsx    # Product item table
│   │   └── App.jsx
├── server/
│   ├── db.js               # SQLite setup
│   ├── routes/
│   │   └── invoices.js     # API endpoints
│   └── index.js            # Express server
└── README.md
```

## How to Run

### 1. Backend Server
```bash
cd server
npm install
node index.js
```
The server will run on `http://localhost:5000`.

### 2. Frontend Client
```bash
cd client
npm install
npm run dev
```
The client will run on `http://localhost:5173`.

## Features
- **Replicated Design**: The invoice layout matches the original blueprint exactly.
- **SQLite Storage**: Invoices and items are stored in a local SQLite database.
- **Search & Filter**: Search invoices by customer name or date range.
- **Dynamic Items**: Add/remove products and multiple sizes per product easily.
- **Auto Calculations**: Automatic calculation of Total, Discount, DP, and Remaining Balance.
- **Save as PDF**: Export invoices directly to PDF with the original layout styles.
