'use client'

interface BriefingInputProps {
  value: string
  onChange: (value: string) => void
  maxLength?: number
}

export function BriefingInput({
  value,
  onChange,
  maxLength = 5000,
}: BriefingInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor="briefing"
          className="text-label-md text-on-surface font-medium"
        >
          Briefing do Projeto
        </label>
        <span className="text-label-sm text-outline">
          {value.length}/{maxLength}
        </span>
      </div>
      <textarea
        id="briefing"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        rows={8}
        placeholder="Descreva o conteudo que voce deseja gerar. Inclua o tema, tom de voz, publico-alvo e qualquer detalhe relevante para a criacao..."
        className="w-full resize-none rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
      />
      {value.length > 0 && value.length < 10 && (
        <p className="text-label-sm text-error">
          O briefing deve ter pelo menos 10 caracteres
        </p>
      )}
    </div>
  )
}
