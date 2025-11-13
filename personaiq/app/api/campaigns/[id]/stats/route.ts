import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UserRole, PersonaType } from '@prisma/client'

/**
 * GET /api/campaigns/[id]/stats
 * Get real-time campaign completion statistics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user || ![UserRole.ADMIN, UserRole.COACH].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch campaign with responses
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: {
        responses: {
          include: {
            employee: {
              include: {
                user: {
                  select: { name: true, email: true }
                }
              }
            }
          }
        }
      }
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Calculate statistics
    const totalInvited = campaign.responses.length
    const completed = campaign.responses.filter(r => r.completionDate).length
    const inProgress = campaign.responses.filter(r => !r.completionDate && Object.keys(r.responses).length > 0).length
    const notStarted = campaign.responses.filter(r => !r.completionDate && Object.keys(r.responses).length === 0).length

    const completionRate = totalInvited > 0 ? Math.round((completed / totalInvited) * 100) : 0

    // Time-based statistics
    const avgTimeTaken = completed > 0
      ? Math.round(
          campaign.responses
            .filter(r => r.timeTaken)
            .reduce((sum, r) => sum + (r.timeTaken || 0), 0) / completed
        )
      : 0

    // Persona distribution
    const personaDistribution = campaign.responses.reduce((acc, response) => {
      if (response.personaClassification) {
        acc[response.personaClassification] = (acc[response.personaClassification] || 0) + 1
      }
      return acc
    }, {} as Record<PersonaType, number>)

    // Average confidence
    const avgConfidence = completed > 0
      ? Math.round(
          campaign.responses
            .filter(r => r.confidenceScore)
            .reduce((sum, r) => sum + (r.confidenceScore || 0), 0) / completed
        )
      : 0

    // Timeline statistics (completions per day)
    const completionsByDate = campaign.responses
      .filter(r => r.completionDate)
      .reduce((acc, response) => {
        const date = new Date(response.completionDate!).toISOString().split('T')[0]
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    // Days remaining
    const now = new Date()
    const endDate = new Date(campaign.endDate)
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    const isExpired = endDate < now

    // Recent completions (last 5)
    const recentCompletions = campaign.responses
      .filter(r => r.completionDate)
      .sort((a, b) => new Date(b.completionDate!).getTime() - new Date(a.completionDate!).getTime())
      .slice(0, 5)
      .map(r => ({
        employeeName: r.employee.user.name,
        completionDate: r.completionDate,
        persona: r.personaClassification,
        confidence: r.confidenceScore
      }))

    return NextResponse.json({
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        isExpired,
        daysRemaining
      },
      stats: {
        totalInvited,
        completed,
        inProgress,
        notStarted,
        completionRate,
        avgTimeTaken,
        avgConfidence
      },
      personaDistribution,
      completionsByDate,
      recentCompletions
    })
  } catch (error) {
    console.error('Error fetching campaign stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign statistics' },
      { status: 500 }
    )
  }
}
