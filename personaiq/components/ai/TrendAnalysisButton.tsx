'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { TrendingUp, TrendingDown, Minus, X } from 'lucide-react'
import { PersonaType } from '@prisma/client'

interface TrendAnalysisButtonProps {
  className?: string
}

interface PersonaStats {
  current: number
  inflow: number
  outflow: number
}

interface TrendsData {
  totalTransitions: number
  progressions: number
  regressions: number
  stable: number
  byPersona: Record<PersonaType, PersonaStats>
}

export function TrendAnalysisButton({ className }: TrendAnalysisButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [trends, setTrends] = useState<TrendsData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/predict', {
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch trend analysis')
      }

      const data = await response.json()
      setTrends(data.trends)
      setIsOpen(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const getPersonaColor = (persona: PersonaType) => {
    switch (persona) {
      case 'TRAILBLAZER':
        return 'from-purple-500 to-pink-500'
      case 'ESTABLISHED':
        return 'from-blue-500 to-cyan-500'
      case 'EMERGING':
        return 'from-green-500 to-emerald-500'
      case 'OVERWHELMED':
        return 'from-yellow-500 to-orange-500'
      case 'RESISTANT':
        return 'from-red-500 to-rose-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const getPersonaEmoji = (persona: PersonaType) => {
    switch (persona) {
      case 'TRAILBLAZER':
        return '🚀'
      case 'ESTABLISHED':
        return '⭐'
      case 'EMERGING':
        return '🌱'
      case 'OVERWHELMED':
        return '😰'
      case 'RESISTANT':
        return '🛑'
      default:
        return '❓'
    }
  }

  const getPersonaLabel = (persona: PersonaType) => {
    return persona.charAt(0) + persona.slice(1).toLowerCase()
  }

  return (
    <>
      <Button
        onClick={handleAnalyze}
        loading={loading}
        className={`bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white ${className}`}
      >
        <TrendingUp className="h-4 w-4 mr-2" />
        Trend Analysis
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  Persona Evolution Trends
                </h2>
                <p className="text-indigo-50 mt-1">
                  Analyze persona transitions across your organization (Last 6 months)
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-indigo-100 transition-colors"
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

              {trends && (
                <>
                  {/* Overall Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                      <div className="text-3xl font-bold text-blue-900">{trends.totalTransitions}</div>
                      <div className="text-sm text-blue-700">Total Transitions</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <div className="text-3xl font-bold text-green-900">{trends.progressions}</div>
                      </div>
                      <div className="text-sm text-green-700">Progressions</div>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-red-600" />
                        <div className="text-3xl font-bold text-red-900">{trends.regressions}</div>
                      </div>
                      <div className="text-sm text-red-700">Regressions</div>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2">
                        <Minus className="h-5 w-5 text-gray-600" />
                        <div className="text-3xl font-bold text-gray-900">{trends.stable}</div>
                      </div>
                      <div className="text-sm text-gray-700">Stable</div>
                    </div>
                  </div>

                  {/* Progression/Regression Ratio */}
                  <div className="mb-8">
                    <h3 className="font-semibold text-gray-900 mb-3">Overall Movement</h3>
                    <div className="bg-gray-100 rounded-lg overflow-hidden h-12 flex">
                      {trends.progressions > 0 && (
                        <div
                          className="bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center text-white font-semibold"
                          style={{
                            width: `${
                              (trends.progressions / (trends.progressions + trends.regressions + trends.stable)) * 100
                            }%`
                          }}
                        >
                          {trends.progressions > 0 && `${trends.progressions} ⬆️`}
                        </div>
                      )}
                      {trends.regressions > 0 && (
                        <div
                          className="bg-gradient-to-r from-red-400 to-red-500 flex items-center justify-center text-white font-semibold"
                          style={{
                            width: `${
                              (trends.regressions / (trends.progressions + trends.regressions + trends.stable)) * 100
                            }%`
                          }}
                        >
                          {trends.regressions > 0 && `${trends.regressions} ⬇️`}
                        </div>
                      )}
                      {trends.stable > 0 && (
                        <div
                          className="bg-gradient-to-r from-gray-300 to-gray-400 flex items-center justify-center text-gray-700 font-semibold"
                          style={{
                            width: `${
                              (trends.stable / (trends.progressions + trends.regressions + trends.stable)) * 100
                            }%`
                          }}
                        >
                          {trends.stable > 0 && `${trends.stable} ➡️`}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>Progressions: {Math.round((trends.progressions / trends.totalTransitions) * 100)}%</span>
                      <span>Regressions: {Math.round((trends.regressions / trends.totalTransitions) * 100)}%</span>
                      <span>Stable: {Math.round((trends.stable / trends.totalTransitions) * 100)}%</span>
                    </div>
                  </div>

                  {/* Per-Persona Breakdown */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Persona Flow Analysis</h3>
                    <div className="space-y-4">
                      {Object.entries(trends.byPersona).map(([persona, stats]) => (
                        <div
                          key={persona}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-12 h-12 rounded-full bg-gradient-to-r ${getPersonaColor(
                                  persona as PersonaType
                                )} flex items-center justify-center text-2xl`}
                              >
                                {getPersonaEmoji(persona as PersonaType)}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {getPersonaLabel(persona as PersonaType)}
                                </h4>
                                <p className="text-sm text-gray-600">Current population: {stats.current}</p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-green-50 border border-green-200 rounded p-3">
                              <div className="flex items-center gap-2 text-green-700 mb-1">
                                <TrendingUp className="h-4 w-4" />
                                <span className="text-xs font-medium">Inflow</span>
                              </div>
                              <div className="text-2xl font-bold text-green-900">{stats.inflow}</div>
                              <div className="text-xs text-green-600">employees moved to this persona</div>
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded p-3">
                              <div className="flex items-center gap-2 text-red-700 mb-1">
                                <TrendingDown className="h-4 w-4" />
                                <span className="text-xs font-medium">Outflow</span>
                              </div>
                              <div className="text-2xl font-bold text-red-900">{stats.outflow}</div>
                              <div className="text-xs text-red-600">employees moved from this persona</div>
                            </div>
                          </div>

                          {/* Net Flow */}
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Net Flow:</span>
                              <span
                                className={`font-semibold ${
                                  stats.inflow - stats.outflow > 0
                                    ? 'text-green-700'
                                    : stats.inflow - stats.outflow < 0
                                    ? 'text-red-700'
                                    : 'text-gray-700'
                                }`}
                              >
                                {stats.inflow - stats.outflow > 0 && '+'}
                                {stats.inflow - stats.outflow}
                                {stats.inflow - stats.outflow > 0
                                  ? ' (growing)'
                                  : stats.inflow - stats.outflow < 0
                                  ? ' (shrinking)'
                                  : ' (stable)'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Insights */}
                  <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                      💡 Key Insights
                    </h3>
                    <ul className="space-y-2 text-sm text-purple-800">
                      {trends.progressions > trends.regressions ? (
                        <li>✅ More employees are progressing than regressing - great job!</li>
                      ) : trends.regressions > trends.progressions ? (
                        <li>⚠️ More regressions than progressions detected - investigate barriers</li>
                      ) : (
                        <li>➡️ Progressions and regressions are balanced</li>
                      )}
                      {trends.byPersona.TRAILBLAZER &&
                        trends.byPersona.TRAILBLAZER.inflow >
                          trends.byPersona.TRAILBLAZER.outflow && (
                          <li>🚀 Trailblazer persona is growing - excellent AI adoption momentum!</li>
                        )}
                      {trends.byPersona.RESISTANT &&
                        trends.byPersona.RESISTANT.inflow > trends.byPersona.RESISTANT.outflow && (
                          <li>
                            🛑 Resistant persona is growing - consider addressing organizational concerns
                          </li>
                        )}
                      {trends.byPersona.OVERWHELMED &&
                        trends.byPersona.OVERWHELMED.current > 0 && (
                          <li>
                            😰 {trends.byPersona.OVERWHELMED.current} employees are overwhelmed - provide
                            additional support
                          </li>
                        )}
                    </ul>
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
