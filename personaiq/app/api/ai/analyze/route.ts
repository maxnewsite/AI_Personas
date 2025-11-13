import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UserRole } from '@prisma/client'
import { analyzeFreeTextResponses, isLLMAvailable } from '@/lib/llm-service'

/**
 * POST /api/ai/analyze
 * Analyze free-text responses from assessments using AI/NLP
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || ![UserRole.ADMIN, UserRole.COACH].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if LLM is available
    if (!isLLMAvailable()) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 503 }
      )
    }

    const { campaignId, employeeId, assessmentResponseId } = await request.json()

    let responsesToAnalyze: any[] = []

    if (assessmentResponseId) {
      // Analyze single assessment response
      const response = await prisma.assessmentResponse.findUnique({
        where: { id: assessmentResponseId },
        include: {
          employee: {
            include: {
              user: { select: { name: true } }
            }
          }
        }
      })

      if (!response) {
        return NextResponse.json({ error: 'Assessment response not found' }, { status: 404 })
      }

      responsesToAnalyze = [response]
    } else if (campaignId) {
      // Analyze all responses in a campaign
      responsesToAnalyze = await prisma.assessmentResponse.findMany({
        where: {
          campaignId,
          completionDate: { not: null }
        },
        include: {
          employee: {
            include: {
              user: { select: { name: true } }
            }
          }
        }
      })
    } else if (employeeId) {
      // Analyze all responses for an employee
      responsesToAnalyze = await prisma.assessmentResponse.findMany({
        where: {
          employeeId,
          completionDate: { not: null }
        },
        include: {
          employee: {
            include: {
              user: { select: { name: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    } else {
      return NextResponse.json(
        { error: 'campaignId, employeeId, or assessmentResponseId is required' },
        { status: 400 }
      )
    }

    if (responsesToAnalyze.length === 0) {
      return NextResponse.json(
        { error: 'No responses found to analyze' },
        { status: 404 }
      )
    }

    // Extract free-text responses
    const allFreeText: Record<string, string> = {}
    let responseCount = 0

    responsesToAnalyze.forEach(response => {
      if (response.responses && typeof response.responses === 'object') {
        Object.entries(response.responses as Record<string, any>).forEach(([key, value]) => {
          if (typeof value === 'string' && value.length > 20) {
            allFreeText[`${response.employee.user.name || 'Employee'} - Q${key}`] = value
            responseCount++
          }
        })
      }
    })

    if (responseCount === 0) {
      return NextResponse.json(
        {
          message: 'No free-text responses found to analyze',
          analysis: {
            sentiment: 'neutral',
            keyThemes: [],
            concerns: [],
            opportunities: [],
            summary: 'No text data available for analysis'
          }
        },
        { status: 200 }
      )
    }

    // Perform AI analysis
    const analysis = await analyzeFreeTextResponses(allFreeText)

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'AI_ANALYSIS_PERFORMED',
        resourceType: campaignId ? 'Campaign' : 'Employee',
        resourceId: campaignId || employeeId || assessmentResponseId || 'unknown',
        details: {
          responseCount,
          freeTextCount: responseCount,
          sentiment: analysis.sentiment
        }
      }
    })

    return NextResponse.json({
      success: true,
      responsesAnalyzed: responsesToAnalyze.length,
      freeTextCount: responseCount,
      analysis,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error analyzing responses:', error)
    return NextResponse.json(
      {
        error: 'Failed to analyze responses',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/ai/analyze/campaigns/[id]/insights
 * Get aggregated insights for a campaign
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
        { error: 'campaignId is required' },
        { status: 400 }
      )
    }

    // Get all responses for campaign
    const responses = await prisma.assessmentResponse.findMany({
      where: {
        campaignId,
        completionDate: { not: null }
      },
      select: {
        personaClassification: true,
        confidenceScore: true,
        responses: true
      }
    })

    // Aggregate basic insights
    const insights = {
      totalResponses: responses.length,
      avgConfidence: responses.reduce((sum, r) => sum + (r.confidenceScore || 0), 0) / responses.length,
      personaCounts: responses.reduce((acc, r) => {
        if (r.personaClassification) {
          acc[r.personaClassification] = (acc[r.personaClassification] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>),
      lowConfidenceCount: responses.filter(r => (r.confidenceScore || 0) < 70).length
    }

    return NextResponse.json({
      campaignId,
      insights,
      aiAnalysisAvailable: isLLMAvailable(),
      message: isLLMAvailable()
        ? 'Use POST /api/ai/analyze with campaignId for detailed AI analysis'
        : 'Configure AI service for detailed analysis'
    })
  } catch (error) {
    console.error('Error getting campaign insights:', error)
    return NextResponse.json(
      { error: 'Failed to get insights' },
      { status: 500 }
    )
  }
}
