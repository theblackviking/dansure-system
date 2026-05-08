import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, User } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export function getUser(req: NextRequest): User | null {
  const token = req.cookies.get('token')?.value
  if (!token) return null
  return verifyToken(token)
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export { supabaseAdmin }
