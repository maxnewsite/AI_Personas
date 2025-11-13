import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UserRole, PersonaType } from "@prisma/client"
import { prisma } from "@/lib/db"
import { Navigation } from "@/components/ui/Navigation"
import { Card, DashboardStat } from "@/components/ui/Card"
import { PersonaBadge } from "@/components/ui/PersonaBadge"
import { Button } from "@/components/ui/Button"
import Link from "next/link"
import { Users, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"

export default async function CoachDashboardPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== UserRole.COACH) {
    redirect('/auth/login')
  }

  // Find coach profile
  const coach = await prisma.coach.findUnique({
    where: { userId: session.user.id },
    include: {
      employees: {
        include: {
          user: { select: { name: true, email: true } },
          personaHistory: {
            orderBy: { date: 'desc' },
            take: 1
          }
        },
        orderBy: { updatedAt: 'desc' }
      }
    }
  })

  if (!coach) {
    redirect('/auth/login')
  }

  async function handleSignOut() {
    'use server'
    await signOut()
  }

  // Calculate statistics
  const totalAssignedEmployees = coach.employees.length
  const employeesWithPersona = coach.employees.filter(e => e.currentPersona).length
  const winners = coach.employees.filter(e => e.winnerStatus).length
  const needsAttention = coach.employees.filter(e =>
    e.currentPersona === PersonaType.OVERWHELMED || e.currentPersona === PersonaType.RESISTANT
  ).length

  // Group employees by persona
  const employeesByPersona = coach.employees.reduce((acc, emp) => {
    if (emp.currentPersona) {
      if (!acc[emp.currentPersona]) {
        acc[emp.currentPersona] = []
      }
      acc[emp.currentPersona].push(emp)
    }
    return acc
  }, {} as Record<PersonaType, typeof coach.employees>)

  // Calculate completion rate
  const completionRate = totalAssignedEmployees > 0
    ? Math.round((employeesWithPersona / totalAssignedEmployees) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation role="COACH" userName={session.user.name} onSignOut={handleSignOut} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Coach Dashboard</h1>
          <p className="text-gray-600 mt-2">
            {coach.specialization || 'AI Adoption Coaching'}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <DashboardStat
            label="Assigned Employees"
            value={totalAssignedEmployees}
            icon={<Users className="h-6 w-6" />}
          />
          <DashboardStat
            label="Assessed"
            value={employeesWithPersona}
            change={{ value: completionRate, positive: completionRate > 70 }}
          />
          <DashboardStat
            label="Winners"
            value={winners}
            icon={<TrendingUp className="h-6 w-6" />}
          />
          <DashboardStat
            label="Needs Attention"
            value={needsAttention}
            icon={<AlertCircle className="h-6 w-6" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Employees by Priority */}
            <Card title="Your Coaching Queue" description="Prioritized by needs and status">
              {coach.employees.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No employees assigned yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* High Priority: Overwhelmed & Resistant */}
                  {needsAttention > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-red-600 mb-3 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        High Priority
                      </h3>
                      {coach.employees
                        .filter(e => e.currentPersona === PersonaType.OVERWHELMED || e.currentPersona === PersonaType.RESISTANT)
                        .map(employee => (
                          <EmployeeCard key={employee.id} employee={employee} />
                        ))}
                    </div>
                  )}

                  {/* Medium Priority: Emerging & Established */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-yellow-600 mb-3 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Medium Priority
                    </h3>
                    {coach.employees
                      .filter(e => e.currentPersona === PersonaType.EMERGING || e.currentPersona === PersonaType.ESTABLISHED)
                      .map(employee => (
                        <EmployeeCard key={employee.id} employee={employee} />
                      ))}
                  </div>

                  {/* Low Priority: Trailblazers */}
                  {employeesByPersona[PersonaType.TRAILBLAZER]?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-green-600 mb-3 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Low Priority - High Performers
                      </h3>
                      {employeesByPersona[PersonaType.TRAILBLAZER].map(employee => (
                        <EmployeeCard key={employee.id} employee={employee} />
                      ))}
                    </div>
                  )}

                  {/* Employees without persona */}
                  {coach.employees.filter(e => !e.currentPersona).length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-semibold text-gray-600 mb-3">
                        Awaiting Assessment
                      </h3>
                      {coach.employees
                        .filter(e => !e.currentPersona)
                        .map(employee => (
                          <div
                            key={employee.id}
                            className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-3"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">{employee.user.name}</h4>
                                <p className="text-sm text-gray-600">
                                  {employee.department} • {employee.jobRole}
                                </p>
                              </div>
                              <span className="text-sm text-gray-500">No assessment yet</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Persona Distribution */}
            <Card title="Persona Distribution" description="Your assigned employees by persona">
              <div className="space-y-4">
                {Object.entries(employeesByPersona).map(([persona, employees]) => {
                  const percentage = totalAssignedEmployees > 0
                    ? Math.round((employees.length / totalAssignedEmployees) * 100)
                    : 0
                  return (
                    <div key={persona} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <PersonaBadge persona={persona as PersonaType} size="sm" />
                        <span className="text-sm text-gray-600">{employees.length} employees</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full bg-persona-${persona.toLowerCase()}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 w-12 text-right">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Coaching Tips */}
            <Card title="Coaching Tips">
              <div className="space-y-4 text-sm text-gray-600">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="font-medium text-red-900 mb-1">🚨 Overwhelmed Personas</div>
                  <p className="text-xs text-red-700">
                    Focus on task decomposition and "good enough" framework. Reduce perfectionism.
                  </p>
                </div>
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="font-medium text-orange-900 mb-1">⚠️ Resistant Personas</div>
                  <p className="text-xs text-orange-700">
                    Address root concerns first. Focus on values alignment over tools.
                  </p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="font-medium text-blue-900 mb-1">🌱 Emerging Personas</div>
                  <p className="text-xs text-blue-700">
                    Build confidence through quick wins. Pair with a buddy for support.
                  </p>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="font-medium text-green-900 mb-1">🚀 Trailblazers</div>
                  <p className="text-xs text-green-700">
                    Scale their impact through mentoring. Focus on leadership skills.
                  </p>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card title="This Week">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sessions completed</span>
                  <span className="font-medium text-gray-900">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Notes added</span>
                  <span className="font-medium text-gray-900">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Follow-ups due</span>
                  <span className="font-medium text-orange-600">0</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

// Employee Card Component
function EmployeeCard({ employee }: { employee: any }) {
  const latestHistory = employee.personaHistory[0]
  const daysAgo = latestHistory
    ? Math.floor((Date.now() - new Date(latestHistory.date).getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors mb-3">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h4 className="font-medium text-gray-900">{employee.user.name}</h4>
            {employee.currentPersona && (
              <PersonaBadge persona={employee.currentPersona} size="sm" />
            )}
            {employee.winnerStatus && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                🏆 Winner
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">
            {employee.department} • {employee.jobRole}
          </p>
          {daysAgo !== null && (
            <p className="text-xs text-gray-500 mt-1">
              Last assessed {daysAgo} {daysAgo === 1 ? 'day' : 'days'} ago
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Link href={`/coach/employees/${employee.id}`} className="flex-1">
          <Button variant="secondary" size="sm" className="w-full">
            View Details
          </Button>
        </Link>
        <Link href={`/coach/employees/${employee.id}/notes`} className="flex-1">
          <Button variant="ghost" size="sm" className="w-full">
            Add Note
          </Button>
        </Link>
      </div>
    </div>
  )
}
