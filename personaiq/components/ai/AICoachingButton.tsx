'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Sparkles, Loader2, X, CheckCircle } from 'lucide-react'

interface AIRecommendation {
  summary: string
  actionItems: string[]
  sessionPlan: string
  redFlags: string[]
  estimatedSessionLength: string
}

interface AICoachingButtonProps {
  employeeId: string
  employeeName: string
  assessmentResponseId?: string
}

export function AICoachingButton({ employeeId, employeeName, assessmentResponseId }: AICoachingButtonProps) {
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<AIRecommendation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  const generateRecommendations = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/coaching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          assessmentResponseId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate recommendations')
      }

      setRecommendations(data.recommendations)
      setShowModal(true)
    } catch (err: any) {
      console.error('Error generating AI recommendations:', err)
      setError(err.message || 'Failed to generate recommendations')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        onClick={generateRecommendations}
        disabled={loading}
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            AI Recommendations
          </>
        )}
      </Button>

      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Modal */}
      {showModal && recommendations && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowModal(false)}
            />

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Sparkles className="h-6 w-6 text-white mr-3" />
                    <h3 className="text-xl font-bold text-white">
                      AI-Powered Coaching Recommendations
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-white hover:text-gray-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <p className="text-sm text-purple-100 mt-1">
                  For {employeeName}
                </p>
              </div>

              <div className="bg-white px-6 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Summary */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    Summary
                  </h4>
                  <p className="text-gray-700 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    {recommendations.summary}
                  </p>
                </div>

                {/* Red Flags */}
                {recommendations.redFlags.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <svg className="h-5 w-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Urgent Concerns
                    </h4>
                    <ul className="space-y-2">
                      {recommendations.redFlags.map((flag, index) => (
                        <li key={index} className="flex items-start bg-red-50 p-3 rounded-lg border border-red-200">
                          <span className="text-red-600 mr-2 font-bold">!</span>
                          <span className="text-gray-700">{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Items */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    Action Items
                  </h4>
                  <ul className="space-y-2">
                    {recommendations.actionItems.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 text-blue-600 font-semibold flex items-center justify-center text-sm mr-3 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Session Plan */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Recommended Session Plan
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-wrap">{recommendations.sessionPlan}</p>
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <span className="text-sm font-medium text-gray-600">
                        Estimated Duration:
                      </span>
                      <span className="ml-2 text-sm text-gray-900 font-semibold">
                        {recommendations.estimatedSessionLength}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  AI-generated recommendations • Review and adapt based on your expertise
                </p>
                <Button onClick={() => setShowModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
