/**
 * HTML Report Templates for PersonaIQ
 * Generates print-ready HTML reports that can be converted to PDF
 */

import { PersonaType } from '@prisma/client'

/**
 * Generate Executive Summary Report HTML
 */
export function generateExecutiveSummary(data: {
  campaign: any
  stats: any
  personaDistribution: Record<PersonaType, number>
  winners: any[]
  recommendations: string[]
}): string {
  const { campaign, stats, personaDistribution, winners, recommendations } = data

  const personaColors: Record<PersonaType, string> = {
    TRAILBLAZER: '#10b981',
    ESTABLISHED: '#3b82f6',
    EMERGING: '#fbbf24',
    OVERWHELMED: '#f97316',
    RESISTANT: '#ef4444'
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Executive Summary - ${campaign.name}</title>
  <style>
    @media print {
      @page { margin: 0.5in; }
      body { margin: 0; }
      .no-print { display: none; }
      .page-break { page-break-after: always; }
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #3b82f6;
    }

    .header h1 {
      margin: 0;
      color: #1f2937;
      font-size: 32px;
    }

    .header .subtitle {
      color: #6b7280;
      font-size: 18px;
      margin-top: 8px;
    }

    .meta {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 30px;
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
    }

    .meta-label {
      font-size: 12px;
      text-transform: uppercase;
      color: #6b7280;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .meta-value {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      margin-top: 4px;
    }

    .section {
      margin-bottom: 40px;
    }

    .section-title {
      font-size: 24px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }

    .stat-value {
      font-size: 36px;
      font-weight: 700;
      color: #3b82f6;
    }

    .stat-label {
      font-size: 14px;
      color: #6b7280;
      margin-top: 8px;
    }

    .persona-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 16px;
      margin-bottom: 30px;
    }

    .persona-card {
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }

    .persona-count {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .persona-name {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .persona-percentage {
      font-size: 12px;
      color: #6b7280;
    }

    .winners-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }

    .winners-table th,
    .winners-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }

    .winners-table th {
      background: #f9fafb;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      color: #6b7280;
    }

    .recommendations {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 20px;
      border-radius: 4px;
    }

    .recommendations ul {
      margin: 0;
      padding-left: 20px;
    }

    .recommendations li {
      margin-bottom: 12px;
      color: #1f2937;
    }

    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }

    .btn-print {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 20px;
    }

    .btn-print:hover {
      background: #2563eb;
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="btn-print" onclick="window.print()">📄 Print / Save as PDF</button>
  </div>

  <div class="header">
    <h1>AI Adoption Assessment</h1>
    <div class="subtitle">Executive Summary</div>
  </div>

  <div class="meta">
    <div class="meta-item">
      <div class="meta-label">Campaign Name</div>
      <div class="meta-value">${campaign.name}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Report Date</div>
      <div class="meta-value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Campaign Period</div>
      <div class="meta-value">
        ${new Date(campaign.startDate).toLocaleDateString()} - ${new Date(campaign.endDate).toLocaleDateString()}
      </div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Status</div>
      <div class="meta-value">${campaign.status}</div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Key Metrics</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${stats.totalInvited}</div>
        <div class="stat-label">Total Invited</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.completed}</div>
        <div class="stat-label">Completed</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.completionRate}%</div>
        <div class="stat-label">Completion Rate</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.avgTimeTaken} min</div>
        <div class="stat-label">Avg Time</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Persona Distribution</h2>
    <div class="persona-grid">
      ${Object.entries(personaDistribution).map(([persona, count]) => {
        const percentage = stats.completed > 0 ? Math.round((count / stats.completed) * 100) : 0
        const color = personaColors[persona as PersonaType] || '#6b7280'
        return `
          <div class="persona-card">
            <div class="persona-count" style="color: ${color}">${count}</div>
            <div class="persona-name">${persona}</div>
            <div class="persona-percentage">${percentage}%</div>
          </div>
        `
      }).join('')}
    </div>
  </div>

  ${winners.length > 0 ? `
    <div class="section">
      <h2 class="section-title">High Performers (Winners)</h2>
      <table class="winners-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Department</th>
            <th>Persona</th>
            <th>Winner Score</th>
            <th>Priority</th>
          </tr>
        </thead>
        <tbody>
          ${winners.slice(0, 10).map(winner => `
            <tr>
              <td>${winner.user?.name || 'N/A'}</td>
              <td>${winner.department}</td>
              <td>${winner.currentPersona}</td>
              <td>${winner.winnerScore}</td>
              <td>${winner.winnerPriority}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  ` : ''}

  <div class="section">
    <h2 class="section-title">Key Recommendations</h2>
    <div class="recommendations">
      <ul>
        ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
      </ul>
    </div>
  </div>

  <div class="footer">
    <p><strong>PersonaIQ</strong> - AI Adoption Persona Identification Platform</p>
    <p>© ${new Date().getFullYear()} PersonaIQ. Confidential - Internal Use Only.</p>
  </div>

  <script>
    // Auto-focus print dialog on load (optional)
    // window.onload = () => window.print();
  </script>
</body>
</html>
  `.trim()
}

/**
 * Generate basic styling for print
 */
export function generatePrintStyles(): string {
  return `
    @media print {
      @page { margin: 0.5in; }
      body { margin: 0; }
      .no-print { display: none !important; }
      .page-break { page-break-after: always; }
    }
  `
}
