import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UserRole } from '@prisma/client'

// GET /api/coaching-notes?employeeId=xxx - Get coaching notes for an employee
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || (session.user.role !== UserRole.COACH && session.user.role !== UserRole.ADMIN)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const employeeId = searchParams.get('employeeId')

    if (!employeeId) {
      return NextResponse.json({ error: 'employeeId is required' }, { status: 400 })
    }

    // For coaches, verify they are assigned to this employee
    if (session.user.role === UserRole.COACH) {
      const coach = await prisma.coach.findUnique({
        where: { userId: session.user.id }
      })

      if (!coach) {
        return NextResponse.json({ error: 'Coach profile not found' }, { status: 404 })
      }

      const employee = await prisma.employee.findUnique({
        where: { id: employeeId }
      })

      if (!employee || employee.assignedCoachId !== coach.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    const notes = await prisma.coachingNote.findMany({
      where: { employeeId },
      include: {
        coach: {
          include: {
            user: { select: { name: true, email: true } }
          }
        }
      },
      orderBy: { sessionDate: 'desc' }
    })

    return NextResponse.json({ notes })
  } catch (error) {
    console.error('Error fetching coaching notes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coaching notes' },
      { status: 500 }
    )
  }
}

// POST /api/coaching-notes - Create a new coaching note
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== UserRole.COACH) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id }
    })

    if (!coach) {
      return NextResponse.json({ error: 'Coach profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      employeeId,
      sessionDate,
      sessionType,
      notes,
      actionItems,
      nextSteps
    } = body

    // Validation
    if (!employeeId || !sessionDate || !notes) {
      return NextResponse.json(
        { error: 'employeeId, sessionDate, and notes are required' },
        { status: 400 }
      )
    }

    // Verify coach is assigned to this employee
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    })

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    if (employee.assignedCoachId !== coach.id) {
      return NextResponse.json(
        { error: 'You are not assigned to this employee' },
        { status: 403 }
      )
    }

    const coachingNote = await prisma.coachingNote.create({
      data: {
        employeeId,
        coachId: coach.id,
        sessionDate: new Date(sessionDate),
        sessionType,
        notes,
        actionItems,
        nextSteps
      },
      include: {
        coach: {
          include: {
            user: { select: { name: true, email: true } }
          }
        }
      }
    })

    return NextResponse.json({ note: coachingNote }, { status: 201 })
  } catch (error) {
    console.error('Error creating coaching note:', error)
    return NextResponse.json(
      { error: 'Failed to create coaching note' },
      { status: 500 }
    )
  }
}
