import { NextRequest, NextResponse } from 'next/server'
import { getUser, unauthorized, supabaseAdmin } from '@/lib/apiHelper'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!getUser(req)) return unauthorized()
  const { error } = await supabaseAdmin.from('expenditures').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
