'use client'
export default function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 10, width: wide ? 700 : 560, maxWidth: '96vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #dee2e6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#154360' }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid #dee2e6', borderRadius: 6, padding: '3px 9px', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  )
}
