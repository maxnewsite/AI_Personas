import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UserRole } from '@prisma/client'

// PUT /api/coaching-notes/[id] - Update a coaching note
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      sessionDate,
      sessionType,
      notes,
      actionItems,
      nextSteps
    } = body

    // Check if note exists and belongs to this coach
    const existingNote = await prisma.coachingNote.findUnique({
      where: { id: params.id }
    })

    if (!existingNote) {
      return NextResponse.json({ error: 'Coaching note not found' }, { status: 404 })
    }

    if (existingNote.coachId !== coach.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const coachingNote = await prisma.coachingNote.update({
      where: { id: params.id },
      data: {
        ...(sessionDate && { sessionDate: new Date(sessionDate) }),
        ...(sessionType !== undefined && { sessionType }),
        ...(notes && { notes }),
        ...(actionItems !== undefined && { actionItems }),
        ...(nextSteps !== undefined && { nextSteps })
      },
      include: {
        coach: {
          include: {
            user: { select: { name: true, email: true } }
          }
        }
      }
    })

    return NextResponse.json({ note: coachingNote })
  } catch (error) {
    console.error('Error updating coaching note:', error)
    return NextResponse.json(
      { error: 'Failed to update coaching note' },
      { status: 500 }
    )
  }
}

// DELETE /api/coaching-notes/[id] - Delete a coaching note
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if note exists and belongs to this coach
    const existingNote = await prisma.coachingNote.findUnique({
      where: { id: params.id }
    })

    if (!existingNote) {
      return NextResponse.json({ error: 'Coaching note not found' }, { status: 404 })
    }

    if (existingNote.coachId !== coach.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.coachingNote.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Coaching note deleted successfully' })
  } catch (error) {
    console.error('Error deleting coaching note:', error)
    return NextResponse.json(
      { error: 'Failed to delete coaching note' },
      { status: 500 }
    )
  }
}
