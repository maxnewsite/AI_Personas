'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { ArrowLeft, ChevronRight, ChevronLeft, Check } from 'lucide-react'

const STEPS = [
  { id: 1, name: 'Basic Info', description: 'Campaign details' },
  { id: 2, name: 'Target Audience', description: 'Who to assess' },
  { id: 3, name: 'Settings', description: 'Configure options' },
  { id: 4, name: 'Review', description: 'Confirm & launch' }
]

export default function NewCampaignPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    status: 'DRAFT',
    targetAll: true,
    targetDepartments: [] as string[],
    targetEmployeeIds: [] as string[],
    showResultsToParticipant: true,
    allowRetakes: false,
    sendReminders: true,
    reminderDays: 3
  })

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          setError('Campaign name is required')
          return false
        }
        if (!formData.startDate) {
          setError('Start date is required')
          return false
        }
        if (!formData.endDate) {
          setError('End date is required')
          return false
        }
        if (new Date(formData.startDate) >= new Date(formData.endDate)) {
          setError('End date must be after start date')
          return false
        }
        return true
      case 2:
        if (!formData.targetAll && formData.targetDepartments.length === 0 && formData.targetEmployeeIds.length === 0) {
          setError('Please select target audience or choose "All Employees"')
          return false
        }
        return true
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length))
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    setError('')
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create campaign')
      }

      router.push('/admin/campaigns')
    } catch (err: any) {
      setError(err.message || 'Failed to create campaign')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/admin/campaigns" className="text-blue-600 hover:text-blue-700 flex items-center mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create New Campaign</h1>
          <p className="text-gray-600 mt-2">Set up an assessment campaign for your organization</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      currentStep > step.id
                        ? 'bg-green-500 border-green-500'
                        : currentStep === step.id
                        ? 'bg-blue-600 border-blue-600'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-5 w-5 text-white" />
                    ) : (
                      <span
                        className={`text-sm font-semibold ${
                          currentStep === step.id ? 'text-white' : 'text-gray-500'
                        }`}
                      >
                        {step.id}
                      </span>
                    )}
                  </div>
                  <div className="ml-3">
                    <div
                      className={`text-sm font-medium ${
                        currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {step.name}
                    </div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Step Content */}
        <Card>
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>

              <Input
                label="Campaign Name"
                type="text"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="e.g., Q4 2024 AI Adoption Assessment"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => updateFormData('startDate', e.target.value)}
                  required
                />
                <Input
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => updateFormData('endDate', e.target.value)}
                  required
                />
              </div>

              <Select
                label="Initial Status"
                value={formData.status}
                onChange={(e) => updateFormData('status', e.target.value)}
                options={[
                  { value: 'DRAFT', label: 'Draft (not visible to employees)' },
                  { value: 'ACTIVE', label: 'Active (launch immediately)' }
                ]}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Target Audience</h2>

              <div className="space-y-4">
                <label className="flex items-start space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.targetAll}
                    onChange={() => updateFormData('targetAll', true)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">All Employees</div>
                    <div className="text-sm text-gray-600">Send assessment to everyone in the organization</div>
                  </div>
                </label>

                <label className="flex items-start space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer">
                  <input
                    type="radio"
                    checked={!formData.targetAll}
                    onChange={() => updateFormData('targetAll', false)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Specific Groups</div>
                    <div className="text-sm text-gray-600 mb-3">Target specific departments or employees</div>

                    {!formData.targetAll && (
                      <div className="space-y-3 pl-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Departments (comma-separated)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., Engineering, Marketing, Sales"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            onChange={(e) =>
                              updateFormData('targetDepartments', e.target.value.split(',').map(d => d.trim()).filter(Boolean))
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Campaign Settings</h2>

              <div className="space-y-4">
                <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    checked={formData.showResultsToParticipant}
                    onChange={(e) => updateFormData('showResultsToParticipant', e.target.checked)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Show Results to Participants</div>
                    <div className="text-sm text-gray-600">
                      Employees will see their persona classification after completing the assessment
                    </div>
                  </div>
                </label>

                <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    checked={formData.allowRetakes}
                    onChange={(e) => updateFormData('allowRetakes', e.target.checked)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Allow Retakes</div>
                    <div className="text-sm text-gray-600">
                      Employees can retake the assessment multiple times
                    </div>
                  </div>
                </label>

                <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    checked={formData.sendReminders}
                    onChange={(e) => updateFormData('sendReminders', e.target.checked)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Send Reminders</div>
                    <div className="text-sm text-gray-600 mb-3">
                      Automatically remind employees who haven't completed the assessment
                    </div>

                    {formData.sendReminders && (
                      <div className="pl-6">
                        <Input
                          label="Reminder Frequency (days)"
                          type="number"
                          value={formData.reminderDays.toString()}
                          onChange={(e) => updateFormData('reminderDays', parseInt(e.target.value) || 3)}
                          min={1}
                          max={30}
                        />
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Review & Confirm</h2>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Campaign Details</h3>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-gray-500">Name</dt>
                      <dd className="font-medium text-gray-900">{formData.name}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Status</dt>
                      <dd className="font-medium text-gray-900">{formData.status}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Start Date</dt>
                      <dd className="font-medium text-gray-900">
                        {new Date(formData.startDate).toLocaleDateString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">End Date</dt>
                      <dd className="font-medium text-gray-900">
                        {new Date(formData.endDate).toLocaleDateString()}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Target Audience</h3>
                  <p className="text-sm text-gray-700">
                    {formData.targetAll
                      ? 'All employees'
                      : formData.targetDepartments.length > 0
                      ? `Departments: ${formData.targetDepartments.join(', ')}`
                      : 'Specific employees'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Settings</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center">
                      <span className={formData.showResultsToParticipant ? 'text-green-600' : 'text-gray-400'}>
                        {formData.showResultsToParticipant ? '✓' : '✗'}
                      </span>
                      <span className="ml-2">Show results to participants</span>
                    </li>
                    <li className="flex items-center">
                      <span className={formData.allowRetakes ? 'text-green-600' : 'text-gray-400'}>
                        {formData.allowRetakes ? '✓' : '✗'}
                      </span>
                      <span className="ml-2">Allow retakes</span>
                    </li>
                    <li className="flex items-center">
                      <span className={formData.sendReminders ? 'text-green-600' : 'text-gray-400'}>
                        {formData.sendReminders ? '✓' : '✗'}
                      </span>
                      <span className="ml-2">
                        Send reminders{formData.sendReminders && ` (every ${formData.reminderDays} days)`}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div className="flex items-center space-x-3">
              <Link href="/admin/campaigns">
                <Button variant="ghost" disabled={loading}>
                  Cancel
                </Button>
              </Link>

              {currentStep < STEPS.length ? (
                <Button variant="primary" onClick={handleNext} disabled={loading}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Campaign'}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
