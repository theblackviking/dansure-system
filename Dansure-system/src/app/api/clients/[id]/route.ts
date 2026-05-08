import { NextRequest, NextResponse } from 'next/server'
import { getUser, unauthorized, supabaseAdmin } from '@/lib/apiHelper'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!getUser(req)) return unauthorized()
  const body = await req.json()
  const { data, error } = await supabaseAdmin.from('clients').update(body).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!getUser(req)) return unauthorized()
  const { error } = await supabaseAdmin.from('clients').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
