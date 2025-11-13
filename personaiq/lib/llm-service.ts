/**
 * LLM Service for PersonaIQ
 * Provides unified interface for OpenAI and Anthropic APIs
 * Used for AI-powered coaching, analysis, and chatbot features
 */

import { PersonaType } from '@prisma/client'

// LLM Provider configuration
const LLM_PROVIDER = process.env.LLM_PROVIDER || 'openai' // 'openai' or 'anthropic'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022'

interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface LLMResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

/**
 * Call OpenAI API
 */
async function callOpenAI(messages: LLMMessage[], options: {
  temperature?: number
  maxTokens?: number
} = {}): Promise<LLMResponse> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2000
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()

  return {
    content: data.choices[0]?.message?.content || '',
    usage: data.usage ? {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens
    } : undefined
  }
}

/**
 * Call Anthropic API
 */
async function callAnthropic(messages: LLMMessage[], options: {
  temperature?: number
  maxTokens?: number
} = {}): Promise<LLMResponse> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured')
  }

  // Convert messages format (Anthropic uses different system message handling)
  const systemMessage = messages.find(m => m.role === 'system')?.content || ''
  const conversationMessages = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role,
      content: m.content
    }))

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      system: systemMessage,
      messages: conversationMessages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2000
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Anthropic API error: ${error.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()

  return {
    content: data.content[0]?.text || '',
    usage: data.usage ? {
      promptTokens: data.usage.input_tokens,
      completionTokens: data.usage.output_tokens,
      totalTokens: data.usage.input_tokens + data.usage.output_tokens
    } : undefined
  }
}

/**
 * Generic LLM call that routes to configured provider
 */
export async function callLLM(messages: LLMMessage[], options: {
  temperature?: number
  maxTokens?: number
  provider?: 'openai' | 'anthropic'
} = {}): Promise<LLMResponse> {
  const provider = options.provider || LLM_PROVIDER

  try {
    if (provider === 'anthropic') {
      return await callAnthropic(messages, options)
    } else {
      return await callOpenAI(messages, options)
    }
  } catch (error) {
    console.error(`LLM API error (${provider}):`, error)
    throw error
  }
}

/**
 * Generate AI-powered coaching recommendations
 */
export async function generateAICoachingRecommendations(params: {
  persona: PersonaType
  confidence: number
  dimensionScores: Record<string, number>
  employeeName: string
  department: string
  jobRole: string
  technicalBackground: string
  freeTextResponses?: Record<string, string>
}): Promise<{
  summary: string
  actionItems: string[]
  sessionPlan: string
  redFlags: string[]
  estimatedSessionLength: string
}> {
  const {
    persona,
    confidence,
    dimensionScores,
    employeeName,
    department,
    jobRole,
    technicalBackground,
    freeTextResponses
  } = params

  const systemPrompt = `You are an expert AI adoption coach creating personalized coaching recommendations. Your goal is to help employees improve their AI tool usage and overcome barriers.

Persona Definitions:
- TRAILBLAZER: Advanced users who experiment, share knowledge, and lead AI adoption
- ESTABLISHED: Consistent users with reliable AI workflows for recurring tasks
- EMERGING: Positive attitude but inconsistent usage and developing confidence
- OVERWHELMED: Struggle with task decomposition, delegation, and managing AI integration
- RESISTANT: Concerns about ethics, job security, or preference for traditional methods

Dimension Scores (0-100):
- Usage Frequency: How often they use AI
- Usage Breadth: Variety of use cases
- Usage Sophistication: Prompt quality and iteration
- Confidence: Self-efficacy with AI
- Trust: Belief in AI quality/value
- Barriers: Obstacles to adoption (inverse score)
- Growth Mindset: Experimentation and learning

Provide actionable, specific, and empathetic recommendations.`

  const userPrompt = `Create personalized coaching recommendations for this employee:

**Employee Profile:**
- Name: ${employeeName}
- Department: ${department}
- Role: ${jobRole}
- Technical Background: ${technicalBackground}

**Assessment Results:**
- Persona Classification: ${persona}
- Classification Confidence: ${Math.round(confidence)}%

**Dimension Scores:**
${Object.entries(dimensionScores).map(([dim, score]) => `- ${dim}: ${Math.round(score)}/100`).join('\n')}

${freeTextResponses && Object.keys(freeTextResponses).length > 0 ? `
**Free-Text Responses:**
${Object.entries(freeTextResponses).map(([q, a]) => `Q: ${q}\nA: ${a}`).join('\n\n')}
` : ''}

Provide:
1. **Summary** (2-3 sentences): Overall assessment and coaching focus
2. **Action Items** (3-5 bullet points): Specific, actionable next steps
3. **Session Plan** (paragraph): Recommended coaching session structure
4. **Red Flags** (if any): Concerns to address urgently
5. **Estimated Session Length**: Suggested duration (e.g., "30 minutes", "1 hour")

Format as JSON with keys: summary, actionItems (array), sessionPlan, redFlags (array), estimatedSessionLength`

  try {
    const response = await callLLM([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], {
      temperature: 0.7,
      maxTokens: 1500
    })

    // Parse JSON response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        summary: parsed.summary || 'No summary generated',
        actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
        sessionPlan: parsed.sessionPlan || '',
        redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : [],
        estimatedSessionLength: parsed.estimatedSessionLength || '30 minutes'
      }
    }

    // Fallback if JSON parsing fails
    return {
      summary: response.content.substring(0, 200),
      actionItems: [],
      sessionPlan: response.content,
      redFlags: [],
      estimatedSessionLength: '30 minutes'
    }
  } catch (error) {
    console.error('Error generating AI coaching recommendations:', error)
    // Return fallback recommendations
    return {
      summary: `${persona} employee requiring targeted coaching based on dimension scores.`,
      actionItems: [
        'Schedule initial 1:1 coaching session',
        'Assess specific barriers and concerns',
        'Create personalized learning plan'
      ],
      sessionPlan: 'Initial assessment session to understand employee needs and create action plan.',
      redFlags: confidence < 70 ? ['Low classification confidence - follow up assessment recommended'] : [],
      estimatedSessionLength: '30 minutes'
    }
  }
}

/**
 * Analyze free-text responses for insights
 */
export async function analyzeFreeTextResponses(responses: Record<string, string>): Promise<{
  sentiment: 'positive' | 'neutral' | 'negative'
  keyThemes: string[]
  concerns: string[]
  opportunities: string[]
  summary: string
}> {
  const systemPrompt = `You are an AI analyst extracting insights from employee assessment responses about AI tool adoption. Identify sentiment, themes, concerns, and opportunities.`

  const userPrompt = `Analyze these free-text responses from an AI adoption assessment:

${Object.entries(responses).map(([q, a]) => `Q: ${q}\nA: ${a}`).join('\n\n')}

Provide analysis as JSON with:
- sentiment: "positive", "neutral", or "negative"
- keyThemes: array of 3-5 main themes
- concerns: array of specific concerns mentioned
- opportunities: array of growth opportunities
- summary: 1-2 sentence overview`

  try {
    const response = await callLLM([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], {
      temperature: 0.5,
      maxTokens: 800
    })

    const jsonMatch = response.content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    return {
      sentiment: 'neutral',
      keyThemes: [],
      concerns: [],
      opportunities: [],
      summary: response.content.substring(0, 200)
    }
  } catch (error) {
    console.error('Error analyzing free-text responses:', error)
    return {
      sentiment: 'neutral',
      keyThemes: [],
      concerns: [],
      opportunities: [],
      summary: 'Analysis unavailable'
    }
  }
}

/**
 * Chatbot assistant for employees
 */
export async function chatbotAssistant(params: {
  question: string
  context?: {
    persona?: PersonaType
    recentResponses?: string[]
  }
}): Promise<string> {
  const { question, context } = params

  const systemPrompt = `You are a helpful AI adoption coach assistant. You answer employee questions about AI tools, best practices, and overcoming adoption challenges. Be supportive, practical, and encouraging.

${context?.persona ? `The employee is classified as a ${context.persona} persona.` : ''}

Keep responses concise (2-3 paragraphs), actionable, and friendly.`

  const userPrompt = question

  try {
    const response = await callLLM([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], {
      temperature: 0.7,
      maxTokens: 500
    })

    return response.content
  } catch (error) {
    console.error('Chatbot error:', error)
    return "I'm sorry, I'm having trouble responding right now. Please try again or contact your coach for assistance."
  }
}

/**
 * Generate executive summary from campaign data
 */
export async function generateExecutiveSummary(params: {
  campaignName: string
  stats: any
  personaDistribution: Record<PersonaType, number>
  topConcerns: string[]
  completionRate: number
}): Promise<string> {
  const systemPrompt = `You are an executive report writer. Create concise, data-driven summaries for leadership about AI adoption assessments.`

  const userPrompt = `Write a 1-paragraph executive summary for this AI adoption assessment campaign:

Campaign: ${params.campaignName}
Completion Rate: ${params.completionRate}%
Total Participants: ${params.stats.completed}

Persona Distribution:
${Object.entries(params.personaDistribution).map(([p, count]) => `- ${p}: ${count} (${Math.round((count/params.stats.completed)*100)}%)`).join('\n')}

Top Concerns: ${params.topConcerns.join(', ')}

Focus on key insights and recommendations for leadership.`

  try {
    const response = await callLLM([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], {
      temperature: 0.6,
      maxTokens: 300
    })

    return response.content
  } catch (error) {
    console.error('Error generating executive summary:', error)
    return `${params.campaignName} completed with ${params.completionRate}% participation rate. Analysis of ${params.stats.completed} employees shows diverse AI adoption patterns requiring targeted coaching interventions.`
  }
}

/**
 * Check if LLM is configured and available
 */
export function isLLMAvailable(): boolean {
  return !!(OPENAI_API_KEY || ANTHROPIC_API_KEY)
}

/**
 * Get LLM provider info
 */
export function getLLMInfo(): {
  provider: string
  model: string
  available: boolean
} {
  return {
    provider: LLM_PROVIDER,
    model: LLM_PROVIDER === 'anthropic' ? ANTHROPIC_MODEL : OPENAI_MODEL,
    available: isLLMAvailable()
  }
}
