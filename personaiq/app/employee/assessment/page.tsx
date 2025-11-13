'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { assessmentQuestions, getSectionQuestions, getTotalSections } from '@/lib/assessment-questions'
import { classifyPersona } from '@/lib/algorithms/persona-classification'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Chatbot } from '@/components/ai/Chatbot'
import { Brain, ChevronLeft, ChevronRight, Save, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function AssessmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // URL parameters
  const campaignId = searchParams.get('campaign')
  const employeeId = searchParams.get('employee')
  const assessmentToken = searchParams.get('token')

  // State
  const [currentSection, setCurrentSection] = useState(1)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [campaignInfo, setCampaignInfo] = useState<any>(null)
  const [employeeInfo, setEmployeeInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [hasEnded, setHasEnded] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const totalSections = getTotalSections()
  const sectionQuestions = getSectionQuestions(currentSection)
  const progress = (currentSection / totalSections) * 100
  const totalAnswered = Object.keys(responses).length

  // Load saved progress on mount
  useEffect(() => {
    async function loadProgress() {
      if (!assessmentToken) {
        setError('Invalid assessment link. Please use the link from your invitation email.')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/assessments/save?token=${assessmentToken}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load assessment')
        }

        setCampaignInfo(data.campaign)
        setEmployeeInfo(data.employee)
        setHasEnded(data.hasEnded)
        setIsCompleted(data.isCompleted)

        if (data.assessment.responses) {
          setResponses(data.assessment.responses)
          setLastSaved(new Date(data.assessment.lastSaved))
        }

        setLoading(false)
      } catch (err: any) {
        console.error('Error loading assessment:', err)
        setError(err.message || 'Failed to load assessment')
        setLoading(false)
      }
    }

    loadProgress()
  }, [assessmentToken])

  // Auto-save function
  const saveProgress = useCallback(async (showNotification = false) => {
    if (!assessmentToken || !autoSaveEnabled) return

    setSaving(true)

    try {
      const response = await fetch('/api/assessments/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentToken,
          responses,
          currentSection
        })
      })

      const data = await response.json()

      if (response.ok) {
        setLastSaved(new Date(data.lastSaved))
        if (showNotification) {
          // Could show a toast notification here
        }
      }
    } catch (error) {
      console.error('Auto-save error:', error)
    } finally {
      setSaving(false)
    }
  }, [assessmentToken, responses, currentSection, autoSaveEnabled])

  // Auto-save on response change (debounced)
  useEffect(() => {
    if (Object.keys(responses).length === 0) return

    const timeout = setTimeout(() => {
      saveProgress()
    }, 2000) // Save 2 seconds after last change

    return () => clearTimeout(timeout)
  }, [responses, saveProgress])

  const handleResponse = (questionId: string, value: any) => {
    setResponses(prev => ({ ...prev, [questionId]: value }))
  }

  const handleNext = () => {
    if (currentSection < totalSections) {
      setCurrentSection(prev => prev + 1)
      window.scrollTo(0, 0)
      saveProgress() // Save when moving to next section
    }
  }

  const handlePrevious = () => {
    if (currentSection > 1) {
      setCurrentSection(prev => prev - 1)
      window.scrollTo(0, 0)
    }
  }

  const handleSaveAndExit = async () => {
    await saveProgress(true)
    router.push('/employee')
  }

  const handleSubmit = async () => {
    setSubmitting(true)

    try {
      // First, save the final responses
      await saveProgress()

      // Calculate persona classification
      const startTime = new Date(campaignInfo?.startDate || Date.now())
      const classification = classifyPersona(responses, startTime)

      // Submit the assessment
      const response = await fetch('/api/assessments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentToken,
          responses,
          classification
        })
      })

      if (response.ok) {
        if (campaignInfo?.showResultsToParticipant) {
          router.push(`/employee/results?token=${assessmentToken}`)
        } else {
          router.push('/employee?submitted=true')
        }
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to submit assessment. Please try again.')
        setSubmitting(false)
      }
    } catch (error) {
      console.error('Submission error:', error)
      alert('An error occurred. Please try again.')
      setSubmitting(false)
    }
  }

  const isSectionComplete = sectionQuestions.every(q =>
    q.required ? responses[q.id] !== undefined && responses[q.id] !== '' : true
  )

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link href="/employee">
              <Button>Return to Dashboard</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  // Show completed state
  if (isCompleted && !campaignInfo?.allowRetakes) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Assessment Completed</h2>
            <p className="text-gray-600 mb-4">
              You've already completed this assessment. Thank you for your participation!
            </p>
            <Link href="/employee">
              <Button>Return to Dashboard</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  // Show ended state
  if (hasEnded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <div className="text-center">
            <Clock className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Assessment Closed</h2>
            <p className="text-gray-600 mb-4">
              This assessment has closed. Please contact your administrator if you need access.
            </p>
            <Link href="/employee">
              <Button>Return to Dashboard</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-blue-600" />
              <div>
                <span className="text-lg font-bold">{campaignInfo?.name}</span>
                <div className="text-xs text-gray-500">
                  Welcome, {employeeInfo?.name}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Last Saved Indicator */}
              {lastSaved && (
                <div className="text-xs text-gray-500 flex items-center">
                  {saving ? (
                    <>
                      <div className="animate-spin h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                      Saved {new Date(lastSaved).toLocaleTimeString()}
                    </>
                  )}
                </div>
              )}
              <div className="text-sm text-gray-600">
                Section {currentSection} of {totalSections}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {sectionQuestions[0]?.sectionName}
            </h2>
            <p className="text-gray-600">
              Please answer all questions honestly. Your responses are confidential.
            </p>
          </div>

          <div className="space-y-8">
            {sectionQuestions.map((question, index) => (
              <div key={question.id} className="pb-6 border-b border-gray-200 last:border-0">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    {index + 1}. {question.question}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </label>

                  {/* Likert Scale */}
                  {question.type === 'likert' && (
                    <div className="flex items-center justify-between gap-2">
                      {[1, 2, 3, 4, 5].map(value => (
                        <button
                          key={value}
                          onClick={() => handleResponse(question.id, value)}
                          className={`flex-1 p-3 text-center rounded-lg border-2 transition-all ${
                            responses[question.id] === value
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-lg font-semibold">{value}</div>
                          <div className="text-xs mt-1">
                            {value === 1 && 'Strongly Disagree'}
                            {value === 2 && 'Disagree'}
                            {value === 3 && 'Neutral'}
                            {value === 4 && 'Agree'}
                            {value === 5 && 'Strongly Agree'}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Single Choice */}
                  {question.type === 'single-choice' && (
                    <div className="space-y-2">
                      {question.options?.map(option => (
                        <button
                          key={option}
                          onClick={() => handleResponse(question.id, option)}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                            responses[question.id] === option
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Multiple Choice */}
                  {question.type === 'multiple-choice' && (
                    <div className="space-y-2">
                      {question.options?.map(option => {
                        const selected = Array.isArray(responses[question.id])
                          ? responses[question.id].includes(option)
                          : false
                        return (
                          <button
                            key={option}
                            onClick={() => {
                              const current = Array.isArray(responses[question.id])
                                ? responses[question.id]
                                : []
                              const updated = selected
                                ? current.filter((item: string) => item !== option)
                                : [...current, option]
                              handleResponse(question.id, updated)
                            }}
                            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                              selected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center">
                              <div
                                className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                                  selected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                                }`}
                              >
                                {selected && <span className="text-white text-xs">✓</span>}
                              </div>
                              {option}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Text Input */}
                  {question.type === 'text' && (
                    <textarea
                      value={responses[question.id] || ''}
                      onChange={(e) => handleResponse(question.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Your answer..."
                    />
                  )}

                  {/* Ranking */}
                  {question.type === 'ranking' && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 mb-3">Select your top 3 in order:</p>
                      {question.options?.map(option => {
                        const currentRanking = Array.isArray(responses[question.id])
                          ? responses[question.id]
                          : []
                        const rank = currentRanking.indexOf(option) + 1

                        return (
                          <button
                            key={option}
                            onClick={() => {
                              let updated = [...currentRanking]
                              if (rank > 0) {
                                updated = updated.filter(item => item !== option)
                              } else if (updated.length < 3) {
                                updated.push(option)
                              }
                              handleResponse(question.id, updated)
                            }}
                            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                              rank > 0
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{option}</span>
                              {rank > 0 && (
                                <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                                  #{rank}
                                </span>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={handlePrevious}
              disabled={currentSection === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleSaveAndExit}
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                Save & Exit
              </Button>

              <div className="text-sm text-gray-600">
                {totalAnswered} / {assessmentQuestions.length} answered
              </div>

              {currentSection < totalSections ? (
                <Button onClick={handleNext} disabled={!isSectionComplete}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} loading={submitting} disabled={!isSectionComplete}>
                  Submit Assessment
                </Button>
              )}
            </div>
          </div>
        </Card>
      </main>

      {/* AI Chatbot Assistant */}
      <Chatbot />
    </div>
  )
}
