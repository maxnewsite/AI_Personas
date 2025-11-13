'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Brain, Loader2, X, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react'

interface CampaignAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative'
  keyThemes: string[]
  concerns: string[]
  opportunities: string[]
  summary: string
}

interface AICampaignAnalysisButtonProps {
  campaignId: string
  campaignName: string
}

export function AICampaignAnalysisButton({ campaignId, campaignName }: AICampaignAnalysisButtonProps) {
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<CampaignAnalysis | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  const analyzeResponses = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze responses')
      }

      setAnalysis(data.analysis)
      setStats({
        responsesAnalyzed: data.responsesAnalyzed,
        freeTextCount: data.freeTextCount
      })
      setShowModal(true)
    } catch (err: any) {
      console.error('Error analyzing campaign:', err)
      setError(err.message || 'Failed to analyze campaign')
    } finally {
      setLoading(false)
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100'
      case 'negative': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '😊'
      case 'negative': return '😟'
      default: return '😐'
    }
  }

  return (
    <>
      <Button
        onClick={analyzeResponses}
        disabled={loading}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Brain className="h-4 w-4 mr-2" />
            AI Analysis
          </>
        )}
      </Button>

      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Modal */}
      {showModal && analysis && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowModal(false)}
            />

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Brain className="h-6 w-6 text-white mr-3" />
                    <h3 className="text-xl font-bold text-white">
                      AI Campaign Analysis
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-white hover:text-gray-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <p className="text-sm text-indigo-100 mt-1">
                  {campaignName}
                </p>
                {stats && (
                  <p className="text-xs text-indigo-200 mt-1">
                    Analyzed {stats.responsesAnalyzed} responses ({stats.freeTextCount} text responses)
                  </p>
                )}
              </div>

              <div className="bg-white px-6 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Summary & Sentiment */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Overall Summary
                    </h4>
                    <p className="text-gray-700 bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                      {analysis.summary}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">
                      Sentiment Analysis
                    </h4>
                    <div className={`${getSentimentColor(analysis.sentiment)} px-4 py-3 rounded-lg font-semibold text-center`}>
                      <span className="text-2xl mr-2">{getSentimentIcon(analysis.sentiment)}</span>
                      <span className="capitalize">{analysis.sentiment}</span>
                    </div>
                  </div>
                </div>

                {/* Key Themes */}
                {analysis.keyThemes.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
                      Key Themes
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {analysis.keyThemes.map((theme, index) => (
                        <div
                          key={index}
                          className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-gray-700"
                        >
                          <div className="flex items-start">
                            <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500 text-white font-semibold flex items-center justify-center text-xs mr-2">
                              {index + 1}
                            </span>
                            <span className="text-sm">{theme}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Concerns */}
                {analysis.concerns.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                      Concerns Identified
                    </h4>
                    <ul className="space-y-2">
                      {analysis.concerns.map((concern, index) => (
                        <li
                          key={index}
                          className="flex items-start bg-orange-50 p-3 rounded-lg border border-orange-200"
                        >
                          <span className="text-orange-600 mr-2 font-bold">⚠</span>
                          <span className="text-gray-700">{concern}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Opportunities */}
                {analysis.opportunities.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <Lightbulb className="h-5 w-5 text-yellow-500 mr-2" />
                      Growth Opportunities
                    </h4>
                    <ul className="space-y-2">
                      {analysis.opportunities.map((opportunity, index) => (
                        <li
                          key={index}
                          className="flex items-start bg-green-50 p-3 rounded-lg border border-green-200"
                        >
                          <span className="text-green-600 mr-2 font-bold">💡</span>
                          <span className="text-gray-700">{opportunity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  AI-powered sentiment and theme analysis • Use insights to guide coaching strategy
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
