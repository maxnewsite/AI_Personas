import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UserRole, PersonaType } from '@prisma/client'
import { assessmentQuestions } from '@/lib/assessment-questions'
import {
  exportCampaignSummary,
  exportCampaignResponses,
  exportDetailedResponses,
  exportPersonaDistribution
} from '@/lib/export'

/**
 * GET /api/campaigns/[id]/export?type=summary|responses|detailed|distribution
 * Export campaign data as CSV
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

    const { searchParams } = new URL(request.url)
    const exportType = searchParams.get('type') || 'responses'

    // Fetch campaign with all data
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: {
        createdBy: { select: { name: true, email: true } },
        responses: {
          include: {
            employee: {
              include: {
                user: { select: { name: true, email: true } },
                assignedCoach: {
                  include: {
                    user: { select: { name: true, email: true } }
                  }
                },
                manager: {
                  include: {
                    user: { select: { name: true, email: true } }
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Calculate stats
    const totalInvited = campaign.responses.length
    const completed = campaign.responses.filter(r => r.completionDate).length
    const inProgress = campaign.responses.filter(
      r => !r.completionDate && Object.keys(r.responses).length > 0
    ).length
    const notStarted = campaign.responses.filter(
      r => !r.completionDate && Object.keys(r.responses).length === 0
    ).length

    const completionRate = totalInvited > 0 ? Math.round((completed / totalInvited) * 100) : 0

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
      totalInvited,
      completed,
      inProgress,
      notStarted,
      completionRate,
      avgTimeTaken,
      avgConfidence
    }

    let csvContent: string
    let filename: string

    switch (exportType) {
      case 'summary':
        csvContent = exportCampaignSummary(campaign, stats)
        filename = `campaign_summary_${campaign.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`
        break

      case 'detailed':
        csvContent = exportDetailedResponses(
          campaign.responses.filter(r => r.completionDate),
          assessmentQuestions
        )
        filename = `campaign_detailed_responses_${campaign.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`
        break

      case 'distribution':
        const personaDistribution = campaign.responses.reduce((acc, response) => {
          if (response.personaClassification) {
            acc[response.personaClassification] = (acc[response.personaClassification] || 0) + 1
          }
          return acc
        }, {} as Record<PersonaType, number>)
        csvContent = exportPersonaDistribution(personaDistribution, completed)
        filename = `persona_distribution_${campaign.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`
        break

      case 'responses':
      default:
        csvContent = exportCampaignResponses(campaign.responses)
        filename = `campaign_responses_${campaign.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`
        break
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DATA_EXPORTED',
        resourceType: 'Campaign',
        resourceId: campaign.id,
        details: {
          campaignName: campaign.name,
          exportType,
          recordCount: campaign.responses.length
        }
      }
    })

    // Return CSV with appropriate headers
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    })
  } catch (error) {
    console.error('Error exporting campaign data:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}
