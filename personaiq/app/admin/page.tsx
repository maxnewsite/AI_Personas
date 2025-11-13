import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UserRole, PersonaType } from "@prisma/client"
import { prisma } from "@/lib/db"
import { Navigation } from "@/components/ui/Navigation"
import { Card, DashboardStat } from "@/components/ui/Card"
import { PersonaBadge } from "@/components/ui/PersonaBadge"
import { signOut } from "@/lib/auth"

export default async function AdminDashboardPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    redirect('/auth/login')
  }

  // Fetch analytics data
  const totalEmployees = await prisma.employee.count()
  const employeesWithPersona = await prisma.employee.count({
    where: { currentPersona: { not: null } }
  })
  const winners = await prisma.employee.count({
    where: { winnerStatus: true }
  })

  // Persona distribution
  const personaDistribution = await prisma.employee.groupBy({
    by: ['currentPersona'],
    _count: true,
    where: { currentPersona: { not: null } }
  })

  const personaCounts = personaDistribution.reduce((acc, item) => {
    if (item.currentPersona) {
      acc[item.currentPersona] = item._count
    }
    return acc
  }, {} as Record<PersonaType, number>)

  // Recent employees
  const recentEmployees = await prisma.employee.findMany({
    take: 10,
    orderBy: { updatedAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } }
    }
  })

  async function handleSignOut() {
    'use server'
    await signOut()
  }

  const completionRate = totalEmployees > 0
    ? Math.round((employeesWithPersona / totalEmployees) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation role="ADMIN" userName={session.user.name} onSignOut={handleSignOut} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Organization-wide AI adoption analytics</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <DashboardStat label="Total Employees" value={totalEmployees} />
          <DashboardStat
            label="Assessed"
            value={employeesWithPersona}
            change={{ value: completionRate, positive: completionRate > 50 }}
          />
          <DashboardStat label="Completion Rate" value={`${completionRate}%`} />
          <DashboardStat label="Winners Identified" value={winners} />
        </div>

        {/* Persona Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card title="Persona Distribution" description="Current classification across organization">
            <div className="space-y-4">
              {Object.entries(personaCounts).map(([persona, count]) => {
                const percentage = totalEmployees > 0
                  ? Math.round((count / totalEmployees) * 100)
                  : 0
                return (
                  <div key={persona} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <PersonaBadge persona={persona as PersonaType} size="sm" />
                      <span className="text-sm text-gray-600">{count} employees</span>
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
              {Object.keys(personaCounts).length === 0 && (
                <p className="text-gray-500 text-sm">No assessments completed yet</p>
              )}
            </div>
          </Card>

          <Card title="Quick Actions" description="Common administrative tasks">
            <div className="space-y-3">
              <a
                href="/admin/campaigns"
                className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-blue-900">Create New Campaign</div>
                <div className="text-sm text-blue-700">Launch a new assessment campaign</div>
              </a>
              <a
                href="/admin/employees"
                className="block p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-green-900">View All Employees</div>
                <div className="text-sm text-green-700">Manage employee profiles and personas</div>
              </a>
              <a
                href="/admin/analytics"
                className="block p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-purple-900">Analytics & Reports</div>
                <div className="text-sm text-purple-700">Deep dive into organization metrics</div>
              </a>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card title="Recent Employees" description="Latest updates">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Persona
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Winner
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {employee.user.name}
                      </div>
                      <div className="text-sm text-gray-500">{employee.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.jobRole}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {employee.currentPersona ? (
                        <PersonaBadge persona={employee.currentPersona} size="sm" />
                      ) : (
                        <span className="text-sm text-gray-500">Not assessed</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {employee.winnerStatus ? (
                        <span className="text-sm text-green-600 font-medium">✓ Winner</span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  )
}
