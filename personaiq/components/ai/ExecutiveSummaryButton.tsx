'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { PersonaBadge } from '@/components/ui/PersonaBadge'
import { FileText, X, Download, Copy, Check } from 'lucide-react'
import { PersonaType } from '@prisma/client'

interface ExecutiveSummaryButtonProps {
  campaignId: string
  campaignName: string
}

interface SummaryData {
  summary: string
  stats: {
    total: number
    completed: number
    avgConfidence: number
  }
  personaDistribution: Record<PersonaType, number>
  topConcerns: string[]
  completionRate: number
}

export function ExecutiveSummaryButton({ campaignId, campaignName }: ExecutiveSummaryButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<SummaryData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate executive summary')
      }

      const result = await response.json()
      setData(result)
      setIsOpen(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!data) return

    const text = `
EXECUTIVE SUMMARY: ${campaignName}

${data.summary}

KEY METRICS:
- Completion Rate: ${data.completionRate}%
- Total Responses: ${data.stats.completed} of ${data.stats.total}
- Average Confidence: ${data.stats.avgConfidence}%

PERSONA DISTRIBUTION:
${Object.entries(data.personaDistribution).map(([persona, count]) =>
  `- ${persona}: ${count} (${Math.round((count/data.stats.completed)*100)}%)`
).join('\n')}

TOP CONCERNS:
${data.topConcerns.map((concern, i) => `${i + 1}. ${concern}`).join('\n')}
    `.trim()

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!data) return

    const text = `
EXECUTIVE SUMMARY
Campaign: ${campaignName}
Generated: ${new Date().toLocaleString()}

${data.summary}

═══════════════════════════════════════════════════════

KEY METRICS

Completion Rate: ${data.completionRate}%
Total Responses: ${data.stats.completed} of ${data.stats.total}
Average Confidence: ${data.stats.avgConfidence}%

═══════════════════════════════════════════════════════

PERSONA DISTRIBUTION

${Object.entries(data.personaDistribution)
  .sort(([, a], [, b]) => b - a)
  .map(([persona, count]) =>
    `${persona.padEnd(15)} ${count.toString().padStart(3)} employees (${Math.round((count/data.stats.completed)*100).toString().padStart(2)}%)`
  ).join('\n')}

═══════════════════════════════════════════════════════

TOP CONCERNS

${data.topConcerns.map((concern, i) => `${i + 1}. ${concern}`).join('\n\n')}

═══════════════════════════════════════════════════════

This summary was generated using AI-powered analysis of assessment responses.
For questions or detailed insights, please contact your PersonaIQ administrator.
    `.trim()

    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `executive-summary-${campaignName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Button
        onClick={handleGenerate}
        loading={loading}
        size="sm"
        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
      >
        <FileText className="h-4 w-4 mr-2" />
        Executive Summary
      </Button>

      {isOpen && data && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  Executive Summary
                </h2>
                <p className="text-emerald-50 mt-1">{campaignName}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-emerald-100 transition-colors"
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

              {/* AI-Generated Summary */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                  🤖 AI-Generated Insights
                </h3>
                <p className="text-emerald-900 leading-relaxed whitespace-pre-line">{data.summary}</p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm text-blue-600 mb-1">Completion Rate</div>
                  <div className="text-3xl font-bold text-blue-900">{data.completionRate}%</div>
                  <div className="text-xs text-blue-600 mt-1">
                    {data.stats.completed} of {data.stats.total} responses
                  </div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-sm text-purple-600 mb-1">Avg Confidence</div>
                  <div className="text-3xl font-bold text-purple-900">{data.stats.avgConfidence}%</div>
                  <div className="text-xs text-purple-600 mt-1">
                    Classification accuracy
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-sm text-green-600 mb-1">Participants</div>
                  <div className="text-3xl font-bold text-green-900">{data.stats.completed}</div>
                  <div className="text-xs text-green-600 mt-1">
                    Completed assessments
                  </div>
                </div>
              </div>

              {/* Persona Distribution */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Persona Distribution</h3>
                <div className="space-y-3">
                  {Object.entries(data.personaDistribution)
                    .sort(([, a], [, b]) => b - a)
                    .map(([persona, count]) => {
                      const percentage = Math.round((count / data.stats.completed) * 100)
                      return (
                        <div key={persona} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <PersonaBadge persona={persona as PersonaType} size="sm" />
                              <span className="text-sm text-gray-600">{count} employees</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{percentage}%</span>
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
              </div>

              {/* Top Concerns */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Top Concerns</h3>
                <div className="space-y-3">
                  {data.topConcerns.map((concern, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-200 text-orange-800 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <p className="text-sm text-orange-900">{concern}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-between items-center">
              <div className="text-xs text-gray-500">
                Generated: {new Date().toLocaleString()}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopy}
                  className="flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDownload}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && !isOpen && (
        <div className="mt-2 text-xs text-red-600">
          {error}
        </div>
      )}
    </>
  )
}
