import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UserRole } from '@prisma/client'
import { exportEmployees } from '@/lib/export'

/**
 * GET /api/employees/export
 * Export all employees data as CSV
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || ![UserRole.ADMIN, UserRole.COACH].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all employees with relations
    const employees = await prisma.employee.findMany({
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
      },
      orderBy: { createdAt: 'desc' }
    })

    const csvContent = exportEmployees(employees)
    const filename = `employees_${new Date().toISOString().split('T')[0]}.csv`

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DATA_EXPORTED',
        resourceType: 'Employee',
        resourceId: 'all',
        details: {
          recordCount: employees.length
        }
      }
    })

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    })
  } catch (error) {
    console.error('Error exporting employees:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}
