import type { Metadata } from 'next'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export const metadata: Metadata = {
  title: 'Reset Password — Stitch AI',
  description: 'Reset your Stitch AI Content Suite password',
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
