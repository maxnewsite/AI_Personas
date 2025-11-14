import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UserRole, CampaignStatus } from '@prisma/client'

// GET /api/campaigns/[id] - Get a single campaign
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        createdBy: { select: { name: true, email: true } },
        responses: {
          include: {
            employee: {
              include: {
                user: { select: { name: true, email: true } }
              }
            }
          }
        }
      }
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    )
  }
}

// PUT /api/campaigns/[id] - Update a campaign
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const body = await request.json()
    const {
      name,
      startDate,
      endDate,
      status,
      targetAll,
      targetDepartments,
      targetEmployeeIds,
      showResultsToParticipant,
      allowRetakes,
      sendReminders,
      reminderDays
    } = body

    // Check if campaign exists
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id }
    })

    if (!existingCampaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Validation
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      )
    }

    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(status && { status }),
        ...(targetAll !== undefined && { targetAll }),
        ...(targetDepartments && { targetDepartments }),
        ...(targetEmployeeIds && { targetEmployeeIds }),
        ...(showResultsToParticipant !== undefined && { showResultsToParticipant }),
        ...(allowRetakes !== undefined && { allowRetakes }),
        ...(sendReminders !== undefined && { sendReminders }),
        ...(reminderDays !== undefined && { reminderDays })
      }
    })

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    )
  }
}

// DELETE /api/campaigns/[id] - Delete a campaign
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if campaign exists
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        responses: { select: { id: true } }
      }
    })

    if (!existingCampaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Don't allow deletion of campaigns with responses
    if (existingCampaign.responses.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete campaign with existing responses' },
        { status: 400 }
      )
    }

    await prisma.campaign.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Campaign deleted successfully' })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    )
  }
}
