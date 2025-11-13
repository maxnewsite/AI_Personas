import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UserRole } from '@prisma/client'

// GET /api/employees/[id] - Get employee details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const employee = await prisma.employee.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { name: true, email: true } },
        manager: {
          include: {
            user: { select: { name: true } }
          }
        },
        assignedCoach: {
          include: {
            user: { select: { name: true } }
          }
        },
        responses: {
          orderBy: { completionDate: 'desc' },
          take: 5
        },
        personaHistory: {
          orderBy: { date: 'desc' },
          take: 10
        }
      }
    })

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Authorization check
    if (
      session.user.role !== UserRole.ADMIN &&
      session.user.role !== UserRole.COACH &&
      session.user.id !== employee.userId
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({ employee })
  } catch (error) {
    console.error('Error fetching employee:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employee' },
      { status: 500 }
    )
  }
}

// PUT /api/employees/[id] - Update employee
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      department,
      jobRole,
      managerId,
      assignedCoachId,
      technicalBackground,
      currentPersona,
      winnerStatus,
      winnerScore,
      winnerPriority
    } = body

    // Check if employee exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { id: params.id }
    })

    if (!existingEmployee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Validate manager exists if provided
    if (managerId) {
      const manager = await prisma.employee.findUnique({
        where: { id: managerId }
      })
      if (!manager) {
        return NextResponse.json({ error: 'Manager not found' }, { status: 400 })
      }
    }

    // Validate coach exists if provided
    if (assignedCoachId) {
      const coach = await prisma.coach.findUnique({
        where: { id: assignedCoachId }
      })
      if (!coach) {
        return NextResponse.json({ error: 'Coach not found' }, { status: 400 })
      }
    }

    const employee = await prisma.employee.update({
      where: { id: params.id },
      data: {
        ...(department && { department }),
        ...(jobRole && { jobRole }),
        ...(managerId !== undefined && { managerId }),
        ...(assignedCoachId !== undefined && { assignedCoachId }),
        ...(technicalBackground && { technicalBackground }),
        ...(currentPersona !== undefined && { currentPersona }),
        ...(winnerStatus !== undefined && { winnerStatus }),
        ...(winnerScore !== undefined && { winnerScore }),
        ...(winnerPriority !== undefined && { winnerPriority })
      },
      include: {
        user: { select: { name: true, email: true } },
        manager: {
          include: {
            user: { select: { name: true } }
          }
        },
        assignedCoach: {
          include: {
            user: { select: { name: true } }
          }
        }
      }
    })

    return NextResponse.json({ employee })
  } catch (error) {
    console.error('Error updating employee:', error)
    return NextResponse.json(
      { error: 'Failed to update employee' },
      { status: 500 }
    )
  }
}
