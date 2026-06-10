import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<'/api/api-keys/[id]'>,
) {
  const { id } = await ctx.params

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 },
    )
  }

  return NextResponse.json({ message: 'API key deleted successfully' })
}
