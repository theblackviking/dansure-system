import { NextRequest, NextResponse } from 'next/server'
import { getUser, unauthorized, supabaseAdmin } from '@/lib/apiHelper'

export async function GET(req: NextRequest) {
  if (!getUser(req)) return unauthorized()
  const { data, error } = await supabaseAdmin.from('expenditures').select('*').order('date', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!getUser(req)) return unauthorized()
  const body = await req.json()
  const { data, error } = await supabaseAdmin.from('expenditures').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
