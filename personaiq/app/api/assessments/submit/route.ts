import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { performPersonaClassification } from '@/lib/algorithms/persona-classification'
import { calculateWinnerScore } from '@/lib/algorithms/winner-identification'
import { generateCoachingRecommendations } from '@/lib/algorithms/coaching-recommendations'
import { sendCoachNotification, generateAssessmentLink } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { assessmentToken, responses, classification } = await req.json()

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
            user: { select: { name: true, email: true } },
            assignedCoach: {
              include: {
                user: { select: { name: true, email: true } }
              }
            }
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
    if (assessment.campaign.endDate < new Date()) {
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

    // Calculate time taken (minutes since creation or last update)
    const startTime = assessment.completionDate
      ? new Date(assessment.updatedAt)
      : new Date(assessment.createdAt)
    const timeTaken = Math.round((Date.now() - startTime.getTime()) / (1000 * 60))

    // Use provided classification or perform classification
    let classificationResult
    if (classification) {
      classificationResult = classification
    } else {
      classificationResult = performPersonaClassification(responses)
    }

    // Calculate winner score
    const winnerResult = calculateWinnerScore(
      responses,
      classificationResult.dimensionScores,
      classificationResult.persona
    )

    // Generate coaching recommendations
    const coachingRecs = generateCoachingRecommendations(
      classificationResult.persona,
      classificationResult.confidence,
      classificationResult.dimensionScores,
      responses,
      winnerResult
    )

    // Update assessment response with completion data
    const updatedAssessment = await prisma.assessmentResponse.update({
      where: { id: assessment.id },
      data: {
        completionDate: new Date(),
        timeTaken,
        responses: responses as any,
        dimensionScores: classificationResult.dimensionScores as any,
        sectionScores: classificationResult.sectionScores || {},
        personaClassification: classificationResult.persona,
        confidenceScore: classificationResult.confidence
      }
    })

    // Update employee persona
    await prisma.employee.update({
      where: { id: assessment.employeeId },
      data: {
        currentPersona: classificationResult.persona,
        winnerStatus: winnerResult.isWinner,
        winnerScore: winnerResult.winnerScore,
        winnerPriority: winnerResult.priority
      }
    })

    // Add to persona history
    await prisma.personaHistory.create({
      data: {
        employeeId: assessment.employeeId,
        persona: classificationResult.persona,
        confidence: classificationResult.confidence,
        source: `Assessment - ${assessment.campaign.name}`
      }
    })

    // Send notification to assigned coach
    if (assessment.employee.assignedCoach) {
      await sendCoachNotification({
        coachEmail: assessment.employee.assignedCoach.user.email,
        coachName: assessment.employee.assignedCoach.user.name || 'Coach',
        employeeName: assessment.employee.user.name || 'Employee',
        persona: classificationResult.persona,
        dashboardLink: `${process.env.APP_URL || process.env.NEXTAUTH_URL}/coach/employees/${assessment.employeeId}`
      })
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: assessment.employee.userId,
        action: 'ASSESSMENT_COMPLETED',
        resourceType: 'AssessmentResponse',
        resourceId: assessment.id,
        details: {
          campaignId: assessment.campaignId,
          campaignName: assessment.campaign.name,
          persona: classificationResult.persona,
          confidence: classificationResult.confidence,
          timeTaken
        }
      }
    })

    return NextResponse.json({
      success: true,
      assessmentId: updatedAssessment.id,
      persona: classificationResult.persona,
      confidence: classificationResult.confidence,
      isWinner: winnerResult.isWinner,
      coachingRecommendations: coachingRecs
    })
  } catch (error) {
    console.error('Assessment submission error:', error)
    return NextResponse.json(
      { error: 'Failed to process assessment' },
      { status: 500 }
    )
  }
}
