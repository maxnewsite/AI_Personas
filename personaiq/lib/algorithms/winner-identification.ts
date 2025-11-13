import { PersonaType, WinnerPriority } from '@prisma/client';
import { DimensionScores } from './persona-classification';

export interface WinnerScoreComponents {
  businessImpact: number;
  socialInfluence: number;
  learningVelocity: number;
  strategicThinking: number;
  sustainability: number;
}

export interface WinnerResult {
  isWinner: boolean;
  winnerScore: number;
  priority: WinnerPriority | null;
  components: WinnerScoreComponents;
  reasoning: string;
}

/**
 * Calculate business impact score (30% weight)
 */
function calculateBusinessImpact(responses: Record<string, any>): number {
  const q1_7 = responses['q1.7'];

  // Based on hours saved
  if (q1_7 === 'More than 10 hours') return 100;
  if (q1_7 === '6-10 hours') return 75;
  if (q1_7 === '3-5 hours') return 50;
  if (q1_7 === '1-2 hours') return 25;
  return 0;
}

/**
 * Calculate social influence score (20% weight)
 */
function calculateSocialInfluence(responses: Record<string, any>): number {
  const q1_6 = responses['q1.6'] || [];
  const q4_1 = responses['q4.1'] || [];

  let score = 0;
  let activitiesCount = 0;

  // Q1.6 - Sharing resources
  if (Array.isArray(q1_6)) {
    const sharingActivities = q1_6.filter(item => item !== 'None of the above');

    if (sharingActivities.includes('Led or facilitated training/workshops')) {
      score += 30;
      activitiesCount++;
    }
    if (sharingActivities.includes('Created documentation or guides')) {
      score += 25;
      activitiesCount++;
    }
    if (sharingActivities.includes('Shared effective prompts or templates')) {
      score += 20;
      activitiesCount++;
    }
    if (sharingActivities.includes('Built custom GPTs or AI workflows')) {
      score += 25;
      activitiesCount++;
    }
  }

  // Q4.1 - Recent helping behavior
  if (Array.isArray(q4_1)) {
    const helpingActivities = q4_1.filter(item => item !== 'None of the above');

    if (helpingActivities.includes('Helped a colleague use AI tools')) {
      score += 15;
      activitiesCount++;
    }
    if (helpingActivities.includes('Shared a successful AI use case with others')) {
      score += 15;
      activitiesCount++;
    }
    if (helpingActivities.includes('Advocated for AI adoption in meetings')) {
      score += 15;
      activitiesCount++;
    }
  }

  // Scale based on variety of activities
  if (activitiesCount >= 4) return Math.min(score, 100);
  if (activitiesCount >= 2) return Math.min(score * 0.9, 100);
  return Math.min(score * 0.75, 100);
}

/**
 * Calculate learning velocity score (25% weight)
 */
function calculateLearningVelocity(responses: Record<string, any>): number {
  const q1_3 = responses['q1.3'];
  const q4_1 = responses['q4.1'] || [];
  const q4_7 = responses['q4.7'];

  let score = 0;

  // Tools tried (max 40 points)
  if (q1_3 === '5 or more tools') score += 40;
  else if (q1_3 === '3-4 tools') score += 30;
  else if (q1_3 === '1-2 tools') score += 15;

  // Active experimentation (max 30 points)
  if (Array.isArray(q4_1)) {
    if (q4_1.includes('Experimented with a new AI tool or technique')) score += 20;
    if (q4_1.includes('Attended AI training or workshops')) score += 10;
  }

  // Growth trajectory (max 30 points)
  if (q4_7 === 'Increased significantly') score += 30;
  else if (q4_7 === 'Increased somewhat') score += 20;
  else if (q4_7 === 'Stayed about the same') score += 10;

  return Math.min(score, 100);
}

/**
 * Calculate strategic thinking score (15% weight)
 */
function calculateStrategicThinking(responses: Record<string, any>): number {
  const q3_2 = responses['q3.2'];
  const q4_2 = responses['q4.2'];

  let score = 0;

  // Knows when to use AI (max 50 points)
  if (q3_2 === "None - I don't face major challenges") score += 50;
  else if (q3_2 === 'Understanding AI\'s limitations') score += 30;
  else if (q3_2 === 'Knowing when to use AI vs. doing it myself') score += 20;

  // Considers AI for problems (max 50 points)
  if (q4_2 === 'Always or almost always') score += 50;
  else if (q4_2 === 'Often') score += 37;
  else if (q4_2 === 'Sometimes') score += 25;

  return Math.min(score, 100);
}

/**
 * Calculate sustainability score (10% weight)
 */
function calculateSustainability(dimensions: DimensionScores): number {
  const { usageFrequency, usageSophistication } = dimensions;

  // Daily + Advanced
  if (usageFrequency >= 75 && usageSophistication >= 75) return 100;
  // Daily + Moderate
  if (usageFrequency >= 75 && usageSophistication >= 50) return 80;
  // Regular + Moderate
  if (usageFrequency >= 50 && usageSophistication >= 50) return 60;
  // Regular + Basic
  if (usageFrequency >= 50) return 40;

  return 20;
}

/**
 * Calculate overall winner score
 */
export function calculateWinnerScore(
  responses: Record<string, any>,
  dimensions: DimensionScores,
  persona: PersonaType
): WinnerResult {
  // Only calculate for Trailblazer and high-potential Emerging
  const eligibleForWinner =
    persona === PersonaType.TRAILBLAZER ||
    (persona === PersonaType.EMERGING && dimensions.growthMindset >= 70);

  if (!eligibleForWinner) {
    return {
      isWinner: false,
      winnerScore: 0,
      priority: null,
      components: {
        businessImpact: 0,
        socialInfluence: 0,
        learningVelocity: 0,
        strategicThinking: 0,
        sustainability: 0
      },
      reasoning: `Winner identification only applies to Trailblazer or high-potential Emerging personas`
    };
  }

  // Calculate component scores
  const businessImpact = calculateBusinessImpact(responses);
  const socialInfluence = calculateSocialInfluence(responses);
  const learningVelocity = calculateLearningVelocity(responses);
  const strategicThinking = calculateStrategicThinking(responses);
  const sustainability = calculateSustainability(dimensions);

  // Calculate weighted winner score
  const winnerScore = Math.round(
    businessImpact * 0.30 +
    socialInfluence * 0.20 +
    learningVelocity * 0.25 +
    strategicThinking * 0.15 +
    sustainability * 0.10
  );

  // Determine winner status and priority
  let isWinner = false;
  let priority: WinnerPriority | null = null;
  let reasoning = '';

  if (winnerScore >= 80 && persona === PersonaType.TRAILBLAZER) {
    isWinner = true;
    priority = WinnerPriority.HIGH;
    reasoning = 'High-performing Trailblazer with exceptional impact and influence';
  } else if (winnerScore >= 80 && persona === PersonaType.EMERGING) {
    isWinner = true;
    priority = WinnerPriority.HIGH;
    reasoning = 'High-potential Emerging persona with rapid growth trajectory';
  } else if (winnerScore >= 70 && persona === PersonaType.TRAILBLAZER) {
    isWinner = true;
    priority = WinnerPriority.MEDIUM;
    reasoning = 'Strong Trailblazer with solid impact metrics';
  } else if (winnerScore >= 85 && persona === PersonaType.ESTABLISHED) {
    isWinner = false; // Flagged as POTENTIAL
    priority = WinnerPriority.MEDIUM;
    reasoning = 'Potential winner - Established persona with very high scores (monitor for elevation)';
  } else {
    reasoning = 'Does not meet winner threshold criteria';
  }

  return {
    isWinner,
    winnerScore,
    priority,
    components: {
      businessImpact,
      socialInfluence,
      learningVelocity,
      strategicThinking,
      sustainability
    },
    reasoning
  };
}

/**
 * Generate winner profile summary
 */
export function generateWinnerProfile(
  winnerResult: WinnerResult,
  persona: PersonaType
): string {
  if (!winnerResult.isWinner) {
    return '';
  }

  const { components, winnerScore, priority } = winnerResult;
  const strengths: string[] = [];

  if (components.businessImpact >= 75) {
    strengths.push('High business impact (10+ hours saved monthly)');
  }
  if (components.socialInfluence >= 75) {
    strengths.push('Strong peer influence and knowledge sharing');
  }
  if (components.learningVelocity >= 75) {
    strengths.push('Rapid learning and experimentation');
  }
  if (components.strategicThinking >= 75) {
    strengths.push('Strategic AI application');
  }

  return `
**Winner Profile** (Score: ${winnerScore}/100, Priority: ${priority})

**Key Strengths:**
${strengths.map(s => `- ${s}`).join('\n')}

**Persona:** ${persona}

**Recommended Actions:**
- Include in AI champion program
- Leverage as peer mentor for ${persona === PersonaType.TRAILBLAZER ? 'Established and Emerging' : 'other Emerging'} personas
- Invite to contribute to organizational AI strategy
- Feature success stories in internal communications
  `.trim();
}
