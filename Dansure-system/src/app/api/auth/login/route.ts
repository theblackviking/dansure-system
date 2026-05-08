import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { comparePassword, signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()
  const { data: user, error } = await supabaseAdmin
    .from('users').select('*').eq('username', username).single()

  if (error || !user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  if (!comparePassword(password, user.password_hash))
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  const token = signToken({ id: user.id, username: user.username, name: user.name, role: user.role })
  const res = NextResponse.json({ user: { id: user.id, username: user.username, name: user.name, role: user.role } })
  res.cookies.set('token', token, { httpOnly: true, maxAge: 604800, path: '/' })
  return res
}
