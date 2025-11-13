import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UserRole, PersonaType } from "@prisma/client"
import { prisma } from "@/lib/db"
import { Navigation } from "@/components/ui/Navigation"
import { Card, DashboardStat } from "@/components/ui/Card"
import { PersonaBadge } from "@/components/ui/PersonaBadge"
import { Users, TrendingUp, AlertTriangle, Award } from "lucide-react"

export default async function ManagerDashboardPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== UserRole.MANAGER) {
    redirect('/auth/login')
  }

  // Find manager's employee profile
  const managerEmployee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
    include: {
      directReports: {
        include: {
          user: { select: { name: true, email: true } },
          assignedCoach: {
            include: {
              employees: { select: { id: true } }
            }
          }
        },
        orderBy: { user: { name: 'asc' } }
      }
    }
  })

  if (!managerEmployee) {
    redirect('/auth/login')
  }

  async function handleSignOut() {
    'use server'
    await signOut()
  }

  const teamMembers = managerEmployee.directReports

  // Calculate team statistics
  const totalTeamMembers = teamMembers.length
  const assessedMembers = teamMembers.filter(e => e.currentPersona).length
  const winners = teamMembers.filter(e => e.winnerStatus).length
  const needsSupport = teamMembers.filter(e =>
    e.currentPersona === PersonaType.OVERWHELMED || e.currentPersona === PersonaType.RESISTANT
  ).length

  const completionRate = totalTeamMembers > 0
    ? Math.round((assessedMembers / totalTeamMembers) * 100)
    : 0

  // Persona distribution
  const personaDistribution = teamMembers.reduce((acc, member) => {
    if (member.currentPersona) {
      acc[member.currentPersona] = (acc[member.currentPersona] || 0) + 1
    }
    return acc
  }, {} as Record<PersonaType, number>)

  // Calculate average winner score
  const winnersData = teamMembers.filter(e => e.winnerStatus && e.winnerScore)
  const avgWinnerScore = winnersData.length > 0
    ? Math.round(winnersData.reduce((sum, e) => sum + (e.winnerScore || 0), 0) / winnersData.length)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation role="MANAGER" userName={session.user.name} onSignOut={handleSignOut} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Team Dashboard</h1>
          <p className="text-gray-600 mt-2">
            {managerEmployee.department} Department • {totalTeamMembers} Team Members
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <DashboardStat
            label="Team Members"
            value={totalTeamMembers}
            icon={<Users className="h-6 w-6" />}
          />
          <DashboardStat
            label="Assessed"
            value={`${completionRate}%`}
            change={{ value: completionRate, positive: completionRate > 70 }}
          />
          <DashboardStat
            label="High Performers"
            value={winners}
            icon={<Award className="h-6 w-6" />}
          />
          <DashboardStat
            label="Needs Support"
            value={needsSupport}
            icon={<AlertTriangle className="h-6 w-6" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Persona Distribution */}
            <Card title="Team Persona Distribution" description="AI adoption personas across your team">
              {Object.keys(personaDistribution).length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No assessments completed yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(personaDistribution)
                    .sort(([, a], [, b]) => b - a)
                    .map(([persona, count]) => {
                      const percentage = totalTeamMembers > 0
                        ? Math.round((count / totalTeamMembers) * 100)
                        : 0
                      return (
                        <div key={persona} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <PersonaBadge persona={persona as PersonaType} size="sm" />
                              <span className="text-sm text-gray-600">{count} members</span>
                            </div>
                            <span className="text-sm font-medium text-gray-700">{percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full bg-persona-${persona.toLowerCase()}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </Card>

            {/* Team Members Overview */}
            <Card title="Team Members" description="Individual team member status">
              {teamMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No team members assigned</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h4 className="font-medium text-gray-900">{member.user.name}</h4>
                            {member.currentPersona && (
                              <PersonaBadge persona={member.currentPersona} size="sm" />
                            )}
                            {member.winnerStatus && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                                🏆 High Performer
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{member.jobRole}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-200">
                        <div>
                          <span className="text-xs text-gray-500">Technical Background</span>
                          <p className="text-sm font-medium text-gray-700">{member.technicalBackground}</p>
                        </div>
                        {member.assignedCoach && (
                          <div>
                            <span className="text-xs text-gray-500">Coach Assigned</span>
                            <p className="text-sm font-medium text-green-700">✓ Yes</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Team Insights */}
            <Card title="Team Insights">
              <div className="space-y-4">
                {winners > 0 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <Award className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">High Performers</span>
                    </div>
                    <p className="text-xs text-green-700">
                      {winners} team {winners === 1 ? 'member' : 'members'} identified as winners
                      {avgWinnerScore > 0 && ` with average score of ${avgWinnerScore}`}
                    </p>
                  </div>
                )}

                {needsSupport > 0 && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-900">Needs Support</span>
                    </div>
                    <p className="text-xs text-orange-700">
                      {needsSupport} team {needsSupport === 1 ? 'member' : 'members'} may need additional coaching support
                    </p>
                  </div>
                )}

                {completionRate < 100 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Assessment Progress</span>
                    </div>
                    <p className="text-xs text-blue-700">
                      {totalTeamMembers - assessedMembers} team {totalTeamMembers - assessedMembers === 1 ? 'member' : 'members'} haven't completed assessment yet
                    </p>
                  </div>
                )}

                {completionRate === 100 && teamMembers.length > 0 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">100% Complete!</span>
                    </div>
                    <p className="text-xs text-green-700">
                      All team members have completed their assessments
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Privacy Notice */}
            <Card title="Privacy Notice">
              <div className="space-y-3 text-xs text-gray-600">
                <p>
                  🔒 Individual assessment responses are confidential and only visible to coaches and admins.
                </p>
                <p>
                  As a manager, you can see aggregated team metrics and persona classifications to support team development.
                </p>
              </div>
            </Card>

            {/* Department Stats */}
            <Card title="Department">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Department</span>
                  <span className="font-medium text-gray-900">{managerEmployee.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Team Size</span>
                  <span className="font-medium text-gray-900">{totalTeamMembers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-medium text-gray-900">{completionRate}%</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
