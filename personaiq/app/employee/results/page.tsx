import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UserRole } from "@prisma/client"
import { prisma } from "@/lib/db"
import { PersonaBadge, PersonaDescription } from "@/components/ui/PersonaBadge"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import Link from "next/link"
import { CheckCircle, TrendingUp, Target } from "lucide-react"

export default async function ResultsPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== UserRole.EMPLOYEE) {
    redirect('/auth/login')
  }

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true
    }
  })

  if (!employee || !employee.currentPersona) {
    redirect('/employee')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Assessment Complete!
          </h1>
          <p className="text-gray-600">
            Thank you for completing the AI Adoption Assessment
          </p>
        </div>

        {/* Persona Result */}
        <Card className="mb-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Your AI Adoption Persona
            </h2>
            <div className="flex justify-center mb-4">
              <PersonaBadge persona={employee.currentPersona} size="lg" />
            </div>
            <div className="max-w-2xl mx-auto">
              <PersonaDescription persona={employee.currentPersona} />
            </div>
          </div>
        </Card>

        {/* Winner Status */}
        {employee.winnerStatus && (
          <Card className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200">
            <div className="text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Congratulations, Winner!
              </h3>
              <p className="text-gray-700 mb-4">
                You've been identified as a high-performer in AI adoption!
              </p>
              <div className="inline-block bg-white rounded-lg px-6 py-3 shadow-sm">
                <div className="text-sm text-gray-600">Winner Score</div>
                <div className="text-3xl font-bold text-yellow-600">
                  {Math.round(employee.winnerScore)}/100
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Next Steps */}
        <Card title="What's Next?" className="mb-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Review Your Dashboard</h4>
                <p className="text-sm text-gray-600">
                  Explore your personalized dashboard with coaching recommendations and resources
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">2</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Connect with Your Coach</h4>
                <p className="text-sm text-gray-600">
                  Your coach will reach out to discuss personalized strategies for growth
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold">3</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Track Your Progress</h4>
                <p className="text-sm text-gray-600">
                  Retake assessments periodically to see how you're evolving
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Tips */}
        <Card title="Quick Tips for Your Persona">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900 mb-1 text-sm">Growth Focus</h4>
              <p className="text-xs text-gray-600">
                {employee.currentPersona === 'EMERGING' && 'Build consistency through daily practice'}
                {employee.currentPersona === 'TRAILBLAZER' && 'Scale impact through teaching others'}
                {employee.currentPersona === 'ESTABLISHED' && 'Expand your use case repertoire'}
                {employee.currentPersona === 'OVERWHELMED' && 'Start with task decomposition skills'}
                {employee.currentPersona === 'RESISTANT' && 'Explore AI that aligns with your values'}
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <Target className="h-6 w-6 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900 mb-1 text-sm">First Step</h4>
              <p className="text-xs text-gray-600">
                {employee.currentPersona === 'EMERGING' && 'Try AI for email drafting this week'}
                {employee.currentPersona === 'TRAILBLAZER' && 'Mentor one colleague this month'}
                {employee.currentPersona === 'ESTABLISHED' && 'Experiment with a new AI tool'}
                {employee.currentPersona === 'OVERWHELMED' && 'Practice with one low-stakes task'}
                {employee.currentPersona === 'RESISTANT' && 'Review the AI ethics framework'}
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-purple-600 mb-2" />
              <h4 className="font-medium text-gray-900 mb-1 text-sm">Success Metric</h4>
              <p className="text-xs text-gray-600">
                {employee.currentPersona === 'EMERGING' && '5-day usage streak achieved'}
                {employee.currentPersona === 'TRAILBLAZER' && 'Workshop delivered to peers'}
                {employee.currentPersona === 'ESTABLISHED' && 'New use case mastered'}
                {employee.currentPersona === 'OVERWHELMED' && 'Task delegated successfully'}
                {employee.currentPersona === 'RESISTANT' && 'Concerns discussed with coach'}
              </p>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-center space-x-4 mt-8">
          <Link href="/employee">
            <Button size="lg">Go to Dashboard</Button>
          </Link>
          <Link href="/employee/assessment">
            <Button variant="secondary" size="lg">Retake Assessment</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
