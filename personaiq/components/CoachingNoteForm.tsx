'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { X } from 'lucide-react'

interface CoachingNoteFormProps {
  employeeId: string
  employeeName: string
  onCancel?: () => void
  onSuccess?: () => void
}

export function CoachingNoteForm({ employeeId, employeeName, onCancel, onSuccess }: CoachingNoteFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    sessionDate: new Date().toISOString().split('T')[0],
    sessionType: '',
    notes: '',
    actionItems: '',
    nextSteps: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.notes.trim()) {
      setError('Notes are required')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/coaching-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          ...formData
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create coaching note')
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create coaching note')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add Coaching Note</h2>
            <p className="text-sm text-gray-600 mt-1">Document your coaching session with {employeeName}</p>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Session Date"
            type="date"
            value={formData.sessionDate}
            onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
            required
          />
          <Select
            label="Session Type"
            value={formData.sessionType}
            onChange={(e) => setFormData({ ...formData, sessionType: e.target.value })}
            options={[
              { value: '', label: 'Select type...' },
              { value: '1:1 Coaching', label: '1:1 Coaching' },
              { value: 'Group Session', label: 'Group Session' },
              { value: 'Check-in', label: 'Check-in' },
              { value: 'Workshop', label: 'Workshop' },
              { value: 'Follow-up', label: 'Follow-up' }
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Notes *
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Document what was discussed, observations, insights..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Action Items
          </label>
          <textarea
            value={formData.actionItems}
            onChange={(e) => setFormData({ ...formData, actionItems: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Specific action items and commitments..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Next Steps
          </label>
          <textarea
            value={formData.nextSteps}
            onChange={(e) => setFormData({ ...formData, nextSteps: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Plan for next session, follow-up items..."
          />
        </div>

        <div className="flex items-center space-x-3 pt-4">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Coaching Note'}
          </Button>
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  )
}
