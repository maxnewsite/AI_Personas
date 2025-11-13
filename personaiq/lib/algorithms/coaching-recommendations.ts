import { PersonaType } from '@prisma/client';
import { DimensionScores } from './persona-classification';
import { WinnerResult } from './winner-identification';

export interface CoachingRecommendation {
  persona: PersonaType;
  confidence: number;
  primaryFocus: string;
  recommendedFrequency: string;
  activities: string[];
  resources: string[];
  successMetrics: string[];
  redFlags: string[];
}

/**
 * Generate coaching recommendations based on persona and assessment data
 */
export function generateCoachingRecommendations(
  persona: PersonaType,
  confidence: number,
  dimensions: DimensionScores,
  responses: Record<string, any>,
  winnerResult: WinnerResult
): CoachingRecommendation {
  switch (persona) {
    case PersonaType.TRAILBLAZER:
      return generateTrailblazerRecommendations(confidence, dimensions, responses, winnerResult);
    case PersonaType.ESTABLISHED:
      return generateEstablishedRecommendations(confidence, dimensions, responses);
    case PersonaType.EMERGING:
      return generateEmergingRecommendations(confidence, dimensions, responses);
    case PersonaType.OVERWHELMED:
      return generateOverwhelmedRecommendations(confidence, dimensions, responses);
    case PersonaType.RESISTANT:
      return generateResistantRecommendations(confidence, dimensions, responses);
  }
}

function generateTrailblazerRecommendations(
  confidence: number,
  dimensions: DimensionScores,
  responses: Record<string, any>,
  winnerResult: WinnerResult
): CoachingRecommendation {
  const isHighPerformer = winnerResult.winnerScore >= 80;

  if (isHighPerformer) {
    return {
      persona: PersonaType.TRAILBLAZER,
      confidence,
      primaryFocus: 'Scaling Impact Through Teaching & Innovation',
      recommendedFrequency: 'Bi-weekly 1:1 Executive Coaching',
      activities: [
        'Lead workshop for peers on best AI use cases and techniques',
        'Develop mentor relationships with 3 Emerging personas',
        'Propose innovation challenge addressing strategic business priorities',
        'Document current AI workflows as templates for broader adoption',
        'Present AI success stories to leadership team'
      ],
      resources: [
        'Executive Coaching: Leading AI Transformation',
        'Workshop Design Template: Teaching AI Skills',
        'Mentorship Framework Guide',
        'Innovation Challenge Toolkit'
      ],
      successMetrics: [
        'Number of employees mentored and their progression',
        'Workshops delivered and participant satisfaction scores',
        'Innovation proposals submitted and adopted',
        'Documented workflows adopted by other teams',
        'Measurable business impact from AI initiatives'
      ],
      redFlags: [
        'Burnout from over-commitment to AI initiatives',
        'Frustration with slower organizational adoption pace',
        'Declining personal productivity due to teaching load'
      ]
    };
  } else {
    // Trailblazer but not winner-level yet
    return {
      persona: PersonaType.TRAILBLAZER,
      confidence,
      primaryFocus: 'Channeling Enthusiasm Into Measurable Impact',
      recommendedFrequency: 'Bi-weekly 1:1 Coaching',
      activities: [
        'Define and track 3 specific impact metrics for AI usage',
        'Identify cross-functional applications of current use cases',
        'Present work to stakeholders outside immediate team',
        `Experiment with advanced techniques: ${getAdvancedTechniqueSuggestion(responses)}`,
        'Begin peer mentoring with 1-2 colleagues'
      ],
      resources: [
        'Impact Measurement Framework for AI',
        'Advanced Prompt Engineering Techniques',
        'Cross-functional Collaboration Guide',
        'Presentation Template: AI Success Stories'
      ],
      successMetrics: [
        'Documented time/cost savings from AI usage',
        'Successful cross-team AI implementation',
        'Stakeholder presentation delivered',
        'New advanced technique mastered',
        'Positive peer mentoring feedback'
      ],
      redFlags: [
        'Experimentation without follow-through',
        'Lack of measurable business impact',
        'Difficulty articulating value to stakeholders'
      ]
    };
  }
}

function generateEstablishedRecommendations(
  confidence: number,
  dimensions: DimensionScores,
  responses: Record<string, any>
): CoachingRecommendation {
  const isHighPerformer = dimensions.usageSophistication >= 70;

  if (isHighPerformer) {
    return {
      persona: PersonaType.ESTABLISHED,
      confidence,
      primaryFocus: 'Breaking Out of Comfort Zone',
      recommendedFrequency: 'Monthly Check-in + Stretch Assignment',
      activities: [
        'Take on stretch use case outside normal workflow',
        `Experiment with new tool: ${getNewToolSuggestion(responses)}`,
        'Shadow a Trailblazer for knowledge transfer',
        'Lead peer learning session on area of expertise',
        'Identify and implement one efficiency improvement'
      ],
      resources: [
        'Stretch Assignment Framework',
        'Tool Comparison Guide: ChatGPT vs Claude vs Copilot',
        'Peer Learning Session Template',
        'Advanced Use Cases Library'
      ],
      successMetrics: [
        'Stretch assignment completed successfully',
        'New tool integrated into workflow',
        'Peer session delivered with positive feedback',
        'Documented efficiency improvement',
        'Increased usage sophistication score'
      ],
      redFlags: [
        'Resistance to trying new approaches',
        'Stagnation in same use cases',
        'Declining usage frequency'
      ]
    };
  } else {
    return {
      persona: PersonaType.ESTABLISHED,
      confidence,
      primaryFocus: 'Sustaining Consistency & Gradual Expansion',
      recommendedFrequency: 'Bi-weekly Group Coaching',
      activities: [
        'Add 1 new use case per month to repertoire',
        'Practice advanced prompting techniques',
        'Join Established peer learning group',
        'Document and share one successful workflow',
        'Participate in bi-weekly group sessions'
      ],
      resources: [
        'Use Case Expansion Workbook',
        'Advanced Prompting Guide',
        'Workflow Documentation Template',
        'Peer Learning Group Schedule'
      ],
      successMetrics: [
        'New use cases added monthly',
        'Improved output quality scores',
        'Workflow documented and shared',
        'Regular group session attendance',
        'Positive peer feedback'
      ],
      redFlags: [
        'Missed group sessions repeatedly',
        'No new use cases attempted',
        'Declining engagement with AI tools'
      ]
    };
  }
}

function generateEmergingRecommendations(
  confidence: number,
  dimensions: DimensionScores,
  responses: Record<string, any>
): CoachingRecommendation {
  const isHighPotential = dimensions.growthMindset >= 70;

  if (isHighPotential) {
    return {
      persona: PersonaType.EMERGING,
      confidence,
      primaryFocus: 'Accelerating Habit Formation',
      recommendedFrequency: 'Weekly 15-min Check-ins',
      activities: [
        '30-day daily usage challenge with tracking',
        'Buddy pair with an Established persona mentor',
        `Complete 5 quick-win use cases: ${getQuickWinSuggestions(responses)}`,
        'Join Emerging cohort peer sessions (bi-weekly)',
        'Share one success story per week with coach'
      ],
      resources: [
        '30-Day AI Challenge Tracker',
        'Quick-Win Use Cases Guide',
        'Buddy Mentoring Framework',
        'Success Story Template',
        'Emerging Peer Group Schedule'
      ],
      successMetrics: [
        'Achieve 5-day usage streak within 2 weeks',
        'Complete 3 new use cases this month',
        'Self-reported confidence increase to 3.5/5',
        'Regular buddy meeting attendance',
        'Documented time savings'
      ],
      redFlags: [
        'Inconsistent usage patterns',
        'Missed buddy meetings',
        'Low confidence despite successes',
        'Reverting to old workflows'
      ]
    };
  } else {
    return {
      persona: PersonaType.EMERGING,
      confidence,
      primaryFocus: 'Building Confidence Through Small Wins',
      recommendedFrequency: 'Bi-weekly Micro-coaching (15 min)',
      activities: [
        `Start with easiest use case: ${getEasiestUseCaseSuggestion(responses)}`,
        'Use provided templates for common tasks',
        'Celebrate each small win with coach',
        'Environment setup: Add AI tool shortcuts to workflow',
        'Practice with low-stakes tasks only'
      ],
      resources: [
        'Getting Started Guide',
        'Pre-built Prompt Templates',
        'Small Wins Checklist',
        'Tool Setup Instructions',
        'Confidence Building Exercises'
      ],
      successMetrics: [
        'First successful AI-assisted task completed',
        'Templates used for 3 tasks',
        'Tool bookmarked and accessible',
        'Self-reported confidence increase',
        'Willingness to try second use case'
      ],
      redFlags: [
        'Avoidance of coaching sessions',
        'Lack of experimentation',
        'Negative self-talk about AI ability',
        'Increased anxiety about AI'
      ]
    };
  }
}

function generateOverwhelmedRecommendations(
  confidence: number,
  dimensions: DimensionScores,
  responses: Record<string, any>
): CoachingRecommendation {
  const topBarrier = getTopBarrier(responses);

  return {
    persona: PersonaType.OVERWHELMED,
    confidence,
    primaryFocus: 'Foundational Skills: Task Decomposition & Delegation',
    recommendedFrequency: 'Bi-weekly 30-min 1:1 Intensive Coaching',
    activities: [
      'Pre-AI fundamentals: Work breakdown exercise on current project',
      'Practice delegation with ultra-low-stakes task',
      `Implement "good enough" framework for ${getHighStressArea(responses)}`,
      'Manager partnership: Align on reduced review expectations',
      'Perfectionism awareness exercises'
    ],
    resources: [
      'Task Decomposition Workbook',
      'Delegation Skills Guide',
      '"Good Enough" Decision Framework',
      'Perfectionism Management Strategies',
      'Time Management for AI Learning'
    ],
    successMetrics: [
      'Successfully decompose 1 complex task',
      'Delegate 1 task without over-reviewing',
      'Reduced review cycles by 25%',
      'Self-reported stress/overwhelm decrease',
      'Increased comfort with imperfection'
    ],
    redFlags: [
      'Increased overwhelm or stress levels',
      'Avoidance of coaching sessions',
      'Over-reviewing AI outputs (negating time savings)',
      'Perfectionism blocking experimentation',
      'Declining to delegate even simple tasks'
    ]
  };
}

function generateResistantRecommendations(
  confidence: number,
  dimensions: DimensionScores,
  responses: Record<string, any>
): CoachingRecommendation {
  const primaryConcern = getResistancePrimaryConcern(responses);

  if (primaryConcern === 'ethical') {
    return {
      persona: PersonaType.RESISTANT,
      confidence,
      primaryFocus: 'Values Alignment & Ethical AI Usage',
      recommendedFrequency: 'Monthly Optional 1:1 (emphasize optional)',
      activities: [
        'Discuss ethical frameworks for responsible AI use',
        'Explore use cases aligned with professional values',
        'Review company AI governance policies',
        'Connect with peer who had similar concerns',
        'Identify AI-resistant aspects of role (human judgment required)'
      ],
      resources: [
        'Ethical AI Framework',
        'Company AI Governance Policy',
        'Responsible AI Use Cases',
        'Critical Thinking with AI Guide'
      ],
      successMetrics: [
        'Attendance at optional sessions',
        'Expressed concerns addressed',
        'Identification of acceptable use cases',
        'Reduced anxiety about AI ethics'
      ],
      redFlags: [
        'Complete disengagement',
        'Spreading misinformation about AI',
        'Actively discouraging others',
        'Policy violations'
      ]
    };
  } else if (primaryConcern === 'job_security') {
    return {
      persona: PersonaType.RESISTANT,
      confidence,
      primaryFocus: 'Augmentation vs Replacement Mindset',
      recommendedFrequency: 'Monthly Optional 1:1',
      activities: [
        'Career development conversation: Future-proofing skills',
        'Demonstrate how AI enhances rather than replaces expertise',
        'Identify AI-resistant aspects of role',
        'Explore upskilling paths that leverage AI',
        'Connect with peer who successfully navigated similar concerns'
      ],
      resources: [
        'Career Future-Proofing Guide',
        'AI as Augmentation Framework',
        'Skill Development Pathways',
        'Job Security in AI Era Article'
      ],
      successMetrics: [
        'Reduced job security anxiety',
        'Career development plan created',
        'Identified AI-augmented skills to develop',
        'Willingness to experiment with low-risk AI tasks'
      ],
      redFlags: [
        'Increased anxiety',
        'Job search activity',
        'Disengagement from team',
        'Refusal to participate in any AI initiatives'
      ]
    };
  } else {
    return {
      persona: PersonaType.RESISTANT,
      confidence,
      primaryFocus: 'Understanding Root Causes of Resistance',
      recommendedFrequency: 'As-needed Motivational Interviewing',
      activities: [
        'Explore concerns without judgment',
        'Arrange peer testimonial from respected colleague',
        'Offer tiny, zero-pressure experiment',
        'Acknowledge legitimate concerns about AI limitations',
        'Respect autonomy and pace'
      ],
      resources: [
        'Motivational Interviewing Guide',
        'Addressing AI Concerns FAQ',
        'Peer Testimonial Videos',
        'Optional: AI Basics Overview'
      ],
      successMetrics: [
        'Open conversation about concerns',
        'Expressed willingness to learn more',
        'Reduced resistance to organizational initiatives',
        'Any small step toward experimentation'
      ],
      redFlags: [
        'Complete disengagement',
        'Actively undermining AI adoption',
        'Hostile attitude toward coaching',
        'Impact on team morale'
      ]
    };
  }
}

// Helper functions

function getAdvancedTechniqueSuggestion(responses: Record<string, any>): string {
  const useCases = responses['q1.2'] || [];
  if (useCases.includes('Writing code or debugging')) {
    return 'Advanced code generation with context chaining';
  }
  if (useCases.includes('Data analysis or visualization')) {
    return 'Multi-step data analysis workflows';
  }
  return 'Prompt chaining for complex workflows';
}

function getNewToolSuggestion(responses: Record<string, any>): string {
  const currentTools = responses['q1.3'] || '0 tools';
  const useCases = responses['q1.2'] || [];

  if (useCases.includes('Writing code or debugging')) {
    return 'GitHub Copilot or Cursor for coding assistance';
  }
  if (useCases.includes('Data analysis or visualization')) {
    return 'ChatGPT Data Analyst or Claude with analysis plugins';
  }
  return 'Claude for document analysis or ChatGPT for brainstorming';
}

function getQuickWinSuggestions(responses: Record<string, any>): string {
  const role = responses['jobRole'] || 'general';
  return 'Email drafting, meeting notes summary, basic research, idea generation, proofreading';
}

function getEasiestUseCaseSuggestion(responses: Record<string, any>): string {
  return 'Email response drafting or proofreading';
}

function getTopBarrier(responses: Record<string, any>): string {
  const barriers = responses['q3.1'] || [];
  return Array.isArray(barriers) && barriers.length > 0
    ? barriers[0]
    : 'time constraints';
}

function getHighStressArea(responses: Record<string, any>): string {
  const role = responses['jobRole'] || 'work tasks';
  return role;
}

function getResistancePrimaryConcern(responses: Record<string, any>): string {
  const q2_12 = responses['q2.12'] || 3;
  const q3_9 = responses['q3.9'];
  const q2_6 = responses['q2.6'] || 3;

  if (q2_12 >= 4 || q3_9 === 'Ethical issues (bias, misinformation, copyright)') {
    return 'ethical';
  }
  if (q2_6 >= 4 || q3_9 === 'Job displacement or obsolescence') {
    return 'job_security';
  }
  return 'general';
}

/**
 * Format recommendations for display
 */
export function formatCoachingRecommendations(recommendation: CoachingRecommendation): string {
  return `
**PERSONA:** ${recommendation.persona}
**CONFIDENCE:** ${recommendation.confidence}%

**PRIMARY COACHING FOCUS:**
${recommendation.primaryFocus}

**RECOMMENDED FREQUENCY:**
${recommendation.recommendedFrequency}

**COACHING ACTIVITIES:**
${recommendation.activities.map((activity, i) => `${i + 1}. ${activity}`).join('\n')}

**RESOURCES TO SHARE:**
${recommendation.resources.map(resource => `- ${resource}`).join('\n')}

**SUCCESS METRICS:**
${recommendation.successMetrics.map(metric => `- ${metric}`).join('\n')}

**RED FLAGS TO WATCH:**
${recommendation.redFlags.map(flag => `- ${flag}`).join('\n')}
  `.trim();
}
