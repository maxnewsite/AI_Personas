'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { PersonaBadge } from '@/components/ui/PersonaBadge'
import { AlertTriangle, TrendingDown, X, Loader2 } from 'lucide-react'

interface RiskAnalysisButtonProps {
  campaignId?: string
  campaignName?: string
}

interface RiskPrediction {
  employeeId: string
  employeeName: string
  department: string
  currentPersona: string
  riskLevel: 'high' | 'medium' | 'low'
  riskScore: number
  riskFactors: string[]
  recommendation: string
  daysSinceLastAssessment: number
  confidenceScore: number
}

interface RiskSummary {
  total: number
  highRisk: number
  mediumRisk: number
  lowRisk: number
  avgRiskScore: number
}

export function RiskAnalysisButton({ campaignId, campaignName }: RiskAnalysisButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [predictions, setPredictions] = useState<RiskPrediction[]>([])
  const [summary, setSummary] = useState<RiskSummary | null>(null)
  const [aiInsights, setAiInsights] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filterLevel, setFilterLevel] = useState<'all' | 'high' | 'medium' | 'low'>('all')

  const handleAnalyze = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to perform risk analysis')
      }

      const data = await response.json()
      setPredictions(data.predictions)
      setSummary(data.summary)
      setAiInsights(data.aiInsights)
      setIsOpen(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const filteredPredictions = filterLevel === 'all'
    ? predictions
    : predictions.filter(p => p.riskLevel === filterLevel)

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high': return '🚨'
      case 'medium': return '⚠️'
      case 'low': return '✅'
      default: return '❓'
    }
  }

  return (
    <>
      <Button
        onClick={handleAnalyze}
        loading={loading}
        className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
      >
        <AlertTriangle className="h-4 w-4 mr-2" />
        Risk Analysis
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6" />
                  Risk Analysis
                  {campaignName && `: ${campaignName}`}
                </h2>
                <p className="text-red-50 mt-1">
                  Identify employees at risk of regression or needing intervention
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-red-100 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {summary && (
                <>
                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
                      <div className="text-sm text-gray-600">Total Analyzed</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <div className="text-2xl font-bold text-red-700">{summary.highRisk}</div>
                      <div className="text-sm text-red-600">High Risk</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <div className="text-2xl font-bold text-yellow-700">{summary.mediumRisk}</div>
                      <div className="text-sm text-yellow-600">Medium Risk</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="text-2xl font-bold text-green-700">{summary.lowRisk}</div>
                      <div className="text-sm text-green-600">Low Risk</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="text-2xl font-bold text-blue-700">{summary.avgRiskScore}</div>
                      <div className="text-sm text-blue-600">Avg Risk Score</div>
                    </div>
                  </div>

                  {/* AI Insights */}
                  {aiInsights && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 mb-6">
                      <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                        🤖 AI Insights
                      </h3>
                      <p className="text-sm text-purple-800 whitespace-pre-line">{aiInsights}</p>
                    </div>
                  )}

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-2 mb-4 border-b border-gray-200">
                    <button
                      onClick={() => setFilterLevel('all')}
                      className={`px-4 py-2 font-medium transition-colors ${
                        filterLevel === 'all'
                          ? 'border-b-2 border-blue-600 text-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      All ({predictions.length})
                    </button>
                    <button
                      onClick={() => setFilterLevel('high')}
                      className={`px-4 py-2 font-medium transition-colors ${
                        filterLevel === 'high'
                          ? 'border-b-2 border-red-600 text-red-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      High Risk ({summary.highRisk})
                    </button>
                    <button
                      onClick={() => setFilterLevel('medium')}
                      className={`px-4 py-2 font-medium transition-colors ${
                        filterLevel === 'medium'
                          ? 'border-b-2 border-yellow-600 text-yellow-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Medium Risk ({summary.mediumRisk})
                    </button>
                    <button
                      onClick={() => setFilterLevel('low')}
                      className={`px-4 py-2 font-medium transition-colors ${
                        filterLevel === 'low'
                          ? 'border-b-2 border-green-600 text-green-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Low Risk ({summary.lowRisk})
                    </button>
                  </div>

                  {/* Predictions Table */}
                  <div className="space-y-3">
                    {filteredPredictions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No employees found with {filterLevel} risk level
                      </div>
                    ) : (
                      filteredPredictions.map((pred) => (
                        <div
                          key={pred.employeeId}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{getRiskIcon(pred.riskLevel)}</span>
                              <div>
                                <h4 className="font-semibold text-gray-900">{pred.employeeName}</h4>
                                <p className="text-sm text-gray-600">{pred.department}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <PersonaBadge persona={pred.currentPersona as any} size="sm" />
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRiskBadgeColor(
                                  pred.riskLevel
                                )}`}
                              >
                                {pred.riskLevel.toUpperCase()} RISK
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <span className="text-xs text-gray-500">Risk Score:</span>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      pred.riskScore >= 50
                                        ? 'bg-red-500'
                                        : pred.riskScore >= 30
                                        ? 'bg-yellow-500'
                                        : 'bg-green-500'
                                    }`}
                                    style={{ width: `${pred.riskScore}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium">{pred.riskScore}/100</span>
                              </div>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Confidence Score:</span>
                              <div className="text-sm font-medium">{pred.confidenceScore}%</div>
                            </div>
                          </div>

                          {pred.riskFactors.length > 0 && (
                            <div className="mb-3">
                              <span className="text-xs text-gray-500 block mb-1">Risk Factors:</span>
                              <div className="flex flex-wrap gap-2">
                                {pred.riskFactors.map((factor, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded border border-orange-200"
                                  >
                                    {factor}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="bg-blue-50 border border-blue-200 rounded p-3">
                            <div className="text-xs text-blue-600 font-medium mb-1">
                              💡 Recommendation
                            </div>
                            <p className="text-sm text-blue-900">{pred.recommendation}</p>
                          </div>

                          {pred.daysSinceLastAssessment > 0 && (
                            <div className="mt-2 text-xs text-gray-500">
                              Last assessment: {pred.daysSinceLastAssessment} days ago
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end">
              <Button variant="secondary" onClick={() => setIsOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
