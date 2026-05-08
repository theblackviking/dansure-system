'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const GHS = (n: number) => `GH₵ ${(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`

export default function DashboardPage() {
  const [records, setRecords] = useState<any[]>([])
  const [expenditures, setExpenditures] = useState<any[]>([])
  const [inventory, setInventory] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    Promise.all([
      fetch('/api/records').then(r => r.json()),
      fetch('/api/expenditures').then(r => r.json()),
      fetch('/api/inventory').then(r => r.json()),
      fetch('/api/clients').then(r => r.json()),
    ]).then(([rec, exp, inv, cli]) => {
      setRecords(Array.isArray(rec) ? rec : [])
      setExpenditures(Array.isArray(exp) ? exp : [])
      setInventory(Array.isArray(inv) ? inv : [])
      setClients(Array.isArray(cli) ? cli : [])
    })
  }, [])

  const totalSales = records.filter(r => r.type === 'sale').reduce((s, r) => s + (r.total || 0), 0)
  const totalServices = records.filter(r => r.type === 'service').reduce((s, r) => s + (r.total || 0), 0)
  const totalExpend = expenditures.reduce((s, e) => s + (e.amount || 0) + (e.transport_cost || 0), 0)
  const outstanding = records.filter(r => r.balance > 0).reduce((s, r) => s + r.balance, 0)
  const lowStock = inventory.filter(i => i.qty <= i.min_qty)

  const now = new Date()
  const monthRecs = records.filter(r => {
    const d = new Date(r.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const monthSales = monthRecs.filter(r => r.type === 'sale').reduce((s, r) => s + (r.total || 0), 0)
  const monthSrv = monthRecs.filter(r => r.type === 'service').reduce((s, r) => s + (r.total || 0), 0)

  const S = { card: { background: '#fff', borderRadius: 8, border: '1px solid #dee2e6', padding: 16 } }

  return (
    <div>
      {lowStock.length > 0 && (
        <div onClick={() => router.push('/dashboard/inventory')}
          style={{ background: '#fadbd8', border: '1px solid #f5c6cb', borderRadius: 8, padding: '12px 16px', marginBottom: 16, cursor: 'pointer', fontSize: 13, color: '#922b21', fontWeight: 500, display: 'flex', gap: 8 }}>
          ⚠️ {lowStock.length} item(s) low in stock: {lowStock.slice(0, 3).map(i => i.name).join(', ')}{lowStock.length > 3 ? '...' : ''} — Click to view inventory
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Sales', value: GHS(totalSales), sub: `${records.filter(r => r.type === 'sale').length} transactions`, color: '#c0392b' },
          { label: 'Total Services', value: GHS(totalServices), sub: `${records.filter(r => r.type === 'service').length} transactions`, color: '#1e8449' },
          { label: 'Outstanding Credit', value: GHS(outstanding), sub: `${records.filter(r => r.balance > 0).length} accounts`, color: '#b7950b' },
          { label: 'Total Expenditure', value: GHS(totalExpend), sub: `${expenditures.length} entries`, color: '#154360' },
        ].map(c => (
          <div key={c.label} style={S.card}>
            <div style={{ fontSize: 11, color: '#adb5bd', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>{c.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: c.color, margin: '4px 0 2px' }}>{c.value}</div>
            <div style={{ fontSize: 11, color: '#adb5bd' }}>{c.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={S.card}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#154360', marginBottom: 12 }}>
            This Month — {now.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, textAlign: 'center', padding: 14, background: '#fadbd8', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: '#922b21', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sales</div>
              <div style={{ fontSize: 19, fontWeight: 700, color: '#c0392b', marginTop: 4 }}>{GHS(monthSales)}</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', padding: 14, background: '#d5f5e3', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: '#1a6b3c', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Services</div>
              <div style={{ fontSize: 19, fontWeight: 700, color: '#1e8449', marginTop: 4 }}>{GHS(monthSrv)}</div>
            </div>
          </div>
        </div>
        <div style={S.card}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#154360', marginBottom: 12 }}>Recent Transactions</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              {['Client', 'Type', 'Total', 'Status'].map(h => (
                <th key={h} style={{ fontSize: 11, color: '#adb5bd', textTransform: 'uppercase', padding: '4px 8px', textAlign: 'left', borderBottom: '1px solid #f0f2f5' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {records.slice(0, 5).map(r => (
                <tr key={r.id}>
                  <td style={{ padding: '6px 8px', fontSize: 12, fontWeight: 600 }}>{r.clients?.name || '—'}</td>
                  <td style={{ padding: '6px 8px' }}>
                    <span style={{ background: r.type === 'sale' ? '#d6eaf8' : '#d5f5e3', color: r.type === 'sale' ? '#154360' : '#1e6b40', fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>{r.type}</span>
                  </td>
                  <td style={{ padding: '6px 8px', fontSize: 12 }}>{GHS(r.total)}</td>
                  <td style={{ padding: '6px 8px' }}>
                    <span style={{ background: r.payment_status === 'paid' ? '#d5f5e3' : r.payment_status === 'credit' ? '#fadbd8' : '#fef9e7', color: r.payment_status === 'paid' ? '#1e6b40' : r.payment_status === 'credit' ? '#922b21' : '#9a7d0a', fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4 }}>{r.payment_status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={S.card}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#154360', marginBottom: 14 }}>Inventory Status</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          {inventory.slice(0, 8).map(i => {
            const low = i.qty <= i.min_qty
            const pct = Math.min(100, Math.round((i.qty / Math.max(i.qty, i.min_qty * 2)) * 100))
            return (
              <div key={i.id} style={{ padding: 10, background: '#f8f9fa', borderRadius: 6, border: '1px solid #dee2e6' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#495057', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: low ? '#c0392b' : '#343a40' }}>{i.qty}</span>
                  <span style={{ background: low ? '#fadbd8' : '#d5f5e3', color: low ? '#922b21' : '#1e6b40', fontSize: 9, fontWeight: 600, padding: '1px 5px', borderRadius: 3 }}>{low ? 'LOW' : 'OK'}</span>
                </div>
                <div style={{ height: 5, background: '#dee2e6', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: low ? '#c0392b' : '#1e8449', borderRadius: 3 }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
