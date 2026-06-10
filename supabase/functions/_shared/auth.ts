import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface AuthUser {
  id: string
  email?: string
}

/**
 * Verify the Authorization header JWT and return the authenticated user.
 * Throws an error if the token is missing, invalid, or expired.
 */
export async function verifyAuth(req: Request): Promise<AuthUser> {
  const authHeader = req.headers.get('Authorization')

  if (!authHeader) {
    throw new Error('AUTH_REQUIRED')
  }

  const token = authHeader.replace('Bearer ', '')

  if (!token || token === authHeader) {
    throw new Error('AUTH_REQUIRED')
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Server configuration error')
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)

  if (error || !user) {
    throw new Error('AUTH_REQUIRED')
  }

  return { id: user.id, email: user.email }
}
