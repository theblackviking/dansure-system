'use client'
import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'
import { S, GHS } from '@/components/Styles'

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [records, setRecords] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: '', phone: '', location: '' })

  const load = async () => {
    const [c, r] = await Promise.all([
      fetch('/api/clients').then(r => r.json()),
      fetch('/api/records').then(r => r.json()),
    ])
    setClients(Array.isArray(c) ? c : [])
    setRecords(Array.isArray(r) ? r : [])
  }
  useEffect(() => { load() }, [])

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.location?.toLowerCase().includes(search.toLowerCase())
  )

  const save = async () => {
    if (!form.name || !form.phone) { alert('Name and phone required'); return }
    const url = editing ? `/api/clients/${editing.id}` : '/api/clients'
    const method = editing ? 'PUT' : 'POST'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setModal(false); setEditing(null); setForm({ name: '', phone: '', location: '' }); load()
  }

  const del = async (id: string) => {
    if (!confirm('Delete this client?')) return
    await fetch(`/api/clients/${id}`, { method: 'DELETE' })
    load()
  }

  const F = (v: string, k: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...S.input, flex: 1 }} />
        <button style={{ ...S.btn, ...S.btnPrimary }} onClick={() => { setForm({ name: '', phone: '', location: '' }); setEditing(null); setModal(true) }}>
          + Add Client
        </button>
      </div>
      <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            {['#', 'Name', 'Phone', 'Location', 'Transactions', 'Outstanding', 'Actions'].map(h => (
              <th key={h} style={{ fontSize: 11, color: '#adb5bd', textTransform: 'uppercase', padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid #f0f2f5', letterSpacing: '0.5px' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map((c, i) => {
              const cRec = records.filter(r => r.client_id === c.id)
              const owed = cRec.reduce((s: number, r: any) => s + (r.balance || 0), 0)
              return (
                <tr key={c.id} style={{ borderBottom: '1px solid #f0f2f5' }}>
                  <td style={{ padding: '10px 12px', fontSize: 11, color: '#adb5bd' }}>{i + 1}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 600, fontSize: 13 }}>{c.name}</td>
                  <td style={{ padding: '10px 12px', fontSize: 13 }}>{c.phone}</td>
                  <td style={{ padding: '10px 12px', fontSize: 13 }}>{c.location}</td>
                  <td style={{ padding: '10px 12px', fontSize: 13 }}>{cRec.length}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: owed > 0 ? '#c0392b' : '#1e8449' }}>{GHS(owed)}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <button style={{ ...S.btn, ...S.btnOutline, padding: '4px 10px', fontSize: 12, marginRight: 6 }}
                      onClick={() => { setForm({ name: c.name, phone: c.phone, location: c.location }); setEditing(c); setModal(true) }}>Edit</button>
                    <button style={{ ...S.btn, ...S.btnDanger, padding: '4px 10px', fontSize: 12 }} onClick={() => del(c.id)}>Del</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#adb5bd' }}>👥 No clients found</div>}
      </div>

      {modal && (
        <Modal title={editing ? 'Edit Client' : 'Add New Client'} onClose={() => { setModal(false); setEditing(null) }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div><label style={S.label}>Full Name *</label><input style={S.input} value={form.name} onChange={e => F(e.target.value, 'name')} placeholder="Client name" /></div>
            <div><label style={S.label}>Phone Number *</label><input style={S.input} value={form.phone} onChange={e => F(e.target.value, 'phone')} placeholder="e.g. 024-555-0000" /></div>
          </div>
          <div style={{ marginBottom: 12 }}><label style={S.label}>Location</label><input style={S.input} value={form.location} onChange={e => F(e.target.value, 'location')} placeholder="Area / District" /></div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, borderTop: '1px solid #dee2e6', paddingTop: 14, marginTop: 8 }}>
            <button style={{ ...S.btn, ...S.btnOutline }} onClick={() => { setModal(false); setEditing(null) }}>Cancel</button>
            <button style={{ ...S.btn, ...S.btnPrimary }} onClick={save}>Save Client</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
