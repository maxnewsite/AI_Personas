import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { chatbotAssistant, isLLMAvailable } from '@/lib/llm-service'

/**
 * POST /api/ai/chatbot
 * AI chatbot assistant for answering employee questions
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if LLM is available
    if (!isLLMAvailable()) {
      return NextResponse.json(
        {
          answer: "I'm sorry, the AI assistant is currently unavailable. Please contact your coach for support.",
          available: false
        },
        { status: 200 }
      )
    }

    const { question } = await request.json()

    if (!question || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      )
    }

    // Get employee context if available
    let context: any = {}

    const employee = await prisma.employee.findUnique({
      where: { userId: session.user.id },
      include: {
        responses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            personaClassification: true,
            responses: true
          }
        }
      }
    })

    if (employee && employee.responses.length > 0) {
      context.persona = employee.responses[0].personaClassification

      // Extract recent concerns from responses
      if (employee.responses[0].responses) {
        const responses = employee.responses[0].responses as Record<string, any>
        const textResponses = Object.values(responses)
          .filter(r => typeof r === 'string' && r.length > 20)
          .slice(0, 3)
        context.recentResponses = textResponses
      }
    }

    // Generate chatbot response
    const answer = await chatbotAssistant({
      question: question.trim(),
      context
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CHATBOT_QUERY',
        resourceType: 'AI',
        resourceId: 'chatbot',
        details: {
          questionLength: question.length,
          hasContext: !!employee
        }
      }
    })

    return NextResponse.json({
      question,
      answer,
      available: true,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Chatbot error:', error)
    return NextResponse.json(
      {
        answer: "I apologize, but I encountered an error. Please try rephrasing your question or contact your coach.",
        error: error instanceof Error ? error.message : 'Unknown error',
        available: false
      },
      { status: 200 }
    )
  }
}

/**
 * GET /api/ai/chatbot
 * Check chatbot availability and get info
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const available = isLLMAvailable()

    return NextResponse.json({
      available,
      message: available
        ? 'AI assistant is ready to help!'
        : 'AI assistant is currently unavailable. Configure API keys to enable.',
      suggestedQuestions: [
        'How can I improve my AI prompt writing?',
        'What are best practices for using AI tools at work?',
        'How do I overcome my concerns about AI?',
        'What AI tools are best for my role?',
        'How can I use AI more effectively?'
      ]
    })
  } catch (error) {
    console.error('Chatbot info error:', error)
    return NextResponse.json(
      { error: 'Failed to get chatbot info' },
      { status: 500 }
    )
  }
}
