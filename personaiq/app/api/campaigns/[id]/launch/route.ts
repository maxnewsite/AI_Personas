import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UserRole, CampaignStatus } from '@prisma/client'
import {
  sendAssessmentInvitation,
  generateAssessmentLink,
  generateAssessmentToken
} from '@/lib/email'

/**
 * POST /api/campaigns/[id]/launch
 * Launch a campaign and send invitations to all target employees
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch campaign
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: {
        responses: true
      }
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Check if campaign is already active
    if (campaign.status === CampaignStatus.ACTIVE) {
      return NextResponse.json(
        { error: 'Campaign is already active' },
        { status: 400 }
      )
    }

    // Check if campaign has ended
    if (new Date(campaign.endDate) < new Date()) {
      return NextResponse.json(
        { error: 'Campaign end date has passed' },
        { status: 400 }
      )
    }

    // Get target employees
    let targetEmployees: any[] = []

    if (campaign.targetAll) {
      // Get all employees
      targetEmployees = await prisma.employee.findMany({
        include: {
          user: { select: { email: true, name: true } }
        }
      })
    } else {
      // Get employees from specific departments or IDs
      const departmentFilter = campaign.targetDepartments.length > 0
        ? { department: { in: campaign.targetDepartments as string[] } }
        : {}

      const idFilter = campaign.targetEmployeeIds.length > 0
        ? { id: { in: campaign.targetEmployeeIds as string[] } }
        : {}

      targetEmployees = await prisma.employee.findMany({
        where: {
          OR: [
            departmentFilter,
            idFilter
          ].filter(f => Object.keys(f).length > 0)
        },
        include: {
          user: { select: { email: true, name: true } }
        }
      })
    }

    if (targetEmployees.length === 0) {
      return NextResponse.json(
        { error: 'No target employees found' },
        { status: 400 }
      )
    }

    // Create assessment response records and send invitations
    const invitationResults = []
    let successCount = 0
    let errorCount = 0

    for (const employee of targetEmployees) {
      try {
        // Check if employee already has a response for this campaign
        const existingResponse = campaign.responses.find(
          r => r.employeeId === employee.id
        )

        let assessmentToken: string
        let responseId: string

        if (existingResponse) {
          // Use existing response and token
          assessmentToken = existingResponse.assessmentToken || generateAssessmentToken()
          responseId = existingResponse.id

          // Update token if it doesn't exist
          if (!existingResponse.assessmentToken) {
            await prisma.assessmentResponse.update({
              where: { id: existingResponse.id },
              data: { assessmentToken }
            })
          }
        } else {
          // Create new response record
          assessmentToken = generateAssessmentToken()

          const response = await prisma.assessmentResponse.create({
            data: {
              campaignId: campaign.id,
              employeeId: employee.id,
              assessmentToken,
              responses: {},
              sectionScores: {},
              dimensionScores: {}
            }
          })

          responseId = response.id
        }

        // Generate assessment link
        const assessmentLink = generateAssessmentLink(
          campaign.id,
          employee.id,
          assessmentToken
        )

        // Send invitation email
        const emailSent = await sendAssessmentInvitation({
          employeeEmail: employee.user.email,
          employeeName: employee.user.name || 'there',
          campaignName: campaign.name,
          campaignEndDate: campaign.endDate,
          assessmentLink
        })

        if (emailSent) {
          successCount++
          invitationResults.push({
            employeeId: employee.id,
            email: employee.user.email,
            status: 'sent',
            responseId
          })
        } else {
          errorCount++
          invitationResults.push({
            employeeId: employee.id,
            email: employee.user.email,
            status: 'failed',
            error: 'Email sending failed'
          })
        }
      } catch (error) {
        console.error(`Error sending invitation to ${employee.user.email}:`, error)
        errorCount++
        invitationResults.push({
          employeeId: employee.id,
          email: employee.user.email,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Update campaign status to ACTIVE
    const updatedCampaign = await prisma.campaign.update({
      where: { id: params.id },
      data: { status: CampaignStatus.ACTIVE }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CAMPAIGN_LAUNCHED',
        resourceType: 'Campaign',
        resourceId: campaign.id,
        details: {
          campaignName: campaign.name,
          targetEmployees: targetEmployees.length,
          invitationsSent: successCount,
          invitationsFailed: errorCount
        }
      }
    })

    return NextResponse.json({
      campaign: updatedCampaign,
      summary: {
        total: targetEmployees.length,
        sent: successCount,
        failed: errorCount
      },
      results: invitationResults
    })
  } catch (error) {
    console.error('Error launching campaign:', error)
    return NextResponse.json(
      { error: 'Failed to launch campaign' },
      { status: 500 }
    )
  }
}
