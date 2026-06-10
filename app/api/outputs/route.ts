import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

/**
 * GET /api/outputs
 *
 * List outputs for the authenticated user with optional filters.
 * Query params:
 *   - type: filter by output type (copy, narrative, hooks, cta, image)
 *   - project_id: filter by project
 *   - search: text search (ILIKE) on content field
 *   - date_from: ISO date string, inclusive lower bound on created_at
 *   - date_to: ISO date string, inclusive upper bound on created_at
 *   - limit: max results to return (default 20, max 100)
 *   - offset: number of results to skip (default 0)
 *
 * Results are ordered by created_at DESC.
 * Response includes `total` count for pagination.
 */
export async function GET(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const projectId = searchParams.get('project_id')
  const search = searchParams.get('search')
  const dateFrom = searchParams.get('date_from')
  const dateTo = searchParams.get('date_to')

  const limit = Math.min(
    Math.max(parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 1),
    MAX_LIMIT,
  )
  const offset = Math.max(
    parseInt(searchParams.get('offset') ?? '0', 10) || 0,
    0,
  )

  let query = supabase
    .from('outputs')
    .select('id, project_id, user_id, type, content, file_url, provider_used, model_used, tokens_used, created_at', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (type) {
    query = query.eq('type', type)
  }

  if (projectId) {
    query = query.eq('project_id', projectId)
  }

  if (search) {
    query = query.ilike('content', `%${search}%`)
  }

  if (dateFrom) {
    query = query.gte('created_at', dateFrom)
  }

  if (dateTo) {
    query = query.lte('created_at', dateTo)
  }

  query = query.range(offset, offset + limit - 1)

  const { data: outputs, error, count } = await query

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch outputs' },
      { status: 500 },
    )
  }

  return NextResponse.json({
    outputs: outputs ?? [],
    total: count ?? 0,
    limit,
    offset,
  })
}
