import type { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/register-form'

export const metadata: Metadata = {
  title: 'Create Account — Stitch AI',
  description: 'Create your Stitch AI Content Suite account',
}

export default function RegisterPage() {
  return <RegisterForm />
}
