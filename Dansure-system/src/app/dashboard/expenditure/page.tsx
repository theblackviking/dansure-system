'use client'
import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'
import { S, GHS, today } from '@/components/Styles'

const CATS = ['Stock Purchase', 'Transport', 'Repairs & Maintenance', 'Utilities', 'Staff Expenses', 'Marketing', 'Other']

export default function ExpenditurePage() {
  const [expenditures, setExpenditures] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ date: today(), category: 'Stock Purchase', description: '', amount: '', supplier: '', transport_cost: '', notes: '' })

  const load = async () => { const d = await fetch('/api/expenditures').then(r => r.json()); setExpenditures(Array.isArray(d) ? d : []) }
  useEffect(() => { load() }, [])

  const filtered = expenditures.filter(e => e.description?.toLowerCase().includes(search.toLowerCase()) || e.category?.toLowerCase().includes(search.toLowerCase()))
  const total = expenditures.reduce((s, e) => s + (e.amount || 0) + (e.transport_cost || 0), 0)

  const save = async () => {
    if (!form.description) { alert('Description required'); return }
    const body = { ...form, amount: parseFloat(form.amount) || 0, transport_cost: parseFloat(form.transport_cost) || 0 }
    await fetch('/api/expenditures', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setModal(false); setForm({ date: today(), category: 'Stock Purchase', description: '', amount: '', supplier: '', transport_cost: '', notes: '' }); load()
  }

  const del = async (id: string) => { if (!confirm('Delete entry?')) return; await fetch(`/api/expenditures/${id}`, { method: 'DELETE' }); load() }
  const F = (v: string, k: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #dee2e6', padding: '12px 20px' }}>
          <div style={{ fontSize: 11, color: '#adb5bd', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Total Expenditure</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#c0392b' }}>{GHS(total)}</div>
        </div>
        <button style={{ ...S.btn, ...S.btnPrimary }} onClick={() => setModal(true)}>+ Add Expenditure</button>
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input placeholder="Search expenditures..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...S.input, flex: 1 }} />
      </div>
      <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            {['Date', 'Category', 'Description', 'Supplier', 'Amount', 'Transport', 'Total', 'Del'].map(h => (
              <th key={h} style={{ fontSize: 11, color: '#adb5bd', textTransform: 'uppercase', padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid #f0f2f5' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id} style={{ borderBottom: '1px solid #f0f2f5' }}>
                <td style={{ padding: '10px 12px', fontSize: 12 }}>{e.date}</td>
                <td style={{ padding: '10px 12px' }}><span style={{ ...S.badge('sale'), background: '#d6eaf8', color: '#154360' }}>{e.category}</span></td>
                <td style={{ padding: '10px 12px', fontSize: 13 }}>{e.description}</td>
                <td style={{ padding: '10px 12px', fontSize: 12, color: '#6c757d' }}>{e.supplier || '—'}</td>
                <td style={{ padding: '10px 12px' }}>{GHS(e.amount)}</td>
                <td style={{ padding: '10px 12px' }}>{GHS(e.transport_cost)}</td>
                <td style={{ padding: '10px 12px', fontWeight: 600, color: '#c0392b' }}>{GHS((e.amount || 0) + (e.transport_cost || 0))}</td>
                <td style={{ padding: '10px 12px' }}><button style={{ ...S.btn, ...S.btnDanger, padding: '4px 10px', fontSize: 12 }} onClick={() => del(e.id)}>Del</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#adb5bd' }}>💸 No expenditure records</div>}
      </div>

      {modal && (
        <Modal title="Add Expenditure" onClose={() => setModal(false)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div><label style={S.label}>Date</label><input type="date" style={S.input} value={form.date} onChange={e => F(e.target.value, 'date')} /></div>
            <div><label style={S.label}>Category</label>
              <select style={S.input} value={form.category} onChange={e => F(e.target.value, 'category')}>
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}><label style={S.label}>Description *</label><textarea style={{ ...S.input, height: 60, resize: 'vertical' } as any} value={form.description} onChange={e => F(e.target.value, 'description')} placeholder="e.g. Purchase of 10 units 6kg DCP extinguishers from FireTech..." /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div><label style={S.label}>Amount (GH₵)</label><input type="number" style={S.input} value={form.amount} onChange={e => F(e.target.value, 'amount')} /></div>
            <div><label style={S.label}>Transport Cost</label><input type="number" style={S.input} value={form.transport_cost} onChange={e => F(e.target.value, 'transport_cost')} /></div>
            <div><label style={S.label}>Supplier / Vendor</label><input style={S.input} value={form.supplier} onChange={e => F(e.target.value, 'supplier')} placeholder="Supplier name" /></div>
          </div>
          <div style={{ marginBottom: 12 }}><label style={S.label}>Notes</label><input style={S.input} value={form.notes} onChange={e => F(e.target.value, 'notes')} /></div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, borderTop: '1px solid #dee2e6', paddingTop: 14 }}>
            <button style={{ ...S.btn, ...S.btnOutline }} onClick={() => setModal(false)}>Cancel</button>
            <button style={{ ...S.btn, ...S.btnPrimary }} onClick={save}>Save Expenditure</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
