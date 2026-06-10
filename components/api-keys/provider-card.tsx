'use client'

const providers = [
  {
    name: 'OpenAI',
    description: 'GPT-4o, GPT-4o-mini for copy, narratives, and hooks.',
    docsUrl: 'https://platform.openai.com/api-keys',
  },
  {
    name: 'Google Gemini',
    description: 'Gemini 2.5 Flash/Pro for text and image generation.',
    docsUrl: 'https://aistudio.google.com/apikey',
  },
  {
    name: 'Anthropic',
    description: 'Claude Sonnet/Haiku for creative writing and CTAs.',
    docsUrl: 'https://console.anthropic.com/settings/keys',
  },
]

export function ProviderInfoCard() {
  return (
    <div className="glass-card rounded-xl p-6 space-y-4">
      <h3 className="font-display text-title-sm text-on-surface">
        Supported Providers
      </h3>
      <div className="space-y-4">
        {providers.map((provider) => (
          <div key={provider.name} className="space-y-1">
            <p className="text-label-md text-on-surface font-medium">
              {provider.name}
            </p>
            <p className="text-body-sm text-on-surface-variant">
              {provider.description}
            </p>
            <a
              href={provider.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-label-sm text-primary hover:underline"
            >
              Get API key
            </a>
          </div>
        ))}
      </div>
      <div className="border-t border-white/5 pt-4">
        <p className="text-body-sm text-on-surface-variant">
          Your keys are stored securely and never shared. They are used only for
          content generation on your behalf.
        </p>
      </div>
    </div>
  )
}
