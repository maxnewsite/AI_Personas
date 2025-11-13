import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UserRole, CampaignStatus } from '@prisma/client'

// GET /api/campaigns - List all campaigns
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaigns = await prisma.campaign.findMany({
      include: {
        createdBy: { select: { name: true, email: true } },
        responses: { select: { id: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

// POST /api/campaigns - Create a new campaign
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    // Validation
    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Name, start date, and end date are required' },
        { status: 400 }
      )
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      )
    }

    const campaign = await prisma.campaign.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: status || CampaignStatus.DRAFT,
        createdById: session.user.id,
        targetAll: targetAll || false,
        targetDepartments: targetDepartments || [],
        targetEmployeeIds: targetEmployeeIds || [],
        showResultsToParticipant: showResultsToParticipant ?? true,
        allowRetakes: allowRetakes ?? false,
        sendReminders: sendReminders ?? true,
        reminderDays: reminderDays || 3
      }
    })

    return NextResponse.json({ campaign }, { status: 201 })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}
