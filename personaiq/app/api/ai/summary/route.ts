import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UserRole, PersonaType } from '@prisma/client'
import { generateExecutiveSummary, isLLMAvailable } from '@/lib/llm-service'

/**
 * POST /api/ai/summary
 * Generate AI-powered executive summary for a campaign
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if LLM is available
    if (!isLLMAvailable()) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 503 }
      )
    }

    const { campaignId } = await request.json()

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    // Fetch campaign with responses
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        responses: {
          where: { completionDate: { not: null } },
          include: {
            employee: {
              select: {
                currentPersona: true
              }
            }
          }
        }
      }
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const completedResponses = campaign.responses.filter(r => r.completionDate)

    if (completedResponses.length === 0) {
      return NextResponse.json(
        { error: 'No completed responses for this campaign' },
        { status: 400 }
      )
    }

    // Calculate stats
    const stats = {
      total: campaign.responses.length,
      completed: completedResponses.length,
      avgConfidence: Math.round(
        completedResponses.reduce((sum, r) => sum + (r.confidenceScore || 0), 0) / completedResponses.length
      )
    }

    // Persona distribution
    const personaDistribution = completedResponses.reduce((acc, response) => {
      const persona = response.employee.currentPersona || response.personaClassification
      if (persona) {
        acc[persona] = (acc[persona] || 0) + 1
      }
      return acc
    }, {} as Record<PersonaType, number>)

    // Extract top concerns from free-text responses
    const concerns: string[] = []
    completedResponses.forEach(response => {
      if (response.responses && typeof response.responses === 'object') {
        const responses = response.responses as Record<string, any>
        Object.values(responses).forEach(value => {
          if (typeof value === 'string' && value.length > 50) {
            // Extract concerns keywords
            const concernKeywords = ['concern', 'worry', 'afraid', 'difficult', 'struggle', 'hard', 'challenge']
            if (concernKeywords.some(keyword => value.toLowerCase().includes(keyword))) {
              concerns.push(value.substring(0, 100))
            }
          }
        })
      }
    })

    // Get top 3 unique concerns
    const topConcerns = Array.from(new Set(concerns)).slice(0, 3)
    if (topConcerns.length === 0) {
      topConcerns.push('No significant concerns reported')
    }

    // Calculate completion rate
    const completionRate = Math.round((stats.completed / stats.total) * 100)

    // Generate AI summary
    const summary = await generateExecutiveSummary({
      campaignName: campaign.name,
      stats,
      personaDistribution,
      topConcerns,
      completionRate
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'EXECUTIVE_SUMMARY_GENERATED',
        resourceType: 'Campaign',
        resourceId: campaignId,
        details: {
          completedResponses: stats.completed,
          completionRate
        }
      }
    })

    return NextResponse.json({
      success: true,
      summary,
      stats,
      personaDistribution,
      topConcerns,
      completionRate,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error generating executive summary:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate executive summary',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/ai/summary?campaignId=xxx
 * Get campaign summary info (without AI generation)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaignId')

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        responses: {
          where: { completionDate: { not: null } }
        }
      }
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const completedCount = campaign.responses.length

    return NextResponse.json({
      campaignId: campaign.id,
      campaignName: campaign.name,
      completedResponses: completedCount,
      aiAvailable: isLLMAvailable(),
      message: isLLMAvailable()
        ? 'Use POST /api/ai/summary to generate executive summary'
        : 'Configure AI service for executive summaries'
    })
  } catch (error) {
    console.error('Error getting campaign summary info:', error)
    return NextResponse.json(
      { error: 'Failed to get summary info' },
      { status: 500 }
    )
  }
}
