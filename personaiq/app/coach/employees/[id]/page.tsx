import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UserRole } from "@prisma/client"
import { prisma } from "@/lib/db"
import { Navigation } from "@/components/ui/Navigation"
import { Card } from "@/components/ui/Card"
import { PersonaBadge, PersonaDescription } from "@/components/ui/PersonaBadge"
import { Button } from "@/components/ui/Button"
import Link from "next/link"
import { ArrowLeft, TrendingUp, AlertCircle, Target, BookOpen, CheckSquare, Flag } from "lucide-react"
import { generateCoachingRecommendations } from "@/lib/algorithms/coaching-recommendations"
import { identifyWinner } from "@/lib/algorithms/winner-identification"

export default async function CoachEmployeeDetailPage({
  params
}: {
  params: { id: string }
}) {
  const session = await auth()

  if (!session?.user || session.user.role !== UserRole.COACH) {
    redirect('/auth/login')
  }

  // Find coach profile
  const coach = await prisma.coach.findUnique({
    where: { userId: session.user.id }
  })

  if (!coach) {
    redirect('/auth/login')
  }

  // Fetch employee data
  const employee = await prisma.employee.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { name: true, email: true } },
      personaHistory: {
        orderBy: { date: 'desc' },
        take: 10
      }
    }
  })

  if (!employee || employee.assignedCoachId !== coach.id) {
    redirect('/coach')
  }

  // Get latest assessment response
  const latestAssessment = await prisma.assessmentResponse.findFirst({
    where: { employeeId: employee.id },
    orderBy: { completionDate: 'desc' }
  })

  async function handleSignOut() {
    'use server'
    await signOut()
  }

  // Generate fresh coaching recommendations if we have assessment data
  let coachingRecs = null
  if (latestAssessment && latestAssessment.personaClassification && latestAssessment.dimensionScores) {
    const winnerResult = identifyWinner(
      latestAssessment.personaClassification,
      latestAssessment.dimensionScores as any,
      latestAssessment.responses as any
    )

    coachingRecs = generateCoachingRecommendations(
      latestAssessment.personaClassification,
      latestAssessment.confidenceScore || 0,
      latestAssessment.dimensionScores as any,
      latestAssessment.responses as any,
      winnerResult
    )
  }

  const hasPersona = !!employee.currentPersona
  const daysAgo = latestAssessment?.completionDate
    ? Math.floor((Date.now() - new Date(latestAssessment.completionDate).getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation role="COACH" userName={session.user.name} onSignOut={handleSignOut} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/coach" className="text-blue-600 hover:text-blue-700 flex items-center mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{employee.user.name}</h1>
              <p className="text-gray-600 mt-1">
                {employee.department} • {employee.jobRole}
              </p>
            </div>
            {hasPersona && employee.currentPersona && (
              <PersonaBadge persona={employee.currentPersona} size="lg" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {!hasPersona ? (
              <Card title="No Assessment Yet">
                <div className="text-center py-8">
                  <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    This employee hasn't completed an assessment yet.
                  </p>
                </div>
              </Card>
            ) : (
              <>
                {/* Current Persona */}
                <Card title="Current Persona">
                  <div className="space-y-4">
                    <PersonaDescription persona={employee.currentPersona!} />
                    {employee.winnerStatus && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">🏆</span>
                          <div>
                            <div className="font-semibold text-green-900">Winner Status</div>
                            <div className="text-sm text-green-700">
                              High-performer with score: {employee.winnerScore}
                            </div>
                            {employee.winnerPriority && (
                              <div className="text-xs text-green-600 mt-1">
                                Priority: {employee.winnerPriority}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {daysAgo !== null && (
                      <div className="text-sm text-gray-500 pt-2 border-t border-gray-200">
                        Last assessed {daysAgo} {daysAgo === 1 ? 'day' : 'days'} ago
                      </div>
                    )}
                  </div>
                </Card>

                {/* Coaching Recommendations */}
                {coachingRecs && (
                  <>
                    <Card
                      title="Coaching Recommendations"
                      description={`Confidence: ${Math.round(coachingRecs.confidence)}%`}
                    >
                      <div className="space-y-4">
                        {/* Primary Focus */}
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <h3 className="font-semibold text-blue-900 mb-1">Primary Focus</h3>
                              <p className="text-sm text-blue-800">{coachingRecs.primaryFocus}</p>
                            </div>
                          </div>
                        </div>

                        {/* Recommended Frequency */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">Recommended Frequency</span>
                          <span className="text-sm text-gray-900">{coachingRecs.recommendedFrequency}</span>
                        </div>
                      </div>
                    </Card>

                    {/* Activities */}
                    <Card
                      title="Recommended Activities"
                      description="Structured coaching activities"
                    >
                      <div className="space-y-2">
                        {coachingRecs.activities.map((activity, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <CheckSquare className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-700">{activity}</p>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* Success Metrics */}
                    <Card title="Success Metrics" description="How to measure progress">
                      <div className="space-y-2">
                        {coachingRecs.successMetrics.map((metric, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg"
                          >
                            <TrendingUp className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-700">{metric}</p>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* Red Flags */}
                    <Card title="Red Flags to Monitor" description="Watch out for these warning signs">
                      <div className="space-y-2">
                        {coachingRecs.redFlags.map((flag, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg"
                          >
                            <Flag className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-700">{flag}</p>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* Resources */}
                    <Card title="Recommended Resources" description="Materials to support growth">
                      <div className="space-y-2">
                        {coachingRecs.resources.map((resource, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg"
                          >
                            <BookOpen className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-700">{resource}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </>
                )}

                {/* Persona History */}
                {employee.personaHistory.length > 0 && (
                  <Card title="Persona Evolution" description="Historical progression over time">
                    <div className="space-y-3">
                      {employee.personaHistory.map((history, index) => (
                        <div
                          key={history.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <PersonaBadge persona={history.persona} size="sm" />
                            <span className="text-sm text-gray-600">
                              {new Date(history.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-gray-500">
                              Confidence: {Math.round(history.confidence)}%
                            </span>
                            {index === 0 && (
                              <div className="text-xs text-blue-600">Current</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Employee Profile */}
            <Card title="Employee Profile">
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-500">Email</div>
                  <div className="font-medium text-gray-900">{employee.user.email}</div>
                </div>
                <div>
                  <div className="text-gray-500">Employee ID</div>
                  <div className="font-medium text-gray-900">{employee.employeeId}</div>
                </div>
                <div>
                  <div className="text-gray-500">Department</div>
                  <div className="font-medium text-gray-900">{employee.department}</div>
                </div>
                <div>
                  <div className="text-gray-500">Job Role</div>
                  <div className="font-medium text-gray-900">{employee.jobRole}</div>
                </div>
                <div>
                  <div className="text-gray-500">Technical Background</div>
                  <div className="font-medium text-gray-900">{employee.technicalBackground}</div>
                </div>
                <div>
                  <div className="text-gray-500">Hire Date</div>
                  <div className="font-medium text-gray-900">
                    {new Date(employee.hireDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card title="Quick Actions">
              <div className="space-y-2">
                <Link href={`/coach/employees/${employee.id}/notes`} className="block">
                  <Button variant="primary" size="sm" className="w-full">
                    Add Coaching Note
                  </Button>
                </Link>
                <Button variant="secondary" size="sm" className="w-full">
                  Schedule Session
                </Button>
                <Button variant="ghost" size="sm" className="w-full">
                  Send Message
                </Button>
              </div>
            </Card>

            {/* Coaching Notes Summary */}
            <Card title="Recent Notes">
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No notes yet</p>
                <Link href={`/coach/employees/${employee.id}/notes`}>
                  <Button variant="ghost" size="sm" className="mt-2">
                    Add First Note
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
