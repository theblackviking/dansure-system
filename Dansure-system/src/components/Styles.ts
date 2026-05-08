export const S = {
  label: { fontSize: 11, fontWeight: 600, color: '#495057', textTransform: 'uppercase' as const, letterSpacing: '0.5px', display: 'block', marginBottom: 4 },
  input: { width: '100%', padding: '8px 10px', border: '1px solid #ced4da', borderRadius: 6, fontSize: 13, fontFamily: 'Barlow,sans-serif', color: '#343a40' },
  btn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: 'Barlow,sans-serif' },
  btnPrimary: { background: '#c0392b', color: '#fff' },
  btnSecondary: { background: '#154360', color: '#fff' },
  btnOutline: { background: '#fff', color: '#495057', border: '1px solid #ced4da' },
  btnDanger: { background: '#e74c3c', color: '#fff' },
  btnSuccess: { background: '#1e8449', color: '#fff' },
  card: { background: '#fff', borderRadius: 8, border: '1px solid #dee2e6', padding: 20, marginBottom: 16 },
  badge: (type: string) => {
    const m: Record<string, [string, string]> = {
      sale: ['#d6eaf8', '#154360'], service: ['#d5f5e3', '#1e6b40'],
      paid: ['#d5f5e3', '#1e6b40'], credit: ['#fadbd8', '#922b21'],
      partial: ['#fef9e7', '#9a7d0a'], low: ['#fadbd8', '#922b21'], ok: ['#d5f5e3', '#1e6b40']
    }
    const [bg, color] = m[type] || ['#f0f2f5', '#495057']
    return { background: bg, color, fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4, textTransform: 'uppercase' as const, display: 'inline-block' }
  }
}
export const GHS = (n: number) => `GH₵ ${(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
export const today = () => new Date().toISOString().slice(0, 10)
