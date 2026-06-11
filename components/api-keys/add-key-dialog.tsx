'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  addApiKeySchema,
  apiKeyProviders,
  type AddApiKeyFormData,
  type ApiKeyProvider,
} from '@/lib/validations/api-keys'

const providerLabels: Record<ApiKeyProvider, string> = {
  openai: 'OpenAI',
  google_gemini: 'Google Gemini',
  anthropic: 'Anthropic',
}

interface AddKeyDialogProps {
  onKeyAdded: () => void
  existingProviders: ApiKeyProvider[]
}

export function AddKeyDialog({
  onKeyAdded,
  existingProviders,
}: AddKeyDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<
    ApiKeyProvider | undefined
  >(undefined)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddApiKeyFormData>({
    resolver: zodResolver(addApiKeySchema),
  })

  const availableProviders = apiKeyProviders.filter(
    (p) => !existingProviders.includes(p),
  )

  async function onSubmit(data: AddApiKeyFormData) {
    setIsSubmitting(true)
    setServerError(null)

    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errorData = await res.json()
        setServerError(errorData.error || 'Failed to save API key')
        return
      }

      reset()
      setSelectedProvider(undefined)
      setOpen(false)
      onKeyAdded()
    } catch {
      setServerError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      reset()
      setSelectedProvider(undefined)
      setServerError(null)
    }
  }

  function handleProviderChange(value: ApiKeyProvider) {
    setSelectedProvider(value)
    setValue('provider', value, { shouldValidate: true })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            className="btn-gradient-primary rounded-lg"
            disabled={availableProviders.length === 0}
          />
        }
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Key
      </DialogTrigger>
      <DialogContent className="glass-card border-white/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-title-lg text-on-surface">
            Add API Key
          </DialogTitle>
          <DialogDescription className="text-body-sm text-on-surface-variant">
            Add your provider API key to enable content generation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Provider Select */}
          <div className="space-y-2">
            <Label htmlFor="provider" className="text-label-md text-on-surface">
              Provider
            </Label>
            <Select
              value={selectedProvider}
              onValueChange={(value) =>
                handleProviderChange(value as ApiKeyProvider)
              }
            >
              <SelectTrigger className="w-full bg-surface-container-highest border-white/5">
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                {availableProviders.map((provider) => (
                  <SelectItem key={provider} value={provider}>
                    {providerLabels[provider]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.provider && (
              <p className="text-label-sm text-error">
                {errors.provider.message}
              </p>
            )}
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <Label htmlFor="key" className="text-label-md text-on-surface">
              API Key
            </Label>
            <Input
              id="key"
              type="password"
              placeholder="sk-..."
              className="bg-surface-container-highest border-white/5 font-mono"
              {...register('key')}
            />
            {errors.key && (
              <p className="text-label-sm text-error">{errors.key.message}</p>
            )}
          </div>

          {/* Server Error */}
          {serverError && (
            <p className="text-label-sm text-error">{serverError}</p>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              className="text-on-surface-variant"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn-gradient-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Key'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
