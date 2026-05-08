import { NextRequest, NextResponse } from 'next/server'
import { getUser, unauthorized, supabaseAdmin } from '@/lib/apiHelper'

export async function GET(req: NextRequest) {
  if (!getUser(req)) return unauthorized()
  const { data, error } = await supabaseAdmin
    .from('records')
    .select('*, clients(name, phone, location), record_items(*)')
    .order('date', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!getUser(req)) return unauthorized()
  const body = await req.json()
  const { items, ...record } = body

  const { data: rec, error: recErr } = await supabaseAdmin
    .from('records').insert(record).select().single()
  if (recErr) return NextResponse.json({ error: recErr.message }, { status: 500 })

  if (items?.length) {
    const itemsWithRecordId = items.map((i: any) => ({ ...i, record_id: rec.id }))
    const { error: itemErr } = await supabaseAdmin.from('record_items').insert(itemsWithRecordId)
    if (itemErr) return NextResponse.json({ error: itemErr.message }, { status: 500 })

    // Deduct inventory quantities for sales
    if (record.type === 'sale') {
      for (const item of items) {
        if (item.inventory_id) {
          await supabaseAdmin.rpc('decrement_inventory', {
            p_id: item.inventory_id,
            p_qty: item.qty
          })
        }
      }
    }
  }

  return NextResponse.json(rec)
}
