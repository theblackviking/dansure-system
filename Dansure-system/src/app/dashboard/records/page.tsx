'use client'
import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'
import { S, GHS, today } from '@/components/Styles'

export default function RecordsPage() {
  const [records, setRecords] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [inventory, setInventory] = useState<any[]>([])
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [viewRec, setViewRec] = useState<any>(null)
  const [form, setForm] = useState({ client_id: '', type: 'sale', date: today(), discount: '0', payment_status: 'paid', amount_paid: '', notes: '' })
  const [items, setItems] = useState([{ inventory_id: '', description: '', qty: '1', unit_price: '' }])

  const load = async () => {
    const [r, c, inv] = await Promise.all([
      fetch('/api/records').then(r => r.json()),
      fetch('/api/clients').then(r => r.json()),
      fetch('/api/inventory').then(r => r.json()),
    ])
    setRecords(Array.isArray(r) ? r : [])
    setClients(Array.isArray(c) ? c : [])
    setInventory(Array.isArray(inv) ? inv : [])
  }
  useEffect(() => { load() }, [])

  const filtered = records.filter(r => {
    const match = !search || r.clients?.name?.toLowerCase().includes(search.toLowerCase())
    if (tab === 'all') return match
    return r.type === tab && match
  })

  const subtotal = items.reduce((s, i) => s + (parseFloat(i.unit_price) || 0) * (parseInt(i.qty) || 0), 0)
  const discount = parseFloat(form.discount) || 0
  const total = subtotal - discount
  const amtPaid = form.payment_status === 'paid' ? total : (parseFloat(form.amount_paid) || 0)
  const balance = Math.max(0, total - amtPaid)

  const addItem = () => setItems(it => [...it, { inventory_id: '', description: '', qty: '1', unit_price: '' }])
  const removeItem = (i: number) => setItems(it => it.filter((_, idx) => idx !== i))
  const updateItem = (i: number, k: string, v: string) => setItems(it => it.map((item, idx) => {
    if (idx !== i) return item
    const upd: any = { ...item, [k]: v }
    if (k === 'inventory_id') {
      const inv = inventory.find(iv => iv.id === v)
      if (inv) { upd.description = inv.name; upd.unit_price = String(inv.price) }
    }
    return upd
  }))

  const save = async () => {
    if (!form.client_id) { alert('Select a client'); return }
    if (items.some(i => !i.description)) { alert('Fill all item descriptions'); return }
    const body = {
      ...form, client_id: form.client_id,
      subtotal, discount, total,
      amount_paid: amtPaid, balance,
      items: items.map(i => ({ ...i, qty: parseInt(i.qty), unit_price: parseFloat(i.unit_price) }))
    }
    await fetch('/api/records', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setModal(false)
    setItems([{ inventory_id: '', description: '', qty: '1', unit_price: '' }])
    setForm({ client_id: '', type: 'sale', date: today(), discount: '0', payment_status: 'paid', amount_paid: '', notes: '' })
    load()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 4, background: '#f0f2f5', padding: 4, borderRadius: 8 }}>
          {['all', 'sale', 'service'].map(t => (
            <div key={t} onClick={() => setTab(t)}
              style={{ padding: '6px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: tab === t ? '#fff' : 'transparent', color: tab === t ? '#154360' : '#6c757d', boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
              {t === 'all' ? 'All' : t === 'sale' ? 'Sales' : 'Services'}
            </div>
          ))}
        </div>
        <button style={{ ...S.btn, ...S.btnPrimary }} onClick={() => setModal(true)}>+ New Record</button>
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input placeholder="Search by client name..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...S.input, flex: 1 }} />
      </div>
      <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            {['Date', 'Client', 'Type', 'Items', 'Total', 'Status', 'Balance', 'View'].map(h => (
              <th key={h} style={{ fontSize: 11, color: '#adb5bd', textTransform: 'uppercase', padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid #f0f2f5' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f0f2f5' }}>
                <td style={{ padding: '10px 12px', fontSize: 12 }}>{r.date}</td>
                <td style={{ padding: '10px 12px', fontWeight: 600, fontSize: 13 }}>{r.clients?.name || '—'}</td>
                <td style={{ padding: '10px 12px' }}><span style={S.badge(r.type)}>{r.type}</span></td>
                <td style={{ padding: '10px 12px', fontSize: 12 }}>{r.record_items?.length || 0} item(s)</td>
                <td style={{ padding: '10px 12px', fontWeight: 600 }}>{GHS(r.total)}</td>
                <td style={{ padding: '10px 12px' }}><span style={S.badge(r.payment_status)}>{r.payment_status}</span></td>
                <td style={{ padding: '10px 12px', fontWeight: 600, color: r.balance > 0 ? '#c0392b' : '#1e8449' }}>{GHS(r.balance)}</td>
                <td style={{ padding: '10px 12px' }}><button style={{ ...S.btn, ...S.btnOutline, padding: '4px 10px', fontSize: 12 }} onClick={() => setViewRec(r)}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#adb5bd' }}>📋 No records found</div>}
      </div>

      {modal && (
        <Modal title="New Sale / Service Record" onClose={() => setModal(false)} wide>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div><label style={S.label}>Client *</label>
              <select style={S.input} value={form.client_id} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))}>
                <option value="">-- Select Client --</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><label style={S.label}>Type</label>
              <select style={S.input} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="sale">Sale</option><option value="service">Service</option>
              </select>
            </div>
            <div><label style={S.label}>Date</label><input type="date" style={S.input} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={S.label}>Items</label>
              <button style={{ ...S.btn, ...S.btnOutline, padding: '4px 10px', fontSize: 12 }} onClick={addItem}>+ Add Item</button>
            </div>
            {items.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, padding: 10, background: '#f8f9fa', borderRadius: 6, border: '1px solid #dee2e6', alignItems: 'center' }}>
                <select style={{ ...S.input, width: 160, flex: 'none' }} value={item.inventory_id} onChange={e => updateItem(i, 'inventory_id', e.target.value)}>
                  <option value="">From Inventory</option>
                  {inventory.map(iv => <option key={iv.id} value={iv.id}>{iv.name}</option>)}
                </select>
                <input style={{ ...S.input, flex: 2 }} placeholder={form.type === 'service' ? 'e.g. Replacement of 6kg DCP extinguisher head' : 'Description'} value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} />
                <input style={{ ...S.input, width: 60, flex: 'none' }} type="number" min="1" placeholder="Qty" value={item.qty} onChange={e => updateItem(i, 'qty', e.target.value)} />
                <input style={{ ...S.input, width: 100, flex: 'none' }} type="number" placeholder="Price GH₵" value={item.unit_price} onChange={e => updateItem(i, 'unit_price', e.target.value)} />
                <span style={{ fontSize: 13, fontWeight: 600, width: 90, textAlign: 'right', color: '#154360', flexShrink: 0 }}>{GHS((parseFloat(item.unit_price) || 0) * (parseInt(item.qty) || 0))}</span>
                {items.length > 1 && <button style={{ ...S.btn, ...S.btnDanger, padding: '4px 8px', fontSize: 13, flexShrink: 0 }} onClick={() => removeItem(i)}>✕</button>}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div><label style={S.label}>Discount (GH₵)</label><input type="number" style={S.input} value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} /></div>
            <div><label style={S.label}>Payment Status</label>
              <select style={S.input} value={form.payment_status} onChange={e => setForm(f => ({ ...f, payment_status: e.target.value }))}>
                <option value="paid">Paid in Full</option><option value="partial">Partial Payment</option><option value="credit">Credit (Not Paid)</option>
              </select>
            </div>
            <div><label style={S.label}>Amount Paid (GH₵)</label>
              <input type="number" style={S.input} disabled={form.payment_status === 'paid'} value={form.payment_status === 'paid' ? total.toFixed(2) : form.amount_paid} onChange={e => setForm(f => ({ ...f, amount_paid: e.target.value }))} />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}><label style={S.label}>Notes</label><textarea style={{ ...S.input, height: 60, resize: 'vertical' } as any} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>

          <div style={{ display: 'flex', gap: 16, background: '#d6eaf8', padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13, fontWeight: 600, color: '#154360' }}>
            <span>Subtotal: {GHS(subtotal)}</span>
            <span>Discount: -{GHS(discount)}</span>
            <span>Total: {GHS(total)}</span>
            <span style={{ color: balance > 0 ? '#c0392b' : '#1e8449' }}>Balance: {GHS(balance)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, borderTop: '1px solid #dee2e6', paddingTop: 14 }}>
            <button style={{ ...S.btn, ...S.btnOutline }} onClick={() => setModal(false)}>Cancel</button>
            <button style={{ ...S.btn, ...S.btnPrimary }} onClick={save}>Save Record</button>
          </div>
        </Modal>
      )}

      {viewRec && (
        <Modal title={`${viewRec.type === 'sale' ? 'Sale' : 'Service'} Receipt`} onClose={() => setViewRec(null)}>
          <div style={{ borderBottom: '2px solid #c0392b', paddingBottom: 12, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#154360' }}>{viewRec.clients?.name}</div>
            <div style={{ fontSize: 12, color: '#adb5bd' }}>{viewRec.clients?.phone} · {viewRec.clients?.location}</div>
            <div style={{ fontSize: 12, color: '#adb5bd', marginTop: 2 }}>Date: {viewRec.date} · Ref: #{viewRec.id?.slice(0, 8)}</div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
            <thead><tr>
              {['Description', 'Qty', 'Unit Price', 'Amount'].map((h, i) => <th key={h} style={{ fontSize: 11, color: '#adb5bd', padding: '6px 8px', textAlign: i > 0 ? 'right' : 'left', borderBottom: '1px solid #dee2e6' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {(viewRec.record_items || []).map((it: any, i: number) => (
                <tr key={i}><td style={{ padding: '8px', fontSize: 13 }}>{it.description}</td><td style={{ padding: '8px', textAlign: 'right' }}>{it.qty}</td><td style={{ padding: '8px', textAlign: 'right' }}>{GHS(it.unit_price)}</td><td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>{GHS(it.qty * it.unit_price)}</td></tr>
              ))}
            </tbody>
          </table>
          <div style={{ textAlign: 'right', borderTop: '1px solid #dee2e6', paddingTop: 10 }}>
            <div style={{ fontSize: 13, color: '#6c757d' }}>Subtotal: {GHS(viewRec.subtotal)}</div>
            {viewRec.discount > 0 && <div style={{ fontSize: 13, color: '#c0392b' }}>Discount: -{GHS(viewRec.discount)}</div>}
            <div style={{ fontSize: 17, fontWeight: 700, color: '#154360' }}>Total: {GHS(viewRec.total)}</div>
            <div style={{ fontSize: 13, color: '#1e8449' }}>Paid: {GHS(viewRec.amount_paid)}</div>
            {viewRec.balance > 0 && <div style={{ fontSize: 13, color: '#c0392b', fontWeight: 600 }}>Balance: {GHS(viewRec.balance)}</div>}
            <span style={S.badge(viewRec.payment_status)}>{viewRec.payment_status}</span>
          </div>
          {viewRec.notes && <div style={{ marginTop: 12, padding: '10px 12px', background: '#f8f9fa', borderRadius: 6, fontSize: 13, color: '#6c757d' }}>Notes: {viewRec.notes}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #dee2e6', paddingTop: 14, marginTop: 16 }}>
            <button style={{ ...S.btn, ...S.btnOutline }} onClick={() => setViewRec(null)}>Close</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
