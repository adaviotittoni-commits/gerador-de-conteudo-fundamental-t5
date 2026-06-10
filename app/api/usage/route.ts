import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export interface TokensByProvider {
  provider: string
  total_tokens: number
}

export interface OutputsByType {
  type: string
  count: number
}

export interface UsageTotals {
  total_tokens: number
  total_outputs: number
}

export interface UsageResponse {
  tokensByProvider: TokensByProvider[]
  outputsByType: OutputsByType[]
  totals: UsageTotals
}

/**
 * GET /api/usage
 *
 * Returns aggregated usage metrics for the authenticated user.
 * Query params:
 *   - period: '7d' | '30d' | 'all' (default: '30d')
 *
 * Returns:
 *   - tokensByProvider: SUM(tokens_used) GROUP BY provider_used
 *   - outputsByType: COUNT(*) GROUP BY type
 *   - totals: { total_tokens, total_outputs }
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
  const period = searchParams.get('period') || '30d'

  // Calculate date filter based on period
  let dateFilter: string | null = null
  if (period === '7d') {
    const date = new Date()
    date.setDate(date.getDate() - 7)
    dateFilter = date.toISOString()
  } else if (period === '30d') {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    dateFilter = date.toISOString()
  }
  // 'all' => no date filter

  // Build base query for tokens by provider
  let tokensQuery = supabase
    .from('outputs')
    .select('provider_used, tokens_used')
    .eq('user_id', user.id)

  if (dateFilter) {
    tokensQuery = tokensQuery.gte('created_at', dateFilter)
  }

  const { data: outputsData, error: outputsError } = await tokensQuery

  if (outputsError) {
    return NextResponse.json(
      { error: 'Failed to fetch usage metrics' },
      { status: 500 },
    )
  }

  const rows = outputsData ?? []

  // Aggregate tokens by provider
  const providerMap = new Map<string, number>()
  for (const row of rows) {
    const provider = row.provider_used || 'unknown'
    const tokens = row.tokens_used ?? 0
    providerMap.set(provider, (providerMap.get(provider) ?? 0) + tokens)
  }

  const tokensByProvider: TokensByProvider[] = Array.from(providerMap.entries())
    .map(([provider, total_tokens]) => ({ provider, total_tokens }))
    .sort((a, b) => b.total_tokens - a.total_tokens)

  // Build base query for outputs by type
  let typeQuery = supabase
    .from('outputs')
    .select('type')
    .eq('user_id', user.id)

  if (dateFilter) {
    typeQuery = typeQuery.gte('created_at', dateFilter)
  }

  const { data: typeData, error: typeError } = await typeQuery

  if (typeError) {
    return NextResponse.json(
      { error: 'Failed to fetch usage metrics' },
      { status: 500 },
    )
  }

  const typeRows = typeData ?? []

  // Aggregate counts by type
  const typeMap = new Map<string, number>()
  for (const row of typeRows) {
    const type = row.type || 'unknown'
    typeMap.set(type, (typeMap.get(type) ?? 0) + 1)
  }

  const outputsByType: OutputsByType[] = Array.from(typeMap.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)

  // Calculate totals
  const total_tokens = tokensByProvider.reduce((sum, p) => sum + p.total_tokens, 0)
  const total_outputs = typeRows.length

  const response: UsageResponse = {
    tokensByProvider,
    outputsByType,
    totals: {
      total_tokens,
      total_outputs,
    },
  }

  return NextResponse.json(response)
}
