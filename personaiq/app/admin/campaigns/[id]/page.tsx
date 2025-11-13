import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UserRole, CampaignStatus, PersonaType } from "@prisma/client"
import { prisma } from "@/lib/db"
import { Navigation } from "@/components/ui/Navigation"
import { Card, DashboardStat } from "@/components/ui/Card"
import { PersonaBadge } from "@/components/ui/PersonaBadge"
import { Button } from "@/components/ui/Button"
import Link from "next/link"
import { ArrowLeft, Users, CheckCircle, TrendingUp, Calendar } from "lucide-react"

export default async function CampaignDetailPage({
  params
}: {
  params: { id: string }
}) {
  const session = await auth()

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    redirect('/auth/login')
  }

  // Fetch campaign with all responses
  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id },
    include: {
      createdBy: { select: { name: true, email: true } },
      responses: {
        include: {
          employee: {
            include: {
              user: { select: { name: true, email: true } }
            }
          }
        },
        orderBy: { completionDate: 'desc' }
      }
    }
  })

  if (!campaign) {
    redirect('/admin/campaigns')
  }

  async function handleSignOut() {
    'use server'
    await signOut()
  }

  // Calculate statistics
  const totalResponses = campaign.responses.length
  const completedResponses = campaign.responses.filter(r => r.completionDate).length
  const avgTimeTaken = completedResponses > 0
    ? Math.round(
        campaign.responses
          .filter(r => r.timeTaken)
          .reduce((sum, r) => sum + (r.timeTaken || 0), 0) / completedResponses
      )
    : 0

  // Persona distribution from responses
  const personaDistribution = campaign.responses.reduce((acc, response) => {
    if (response.personaClassification) {
      acc[response.personaClassification] = (acc[response.personaClassification] || 0) + 1
    }
    return acc
  }, {} as Record<PersonaType, number>)

  // Calculate average confidence
  const avgConfidence = completedResponses > 0
    ? Math.round(
        campaign.responses
          .filter(r => r.confidenceScore)
          .reduce((sum, r) => sum + (r.confidenceScore || 0), 0) / completedResponses
      )
    : 0

  const isActive = campaign.status === CampaignStatus.ACTIVE
  const isExpired = new Date(campaign.endDate) < new Date()
  const daysRemaining = Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation role="ADMIN" userName={session.user.name} onSignOut={handleSignOut} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/admin/campaigns" className="text-blue-600 hover:text-blue-700 flex items-center mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
              <p className="text-gray-600 mt-2">
                Created by {campaign.createdBy.name} on {new Date(campaign.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  campaign.status === CampaignStatus.ACTIVE
                    ? 'bg-green-100 text-green-800'
                    : campaign.status === CampaignStatus.DRAFT
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {campaign.status}
              </span>
              {isExpired && isActive && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  Expired
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <DashboardStat
            label="Total Responses"
            value={totalResponses}
            icon={<Users className="h-6 w-6" />}
          />
          <DashboardStat
            label="Completed"
            value={completedResponses}
            icon={<CheckCircle className="h-6 w-6" />}
          />
          <DashboardStat
            label="Avg Time Taken"
            value={avgTimeTaken > 0 ? `${avgTimeTaken}min` : 'N/A'}
            icon={<TrendingUp className="h-6 w-6" />}
          />
          <DashboardStat
            label={isExpired ? 'Ended' : 'Days Remaining'}
            value={isExpired ? 'Completed' : daysRemaining > 0 ? daysRemaining : 'Today'}
            icon={<Calendar className="h-6 w-6" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Persona Distribution */}
            <Card title="Persona Distribution" description="Assessment results breakdown">
              {Object.keys(personaDistribution).length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No responses yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(personaDistribution)
                    .sort(([, a], [, b]) => b - a)
                    .map(([persona, count]) => {
                      const percentage = totalResponses > 0
                        ? Math.round((count / totalResponses) * 100)
                        : 0
                      return (
                        <div key={persona} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <PersonaBadge persona={persona as PersonaType} size="sm" />
                              <span className="text-sm text-gray-600">{count} responses</span>
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

            {/* Recent Responses */}
            <Card title="Recent Responses" description="Latest assessment submissions">
              {campaign.responses.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No responses yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {campaign.responses.slice(0, 10).map((response) => {
                    const daysAgo = response.completionDate
                      ? Math.floor((Date.now() - new Date(response.completionDate).getTime()) / (1000 * 60 * 60 * 24))
                      : null

                    return (
                      <div
                        key={response.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <div>
                            <div className="font-medium text-gray-900">{response.employee.user.name}</div>
                            <div className="flex items-center space-x-2 mt-1">
                              {response.personaClassification && (
                                <PersonaBadge persona={response.personaClassification} size="sm" />
                              )}
                              <span className="text-xs text-gray-500">{response.employee.department}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {response.confidenceScore && (
                            <div className="text-sm font-medium text-gray-900">
                              {Math.round(response.confidenceScore)}% confidence
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Campaign Details */}
            <Card title="Campaign Details">
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-500">Start Date</div>
                  <div className="font-medium text-gray-900">
                    {new Date(campaign.startDate).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">End Date</div>
                  <div className="font-medium text-gray-900">
                    {new Date(campaign.endDate).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Target Audience</div>
                  <div className="font-medium text-gray-900">
                    {campaign.targetAll ? 'All Employees' : 'Selected Groups'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Average Confidence</div>
                  <div className="font-medium text-gray-900">{avgConfidence}%</div>
                </div>
              </div>
            </Card>

            {/* Settings */}
            <Card title="Settings">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Show Results</span>
                  <span className={campaign.showResultsToParticipant ? 'text-green-600' : 'text-gray-400'}>
                    {campaign.showResultsToParticipant ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Allow Retakes</span>
                  <span className={campaign.allowRetakes ? 'text-green-600' : 'text-gray-400'}>
                    {campaign.allowRetakes ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Send Reminders</span>
                  <span className={campaign.sendReminders ? 'text-green-600' : 'text-gray-400'}>
                    {campaign.sendReminders ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
                {campaign.sendReminders && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Reminder Frequency</span>
                    <span className="text-gray-900">Every {campaign.reminderDays} days</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Actions */}
            <Card title="Actions">
              <div className="space-y-2">
                <Button variant="secondary" size="sm" className="w-full">
                  Export Results
                </Button>
                <Button variant="secondary" size="sm" className="w-full">
                  Send Reminders
                </Button>
                {campaign.status === CampaignStatus.ACTIVE && (
                  <Button variant="ghost" size="sm" className="w-full text-red-600 hover:bg-red-50">
                    Close Campaign
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
