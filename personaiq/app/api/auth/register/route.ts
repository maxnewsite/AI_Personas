import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { UserRole, TechnicalBackground } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, name, role, department, jobRole } = body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user and employee profile
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || UserRole.EMPLOYEE,
        employee: role === UserRole.EMPLOYEE || !role ? {
          create: {
            employeeId: `EMP${Date.now()}`,
            department: department || 'General',
            jobRole: jobRole || 'Employee',
            hireDate: new Date(),
            technicalBackground: TechnicalBackground.NONE
          }
        } : undefined
      },
      include: {
        employee: true
      }
    })

    // Don't send password back
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
