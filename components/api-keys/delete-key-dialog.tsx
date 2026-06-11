'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { ApiKey } from '@/types'

const providerLabels: Record<ApiKey['provider'], string> = {
  openai: 'OpenAI',
  google_gemini: 'Google Gemini',
  anthropic: 'Anthropic',
}

interface DeleteKeyDialogProps {
  apiKey: Omit<ApiKey, 'encrypted_key'> | null
  onConfirm: (id: string) => void
  onCancel: () => void
}

export function DeleteKeyDialog({
  apiKey,
  onConfirm,
  onCancel,
}: DeleteKeyDialogProps) {
  return (
    <AlertDialog open={!!apiKey} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="glass-card border-white/10">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-title-lg text-on-surface">
            Remove API Key
          </AlertDialogTitle>
          <AlertDialogDescription className="text-body-sm text-on-surface-variant">
            Are you sure you want to remove the{' '}
            <strong className="text-on-surface">
              {apiKey ? providerLabels[apiKey.provider] : ''}
            </strong>{' '}
            API key? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onCancel}
            className="text-on-surface-variant"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => apiKey && onConfirm(apiKey.id)}
            className="bg-error text-on-surface hover:bg-error/80"
          >
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
