'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { assessmentQuestions, getSectionQuestions, getTotalSections } from '@/lib/assessment-questions'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Brain, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function AssessmentPage() {
  const router = useRouter()
  const [currentSection, setCurrentSection] = useState(1)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)

  const totalSections = getTotalSections()
  const sectionQuestions = getSectionQuestions(currentSection)
  const progress = (currentSection / totalSections) * 100

  const handleResponse = (questionId: string, value: any) => {
    setResponses(prev => ({ ...prev, [questionId]: value }))
  }

  const handleNext = () => {
    if (currentSection < totalSections) {
      setCurrentSection(prev => prev + 1)
      window.scrollTo(0, 0)
    }
  }

  const handlePrevious = () => {
    if (currentSection > 1) {
      setCurrentSection(prev => prev - 1)
      window.scrollTo(0, 0)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/assessments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses })
      })

      if (response.ok) {
        router.push('/employee/results')
      } else {
        alert('Failed to submit assessment. Please try again.')
        setLoading(false)
      }
    } catch (error) {
      console.error('Submission error:', error)
      alert('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  const isSectionComplete = sectionQuestions.every(q =>
    q.required ? responses[q.id] !== undefined && responses[q.id] !== '' : true
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/employee" className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-bold">PersonaIQ Assessment</span>
            </Link>
            <div className="text-sm text-gray-600">
              Section {currentSection} of {totalSections}
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
              Please answer all questions honestly. This assessment takes about 15 minutes.
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

                  {/* Ranking (simplified as text input for demo) */}
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

            <div className="text-sm text-gray-600">
              {Object.keys(responses).length} / {assessmentQuestions.length} answered
            </div>

            {currentSection < totalSections ? (
              <Button onClick={handleNext} disabled={!isSectionComplete}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} loading={loading} disabled={!isSectionComplete}>
                Submit Assessment
              </Button>
            )}
          </div>
        </Card>
      </main>
    </div>
  )
}
