import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UserRole, PersonaType } from "@prisma/client"
import { prisma } from "@/lib/db"
import { Navigation } from "@/components/ui/Navigation"
import { Card } from "@/components/ui/Card"
import { PersonaBadge } from "@/components/ui/PersonaBadge"
import { Button } from "@/components/ui/Button"
import Link from "next/link"
import { Search, Download, UserPlus } from "lucide-react"

export default async function AdminEmployeesPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    redirect('/auth/login')
  }

  // Fetch all employees with their relationships
  const employees = await prisma.employee.findMany({
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
        take: 1
      }
    },
    orderBy: { user: { name: 'asc' } }
  })

  async function handleSignOut() {
    'use server'
    await signOut()
  }

  // Get unique departments and personas for filtering
  const departments = Array.from(new Set(employees.map(e => e.department))).sort()
  const personas = Object.values(PersonaType)

  // Calculate statistics
  const totalEmployees = employees.length
  const assessed = employees.filter(e => e.currentPersona).length
  const winners = employees.filter(e => e.winnerStatus).length
  const needsCoach = employees.filter(e => !e.assignedCoachId).length

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation role="ADMIN" userName={session.user.name} onSignOut={handleSignOut} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
              <p className="text-gray-600 mt-2">
                {totalEmployees} employees • {assessed} assessed • {winners} winners
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="secondary" size="lg">
                <Download className="h-5 w-5 mr-2" />
                Export
              </Button>
              <Button variant="primary" size="lg">
                <UserPlus className="h-5 w-5 mr-2" />
                Add Employee
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card title="Filters" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Name or email..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Persona
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">All Personas</option>
                {personas.map(persona => (
                  <option key={persona} value={persona}>{persona}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">All Status</option>
                <option value="assessed">Assessed</option>
                <option value="not_assessed">Not Assessed</option>
                <option value="winner">Winners Only</option>
                <option value="needs_coach">Needs Coach</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Employee List */}
        <Card title="All Employees">
          {employees.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
              <p className="text-gray-600 mb-6">
                Add your first employee to get started with assessments.
              </p>
              <Button variant="primary" size="lg">
                <UserPlus className="h-5 w-5 mr-2" />
                Add First Employee
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Persona
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Coach
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Manager
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.map((employee) => {
                    const latestResponse = employee.responses[0]
                    const daysAgo = latestResponse?.completionDate
                      ? Math.floor((Date.now() - new Date(latestResponse.completionDate).getTime()) / (1000 * 60 * 60 * 24))
                      : null

                    return (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{employee.user.name}</div>
                            <div className="text-sm text-gray-500">{employee.user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{employee.department}</div>
                          <div className="text-sm text-gray-500">{employee.jobRole}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {employee.currentPersona ? (
                            <div className="flex flex-col space-y-1">
                              <PersonaBadge persona={employee.currentPersona} size="sm" />
                              {employee.winnerStatus && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full inline-block w-fit">
                                  🏆 Winner
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Not assessed</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {employee.currentPersona ? (
                            <div className="text-sm">
                              <div className="text-green-600 font-medium">✓ Assessed</div>
                              {daysAgo !== null && (
                                <div className="text-gray-500 text-xs">
                                  {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-orange-600">Pending</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {employee.assignedCoach ? (
                            <div className="text-sm text-gray-900">{employee.assignedCoach.user.name}</div>
                          ) : (
                            <span className="text-sm text-orange-600">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {employee.manager ? (
                            <div className="text-sm text-gray-900">{employee.manager.user.name}</div>
                          ) : (
                            <span className="text-sm text-gray-400">None</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link href={`/admin/employees/${employee.id}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Quick Stats */}
        {needsCoach > 0 && (
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-orange-600">⚠️</span>
              <span className="text-sm font-medium text-orange-900">
                {needsCoach} {needsCoach === 1 ? 'employee needs' : 'employees need'} a coach assigned
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
