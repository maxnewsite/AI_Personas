/**
 * Export Utilities for PersonaIQ
 * Handles CSV and PDF exports for campaigns, employees, and reports
 */

import { PersonaType, CampaignStatus } from '@prisma/client'

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV(data: any[], headers?: string[]): string {
  if (data.length === 0) return ''

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0])

  // Create CSV header row
  const headerRow = csvHeaders.join(',')

  // Create data rows
  const dataRows = data.map(row => {
    return csvHeaders.map(header => {
      const value = row[header]

      // Handle different data types
      if (value === null || value === undefined) {
        return ''
      }

      // Convert objects/arrays to JSON string
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`
      }

      // Escape quotes and wrap in quotes if contains comma or newline
      const stringValue = String(value)
      if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }

      return stringValue
    }).join(',')
  })

  return [headerRow, ...dataRows].join('\n')
}

/**
 * Export campaign summary data to CSV
 */
export function exportCampaignSummary(campaign: any, stats: any): string {
  const data = [{
    'Campaign ID': campaign.id,
    'Campaign Name': campaign.name,
    'Status': campaign.status,
    'Start Date': new Date(campaign.startDate).toLocaleDateString(),
    'End Date': new Date(campaign.endDate).toLocaleDateString(),
    'Target Audience': campaign.targetAll ? 'All Employees' : 'Specific Groups',
    'Total Invited': stats.totalInvited,
    'Completed': stats.completed,
    'In Progress': stats.inProgress,
    'Not Started': stats.notStarted,
    'Completion Rate': `${stats.completionRate}%`,
    'Avg Time (min)': stats.avgTimeTaken,
    'Avg Confidence': `${stats.avgConfidence}%`,
    'Created By': campaign.createdBy?.name || 'N/A',
    'Created At': new Date(campaign.createdAt).toLocaleString()
  }]

  return arrayToCSV(data)
}

/**
 * Export campaign responses to CSV
 */
export function exportCampaignResponses(responses: any[]): string {
  const data = responses.map(response => ({
    'Employee Name': response.employee?.user?.name || 'N/A',
    'Employee Email': response.employee?.user?.email || 'N/A',
    'Employee ID': response.employee?.employeeId || 'N/A',
    'Department': response.employee?.department || 'N/A',
    'Job Role': response.employee?.jobRole || 'N/A',
    'Persona Classification': response.personaClassification || 'Not Completed',
    'Confidence Score': response.confidenceScore ? `${Math.round(response.confidenceScore)}%` : 'N/A',
    'Completion Status': response.completionDate ? 'Completed' : 'In Progress',
    'Completion Date': response.completionDate ? new Date(response.completionDate).toLocaleString() : 'N/A',
    'Time Taken (min)': response.timeTaken || 'N/A',
    'Winner Status': response.employee?.winnerStatus ? 'Yes' : 'No',
    'Winner Score': response.employee?.winnerScore || 'N/A',
    'Assigned Coach': response.employee?.assignedCoach?.user?.name || 'Not Assigned',
    'Started At': new Date(response.createdAt).toLocaleString()
  }))

  return arrayToCSV(data)
}

/**
 * Export detailed assessment responses with all questions
 */
export function exportDetailedResponses(responses: any[], questions: any[]): string {
  const data = responses.map(response => {
    const baseData: any = {
      'Employee Name': response.employee?.user?.name || 'N/A',
      'Employee Email': response.employee?.user?.email || 'N/A',
      'Persona': response.personaClassification || 'N/A',
      'Confidence': response.confidenceScore ? `${Math.round(response.confidenceScore)}%` : 'N/A'
    }

    // Add dimension scores
    if (response.dimensionScores) {
      Object.entries(response.dimensionScores).forEach(([dimension, score]) => {
        baseData[`Dimension: ${dimension}`] = score
      })
    }

    // Add individual question responses
    if (response.responses) {
      questions.forEach(q => {
        const answer = response.responses[q.id]
        const questionText = q.question.substring(0, 50) // Truncate for CSV
        baseData[`Q${q.id}: ${questionText}`] = Array.isArray(answer)
          ? answer.join('; ')
          : answer || 'N/A'
      })
    }

    return baseData
  })

  return arrayToCSV(data)
}

/**
 * Export persona distribution data
 */
export function exportPersonaDistribution(distribution: Record<PersonaType, number>, total: number): string {
  const data = Object.entries(distribution).map(([persona, count]) => ({
    'Persona': persona,
    'Count': count,
    'Percentage': `${Math.round((count / total) * 100)}%`
  }))

  // Add total row
  data.push({
    'Persona': 'TOTAL',
    'Count': total,
    'Percentage': '100%'
  })

  return arrayToCSV(data)
}

/**
 * Export employees data to CSV
 */
export function exportEmployees(employees: any[]): string {
  const data = employees.map(employee => ({
    'Employee ID': employee.employeeId,
    'Name': employee.user?.name || 'N/A',
    'Email': employee.user?.email || 'N/A',
    'Department': employee.department,
    'Job Role': employee.jobRole,
    'Hire Date': new Date(employee.hireDate).toLocaleDateString(),
    'Technical Background': employee.technicalBackground,
    'Current Persona': employee.currentPersona || 'Not Assessed',
    'Winner Status': employee.winnerStatus ? 'Yes' : 'No',
    'Winner Score': employee.winnerScore || 'N/A',
    'Winner Priority': employee.winnerPriority || 'N/A',
    'Assigned Coach': employee.assignedCoach?.user?.name || 'Not Assigned',
    'Manager': employee.manager?.user?.name || 'None'
  }))

  return arrayToCSV(data)
}

/**
 * Export coaching notes to CSV
 */
export function exportCoachingNotes(notes: any[]): string {
  const data = notes.map(note => ({
    'Date': new Date(note.sessionDate).toLocaleDateString(),
    'Employee': note.employee?.user?.name || 'N/A',
    'Coach': note.coach?.user?.name || 'N/A',
    'Session Type': note.sessionType || 'N/A',
    'Notes': note.notes,
    'Action Items': note.actionItems || 'None',
    'Next Steps': note.nextSteps || 'None',
    'Created At': new Date(note.createdAt).toLocaleString()
  }))

  return arrayToCSV(data)
}

/**
 * Download CSV file (client-side helper)
 */
export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Format date for filenames
 */
export function formatFilename(baseName: string, extension: string = 'csv'): string {
  const date = new Date().toISOString().split('T')[0]
  const sanitized = baseName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  return `${sanitized}_${date}.${extension}`
}
