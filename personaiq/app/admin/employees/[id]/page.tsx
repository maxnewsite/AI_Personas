'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { PersonaBadge, PersonaDescription } from '@/components/ui/PersonaBadge'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { ArrowLeft, Edit, Save, X } from 'lucide-react'

export default function EmployeeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [employee, setEmployee] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [editData, setEditData] = useState({
    department: '',
    jobRole: '',
    technicalBackground: '',
    assignedCoachId: '',
    managerId: ''
  })

  useEffect(() => {
    fetchEmployee()
  }, [params.id])

  const fetchEmployee = async () => {
    try {
      const response = await fetch(`/api/employees/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch employee')
      const data = await response.json()
      setEmployee(data.employee)
      setEditData({
        department: data.employee.department,
        jobRole: data.employee.jobRole,
        technicalBackground: data.employee.technicalBackground,
        assignedCoachId: data.employee.assignedCoachId || '',
        managerId: data.employee.managerId || ''
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/employees/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update employee')
      }

      await fetchEmployee()
      setEditing(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Employee not found</div>
      </div>
    )
  }

  const hasPersona = !!employee.currentPersona

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/admin/employees" className="text-blue-600 hover:text-blue-700 flex items-center mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Employees
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{employee.user.name}</h1>
              <p className="text-gray-600 mt-1">{employee.user.email}</p>
            </div>
            {hasPersona && employee.currentPersona && (
              <PersonaBadge persona={employee.currentPersona} size="lg" />
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Employee Information */}
            <Card
              title="Employee Information"
              action={
                !editing ? (
                  <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : null
              }
            >
              {!editing ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Employee ID</div>
                    <div className="font-medium text-gray-900">{employee.employeeId}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Department</div>
                    <div className="font-medium text-gray-900">{employee.department}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Job Role</div>
                    <div className="font-medium text-gray-900">{employee.jobRole}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Technical Background</div>
                    <div className="font-medium text-gray-900">{employee.technicalBackground}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Hire Date</div>
                    <div className="font-medium text-gray-900">
                      {new Date(employee.hireDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Manager</div>
                    <div className="font-medium text-gray-900">
                      {employee.manager ? employee.manager.user.name : 'None'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Assigned Coach</div>
                    <div className="font-medium text-gray-900">
                      {employee.assignedCoach ? employee.assignedCoach.user.name : 'Unassigned'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Input
                    label="Department"
                    value={editData.department}
                    onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                  />
                  <Input
                    label="Job Role"
                    value={editData.jobRole}
                    onChange={(e) => setEditData({ ...editData, jobRole: e.target.value })}
                  />
                  <Select
                    label="Technical Background"
                    value={editData.technicalBackground}
                    onChange={(e) => setEditData({ ...editData, technicalBackground: e.target.value })}
                    options={[
                      { value: 'NONE', label: 'None' },
                      { value: 'BASIC', label: 'Basic' },
                      { value: 'INTERMEDIATE', label: 'Intermediate' },
                      { value: 'ADVANCED', label: 'Advanced' }
                    ]}
                  />
                  <div className="flex items-center space-x-3 pt-4">
                    <Button variant="primary" onClick={handleSave} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditing(false)
                        setError('')
                      }}
                      disabled={saving}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Current Persona */}
            {hasPersona && (
              <Card title="Current Persona">
                <PersonaDescription persona={employee.currentPersona!} />
                {employee.winnerStatus && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">🏆</span>
                      <div>
                        <div className="font-semibold text-green-900">Winner Status</div>
                        <div className="text-sm text-green-700">
                          High-performer with score: {employee.winnerScore}
                        </div>
                        {employee.winnerPriority && (
                          <div className="text-xs text-green-600 mt-1">
                            Priority: {employee.winnerPriority}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Persona History */}
            {employee.personaHistory && employee.personaHistory.length > 0 && (
              <Card title="Persona Evolution" description="Historical progression over time">
                <div className="space-y-3">
                  {employee.personaHistory.map((history: any, index: number) => (
                    <div
                      key={history.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <PersonaBadge persona={history.persona} size="sm" />
                        <span className="text-sm text-gray-600">
                          {new Date(history.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-500">
                          Confidence: {Math.round(history.confidence)}%
                        </span>
                        {index === 0 && (
                          <div className="text-xs text-blue-600">Current</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Assessment History */}
            {employee.responses && employee.responses.length > 0 && (
              <Card title="Assessment History" description="Recent assessment submissions">
                <div className="space-y-3">
                  {employee.responses.map((response: any) => {
                    const daysAgo = response.completionDate
                      ? Math.floor((Date.now() - new Date(response.completionDate).getTime()) / (1000 * 60 * 60 * 24))
                      : null

                    return (
                      <div
                        key={response.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {response.personaClassification && (
                            <PersonaBadge persona={response.personaClassification} size="sm" />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {response.campaignId}
                            </div>
                            {response.completionDate && (
                              <div className="text-xs text-gray-500">
                                {new Date(response.completionDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {response.confidenceScore && (
                            <div className="text-sm text-gray-700">
                              {Math.round(response.confidenceScore)}% confidence
                            </div>
                          )}
                          {response.timeTaken && (
                            <div className="text-xs text-gray-500">{response.timeTaken} min</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card title="Quick Actions">
              <div className="space-y-2">
                <Button variant="secondary" size="sm" className="w-full">
                  Assign Coach
                </Button>
                <Button variant="secondary" size="sm" className="w-full">
                  Change Manager
                </Button>
                <Button variant="secondary" size="sm" className="w-full">
                  Manual Persona Override
                </Button>
                <Button variant="ghost" size="sm" className="w-full">
                  View Full Profile
                </Button>
              </div>
            </Card>

            {/* Status Summary */}
            <Card title="Status">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={hasPersona ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'}>
                    {hasPersona ? '✓ Assessed' : '⏳ Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Coach Assigned</span>
                  <span className={employee.assignedCoachId ? 'text-green-600' : 'text-orange-600'}>
                    {employee.assignedCoachId ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Winner Status</span>
                  <span className={employee.winnerStatus ? 'text-green-600' : 'text-gray-400'}>
                    {employee.winnerStatus ? '🏆 Winner' : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Assessments</span>
                  <span className="text-gray-900 font-medium">
                    {employee.responses?.length || 0}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
