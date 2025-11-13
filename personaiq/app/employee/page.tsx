import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UserRole } from "@prisma/client"
import { prisma } from "@/lib/db"
import { Navigation } from "@/components/ui/Navigation"
import { Card } from "@/components/ui/Card"
import { PersonaBadge, PersonaDescription } from "@/components/ui/PersonaBadge"
import { Button } from "@/components/ui/Button"
import Link from "next/link"
import { ClipboardList, TrendingUp, BookOpen } from "lucide-react"

export default async function EmployeeDashboardPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== UserRole.EMPLOYEE) {
    redirect('/auth/login')
  }

  // Fetch employee data
  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true,
      personaHistory: {
        orderBy: { date: 'desc' },
        take: 5
      }
    }
  })

  if (!employee) {
    redirect('/auth/login')
  }

  async function handleSignOut() {
    'use server'
    await signOut()
  }

  const hasPersona = !!employee.currentPersona

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation role="EMPLOYEE" userName={session.user.name} onSignOut={handleSignOut} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {employee.user.name}!</h1>
          <p className="text-gray-600 mt-2">Track your AI adoption journey</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Persona */}
            {hasPersona ? (
              <Card title="Your AI Adoption Persona">
                <div className="space-y-4">
                  <div>
                    <PersonaBadge persona={employee.currentPersona!} size="lg" />
                  </div>
                  <PersonaDescription persona={employee.currentPersona!} />

                  {employee.winnerStatus && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">🏆</span>
                        <div>
                          <div className="font-semibold text-green-900">Winner Status</div>
                          <div className="text-sm text-green-700">
                            You've been identified as a high-performer! Score: {employee.winnerScore}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Your Progress</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Department:</span>{' '}
                        <span className="font-medium">{employee.department}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Role:</span>{' '}
                        <span className="font-medium">{employee.jobRole}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Technical Background:</span>{' '}
                        <span className="font-medium">{employee.technicalBackground}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">With us since:</span>{' '}
                        <span className="font-medium">
                          {new Date(employee.hireDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card title="Get Started">
                <div className="text-center py-8">
                  <ClipboardList className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Take Your First Assessment
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Complete a 15-minute assessment to discover your AI adoption persona and receive
                    personalized coaching recommendations.
                  </p>
                  <Link href="/employee/assessment">
                    <Button size="lg">Start Assessment</Button>
                  </Link>
                </div>
              </Card>
            )}

            {/* Persona History */}
            {employee.personaHistory.length > 0 && (
              <Card title="Your Journey" description="Persona evolution over time">
                <div className="space-y-3">
                  {employee.personaHistory.map((history, index) => (
                    <div
                      key={history.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <PersonaBadge persona={history.persona} size="sm" />
                        <span className="text-sm text-gray-600">
                          {new Date(history.date).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        Confidence: {Math.round(history.confidence)}%
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card title="Quick Actions">
              <div className="space-y-3">
                <Link href="/employee/assessment">
                  <button className="w-full flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left">
                    <ClipboardList className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="text-sm font-medium text-blue-900">
                        {hasPersona ? 'Retake Assessment' : 'Take Assessment'}
                      </div>
                      <div className="text-xs text-blue-700">~15 minutes</div>
                    </div>
                  </button>
                </Link>

                <button className="w-full flex items-center space-x-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-sm font-medium text-green-900">View Progress</div>
                    <div className="text-xs text-green-700">Track your growth</div>
                  </div>
                </button>

                <button className="w-full flex items-center space-x-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="text-sm font-medium text-purple-900">Learning Resources</div>
                    <div className="text-xs text-purple-700">Recommended for you</div>
                  </div>
                </button>
              </div>
            </Card>

            {/* Tips */}
            {hasPersona && (
              <Card title="Tips for Growth">
                <div className="space-y-3 text-sm text-gray-600">
                  {employee.currentPersona === 'EMERGING' && (
                    <>
                      <p>💡 Try using AI for one task daily to build consistency</p>
                      <p>🤝 Find a buddy who uses AI regularly</p>
                      <p>✨ Start with email drafting or summarization</p>
                    </>
                  )}
                  {employee.currentPersona === 'TRAILBLAZER' && (
                    <>
                      <p>🎯 Consider mentoring 2-3 colleagues</p>
                      <p>📝 Document your best workflows</p>
                      <p>🚀 Explore advanced techniques like prompt chaining</p>
                    </>
                  )}
                  {employee.currentPersona === 'ESTABLISHED' && (
                    <>
                      <p>📈 Try expanding to 1 new use case this month</p>
                      <p>🔧 Experiment with a new AI tool</p>
                      <p>👥 Share your success stories with the team</p>
                    </>
                  )}
                  {employee.currentPersona === 'OVERWHELMED' && (
                    <>
                      <p>🎯 Focus on just one simple task</p>
                      <p>✅ Embrace "good enough" outputs</p>
                      <p>🤝 Ask for help from your coach</p>
                    </>
                  )}
                  {employee.currentPersona === 'RESISTANT' && (
                    <>
                      <p>💭 Your concerns are valid</p>
                      <p>🔒 Review our AI ethics policy</p>
                      <p>🗣️ Talk to your coach about specific worries</p>
                    </>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
