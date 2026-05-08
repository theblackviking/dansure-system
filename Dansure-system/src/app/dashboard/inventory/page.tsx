'use client'
import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'
import { S, GHS } from '@/components/Styles'

const CATS = ['Extinguisher', 'Service Part', 'Safety Gear', 'Signage', 'Gadget', 'Other']

export default function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: '', category: 'Extinguisher', qty: '', min_qty: '', cost: '', price: '' })

  const load = async () => { const d = await fetch('/api/inventory').then(r => r.json()); setInventory(Array.isArray(d) ? d : []) }
  useEffect(() => { load() }, [])

  const filtered = inventory.filter(i => i.name?.toLowerCase().includes(search.toLowerCase()) || i.category?.toLowerCase().includes(search.toLowerCase()))
  const lowStock = inventory.filter(i => i.qty <= i.min_qty)

  const save = async () => {
    if (!form.name || form.qty === '' || form.price === '') { alert('Name, qty and price required'); return }
    const body = { name: form.name, category: form.category, qty: parseInt(form.qty), min_qty: parseInt(form.min_qty) || 0, cost: parseFloat(form.cost) || 0, price: parseFloat(form.price) }
    const url = editing ? `/api/inventory/${editing.id}` : '/api/inventory'
    const method = editing ? 'PUT' : 'POST'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setModal(false); setEditing(null); setForm({ name: '', category: 'Extinguisher', qty: '', min_qty: '', cost: '', price: '' }); load()
  }

  const del = async (id: string) => { if (!confirm('Remove item?')) return; await fetch(`/api/inventory/${id}`, { method: 'DELETE' }); load() }
  const F = (v: string, k: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div>
      {lowStock.length > 0 && (
        <div style={{ background: '#fadbd8', border: '1px solid #f5c6cb', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#922b21', fontWeight: 500 }}>
          ⚠️ {lowStock.length} item(s) need restocking: {lowStock.map(i => i.name).join(', ')}
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input placeholder="Search inventory..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...S.input, flex: 1 }} />
        <button style={{ ...S.btn, ...S.btnPrimary }} onClick={() => { setForm({ name: '', category: 'Extinguisher', qty: '', min_qty: '', cost: '', price: '' }); setEditing(null); setModal(true) }}>+ Add Item</button>
      </div>
      <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            {['Item Name', 'Category', 'In Stock', 'Min Stock', 'Cost Price', 'Selling Price', 'Status', 'Actions'].map(h => (
              <th key={h} style={{ fontSize: 11, color: '#adb5bd', textTransform: 'uppercase', padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid #f0f2f5' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map(i => (
              <tr key={i.id} style={{ borderBottom: '1px solid #f0f2f5' }}>
                <td style={{ padding: '10px 12px', fontWeight: 600 }}>{i.name}</td>
                <td style={{ padding: '10px 12px', fontSize: 12, color: '#6c757d' }}>{i.category}</td>
                <td style={{ padding: '10px 12px', fontWeight: 700, color: i.qty <= i.min_qty ? '#c0392b' : '#343a40' }}>{i.qty}</td>
                <td style={{ padding: '10px 12px', fontSize: 13 }}>{i.min_qty}</td>
                <td style={{ padding: '10px 12px', fontSize: 13 }}>{GHS(i.cost)}</td>
                <td style={{ padding: '10px 12px', fontWeight: 600, color: '#154360' }}>{GHS(i.price)}</td>
                <td style={{ padding: '10px 12px' }}><span style={S.badge(i.qty <= i.min_qty ? 'low' : 'ok')}>{i.qty <= i.min_qty ? 'Low Stock' : 'In Stock'}</span></td>
                <td style={{ padding: '10px 12px' }}>
                  <button style={{ ...S.btn, ...S.btnOutline, padding: '4px 10px', fontSize: 12, marginRight: 6 }} onClick={() => { setForm({ name: i.name, category: i.category, qty: String(i.qty), min_qty: String(i.min_qty), cost: String(i.cost), price: String(i.price) }); setEditing(i); setModal(true) }}>Edit</button>
                  <button style={{ ...S.btn, ...S.btnDanger, padding: '4px 10px', fontSize: 12 }} onClick={() => del(i.id)}>Del</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#adb5bd' }}>📦 No inventory items</div>}
      </div>

      {modal && (
        <Modal title={editing ? 'Edit Item' : 'Add Inventory Item'} onClose={() => { setModal(false); setEditing(null) }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div><label style={S.label}>Item Name *</label><input style={S.input} value={form.name} onChange={e => F(e.target.value, 'name')} placeholder="e.g. 6kg DCP Extinguisher" /></div>
            <div><label style={S.label}>Category</label>
              <select style={S.input} value={form.category} onChange={e => F(e.target.value, 'category')}>
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div><label style={S.label}>Quantity *</label><input type="number" style={S.input} value={form.qty} onChange={e => F(e.target.value, 'qty')} /></div>
            <div><label style={S.label}>Min Stock Alert</label><input type="number" style={S.input} value={form.min_qty} onChange={e => F(e.target.value, 'min_qty')} placeholder="Alert threshold" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div><label style={S.label}>Cost Price (GH₵)</label><input type="number" style={S.input} value={form.cost} onChange={e => F(e.target.value, 'cost')} /></div>
            <div><label style={S.label}>Selling Price (GH₵) *</label><input type="number" style={S.input} value={form.price} onChange={e => F(e.target.value, 'price')} /></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, borderTop: '1px solid #dee2e6', paddingTop: 14 }}>
            <button style={{ ...S.btn, ...S.btnOutline }} onClick={() => { setModal(false); setEditing(null) }}>Cancel</button>
            <button style={{ ...S.btn, ...S.btnPrimary }} onClick={save}>Save Item</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
