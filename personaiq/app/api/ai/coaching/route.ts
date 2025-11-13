import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UserRole } from '@prisma/client'
import { generateAICoachingRecommendations, isLLMAvailable } from '@/lib/llm-service'

/**
 * POST /api/ai/coaching
 * Generate AI-powered coaching recommendations for an employee
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
        { error: 'AI service not configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY.' },
        { status: 503 }
      )
    }

    const { employeeId, assessmentResponseId } = await request.json()

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      )
    }

    // Fetch employee with latest assessment
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: { select: { name: true, email: true } },
        responses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          where: assessmentResponseId ? { id: assessmentResponseId } : undefined
        }
      }
    })

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    const latestResponse = employee.responses[0]

    if (!latestResponse || !latestResponse.personaClassification) {
      return NextResponse.json(
        { error: 'No completed assessment found for this employee' },
        { status: 404 }
      )
    }

    // Extract free-text responses
    const freeTextResponses: Record<string, string> = {}
    if (latestResponse.responses && typeof latestResponse.responses === 'object') {
      Object.entries(latestResponse.responses as Record<string, any>).forEach(([key, value]) => {
        if (typeof value === 'string' && value.length > 20) {
          freeTextResponses[key] = value
        }
      })
    }

    // Generate AI recommendations
    const recommendations = await generateAICoachingRecommendations({
      persona: latestResponse.personaClassification,
      confidence: latestResponse.confidenceScore || 0,
      dimensionScores: latestResponse.dimensionScores as Record<string, number>,
      employeeName: employee.user.name || 'Employee',
      department: employee.department,
      jobRole: employee.jobRole,
      technicalBackground: employee.technicalBackground,
      freeTextResponses: Object.keys(freeTextResponses).length > 0 ? freeTextResponses : undefined
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'AI_COACHING_GENERATED',
        resourceType: 'Employee',
        resourceId: employeeId,
        details: {
          assessmentResponseId: latestResponse.id,
          persona: latestResponse.personaClassification,
          recommendationsGenerated: true
        }
      }
    })

    return NextResponse.json({
      success: true,
      employee: {
        id: employee.id,
        name: employee.user.name,
        department: employee.department,
        jobRole: employee.jobRole
      },
      assessment: {
        id: latestResponse.id,
        persona: latestResponse.personaClassification,
        confidence: latestResponse.confidenceScore,
        completionDate: latestResponse.completionDate
      },
      recommendations
    })
  } catch (error) {
    console.error('Error generating AI coaching recommendations:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/ai/coaching?employeeId=xxx
 * Get cached AI coaching recommendations if available
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || ![UserRole.ADMIN, UserRole.COACH].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      )
    }

    // Check if there are any coaching notes with AI recommendations
    const recentNotes = await prisma.coachingNote.findFirst({
      where: {
        employeeId,
        notes: { contains: 'AI-Generated' }
      },
      orderBy: { sessionDate: 'desc' }
    })

    if (recentNotes) {
      return NextResponse.json({
        cached: true,
        note: recentNotes,
        message: 'Showing recent AI-generated recommendations'
      })
    }

    return NextResponse.json({
      cached: false,
      message: 'No cached recommendations found. Generate new recommendations.'
    })
  } catch (error) {
    console.error('Error fetching AI coaching recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}
