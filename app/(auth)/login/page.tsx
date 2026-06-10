import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'Sign In — Stitch AI',
  description: 'Sign in to your Stitch AI Content Suite account',
}

export default function LoginPage() {
  return <LoginForm />
}
