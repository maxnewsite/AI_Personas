import Link from 'next/link'
import { ArrowRight, BarChart3, Users, Target, Brain } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">PersonaIQ</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="btn btn-primary"
              >
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Accelerate AI Adoption
            <br />
            <span className="text-blue-600">Across Your Organization</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Identify which of five AI adoption personas each employee belongs to,
            then provide personalized coaching and track progress in real-time.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link href="/auth/register" className="btn btn-primary text-lg px-8 py-3">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="#features" className="btn btn-secondary text-lg px-8 py-3">
              Learn More
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">15 min</div>
            <div className="text-gray-600">Per Assessment</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">85%+</div>
            <div className="text-gray-600">Classification Accuracy</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">5</div>
            <div className="text-gray-600">AI Personas</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">Real-time</div>
            <div className="text-gray-600">Analytics</div>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="mb-20">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything you need to drive AI adoption
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card">
              <div className="bg-blue-100 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Persona Classification
              </h4>
              <p className="text-gray-600">
                Automatically classify employees into 5 personas: Trailblazer, Established,
                Emerging, Overwhelmed, or Resistant.
              </p>
            </div>

            <div className="card">
              <div className="bg-green-100 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Personalized Coaching
              </h4>
              <p className="text-gray-600">
                Generate custom coaching plans for each employee based on their persona,
                barriers, and goals.
              </p>
            </div>

            <div className="card">
              <div className="bg-purple-100 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Analytics Dashboard
              </h4>
              <p className="text-gray-600">
                Track organizational AI readiness, persona distribution, and identify
                high-potential winners.
              </p>
            </div>
          </div>
        </div>

        {/* The 5 Personas */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            The Five AI Adoption Personas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg shadow-sm border-2 border-green-200 p-6">
              <div className="persona-badge persona-badge-trailblazer mb-3">
                Trailblazer
              </div>
              <p className="text-sm text-gray-600">
                Advanced users who experiment, share, and lead AI adoption
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border-2 border-blue-200 p-6">
              <div className="persona-badge persona-badge-established mb-3">
                Established
              </div>
              <p className="text-sm text-gray-600">
                Consistent users with established AI workflows
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border-2 border-yellow-200 p-6">
              <div className="persona-badge persona-badge-emerging mb-3">
                Emerging
              </div>
              <p className="text-sm text-gray-600">
                Positive attitude but inconsistent usage and low confidence
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border-2 border-orange-200 p-6">
              <div className="persona-badge persona-badge-overwhelmed mb-3">
                Overwhelmed
              </div>
              <p className="text-sm text-gray-600">
                Struggle with task decomposition and delegation
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border-2 border-red-200 p-6">
              <div className="persona-badge persona-badge-resistant mb-3">
                Resistant
              </div>
              <p className="text-sm text-gray-600">
                Concerns about ethics, job security, or prefer traditional methods
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-blue-600 rounded-2xl p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">
            Ready to transform your organization's AI adoption?
          </h3>
          <p className="text-xl mb-8 text-blue-100">
            Start with a free assessment of up to 100 employees
          </p>
          <Link href="/auth/register" className="btn bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3">
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 PersonaIQ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
