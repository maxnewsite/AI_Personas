import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UserRole, PersonaType } from '@prisma/client'
import { generateExecutiveSummary } from '@/lib/report-templates'

/**
 * GET /api/campaigns/[id]/report
 * Generate HTML report for campaign (can be printed to PDF)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch campaign with all data
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: {
        createdBy: { select: { name: true, email: true } },
        responses: {
          include: {
            employee: {
              include: {
                user: { select: { name: true, email: true } }
              }
            }
          },
          where: {
            completionDate: { not: null }
          }
        }
      }
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Calculate stats
    const allResponses = await prisma.assessmentResponse.count({
      where: { campaignId: campaign.id }
    })

    const completed = campaign.responses.length
    const inProgress = allResponses - completed
    const completionRate = allResponses > 0 ? Math.round((completed / allResponses) * 100) : 0

    const avgTimeTaken = completed > 0
      ? Math.round(
          campaign.responses
            .filter(r => r.timeTaken)
            .reduce((sum, r) => sum + (r.timeTaken || 0), 0) / completed
        )
      : 0

    const avgConfidence = completed > 0
      ? Math.round(
          campaign.responses
            .filter(r => r.confidenceScore)
            .reduce((sum, r) => sum + (r.confidenceScore || 0), 0) / completed
        )
      : 0

    const stats = {
      totalInvited: allResponses,
      completed,
      inProgress,
      notStarted: allResponses - completed - inProgress,
      completionRate,
      avgTimeTaken,
      avgConfidence
    }

    // Persona distribution
    const personaDistribution = campaign.responses.reduce((acc, response) => {
      if (response.personaClassification) {
        acc[response.personaClassification] = (acc[response.personaClassification] || 0) + 1
      }
      return acc
    }, {} as Record<PersonaType, number>)

    // Get winners
    const winners = await prisma.employee.findMany({
      where: {
        winnerStatus: true,
        responses: {
          some: {
            campaignId: campaign.id
          }
        }
      },
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { winnerScore: 'desc' },
      take: 10
    })

    // Generate recommendations based on data
    const recommendations: string[] = []

    // Recommendation: Completion rate
    if (completionRate < 70) {
      recommendations.push(`Increase participation: Only ${completionRate}% completion rate. Send reminders to incomplete participants.`)
    } else if (completionRate >= 90) {
      recommendations.push(`Excellent participation: ${completionRate}% completion rate demonstrates strong engagement.`)
    }

    // Recommendation: Persona distribution
    const trailblazers = personaDistribution.TRAILBLAZER || 0
    const resistant = personaDistribution.RESISTANT || 0
    const emerging = personaDistribution.EMERGING || 0
    const overwhelmed = personaDistribution.OVERWHELMED || 0

    if (trailblazers > 0) {
      recommendations.push(`Leverage ${trailblazers} Trailblazers as mentors and innovation champions to accelerate adoption across the organization.`)
    }

    if (resistant > completed * 0.2) {
      recommendations.push(`Address concerns: ${resistant} employees (${Math.round((resistant/completed)*100)}%) are resistant. Focus on understanding and addressing their concerns about job security and ethics.`)
    }

    if (emerging + overwhelmed > completed * 0.5) {
      recommendations.push(`Provide foundational support: Over 50% of employees are Emerging or Overwhelmed. Implement structured training programs and peer support.`)
    }

    // Recommendation: Winners
    if (winners.length > 0) {
      recommendations.push(`Recognize high performers: ${winners.length} employees identified as Winners. Consider recognition programs and advanced leadership opportunities.`)
    }

    // Recommendation: Average confidence
    if (avgConfidence < 70) {
      recommendations.push(`Build confidence: Average classification confidence is ${avgConfidence}%. Consider follow-up assessments or interviews for low-confidence classifications.`)
    }

    // Generate HTML report
    const htmlReport = generateExecutiveSummary({
      campaign,
      stats,
      personaDistribution,
      winners,
      recommendations
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'REPORT_GENERATED',
        resourceType: 'Campaign',
        resourceId: campaign.id,
        details: {
          campaignName: campaign.name,
          reportType: 'executive_summary'
        }
      }
    })

    // Return HTML with appropriate headers
    return new NextResponse(htmlReport, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache'
      }
    })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}
