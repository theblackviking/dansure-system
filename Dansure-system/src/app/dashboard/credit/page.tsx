'use client'
import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'
import { S, GHS } from '@/components/Styles'

export default function CreditPage() {
  const [records, setRecords] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [payModal, setPayModal] = useState<any>(null)
  const [payAmt, setPayAmt] = useState('')

  const load = async () => { const d = await fetch('/api/records').then(r => r.json()); setRecords(Array.isArray(d) ? d : []) }
  useEffect(() => { load() }, [])

  const creditRecs = records.filter(r => r.balance > 0)
  const filtered = creditRecs.filter(r => !search || r.clients?.name?.toLowerCase().includes(search.toLowerCase()))
  const totalOwed = creditRecs.reduce((s, r) => s + (r.balance || 0), 0)

  const recordPayment = async () => {
    const amt = parseFloat(payAmt) || 0
    if (amt <= 0) { alert('Enter a valid amount'); return }
    const newPaid = (payModal.amount_paid || 0) + amt
    const newBal = Math.max(0, (payModal.total || 0) - newPaid)
    const status = newBal <= 0 ? 'paid' : 'partial'
    await fetch(`/api/records/${payModal.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount_paid: newPaid, balance: newBal, payment_status: status })
    })
    setPayModal(null); setPayAmt(''); load()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #dee2e6', padding: '12px 20px' }}>
          <div style={{ fontSize: 11, color: '#adb5bd', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Total Outstanding</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#c0392b' }}>{GHS(totalOwed)}</div>
          <div style={{ fontSize: 11, color: '#adb5bd' }}>{creditRecs.length} account(s)</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input placeholder="Search clients with outstanding balance..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...S.input, flex: 1 }} />
      </div>
      <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            {['Date', 'Client', 'Type', 'Invoice Total', 'Amount Paid', 'Balance', 'Status', 'Action'].map(h => (
              <th key={h} style={{ fontSize: 11, color: '#adb5bd', textTransform: 'uppercase', padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid #f0f2f5' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f0f2f5' }}>
                <td style={{ padding: '10px 12px', fontSize: 12 }}>{r.date}</td>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{r.clients?.name}</div>
                  <div style={{ fontSize: 11, color: '#adb5bd' }}>{r.clients?.phone}</div>
                </td>
                <td style={{ padding: '10px 12px' }}><span style={S.badge(r.type)}>{r.type}</span></td>
                <td style={{ padding: '10px 12px' }}>{GHS(r.total)}</td>
                <td style={{ padding: '10px 12px', color: '#1e8449', fontWeight: 600 }}>{GHS(r.amount_paid)}</td>
                <td style={{ padding: '10px 12px', color: '#c0392b', fontWeight: 700 }}>{GHS(r.balance)}</td>
                <td style={{ padding: '10px 12px' }}><span style={S.badge(r.payment_status)}>{r.payment_status}</span></td>
                <td style={{ padding: '10px 12px' }}>
                  <button style={{ ...S.btn, ...S.btnSuccess, padding: '5px 10px', fontSize: 12 }} onClick={() => { setPayModal(r); setPayAmt('') }}>
                    Record Payment
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#adb5bd' }}>💳 No outstanding balances</div>}
      </div>

      {payModal && (
        <Modal title="Record Payment" onClose={() => setPayModal(null)}>
          <div style={{ marginBottom: 16, padding: 12, background: '#f8f9fa', borderRadius: 8 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#154360' }}>{payModal.clients?.name}</div>
            <div style={{ fontSize: 13, marginTop: 6, display: 'flex', gap: 16 }}>
              <span>Invoice: <b>{GHS(payModal.total)}</b></span>
              <span>Paid: <b style={{ color: '#1e8449' }}>{GHS(payModal.amount_paid)}</b></span>
              <span>Balance: <b style={{ color: '#c0392b' }}>{GHS(payModal.balance)}</b></span>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}><label style={S.label}>Payment Amount (GH₵)</label><input type="number" style={S.input} value={payAmt} onChange={e => setPayAmt(e.target.value)} placeholder={`Max: ${(payModal.balance || 0).toFixed(2)}`} /></div>
          <div style={{ marginBottom: 12 }}>
            <button style={{ ...S.btn, ...S.btnOutline, fontSize: 12, padding: '5px 12px' }} onClick={() => setPayAmt(String(payModal.balance))}>Pay Full Balance ({GHS(payModal.balance)})</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, borderTop: '1px solid #dee2e6', paddingTop: 14 }}>
            <button style={{ ...S.btn, ...S.btnOutline }} onClick={() => setPayModal(null)}>Cancel</button>
            <button style={{ ...S.btn, ...S.btnSuccess }} onClick={recordPayment}>Confirm Payment</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
