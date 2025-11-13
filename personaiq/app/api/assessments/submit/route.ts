import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { performPersonaClassification } from '@/lib/algorithms/persona-classification'
import { calculateWinnerScore } from '@/lib/algorithms/winner-identification'
import { generateCoachingRecommendations } from '@/lib/algorithms/coaching-recommendations'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { responses } = await req.json()

    // Get employee record
    const employee = await prisma.employee.findUnique({
      where: { userId: session.user.id }
    })

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Perform classification
    const classificationResult = performPersonaClassification(responses)

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

    // Save assessment response
    const assessmentResponse = await prisma.assessmentResponse.create({
      data: {
        employeeId: employee.id,
        campaignId: 'demo-campaign', // For demo purposes
        completionDate: new Date(),
        timeTaken: 15, // Approximate
        responses: responses,
        dimensionScores: classificationResult.dimensionScores,
        personaClassification: classificationResult.persona,
        confidenceScore: classificationResult.confidence
      }
    })

    // Update employee persona
    await prisma.employee.update({
      where: { id: employee.id },
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
        employeeId: employee.id,
        persona: classificationResult.persona,
        confidence: classificationResult.confidence,
        source: 'Assessment'
      }
    })

    return NextResponse.json({
      success: true,
      assessmentId: assessmentResponse.id,
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
