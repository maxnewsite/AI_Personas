import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UserRole, PersonaType } from "@prisma/client"
import { prisma } from "@/lib/db"
import { Navigation } from "@/components/ui/Navigation"
import { Card, DashboardStat } from "@/components/ui/Card"
import { PersonaBadge } from "@/components/ui/PersonaBadge"
import { TrendingUp, Users, Award, Target } from "lucide-react"

export default async function AdminAnalyticsPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    redirect('/auth/login')
  }

  async function handleSignOut() {
    'use server'
    await signOut()
  }

  // Fetch comprehensive analytics data
  const totalEmployees = await prisma.employee.count()
  const assessedEmployees = await prisma.employee.count({
    where: { currentPersona: { not: null } }
  })
  const winners = await prisma.employee.count({
    where: { winnerStatus: true }
  })
  const totalAssessments = await prisma.assessmentResponse.count()

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

  // Department distribution
  const departmentDistribution = await prisma.employee.groupBy({
    by: ['department'],
    _count: true,
    where: { currentPersona: { not: null } }
  })

  const departmentData = departmentDistribution.map(item => ({
    department: item.department,
    count: item._count
  })).sort((a, b) => b.count - a.count)

  // Winners by persona
  const winnersByPersona = await prisma.employee.groupBy({
    by: ['currentPersona'],
    _count: true,
    where: {
      winnerStatus: true,
      currentPersona: { not: null }
    }
  })

  const winnerCounts = winnersByPersona.reduce((acc, item) => {
    if (item.currentPersona) {
      acc[item.currentPersona] = item._count
    }
    return acc
  }, {} as Record<PersonaType, number>)

  // Get top winners
  const topWinners = await prisma.employee.findMany({
    where: {
      winnerStatus: true,
      winnerScore: { not: null }
    },
    include: {
      user: { select: { name: true } }
    },
    orderBy: { winnerScore: 'desc' },
    take: 10
  })

  // Technical background distribution
  const technicalDistribution = await prisma.employee.groupBy({
    by: ['technicalBackground'],
    _count: true,
    where: { currentPersona: { not: null } }
  })

  // Recent assessments
  const recentAssessments = await prisma.assessmentResponse.findMany({
    take: 10,
    orderBy: { completionDate: 'desc' },
    include: {
      employee: {
        include: {
          user: { select: { name: true } }
        }
      }
    }
  })

  const completionRate = totalEmployees > 0
    ? Math.round((assessedEmployees / totalEmployees) * 100)
    : 0

  const avgConfidence = assessedEmployees > 0
    ? Math.round(
        (await prisma.assessmentResponse.aggregate({
          _avg: { confidenceScore: true }
        }))._avg.confidenceScore || 0
      )
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation role="ADMIN" userName={session.user.name} onSignOut={handleSignOut} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Comprehensive AI adoption insights</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <DashboardStat
            label="Total Employees"
            value={totalEmployees}
            icon={<Users className="h-6 w-6" />}
          />
          <DashboardStat
            label="Assessment Rate"
            value={`${completionRate}%`}
            change={{ value: completionRate, positive: completionRate > 70 }}
          />
          <DashboardStat
            label="Winners Identified"
            value={winners}
            icon={<Award className="h-6 w-6" />}
          />
          <DashboardStat
            label="Avg Confidence"
            value={`${avgConfidence}%`}
            icon={<Target className="h-6 w-6" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Persona Distribution */}
          <Card title="Persona Distribution" description="Organization-wide persona breakdown">
            <div className="space-y-4">
              {Object.entries(personaCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([persona, count]) => {
                  const percentage = assessedEmployees > 0
                    ? Math.round((count / assessedEmployees) * 100)
                    : 0
                  const winnerCount = winnerCounts[persona as PersonaType] || 0

                  return (
                    <div key={persona} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <PersonaBadge persona={persona as PersonaType} size="sm" />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">{count} employees</span>
                              {winnerCount > 0 && (
                                <span className="text-xs text-green-600">({winnerCount} winners)</span>
                              )}
                            </div>
                          </div>
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
          </Card>

          {/* Department Distribution */}
          <Card title="Department Breakdown" description="Assessment completion by department">
            <div className="space-y-3">
              {departmentData.map((dept, index) => {
                const percentage = assessedEmployees > 0
                  ? Math.round((dept.count / assessedEmployees) * 100)
                  : 0

                return (
                  <div key={dept.department} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-900">{dept.department}</span>
                        <span className="text-sm text-gray-600">{dept.count} assessed</span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Winners */}
          <Card title="Winner Leaderboard" description="Top 10 high performers">
            {topWinners.length === 0 ? (
              <div className="text-center py-8">
                <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No winners identified yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topWinners.map((winner, index) => (
                  <div
                    key={winner.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-800 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{winner.user.name}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          {winner.currentPersona && (
                            <PersonaBadge persona={winner.currentPersona} size="sm" />
                          )}
                          <span className="text-xs text-gray-500">{winner.department}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{winner.winnerScore}</div>
                      <div className="text-xs text-gray-500">Score</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Technical Background Distribution */}
          <Card title="Technical Background" description="Employee technical proficiency levels">
            <div className="space-y-4">
              {technicalDistribution.map((tech) => {
                const percentage = assessedEmployees > 0
                  ? Math.round((tech._count / assessedEmployees) * 100)
                  : 0

                return (
                  <div key={tech.technicalBackground} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{tech.technicalBackground}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{tech._count}</span>
                        <span className="text-sm font-medium text-gray-700">{percentage}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-purple-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card title="Recent Assessments" description="Latest submissions">
          {recentAssessments.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No assessments completed yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAssessments.map((assessment) => {
                const daysAgo = assessment.completionDate
                  ? Math.floor((Date.now() - new Date(assessment.completionDate).getTime()) / (1000 * 60 * 60 * 24))
                  : null

                return (
                  <div
                    key={assessment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div>
                        <div className="font-medium text-gray-900">{assessment.employee.user.name}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          {assessment.personaClassification && (
                            <PersonaBadge persona={assessment.personaClassification} size="sm" />
                          )}
                          <span className="text-xs text-gray-500">{assessment.employee.department}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {assessment.confidenceScore && (
                        <div className="text-sm font-medium text-gray-900">
                          {Math.round(assessment.confidenceScore)}% confidence
                        </div>
                      )}
                      {daysAgo !== null && (
                        <div className="text-xs text-gray-500">
                          {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Insights */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {completionRate < 50 && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-orange-600">⚠️</span>
                <span className="text-sm font-medium text-orange-900">Low Assessment Rate</span>
              </div>
              <p className="text-xs text-orange-700">
                Only {completionRate}% of employees have completed assessments. Consider launching a new campaign.
              </p>
            </div>
          )}
          {winners > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-green-600">🏆</span>
                <span className="text-sm font-medium text-green-900">High Performers</span>
              </div>
              <p className="text-xs text-green-700">
                {winners} winners identified. Consider creating mentorship programs to scale their impact.
              </p>
            </div>
          )}
          {personaCounts[PersonaType.OVERWHELMED] > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-red-600">🚨</span>
                <span className="text-sm font-medium text-red-900">Needs Support</span>
              </div>
              <p className="text-xs text-red-700">
                {personaCounts[PersonaType.OVERWHELMED]} employees are overwhelmed. Prioritize coaching resources.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
