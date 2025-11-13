import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * POST /api/assessments/save
 * Save assessment progress (auto-save or manual save)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assessmentToken, responses, currentSection } = body

    if (!assessmentToken) {
      return NextResponse.json(
        { error: 'Assessment token is required' },
        { status: 400 }
      )
    }

    // Find assessment response by token
    const assessment = await prisma.assessmentResponse.findUnique({
      where: { assessmentToken },
      include: {
        campaign: true,
        employee: {
          include: {
            user: { select: { name: true, email: true } }
          }
        }
      }
    })

    if (!assessment) {
      return NextResponse.json(
        { error: 'Invalid assessment token' },
        { status: 404 }
      )
    }

    // Check if campaign is still active
    const now = new Date()
    if (assessment.campaign.endDate < now) {
      return NextResponse.json(
        { error: 'Assessment period has ended' },
        { status: 400 }
      )
    }

    // Check if already completed (and retakes not allowed)
    if (assessment.completionDate && !assessment.campaign.allowRetakes) {
      return NextResponse.json(
        { error: 'Assessment already completed' },
        { status: 400 }
      )
    }

    // Update assessment with new responses
    const updatedAssessment = await prisma.assessmentResponse.update({
      where: { id: assessment.id },
      data: {
        responses: responses || assessment.responses,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      lastSaved: updatedAssessment.updatedAt,
      message: 'Progress saved successfully'
    })
  } catch (error) {
    console.error('Error saving assessment:', error)
    return NextResponse.json(
      { error: 'Failed to save progress' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/assessments/save
 * Load saved assessment progress
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assessmentToken = searchParams.get('token')

    if (!assessmentToken) {
      return NextResponse.json(
        { error: 'Assessment token is required' },
        { status: 400 }
      )
    }

    // Find assessment response by token
    const assessment = await prisma.assessmentResponse.findUnique({
      where: { assessmentToken },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            endDate: true,
            showResultsToParticipant: true,
            allowRetakes: true
          }
        },
        employee: {
          include: {
            user: { select: { name: true, email: true } }
          }
        }
      }
    })

    if (!assessment) {
      return NextResponse.json(
        { error: 'Invalid assessment token' },
        { status: 404 }
      )
    }

    // Check if campaign has ended
    const now = new Date()
    const hasEnded = assessment.campaign.endDate < now

    return NextResponse.json({
      assessment: {
        id: assessment.id,
        responses: assessment.responses,
        completionDate: assessment.completionDate,
        lastSaved: assessment.updatedAt
      },
      campaign: assessment.campaign,
      employee: {
        name: assessment.employee.user.name,
        email: assessment.employee.user.email
      },
      hasEnded,
      isCompleted: !!assessment.completionDate
    })
  } catch (error) {
    console.error('Error loading assessment:', error)
    return NextResponse.json(
      { error: 'Failed to load assessment' },
      { status: 500 }
    )
  }
}
