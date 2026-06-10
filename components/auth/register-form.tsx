'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSupabase } from '@/components/providers/supabase-provider'
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth'
import { OAuthButton } from '@/components/auth/oauth-button'
import Link from 'next/link'

export function RegisterForm() {
  const { supabase } = useSupabase()
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterFormData) {
    setServerError(null)

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
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
            Check your email to confirm your account. You can close this page.
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

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="font-mono text-label-sm uppercase tracking-wider text-primary"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-sm text-error">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="font-mono text-label-sm uppercase tracking-wider text-primary"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat your password"
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-error">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-primary px-6 py-3 font-mono text-label-md text-on-primary-fixed transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-outline-variant" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-surface px-4 font-mono text-label-sm uppercase tracking-wider text-on-surface-variant">
            or
          </span>
        </div>
      </div>

      <OAuthButton />

      <p className="text-center text-sm text-on-surface-variant">
        Already have an account?{' '}
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
