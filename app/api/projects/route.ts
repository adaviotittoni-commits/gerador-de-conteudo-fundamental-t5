import { createClient } from '@/lib/supabase/server'
import { createProjectSchema } from '@/lib/validations/project'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 },
    )
  }

  const result = createProjectSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: result.error.issues },
      { status: 400 },
    )
  }

  const { input_text, model_config } = result.data

  const { data: project, error } = await supabase
    .from('content_projects')
    .insert({
      user_id: user.id,
      input_text,
      model_config,
      status: 'draft',
    })
    .select('id, user_id, input_text, status, model_config, created_at, updated_at')
    .single()

  if (error) {
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 },
    )
  }

  return NextResponse.json(
    { project, message: 'Project created successfully' },
    { status: 201 },
  )
}

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: projects, error } = await supabase
    .from('content_projects')
    .select('id, user_id, input_text, status, model_config, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 },
    )
  }

  return NextResponse.json({ projects: projects ?? [] })
}
