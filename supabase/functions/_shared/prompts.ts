/**
 * Specialized Prompt Templates for Content Generation
 *
 * Each generation type (copy, narrative, hooks, cta) has a tailored prompt
 * that incorporates the user's input text and optional tone of voice settings.
 */

export type GenerationType = 'copy' | 'narrative' | 'hooks' | 'cta'

interface ToneOfVoice {
  style?: string
  adjectives?: string[]
  examples?: string[]
  [key: string]: unknown
}

/**
 * Build a tone-of-voice instruction block to inject into prompts.
 * Returns an empty string when no tone is provided.
 */
function buildToneBlock(tone?: ToneOfVoice | null): string {
  if (!tone) return ''

  const parts: string[] = []

  if (tone.style) {
    parts.push(`Communication style: ${tone.style}`)
  }

  if (tone.adjectives && tone.adjectives.length > 0) {
    parts.push(`Brand voice adjectives: ${tone.adjectives.join(', ')}`)
  }

  if (tone.examples && tone.examples.length > 0) {
    parts.push(
      `Reference examples of the desired tone:\n${tone.examples.map((e) => `- "${e}"`).join('\n')}`,
    )
  }

  if (parts.length === 0) return ''

  return `\n\nIMPORTANT — Tone of Voice Guidelines:\n${parts.join('\n')}\nApply this tone consistently throughout your response.\n`
}

const PROMPTS: Record<GenerationType, (inputText: string, toneBlock: string) => string> = {
  copy: (inputText, toneBlock) =>
    `You are an expert copywriter specializing in social media and digital advertising.

Based on the following briefing, create persuasive copy optimized for posts and ads.

BRIEFING:
${inputText}
${toneBlock}
REQUIREMENTS:
- Write 3 variations of the copy (short, medium, long)
- Each variation should have a clear value proposition
- Use power words and emotional triggers
- Include relevant hashtag suggestions
- Optimize for engagement and conversion
- Keep the short version under 100 characters (ideal for ads)
- Medium version: 150-250 characters (ideal for social posts)
- Long version: 300-500 characters (ideal for captions)

Format your response with clear labels for each variation.`,

  narrative: (inputText, toneBlock) =>
    `You are a master storyteller and narrative designer for digital content.

Based on the following briefing, create a compelling narrative arc for social media storytelling.

BRIEFING:
${inputText}
${toneBlock}
REQUIREMENTS:
- Create a complete story arc (setup, conflict, resolution)
- Design it for serial content (can be split into 3-5 posts)
- Include emotional beats that drive engagement
- Suggest visual moments for each story segment
- Add transition hooks between segments to maintain audience interest
- The narrative should feel authentic and relatable
- Include a clear character or protagonist (the brand/creator or their audience)

Format your response with numbered segments, each with its narrative beat and visual suggestion.`,

  hooks: (inputText, toneBlock) =>
    `You are a viral content specialist focused on attention-grabbing hooks.

Based on the following briefing, create powerful hooks designed to capture attention in the first 3 seconds.

BRIEFING:
${inputText}
${toneBlock}
REQUIREMENTS:
- Create 5 different hook styles:
  1. Question hook — opens with a provocative question
  2. Statistic hook — leads with a surprising number or fact
  3. Contrarian hook — challenges a common belief
  4. Story hook — starts with "I..." or a personal anecdote opener
  5. Curiosity hook — creates an information gap
- Each hook should be under 15 words
- Hooks must be scroll-stopping and create immediate curiosity
- Include a brief explanation of why each hook works
- Suggest which platform each hook works best on (Instagram, TikTok, YouTube, LinkedIn)

Format each hook with its type, the hook text, platform suggestion, and a one-line explanation.`,

  cta: (inputText, toneBlock) =>
    `You are a conversion optimization expert specializing in calls-to-action.

Based on the following briefing, create contextual CTAs optimized for different platforms and objectives.

BRIEFING:
${inputText}
${toneBlock}
REQUIREMENTS:
- Create CTAs for 4 different objectives:
  1. Engagement CTA — drive comments, shares, saves
  2. Traffic CTA — drive clicks to link/bio/website
  3. Conversion CTA — drive purchases or sign-ups
  4. Community CTA — drive follows, subscriptions, community growth
- For each objective, provide 3 variations (direct, soft, creative)
- Include emoji suggestions where appropriate
- Suggest placement within the content (beginning, middle, end, or standalone)
- Each CTA should feel natural, not pushy
- Consider platform character limits

Format with clear categories and variations for each objective.`,
}

/**
 * Generate a specialized prompt for the given content type.
 *
 * @param type - Generation type (copy, narrative, hooks, cta)
 * @param inputText - The user's briefing or project input text
 * @param toneOfVoice - Optional tone of voice settings from user profile
 * @returns Complete prompt string ready to send to an AI provider
 */
export function getPrompt(
  type: GenerationType,
  inputText: string,
  toneOfVoice?: ToneOfVoice | null,
): string {
  const builder = PROMPTS[type]
  if (!builder) {
    throw new Error(`Unknown generation type: ${type}`)
  }

  const toneBlock = buildToneBlock(toneOfVoice)
  return builder(inputText, toneBlock)
}
