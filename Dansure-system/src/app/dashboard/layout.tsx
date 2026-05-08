'use client'
import { useEffect, useState, createContext, useContext } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface User { id: string; username: string; name: string; role: string }
const UserContext = createContext<User | null>(null)
export const useUser = () => useContext(UserContext)

const NAV = [
  { id: '', icon: '🏠', label: 'Dashboard' },
  { id: 'records', icon: '📋', label: 'Sales & Services' },
  { id: 'clients', icon: '👥', label: 'Clients' },
  { id: 'credit', icon: '💳', label: 'Credit / Partial' },
  { id: 'inventory', icon: '📦', label: 'Inventory' },
  { id: 'expenditure', icon: '💸', label: 'Expenditure' },
  { id: 'reports', icon: '📊', label: 'Reports' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [lowStock, setLowStock] = useState(0)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/auth/me').then(r => {
      if (!r.ok) router.push('/login')
      else r.json().then(d => setUser(d.user))
    })
    fetch('/api/inventory').then(r => r.ok ? r.json() : []).then((inv: any[]) => {
      setLowStock(inv.filter(i => i.qty <= i.min_qty).length)
    })
  }, [])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const currentSeg = pathname.replace('/dashboard', '').replace('/', '')
  const pageTitle: Record<string, string> = {
    '': 'Dashboard', records: 'Sales & Services', clients: 'Clients',
    credit: 'Credit & Partial Payments', inventory: 'Inventory Management',
    expenditure: 'Expenditure Tracker', reports: 'Reports & Analytics'
  }

  return (
    <UserContext.Provider value={user}>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: 220, background: '#154360', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '20px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>🔥</div>
            <div style={{ fontFamily: 'Barlow Condensed,sans-serif', fontSize: 16, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>Dansure Engineering Group Limited</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '1.2px', textTransform: 'uppercase', marginTop: 3 }}>Management System</div>
          </div>
          <nav style={{ padding: '10px 0', flex: 1, overflowY: 'auto' }}>
            {NAV.map(n => (
              <div key={n.id}
                onClick={() => router.push('/dashboard' + (n.id ? '/' + n.id : ''))}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
                  cursor: 'pointer', color: currentSeg === n.id ? '#fff' : 'rgba(255,255,255,0.65)',
                  fontSize: 13, fontWeight: 500,
                  background: currentSeg === n.id ? 'rgba(255,255,255,0.12)' : 'transparent',
                  borderLeft: `3px solid ${currentSeg === n.id ? '#c0392b' : 'transparent'}`,
                  transition: 'all 0.15s'
                }}>
                <span style={{ fontSize: 15 }}>{n.icon}</span>
                <span style={{ flex: 1 }}>{n.label}</span>
                {n.id === 'inventory' && lowStock > 0 && (
                  <span style={{ background: '#c0392b', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 10, fontWeight: 600 }}>{lowStock}</span>
                )}
              </div>
            ))}
          </nav>
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginBottom: 3 }}>Logged in as</div>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{user?.name}</div>
            <button onClick={logout} style={{ width: '100%', padding: '6px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'Barlow,sans-serif' }}>
              Logout
            </button>
          </div>
        </div>
        {/* Main */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ background: '#fff', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #dee2e6' }}>
            <div style={{ fontSize: 17, fontWeight: 600, color: '#154360' }}>{pageTitle[currentSeg] || 'Dashboard'}</div>
            <span style={{ fontSize: 12, color: '#adb5bd' }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
            {children}
          </div>
        </div>
      </div>
    </UserContext.Provider>
  )
}
