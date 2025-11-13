import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UserRole, PersonaType } from '@prisma/client'
import { callLLM, isLLMAvailable } from '@/lib/llm-service'

/**
 * POST /api/ai/predict
 * Predictive analytics: Identify employees at risk of regression or needing intervention
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || ![UserRole.ADMIN, UserRole.COACH].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { campaignId, employeeIds } = await request.json()

    // Fetch employees with their assessment history
    let employees: any[] = []

    if (campaignId) {
      // Get all employees who completed assessments in this campaign
      const responses = await prisma.assessmentResponse.findMany({
        where: {
          campaignId,
          completionDate: { not: null }
        },
        include: {
          employee: {
            include: {
              user: { select: { name: true, email: true } },
              personaHistory: {
                orderBy: { date: 'desc' },
                take: 5
              },
              responses: {
                orderBy: { completionDate: 'desc' },
                take: 3,
                where: { completionDate: { not: null } }
              }
            }
          }
        }
      })
      employees = responses.map(r => r.employee)
    } else if (employeeIds && Array.isArray(employeeIds)) {
      // Get specific employees
      employees = await prisma.employee.findMany({
        where: { id: { in: employeeIds } },
        include: {
          user: { select: { name: true, email: true } },
          personaHistory: {
            orderBy: { date: 'desc' },
            take: 5
          },
          responses: {
            orderBy: { completionDate: 'desc' },
            take: 3,
            where: { completionDate: { not: null } }
          }
        }
      })
    } else {
      // Get all employees with recent assessments
      employees = await prisma.employee.findMany({
        where: {
          responses: {
            some: {
              completionDate: { not: null }
            }
          }
        },
        include: {
          user: { select: { name: true, email: true } },
          personaHistory: {
            orderBy: { date: 'desc' },
            take: 5
          },
          responses: {
            orderBy: { completionDate: 'desc' },
            take: 3,
            where: { completionDate: { not: null } }
          }
        },
        take: 100
      })
    }

    // Analyze each employee for risk factors
    const predictions = employees.map(employee => {
      const riskFactors: string[] = []
      let riskScore = 0 // 0-100, higher = more at risk

      // Factor 1: Low confidence in persona classification
      const latestResponse = employee.responses[0]
      if (latestResponse && latestResponse.confidenceScore && latestResponse.confidenceScore < 70) {
        riskFactors.push('Low classification confidence')
        riskScore += 15
      }

      // Factor 2: Persona degradation (moved to worse persona)
      if (employee.personaHistory.length >= 2) {
        const personaValue: Record<PersonaType, number> = {
          TRAILBLAZER: 5,
          ESTABLISHED: 4,
          EMERGING: 3,
          OVERWHELMED: 2,
          RESISTANT: 1
        }
        const current = personaValue[employee.currentPersona]
        const previous = personaValue[employee.personaHistory[1].persona]
        if (current < previous) {
          riskFactors.push('Persona regression detected')
          riskScore += 30
        }
      }

      // Factor 3: OVERWHELMED or RESISTANT persona
      if (employee.currentPersona === PersonaType.OVERWHELMED) {
        riskFactors.push('Overwhelmed with AI adoption')
        riskScore += 20
      }
      if (employee.currentPersona === PersonaType.RESISTANT) {
        riskFactors.push('Resistant to AI adoption')
        riskScore += 25
      }

      // Factor 4: Low dimension scores
      if (latestResponse && latestResponse.dimensionScores) {
        const scores = latestResponse.dimensionScores as Record<string, number>
        const avgScore = Object.values(scores).reduce((sum, s) => sum + s, 0) / Object.keys(scores).length

        if (avgScore < 40) {
          riskFactors.push('Very low engagement across dimensions')
          riskScore += 20
        } else if (scores.confidence && scores.confidence < 30) {
          riskFactors.push('Critical confidence issues')
          riskScore += 15
        }

        if (scores.barriers && scores.barriers < 30) { // barriers is inverse
          riskFactors.push('Significant barriers to adoption')
          riskScore += 10
        }
      }

      // Factor 5: No recent assessments
      const daysSinceLastAssessment = latestResponse
        ? Math.floor((Date.now() - new Date(latestResponse.completionDate!).getTime()) / (1000 * 60 * 60 * 24))
        : 999
      if (daysSinceLastAssessment > 90) {
        riskFactors.push('No recent assessment data')
        riskScore += 10
      }

      // Determine risk level
      let riskLevel: 'high' | 'medium' | 'low'
      if (riskScore >= 50) riskLevel = 'high'
      else if (riskScore >= 30) riskLevel = 'medium'
      else riskLevel = 'low'

      // Generate recommendation
      let recommendation = ''
      if (riskLevel === 'high') {
        recommendation = 'Immediate 1:1 coaching session recommended. Address barriers and rebuild confidence.'
      } else if (riskLevel === 'medium') {
        recommendation = 'Schedule check-in within 2 weeks. Monitor progress and provide support.'
      } else {
        recommendation = 'Continue regular coaching cadence. Employee is progressing well.'
      }

      return {
        employeeId: employee.id,
        employeeName: employee.user.name || 'Unknown',
        department: employee.department,
        currentPersona: employee.currentPersona,
        riskLevel,
        riskScore,
        riskFactors,
        recommendation,
        daysSinceLastAssessment,
        confidenceScore: latestResponse?.confidenceScore || 0
      }
    })

    // Sort by risk score (highest first)
    predictions.sort((a, b) => b.riskScore - a.riskScore)

    // Create summary
    const summary = {
      total: predictions.length,
      highRisk: predictions.filter(p => p.riskLevel === 'high').length,
      mediumRisk: predictions.filter(p => p.riskLevel === 'medium').length,
      lowRisk: predictions.filter(p => p.riskLevel === 'low').length,
      avgRiskScore: Math.round(predictions.reduce((sum, p) => sum + p.riskScore, 0) / predictions.length)
    }

    // Generate AI insights if available
    let aiInsights: string | null = null
    if (isLLMAvailable() && predictions.length > 0) {
      try {
        const highRiskEmployees = predictions.filter(p => p.riskLevel === 'high')
        if (highRiskEmployees.length > 0) {
          const systemPrompt = `You are an AI adoption analytics expert. Provide concise insights about employee risk patterns.`
          const userPrompt = `Analyze these ${highRiskEmployees.length} high-risk employees:

${highRiskEmployees.slice(0, 10).map(e => `- ${e.employeeName} (${e.currentPersona}): ${e.riskFactors.join(', ')}`).join('\n')}

Provide 2-3 key insights and recommended interventions in 100 words or less.`

          const response = await callLLM([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ], { temperature: 0.7, maxTokens: 300 })

          aiInsights = response.content
        }
      } catch (error) {
        console.error('Error generating AI insights:', error)
      }
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'PREDICTIVE_ANALYSIS_PERFORMED',
        resourceType: campaignId ? 'Campaign' : 'Organization',
        resourceId: campaignId || 'all',
        details: {
          employeesAnalyzed: predictions.length,
          highRiskCount: summary.highRisk,
          avgRiskScore: summary.avgRiskScore
        }
      }
    })

    return NextResponse.json({
      success: true,
      summary,
      predictions,
      aiInsights,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error performing predictive analysis:', error)
    return NextResponse.json(
      {
        error: 'Failed to perform predictive analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/ai/predict/trends
 * Analyze persona evolution trends across organization
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all persona history
    const history = await prisma.personaHistory.findMany({
      where: {
        date: {
          gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) // Last 6 months
        }
      },
      include: {
        employee: {
          include: {
            user: { select: { name: true } }
          }
        }
      },
      orderBy: { date: 'desc' }
    })

    // Analyze trends
    const trends = {
      totalTransitions: history.length,
      progressions: 0, // Moving to better persona
      regressions: 0,  // Moving to worse persona
      stable: 0,        // Staying the same
      byPersona: {} as Record<PersonaType, {
        current: number
        inflow: number
        outflow: number
      }>
    }

    // Initialize persona stats
    Object.values(PersonaType).forEach(persona => {
      trends.byPersona[persona] = { current: 0, inflow: 0, outflow: 0 }
    })

    // Calculate current distribution
    const currentPersonas = await prisma.employee.groupBy({
      by: ['currentPersona'],
      _count: true
    })

    currentPersonas.forEach(p => {
      if (p.currentPersona) {
        trends.byPersona[p.currentPersona].current = p._count
      }
    })

    // Analyze transitions
    const personaValue: Record<PersonaType, number> = {
      TRAILBLAZER: 5,
      ESTABLISHED: 4,
      EMERGING: 3,
      OVERWHELMED: 2,
      RESISTANT: 1
    }

    // Group history by employee
    const employeeHistories: Record<string, any[]> = {}
    history.forEach(h => {
      if (!employeeHistories[h.employeeId]) {
        employeeHistories[h.employeeId] = []
      }
      employeeHistories[h.employeeId].push(h)
    })

    Object.values(employeeHistories).forEach(empHistory => {
      empHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      for (let i = 1; i < empHistory.length; i++) {
        const prev = empHistory[i - 1]
        const curr = empHistory[i]

        if (prev.persona !== curr.persona) {
          const prevValue = personaValue[prev.persona]
          const currValue = personaValue[curr.persona]

          trends.byPersona[prev.persona].outflow++
          trends.byPersona[curr.persona].inflow++

          if (currValue > prevValue) {
            trends.progressions++
          } else if (currValue < prevValue) {
            trends.regressions++
          }
        } else {
          trends.stable++
        }
      }
    })

    return NextResponse.json({
      success: true,
      trends,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error analyzing trends:', error)
    return NextResponse.json(
      { error: 'Failed to analyze trends' },
      { status: 500 }
    )
  }
}
