import { supabase } from './supabase'

export async function getInvoices() {
    const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })
    if (error) throw error
    return data
}

export async function searchInvoices({ name, from, to }) {
    let query = supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })
    if (name) query = query.ilike('customer', `%${name}%`)
    if (from) query = query.gte('date', from)
    if (to) query = query.lte('date', to)
    const { data, error } = await query
    if (error) throw error
    return data
}

export async function getInvoiceById(id) {
    const { data, error } = await supabase
        .from('invoices')
        .select('*, invoice_items(*)')
        .eq('id', id)
        .single()
    if (error) throw error
    return data
}

export async function createInvoice(invoice, items) {
    const { data, error } = await supabase
        .from('invoices')
        .insert(invoice)
        .select()
        .single()
    if (error) throw error
    const invoiceItems = items.map(item => ({
        ...item,
        invoice_id: data.id
    }))
    const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItems)
    if (itemsError) throw itemsError
    return data
}

export async function updateInvoice(id, invoice, items) {
    const { error } = await supabase
        .from('invoices')
        .update(invoice)
        .eq('id', id)
    if (error) throw error
    await supabase.from('invoice_items').delete().eq('invoice_id', id)
    const invoiceItems = items.map(item => ({
        ...item,
        invoice_id: id
    }))
    const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItems)
    if (itemsError) throw itemsError
}

export async function deleteInvoice(id) {
    const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)
    if (error) throw error
}
