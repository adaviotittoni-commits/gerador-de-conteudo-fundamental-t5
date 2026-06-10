'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSupabase } from '@/components/providers/supabase-provider'
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '@/lib/validations/auth'
import Link from 'next/link'

export function ForgotPasswordForm() {
  const { supabase } = useSupabase()
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  async function onSubmit(data: ForgotPasswordFormData) {
    setServerError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/callback`,
    })

    if (error) {
      setServerError(error.message)
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-xl border border-success/20 bg-success/10 px-4 py-6">
          <p className="text-sm text-success">
            If an account exists with that email, you will receive a password
            reset link shortly.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-block px-4 py-3 font-mono text-label-md text-on-surface-variant transition-colors hover:text-primary"
        >
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {serverError && (
        <div className="rounded-xl border border-error/20 bg-error-container/20 px-4 py-3">
          <p className="text-sm text-error">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="font-mono text-label-sm uppercase tracking-wider text-primary"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-error">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-primary px-6 py-3 font-mono text-label-md text-on-primary-fixed transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <p className="text-center text-sm text-on-surface-variant">
        Remember your password?{' '}
        <Link
          href="/login"
          className="font-mono text-label-md text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
