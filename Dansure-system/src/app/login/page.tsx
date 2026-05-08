'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const login = async () => {
    setLoading(true); setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    const data = await res.json()
    if (res.ok) router.push('/dashboard')
    else { setError(data.error || 'Login failed'); setLoading(false) }
  }

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#154360 0%,#1a5276 50%,#1c2e4a 100%)',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'#fff',borderRadius:12,padding:40,width:380,boxShadow:'0 30px 80px rgba(0,0,0,0.3)'}}>
        <div style={{textAlign:'center',marginBottom:28}}>
          <div style={{fontSize:40,marginBottom:8}}>🔥</div>
          <div style={{fontFamily:'Barlow Condensed,sans-serif',fontSize:22,fontWeight:700,color:'#154360',lineHeight:1.1}}>Dansure Engineering<br/>Group Limited</div>
          <div style={{fontSize:11,color:'#adb5bd',letterSpacing:'1.5px',textTransform:'uppercase',marginTop:4}}>Business Management System</div>
        </div>
        <div style={{fontSize:14,fontWeight:600,color:'#495057',marginBottom:16,textAlign:'center'}}>Sign in to continue</div>
        {[
          {label:'Username',value:username,set:setUsername,type:'text'},
          {label:'Password',value:password,set:setPassword,type:'password'}
        ].map(f=>(
          <div key={f.label} style={{marginBottom:14}}>
            <label style={{fontSize:11,fontWeight:600,color:'#495057',textTransform:'uppercase',letterSpacing:'0.5px',display:'block',marginBottom:4}}>{f.label}</label>
            <input type={f.type} value={f.value} onChange={e=>f.set(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&login()}
              style={{width:'100%',padding:'9px 12px',border:'1px solid #ced4da',borderRadius:6,fontSize:14,fontFamily:'Barlow,sans-serif'}}
            />
          </div>
        ))}
        {error && <div style={{color:'#c0392b',fontSize:12,marginBottom:8}}>{error}</div>}
        <button onClick={login} disabled={loading}
          style={{width:'100%',padding:11,background:'#c0392b',color:'#fff',border:'none',borderRadius:6,fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'Barlow,sans-serif',marginTop:4}}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </div>
    </div>
  )
}
