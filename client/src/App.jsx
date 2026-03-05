import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import InvoiceList from './pages/InvoiceList'
import InvoiceForm from './pages/InvoiceForm'

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-100">
                <Routes>
                    <Route path="/" element={<InvoiceList />} />
                    <Route path="/new" element={<InvoiceForm />} />
                    <Route path="/edit/:id" element={<InvoiceForm />} />
                </Routes>
            </div>
        </Router>
    )
}

export default App
