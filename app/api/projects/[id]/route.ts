import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * GET /api/projects/[id]
 *
 * Fetch a single project with all its outputs (join).
 * Only returns projects owned by the authenticated user (RLS enforced).
 */
export async function GET(
  _req: NextRequest,
  ctx: RouteContext<'/api/projects/[id]'>,
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

  const { data: project, error } = await supabase
    .from('content_projects')
    .select(
      'id, user_id, input_text, status, model_config, created_at, updated_at, outputs(id, project_id, user_id, type, content, file_url, provider_used, model_used, tokens_used, created_at)',
    )
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !project) {
    return NextResponse.json(
      { error: 'Project not found' },
      { status: 404 },
    )
  }

  return NextResponse.json({ project })
}

/**
 * DELETE /api/projects/[id]
 *
 * Delete a project and cascade to its outputs.
 * Only deletes projects owned by the authenticated user.
 */
export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<'/api/projects/[id]'>,
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

  // Delete outputs first (cascade)
  await supabase
    .from('outputs')
    .delete()
    .eq('project_id', id)
    .eq('user_id', user.id)

  // Delete the project
  const { error } = await supabase
    .from('content_projects')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 },
    )
  }

  return NextResponse.json({ message: 'Project deleted successfully' })
}
