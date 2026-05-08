'use client'
import { useEffect, useState } from 'react'
import { GHS } from '@/components/Styles'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function ReportsPage() {
  const [records, setRecords] = useState<any[]>([])
  const [expenditures, setExpenditures] = useState<any[]>([])
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [filterMonth, setFilterMonth] = useState('all')

  useEffect(() => {
    Promise.all([
      fetch('/api/records').then(r => r.json()),
      fetch('/api/expenditures').then(r => r.json()),
    ]).then(([r, e]) => { setRecords(Array.isArray(r) ? r : []); setExpenditures(Array.isArray(e) ? e : []) })
  }, [])

  const years = [...new Set(records.map(r => new Date(r.date).getFullYear()))].sort((a, b) => b - a)
  if (!years.includes(parseInt(year))) years.unshift(parseInt(year))

  const data = MONTHS.map((m, mi) => {
    const mRec = records.filter(r => { const d = new Date(r.date); return d.getFullYear() === parseInt(year) && d.getMonth() === mi })
    const mExp = expenditures.filter(e => { const d = new Date(e.date); return d.getFullYear() === parseInt(year) && d.getMonth() === mi })
    const sales = mRec.filter(r => r.type === 'sale').reduce((s, r) => s + (r.total || 0), 0)
    const services = mRec.filter(r => r.type === 'service').reduce((s, r) => s + (r.total || 0), 0)
    const exp = mExp.reduce((s, e) => s + (e.amount || 0) + (e.transport_cost || 0), 0)
    return { month: m, sales, services, exp, total: sales + services }
  })

  const displayData = filterMonth === 'all' ? data : [data[parseInt(filterMonth)]]
  const totSales = data.reduce((s, d) => s + d.sales, 0)
  const totSrv = data.reduce((s, d) => s + d.services, 0)
  const totExp = data.reduce((s, d) => s + d.exp, 0)
  const net = totSales + totSrv - totExp
  const maxVal = Math.max(...data.map(d => d.total), 1)

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <select value={year} onChange={e => setYear(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #ced4da', borderRadius: 6, fontSize: 13, width: 120 }}>
          {years.map(y => <option key={y}>{y}</option>)}
        </select>
        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #ced4da', borderRadius: 6, fontSize: 13, width: 140 }}>
          <option value="all">All Months</option>
          {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Sales', value: GHS(totSales), color: '#c0392b' },
          { label: 'Total Services', value: GHS(totSrv), color: '#1e8449' },
          { label: 'Total Expenditure', value: GHS(totExp), color: '#495057' },
          { label: 'Net Revenue', value: GHS(net), color: net >= 0 ? '#1e8449' : '#c0392b' },
        ].map(c => (
          <div key={c.label} style={{ background: '#fff', borderRadius: 8, border: '1px solid #dee2e6', padding: 16 }}>
            <div style={{ fontSize: 11, color: '#adb5bd', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>{c.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: c.color, marginTop: 4 }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #dee2e6', padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#154360', marginBottom: 16 }}>Monthly Sales vs Services — {year}</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 180, paddingBottom: 24, position: 'relative' }}>
          {data.map((d, i) => {
            const sh = Math.round((d.sales / maxVal) * 150)
            const svh = Math.round((d.services / maxVal) * 150)
            const highlight = filterMonth === 'all' || parseInt(filterMonth) === i
            return (
              <div key={i} title={`${d.month}: Sales ${GHS(d.sales)}, Services ${GHS(d.services)}`}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, opacity: highlight ? 1 : 0.25 }}>
                <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 155 }}>
                  <div style={{ width: 11, height: `${sh}px`, background: '#c0392b', borderRadius: '2px 2px 0 0', minHeight: d.sales > 0 ? 3 : 0 }} />
                  <div style={{ width: 11, height: `${svh}px`, background: '#1e8449', borderRadius: '2px 2px 0 0', minHeight: d.services > 0 ? 3 : 0 }} />
                </div>
                <div style={{ fontSize: 10, color: '#adb5bd' }}>{d.month}</div>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 20, fontSize: 12, marginTop: 4 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, background: '#c0392b', borderRadius: 2, display: 'inline-block' }} />Sales</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, background: '#1e8449', borderRadius: 2, display: 'inline-block' }} />Services</span>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #dee2e6', padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#154360', marginBottom: 14 }}>Monthly Breakdown — {year}</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            {['Month', 'Sales', 'Services', 'Revenue', 'Expenditure', 'Net'].map(h => (
              <th key={h} style={{ fontSize: 11, color: '#adb5bd', textTransform: 'uppercase', padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #f0f2f5' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {displayData.map((d, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f0f2f5' }}>
                <td style={{ padding: '10px 12px', fontWeight: 600 }}>{d.month} {year}</td>
                <td style={{ padding: '10px 12px', color: '#c0392b' }}>{GHS(d.sales)}</td>
                <td style={{ padding: '10px 12px', color: '#1e8449' }}>{GHS(d.services)}</td>
                <td style={{ padding: '10px 12px', fontWeight: 600 }}>{GHS(d.total)}</td>
                <td style={{ padding: '10px 12px', color: '#6c757d' }}>{GHS(d.exp)}</td>
                <td style={{ padding: '10px 12px', fontWeight: 600, color: d.total - d.exp >= 0 ? '#1e8449' : '#c0392b' }}>{GHS(d.total - d.exp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
