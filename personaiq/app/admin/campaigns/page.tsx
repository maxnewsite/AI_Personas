import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UserRole, CampaignStatus } from "@prisma/client"
import { prisma } from "@/lib/db"
import { Navigation } from "@/components/ui/Navigation"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import Link from "next/link"
import { Plus, Calendar, Users, TrendingUp, CheckCircle } from "lucide-react"

export default async function AdminCampaignsPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    redirect('/auth/login')
  }

  // Fetch all campaigns with response counts
  const campaigns = await prisma.campaign.findMany({
    include: {
      createdBy: { select: { name: true } },
      responses: { select: { id: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  async function handleSignOut() {
    'use server'
    await signOut()
  }

  // Calculate statistics
  const totalCampaigns = campaigns.length
  const activeCampaigns = campaigns.filter(c => c.status === CampaignStatus.ACTIVE).length
  const totalResponses = campaigns.reduce((sum, c) => sum + c.responses.length, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation role="ADMIN" userName={session.user.name} onSignOut={handleSignOut} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Campaign Management</h1>
              <p className="text-gray-600 mt-2">Create and manage assessment campaigns</p>
            </div>
            <Link href="/admin/campaigns/new">
              <Button variant="primary" size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Create Campaign
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalCampaigns}</div>
                <div className="text-sm text-gray-600">Total Campaigns</div>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{activeCampaigns}</div>
                <div className="text-sm text-gray-600">Active Now</div>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalResponses}</div>
                <div className="text-sm text-gray-600">Total Responses</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Campaigns List */}
        <Card title="All Campaigns">
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Create your first assessment campaign to start collecting persona data from employees.
              </p>
              <Link href="/admin/campaigns/new">
                <Button variant="primary" size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Campaign
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => {
                const statusColor = {
                  [CampaignStatus.DRAFT]: 'bg-gray-100 text-gray-800',
                  [CampaignStatus.ACTIVE]: 'bg-green-100 text-green-800',
                  [CampaignStatus.CLOSED]: 'bg-red-100 text-red-800'
                }[campaign.status]

                const isActive = campaign.status === CampaignStatus.ACTIVE
                const isPast = new Date(campaign.endDate) < new Date()
                const responsesCount = campaign.responses.length

                return (
                  <div
                    key={campaign.id}
                    className="p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                            {campaign.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Created by {campaign.createdBy.name} on{' '}
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Link href={`/admin/campaigns/${campaign.id}`}>
                        <Button variant="secondary" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Start Date</div>
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(campaign.startDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">End Date</div>
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(campaign.endDate).toLocaleDateString()}
                          {isPast && isActive && (
                            <span className="ml-2 text-xs text-orange-600">(Expired)</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Responses</div>
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {responsesCount}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Target</div>
                        <div className="text-sm font-medium text-gray-900">
                          {campaign.targetAll ? 'All Employees' : 'Selected Groups'}
                        </div>
                      </div>
                    </div>

                    {/* Settings Summary */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                      {campaign.showResultsToParticipant && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          ✓ Results Visible
                        </span>
                      )}
                      {campaign.allowRetakes && (
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                          ✓ Retakes Allowed
                        </span>
                      )}
                      {campaign.sendReminders && (
                        <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
                          ✓ Reminders Active
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}
