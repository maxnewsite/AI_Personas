import { PersonaType } from '@prisma/client';

export interface DimensionScores {
  usageFrequency: number;
  usageBreadth: number;
  usageSophistication: number;
  confidence: number;
  trust: number;
  barriers: number; // Inverse scored - high barriers = low score
  growthMindset: number;
}

export interface PersonaIndicators {
  trailblazer: number;
  established: number;
  emerging: number;
  overwhelmed: number;
  resistant: number;
}

export interface ClassificationResult {
  persona: PersonaType;
  confidence: number;
  dimensionScores: DimensionScores;
  personaIndicators: PersonaIndicators;
  conflictingSignals?: string[];
}

/**
 * Calculate dimension scores from assessment responses
 */
export function calculateDimensionScores(responses: Record<string, any>): DimensionScores {
  // Usage Frequency Score (0-100)
  const usageFrequency = calculateUsageFrequency(responses);

  // Usage Breadth Score (0-100)
  const usageBreadth = calculateUsageBreadth(responses);

  // Usage Sophistication Score (0-100)
  const usageSophistication = calculateUsageSophistication(responses);

  // Confidence Score (0-100)
  const confidence = calculateConfidence(responses);

  // Trust Score (0-100)
  const trust = calculateTrust(responses);

  // Barrier Score (0-100, reverse scored)
  const barriers = calculateBarriers(responses);

  // Growth Mindset Score (0-100)
  const growthMindset = calculateGrowthMindset(responses);

  return {
    usageFrequency,
    usageBreadth,
    usageSophistication,
    confidence,
    trust,
    barriers,
    growthMindset
  };
}

/**
 * Calculate usage frequency score
 */
function calculateUsageFrequency(responses: Record<string, any>): number {
  const q1_1 = responses['q1.1'];
  const q1_4 = responses['q1.4'];
  const q1_9 = responses['q1.9'];

  let score = 0;

  // Q1.1 scoring
  if (q1_1 === 'Multiple times per day') score += 40;
  else if (q1_1 === 'Once per day') score += 30;
  else if (q1_1 === 'A few times per week') score += 20;
  else if (q1_1 === 'Once per week or less') score += 10;
  else score += 0;

  // Q1.4 scoring
  if (q1_4 === 'I use AI daily as part of my core workflow') score += 35;
  else if (q1_4 === 'I use AI regularly for specific recurring tasks') score += 25;
  else if (q1_4 === 'I use AI occasionally when I remember or when someone suggests it') score += 15;
  else if (q1_4 === "I've tried AI a few times but don't use it consistently") score += 5;
  else score += 0;

  // Q1.9 scoring
  if (q1_9 === 'Yes, formally with specific metrics') score += 25;
  else if (q1_9 === 'Yes, informally in my head') score += 15;
  else if (q1_9 === 'No, but I should') score += 5;
  else score += 0;

  return Math.min(score, 100);
}

/**
 * Calculate usage breadth score
 */
function calculateUsageBreadth(responses: Record<string, any>): number {
  const q1_2 = responses['q1.2'] || [];
  const q1_3 = responses['q1.3'];

  let score = 0;

  // Q1.2 scoring - number of use cases (max 50 points)
  const useCases = Array.isArray(q1_2) ? q1_2.filter((item: string) =>
    item !== "I don't use AI tools" && item !== 'Other'
  ).length : 0;

  if (useCases >= 6) score += 50;
  else if (useCases >= 4) score += 37;
  else if (useCases >= 2) score += 25;
  else if (useCases >= 1) score += 12;

  // Q1.3 scoring - tools tried (max 50 points)
  if (q1_3 === '5 or more tools') score += 50;
  else if (q1_3 === '3-4 tools') score += 37;
  else if (q1_3 === '1-2 tools') score += 25;
  else score += 0;

  return Math.min(score, 100);
}

/**
 * Calculate usage sophistication score
 */
function calculateUsageSophistication(responses: Record<string, any>): number {
  const q1_5 = responses['q1.5'];
  const q1_8 = responses['q1.8'];

  let score = 0;

  // Q1.5 scoring (max 60 points)
  if (q1_5 === 'Chain multiple AI interactions together to solve complex problems') score += 60;
  else if (q1_5 === 'Iterate and refine prompts until I get great results') score += 45;
  else if (q1_5 === 'Write my own prompts from scratch') score += 30;
  else if (q1_5 === 'Make small modifications to prompts I find') score += 15;
  else if (q1_5 === 'Copy and paste prompts from others without changes') score += 5;
  else score += 0;

  // Q1.8 scoring (max 40 points)
  if (q1_8 === 'Excellent - usually needs no revisions') score += 40;
  else if (q1_8 === 'Good - needs minor revisions') score += 30;
  else if (q1_8 === 'Fair - needs substantial revisions') score += 15;
  else if (q1_8 === 'Poor - often unusable') score += 5;
  else score += 0;

  return Math.min(score, 100);
}

/**
 * Calculate confidence score
 */
function calculateConfidence(responses: Record<string, any>): number {
  const q2_2 = responses['q2.2'] || 3; // Likert scale 1-5
  const q4_8 = responses['q4.8'];

  let score = 0;

  // Q2.2 scoring (max 60 points)
  score += (q2_2 - 1) * 15; // 1->0, 2->15, 3->30, 4->45, 5->60

  // Q4.8 scoring (max 40 points)
  if (q4_8 === "Excited and confident - I'd love to") score += 40;
  else if (q4_8 === 'Willing and capable with some preparation') score += 30;
  else if (q4_8 === "Nervous but would try my best") score += 20;
  else if (q4_8 === "Very uncomfortable - I don't know enough") score += 10;
  else score += 0;

  return Math.min(score, 100);
}

/**
 * Calculate trust score
 */
function calculateTrust(responses: Record<string, any>): number {
  const q2_1 = responses['q2.1'] || 3;
  const q2_3 = responses['q2.3'] || 3;
  const q2_4 = responses['q2.4'] || 3; // Reverse scored

  let score = 0;

  // Q2.1 - productivity belief (max 40 points)
  score += (q2_1 - 1) * 10;

  // Q2.3 - trust in quality (max 40 points)
  score += (q2_3 - 1) * 10;

  // Q2.4 - skill deterioration worry (reverse scored, max 20 points)
  score += (5 - q2_4) * 5;

  return Math.min(score, 100);
}

/**
 * Calculate barriers score (inverse - high barriers = low score)
 */
function calculateBarriers(responses: Record<string, any>): number {
  const q3_1 = responses['q3.1'] || [];
  const q3_2 = responses['q3.2'];
  const q3_4 = responses['q3.4'];

  let barrierPoints = 0;

  // Q3.1 - top barriers ranked (more barriers = more points deducted)
  const topBarriers = Array.isArray(q3_1) ? q3_1.slice(0, 3) : [];
  barrierPoints += topBarriers.length * 10; // Up to 30 points

  // Q3.2 - biggest challenge
  if (q3_2 && q3_2 !== "None - I don't face major challenges" && q3_2 !== "I don't use AI tools") {
    barrierPoints += 20;
  }

  // Q3.4 - time availability
  if (q3_4 === "I'm too busy with current work to focus on AI") barrierPoints += 30;
  else if (q3_4 === "I don't prioritize AI learning") barrierPoints += 20;
  else if (q3_4 === 'I fit AI learning into gaps in my schedule') barrierPoints += 10;

  // Convert to 0-100 score (inverse)
  return Math.max(0, 100 - barrierPoints);
}

/**
 * Calculate growth mindset score
 */
function calculateGrowthMindset(responses: Record<string, any>): number {
  const q2_7 = responses['q2.7'] || 3;
  const q2_11 = responses['q2.11'] || 3;
  const q4_3 = responses['q4.3'] || [];

  let score = 0;

  // Q2.7 - enjoys experimentation (max 35 points)
  score += (q2_7 - 1) * 8.75;

  // Q2.11 - excitement (max 35 points)
  score += (q2_11 - 1) * 8.75;

  // Q4.3 - learning approach (max 30 points)
  const activeApproaches = Array.isArray(q4_3) ? q4_3 : [];
  if (activeApproaches.includes('Actively search and experiment on my own')) score += 15;
  if (activeApproaches.includes('Follow AI-focused social media or newsletters')) score += 10;
  if (activeApproaches.includes('Learn from colleagues who are ahead of me')) score += 5;

  return Math.min(score, 100);
}

/**
 * Calculate persona-specific indicators
 */
export function calculatePersonaIndicators(
  responses: Record<string, any>,
  dimensions: DimensionScores
): PersonaIndicators {
  return {
    trailblazer: calculateTrailblazerIndicator(responses, dimensions),
    established: calculateEstablishedIndicator(responses, dimensions),
    emerging: calculateEmergingIndicator(responses, dimensions),
    overwhelmed: calculateOverwhelmedIndicator(responses, dimensions),
    resistant: calculateResistantIndicator(responses, dimensions)
  };
}

function calculateTrailblazerIndicator(
  responses: Record<string, any>,
  dimensions: DimensionScores
): number {
  let score = 0;

  // High usage metrics
  if (dimensions.usageFrequency >= 75) score += 20;
  if (dimensions.usageBreadth >= 75) score += 20;
  if (dimensions.usageSophistication >= 75) score += 20;

  // Sharing behavior (Q1.6)
  const q1_6 = responses['q1.6'] || [];
  if (Array.isArray(q1_6) && q1_6.some(item => item !== 'None of the above')) {
    score += 15;
  }

  // Active experimentation (Q4.1)
  const q4_1 = responses['q4.1'] || [];
  if (Array.isArray(q4_1) && q4_1.filter(item => item !== 'None of the above').length >= 3) {
    score += 15;
  }

  // Teaching enthusiasm (Q4.8)
  if (responses['q4.8'] === "Excited and confident - I'd love to") {
    score += 10;
  }

  return Math.min(score, 100);
}

function calculateEstablishedIndicator(
  responses: Record<string, any>,
  dimensions: DimensionScores
): number {
  let score = 0;

  // Moderate, consistent usage
  if (dimensions.usageFrequency >= 50 && dimensions.usageFrequency < 75) score += 25;

  // Regular pattern (Q1.4)
  if (responses['q1.4'] === 'I use AI regularly for specific recurring tasks') {
    score += 25;
  }

  // Good quality outputs (Q1.8)
  if (responses['q1.8'] === 'Good - needs minor revisions') {
    score += 20;
  }

  // Moderate confidence (Q2.2 = 4)
  if (responses['q2.2'] === 4) {
    score += 15;
  }

  // Contributes in meetings (Q4.6)
  if (responses['q4.6'] === 'Contribute ideas and experiences') {
    score += 15;
  }

  return Math.min(score, 100);
}

function calculateEmergingIndicator(
  responses: Record<string, any>,
  dimensions: DimensionScores
): number {
  let score = 0;

  // Lower usage but positive attitude
  if (dimensions.usageFrequency >= 25 && dimensions.usageFrequency < 50) score += 25;

  // Positive attitude despite low use
  const q2_1 = responses['q2.1'] || 3;
  const q2_5 = responses['q2.5'] || 3;
  if (q2_1 >= 4 && q2_5 >= 4) {
    score += 25;
  }

  // Low confidence
  if (dimensions.confidence <= 50) {
    score += 20;
  }

  // Learning from others (Q4.3)
  const q4_3 = responses['q4.3'] || [];
  if (Array.isArray(q4_3) && q4_3.includes('Learn from colleagues who are ahead of me')) {
    score += 15;
  }

  // Would attend training (Q4.4)
  if (responses['q4.4'] === 'Sign up if schedule permits' ||
      responses['q4.4'] === 'Sign up immediately and attend enthusiastically') {
    score += 15;
  }

  return Math.min(score, 100);
}

function calculateOverwhelmedIndicator(
  responses: Record<string, any>,
  dimensions: DimensionScores
): number {
  let score = 0;

  // Struggles with delegation (Q3.7)
  const q3_7 = responses['q3.7'];
  if (q3_7 === 'Rarely delegate - prefer to do it myself' ||
      q3_7 === 'Never delegate - need full control') {
    score += 25;
  }

  // Uncomfortable with ambiguity (Q3.6)
  if (responses['q3.6'] === 'Uncomfortable - I need things to be right the first time' ||
      responses['q3.6'] === 'Very uncomfortable - I prefer proven, reliable methods') {
    score += 20;
  }

  // High time pressure (Q3.1)
  const q3_1 = responses['q3.1'] || [];
  if (Array.isArray(q3_1) && q3_1[0] === "Don't have enough time to learn") {
    score += 20;
  }

  // Difficulty with task decomposition (Q3.2)
  if (responses['q3.2'] === 'Knowing when to use AI vs. doing it myself') {
    score += 20;
  }

  // Low confidence but high interest
  const q2_2 = responses['q2.2'] || 3;
  const q2_5 = responses['q2.5'] || 3;
  if (q2_2 <= 2 && q2_5 >= 4) {
    score += 15;
  }

  return Math.min(score, 100);
}

function calculateResistantIndicator(
  responses: Record<string, any>,
  dimensions: DimensionScores
): number {
  let score = 0;

  // Job security fears (Q2.6)
  const q2_6 = responses['q2.6'] || 3;
  if (q2_6 >= 4) {
    score += 20;
  }

  // Ethical concerns (Q2.12 and Q3.9)
  const q2_12 = responses['q2.12'] || 3;
  if (q2_12 >= 4 && responses['q3.9'] === 'Ethical issues (bias, misinformation, copyright)') {
    score += 20;
  }

  // Skill atrophy worry (Q2.4)
  const q2_4 = responses['q2.4'] || 3;
  if (q2_4 >= 4) {
    score += 15;
  }

  // Prefers traditional methods
  if (responses['q3.1']?.[0] === 'Prefer traditional methods') {
    score += 20;
  }

  // Low excitement (Q2.11)
  const q2_11 = responses['q2.11'] || 3;
  if (q2_11 <= 2) {
    score += 15;
  }

  // Would not attend training (Q4.4)
  if (responses['q4.4'] === 'Definitely not sign up') {
    score += 10;
  }

  return Math.min(score, 100);
}

/**
 * Classify persona based on indicators and dimension scores
 */
export function classifyPersona(
  responses: Record<string, any>,
  dimensions: DimensionScores,
  indicators: PersonaIndicators
): ClassificationResult {
  let persona: PersonaType;
  let confidence: number;
  const conflictingSignals: string[] = [];

  // Primary classification rules
  if (indicators.trailblazer >= 70 && dimensions.usageFrequency >= 75) {
    persona = PersonaType.TRAILBLAZER;
    confidence = calculateConfidenceScore(indicators.trailblazer, indicators);
  } else if (indicators.established >= 60 && dimensions.usageFrequency >= 50) {
    persona = PersonaType.ESTABLISHED;
    confidence = calculateConfidenceScore(indicators.established, indicators);
  } else if (indicators.emerging >= 60 && (dimensions.confidence <= 50 || dimensions.usageFrequency < 50)) {
    persona = PersonaType.EMERGING;
    confidence = calculateConfidenceScore(indicators.emerging, indicators);
  } else if (indicators.overwhelmed >= 60 && dimensions.confidence <= 40) {
    persona = PersonaType.OVERWHELMED;
    confidence = calculateConfidenceScore(indicators.overwhelmed, indicators);
  } else if (indicators.resistant >= 60 && (dimensions.usageFrequency <= 25 || dimensions.trust <= 40)) {
    persona = PersonaType.RESISTANT;
    confidence = calculateConfidenceScore(indicators.resistant, indicators);
  } else {
    // Weighted scoring approach
    const scores = [
      { persona: PersonaType.TRAILBLAZER, score: indicators.trailblazer },
      { persona: PersonaType.ESTABLISHED, score: indicators.established },
      { persona: PersonaType.EMERGING, score: indicators.emerging },
      { persona: PersonaType.OVERWHELMED, score: indicators.overwhelmed },
      { persona: PersonaType.RESISTANT, score: indicators.resistant }
    ];

    scores.sort((a, b) => b.score - a.score);
    persona = scores[0].persona;

    // Lower confidence if scores are close
    if (scores[1].score >= scores[0].score * 0.8) {
      confidence = 65;
      conflictingSignals.push(`Close scores between ${persona} and ${scores[1].persona}`);
    } else {
      confidence = 75;
    }
  }

  // Detect conflicts
  if (indicators.trailblazer >= 60 && dimensions.usageFrequency < 50) {
    conflictingSignals.push('High interest/capability but low usage - investigate barriers');
  }

  return {
    persona,
    confidence,
    dimensionScores: dimensions,
    personaIndicators: indicators,
    conflictingSignals: conflictingSignals.length > 0 ? conflictingSignals : undefined
  };
}

function calculateConfidenceScore(primaryScore: number, allIndicators: PersonaIndicators): number {
  const indicators = Object.values(allIndicators);
  const sortedIndicators = indicators.sort((a, b) => b - a);
  const hasConflicts = sortedIndicators[1] >= sortedIndicators[0] * 0.7;

  if (primaryScore >= 80 && !hasConflicts) return 95;
  if (primaryScore >= 70 && !hasConflicts) return 85;
  if (primaryScore >= 60 && !hasConflicts) return 75;
  if (primaryScore >= 50 || hasConflicts) return 65;
  return 50;
}

/**
 * Main classification function
 */
export function performPersonaClassification(responses: Record<string, any>): ClassificationResult {
  const dimensions = calculateDimensionScores(responses);
  const indicators = calculatePersonaIndicators(responses, dimensions);
  return classifyPersona(responses, dimensions, indicators);
}
