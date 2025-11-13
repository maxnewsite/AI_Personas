export type QuestionType = 'single-choice' | 'multiple-choice' | 'likert' | 'ranking' | 'text';

export interface Question {
  id: string;
  section: number;
  sectionName: string;
  type: QuestionType;
  question: string;
  options?: string[];
  required: boolean;
  dimensions: string[]; // Which dimensions this question contributes to
}

export const assessmentQuestions: Question[] = [
  // SECTION 1: Current AI Usage Behavior (10 questions)
  {
    id: 'q1.1',
    section: 1,
    sectionName: 'Current AI Usage',
    type: 'single-choice',
    question: 'How often do you use AI tools (ChatGPT, Claude, Copilot, etc.) for work-related tasks?',
    options: [
      'Multiple times per day',
      'Once per day',
      'A few times per week',
      'Once per week or less',
      'Never or almost never'
    ],
    required: true,
    dimensions: ['usageFrequency', 'trailblazer', 'established', 'emerging', 'resistant']
  },
  {
    id: 'q1.2',
    section: 1,
    sectionName: 'Current AI Usage',
    type: 'multiple-choice',
    question: 'When you use AI tools, you typically use them for: (Select all that apply)',
    options: [
      'Drafting emails or messages',
      'Summarizing long documents',
      'Generating ideas or brainstorming',
      'Writing code or debugging',
      'Data analysis or visualization',
      'Creating presentations or reports',
      'Research and information gathering',
      'Learning new skills or concepts',
      'Other',
      "I don't use AI tools"
    ],
    required: true,
    dimensions: ['usageBreadth', 'trailblazer', 'established']
  },
  {
    id: 'q1.3',
    section: 1,
    sectionName: 'Current AI Usage',
    type: 'single-choice',
    question: 'How many different AI tools have you tried in the past 3 months?',
    options: [
      '0 tools',
      '1-2 tools',
      '3-4 tools',
      '5 or more tools'
    ],
    required: true,
    dimensions: ['usageBreadth', 'learningVelocity', 'trailblazer']
  },
  {
    id: 'q1.4',
    section: 1,
    sectionName: 'Current AI Usage',
    type: 'single-choice',
    question: 'Which statement best describes your AI usage pattern?',
    options: [
      'I use AI daily as part of my core workflow',
      'I use AI regularly for specific recurring tasks',
      'I use AI occasionally when I remember or when someone suggests it',
      "I've tried AI a few times but don't use it consistently",
      "I haven't used AI tools for work"
    ],
    required: true,
    dimensions: ['usageFrequency', 'trailblazer', 'established', 'emerging', 'overwhelmed']
  },
  {
    id: 'q1.5',
    section: 1,
    sectionName: 'Current AI Usage',
    type: 'single-choice',
    question: 'When you use AI, do you typically:',
    options: [
      'Copy and paste prompts from others without changes',
      'Make small modifications to prompts I find',
      'Write my own prompts from scratch',
      'Iterate and refine prompts until I get great results',
      'Chain multiple AI interactions together to solve complex problems',
      "N/A - I don't use AI tools"
    ],
    required: true,
    dimensions: ['usageSophistication', 'trailblazer', 'established']
  },
  {
    id: 'q1.6',
    section: 1,
    sectionName: 'Current AI Usage',
    type: 'multiple-choice',
    question: 'Have you created or shared any AI-related resources with colleagues? (Select all that apply)',
    options: [
      'Shared effective prompts or templates',
      'Created documentation or guides',
      'Led or facilitated training/workshops',
      'Built custom GPTs or AI workflows',
      'None of the above'
    ],
    required: true,
    dimensions: ['socialInfluence', 'trailblazer', 'businessImpact']
  },
  {
    id: 'q1.7',
    section: 1,
    sectionName: 'Current AI Usage',
    type: 'single-choice',
    question: 'In the past month, approximately how many hours have you saved by using AI tools?',
    options: [
      "0 hours (don't use or no time saved)",
      '1-2 hours',
      '3-5 hours',
      '6-10 hours',
      'More than 10 hours'
    ],
    required: true,
    dimensions: ['businessImpact', 'trailblazer']
  },
  {
    id: 'q1.8',
    section: 1,
    sectionName: 'Current AI Usage',
    type: 'single-choice',
    question: 'How would you rate the quality of output you typically get from AI tools?',
    options: [
      'Excellent - usually needs no revisions',
      'Good - needs minor revisions',
      'Fair - needs substantial revisions',
      'Poor - often unusable',
      "N/A - I don't use AI tools enough to judge"
    ],
    required: true,
    dimensions: ['usageSophistication', 'established']
  },
  {
    id: 'q1.9',
    section: 1,
    sectionName: 'Current AI Usage',
    type: 'single-choice',
    question: 'Do you track or measure the impact of AI on your work?',
    options: [
      'Yes, formally with specific metrics',
      'Yes, informally in my head',
      'No, but I should',
      "No, and I don't see the need",
      "N/A - I don't use AI tools"
    ],
    required: true,
    dimensions: ['strategicThinking', 'trailblazer']
  },
  {
    id: 'q1.10',
    section: 1,
    sectionName: 'Current AI Usage',
    type: 'single-choice',
    question: 'Which best describes your experimentation with AI?',
    options: [
      'I actively experiment with new approaches and use cases weekly',
      'I occasionally try new things when I have time',
      'I stick to what I know works',
      "I haven't really experimented",
      'I prefer not to use AI tools'
    ],
    required: true,
    dimensions: ['growthMindset', 'learningVelocity', 'trailblazer', 'resistant']
  },

  // SECTION 2: Attitudes & Beliefs (12 questions)
  {
    id: 'q2.1',
    section: 2,
    sectionName: 'Attitudes & Beliefs',
    type: 'likert',
    question: 'I believe AI tools can significantly improve my productivity.',
    required: true,
    dimensions: ['trust', 'valuePerception', 'emerging', 'resistant']
  },
  {
    id: 'q2.2',
    section: 2,
    sectionName: 'Attitudes & Beliefs',
    type: 'likert',
    question: 'I feel confident in my ability to use AI tools effectively.',
    required: true,
    dimensions: ['confidence', 'trailblazer', 'established', 'emerging', 'overwhelmed']
  },
  {
    id: 'q2.3',
    section: 2,
    sectionName: 'Attitudes & Beliefs',
    type: 'likert',
    question: 'I trust the quality and accuracy of AI-generated content.',
    required: true,
    dimensions: ['trust', 'trailblazer', 'resistant']
  },
  {
    id: 'q2.4',
    section: 2,
    sectionName: 'Attitudes & Beliefs',
    type: 'likert',
    question: 'I worry that relying on AI will cause my skills to deteriorate.',
    required: true,
    dimensions: ['trust', 'resistant']
  },
  {
    id: 'q2.5',
    section: 2,
    sectionName: 'Attitudes & Beliefs',
    type: 'likert',
    question: 'Learning to use AI tools effectively is a good use of my time.',
    required: true,
    dimensions: ['valuePerception', 'emerging', 'overwhelmed']
  },
  {
    id: 'q2.6',
    section: 2,
    sectionName: 'Attitudes & Beliefs',
    type: 'likert',
    question: "I'm concerned about job security as AI capabilities improve.",
    required: true,
    dimensions: ['resistant', 'overwhelmed']
  },
  {
    id: 'q2.7',
    section: 2,
    sectionName: 'Attitudes & Beliefs',
    type: 'likert',
    question: 'I enjoy exploring and experimenting with new technologies.',
    required: true,
    dimensions: ['growthMindset', 'trailblazer']
  },
  {
    id: 'q2.8',
    section: 2,
    sectionName: 'Attitudes & Beliefs',
    type: 'likert',
    question: 'I believe AI should be used to augment human work, not replace it.',
    required: true,
    dimensions: ['valuePerception']
  },
  {
    id: 'q2.9',
    section: 2,
    sectionName: 'Attitudes & Beliefs',
    type: 'likert',
    question: 'I feel overwhelmed by the pace of AI advancement.',
    required: true,
    dimensions: ['overwhelmed', 'resistant']
  },
  {
    id: 'q2.10',
    section: 2,
    sectionName: 'Attitudes & Beliefs',
    type: 'likert',
    question: 'I think my organization should invest more in AI training and support.',
    required: true,
    dimensions: ['valuePerception']
  },
  {
    id: 'q2.11',
    section: 2,
    sectionName: 'Attitudes & Beliefs',
    type: 'likert',
    question: "I'm excited about the possibilities AI creates for my work.",
    required: true,
    dimensions: ['growthMindset', 'trailblazer', 'resistant']
  },
  {
    id: 'q2.12',
    section: 2,
    sectionName: 'Attitudes & Beliefs',
    type: 'likert',
    question: 'I have ethical concerns about AI that prevent me from using it.',
    required: true,
    dimensions: ['resistant']
  },

  // SECTION 3: Barriers & Challenges (10 questions)
  {
    id: 'q3.1',
    section: 3,
    sectionName: 'Barriers & Challenges',
    type: 'ranking',
    question: 'What prevents you from using AI tools more often? (Rank top 3, 1=biggest barrier)',
    options: [
      "Don't have enough time to learn",
      'Not sure which tools to use',
      'Concerned about data security/privacy',
      "Don't see relevant use cases for my work",
      'Lack of organizational support or guidance',
      'Worried about making mistakes',
      "Don't trust the quality of outputs",
      'Prefer traditional methods',
      'Company policies restrict usage',
      'Cost of premium tools'
    ],
    required: true,
    dimensions: ['barriers', 'emerging', 'overwhelmed', 'resistant']
  },
  {
    id: 'q3.2',
    section: 3,
    sectionName: 'Barriers & Challenges',
    type: 'single-choice',
    question: "When you try to use AI tools, what's your biggest challenge?",
    options: [
      'Writing effective prompts',
      'Knowing when to use AI vs. doing it myself',
      'Validating and editing AI outputs',
      'Integrating AI into my existing workflows',
      'Getting consistent quality results',
      "Understanding AI's limitations",
      "None - I don't face major challenges",
      "I don't use AI tools"
    ],
    required: true,
    dimensions: ['barriers', 'strategicThinking', 'overwhelmed']
  },
  {
    id: 'q3.3',
    section: 3,
    sectionName: 'Barriers & Challenges',
    type: 'single-choice',
    question: 'How much support do you receive for AI adoption from your manager?',
    options: ['None', 'A little', 'Some', 'A lot'],
    required: true,
    dimensions: ['barriers', 'emerging']
  },
  {
    id: 'q3.4',
    section: 3,
    sectionName: 'Barriers & Challenges',
    type: 'single-choice',
    question: 'Which statement best describes your situation?',
    options: [
      'I have dedicated time to learn and experiment with AI',
      'I fit AI learning into gaps in my schedule',
      "I'm too busy with current work to focus on AI",
      "I don't prioritize AI learning",
      'Learning AI is explicitly part of my role'
    ],
    required: true,
    dimensions: ['barriers', 'emerging', 'overwhelmed']
  },
  {
    id: 'q3.5',
    section: 3,
    sectionName: 'Barriers & Challenges',
    type: 'multiple-choice',
    question: 'What would most help you increase your AI usage? (Select top 2)',
    options: [
      'More training and workshops',
      '1:1 coaching or mentoring',
      'Better tools or access to premium features',
      'Dedicated time allocation',
      'Success stories from peers',
      'Clear organizational strategy and expectations',
      'Technical support when I\'m stuck',
      "Nothing - I'm already using AI effectively",
      "Nothing - I'm not interested in using AI more"
    ],
    required: true,
    dimensions: ['barriers', 'emerging']
  },
  {
    id: 'q3.6',
    section: 3,
    sectionName: 'Barriers & Challenges',
    type: 'single-choice',
    question: 'How comfortable are you with ambiguity and imperfect results?',
    options: [
      'Very comfortable - I iterate until I get good results',
      'Somewhat comfortable - I can tolerate some imperfection',
      'Uncomfortable - I need things to be right the first time',
      'Very uncomfortable - I prefer proven, reliable methods'
    ],
    required: true,
    dimensions: ['overwhelmed', 'trailblazer']
  },
  {
    id: 'q3.7',
    section: 3,
    sectionName: 'Barriers & Challenges',
    type: 'single-choice',
    question: 'When you delegate tasks (to people or AI), you typically:',
    options: [
      'Delegate freely and trust the outcome',
      'Delegate but check in regularly',
      'Delegate but review everything thoroughly',
      'Rarely delegate - prefer to do it myself',
      'Never delegate - need full control'
    ],
    required: true,
    dimensions: ['overwhelmed', 'trailblazer']
  },
  {
    id: 'q3.8',
    section: 3,
    sectionName: 'Barriers & Challenges',
    type: 'single-choice',
    question: 'How do you feel about the time investment required to learn AI tools?',
    options: [
      "Excited - it's an investment in my future",
      'Willing - I see the long-term value',
      "Hesitant - not sure the ROI is worth it",
      "Resistant - I'm already too busy",
      "Resentful - this shouldn't be required"
    ],
    required: true,
    dimensions: ['emerging', 'overwhelmed', 'resistant']
  },
  {
    id: 'q3.9',
    section: 3,
    sectionName: 'Barriers & Challenges',
    type: 'single-choice',
    question: "What's your biggest fear about AI in the workplace? (Select one)",
    options: [
      'Job displacement or obsolescence',
      'Making mistakes that damage my reputation',
      'Falling behind peers who adopt faster',
      'Ethical issues (bias, misinformation, copyright)',
      'Loss of human skills and judgment',
      'Privacy and security breaches',
      "None - I'm not particularly worried"
    ],
    required: true,
    dimensions: ['resistant', 'overwhelmed']
  },
  {
    id: 'q3.10',
    section: 3,
    sectionName: 'Barriers & Challenges',
    type: 'text',
    question: 'If you could change one thing to make AI adoption easier for you, what would it be?',
    required: false,
    dimensions: ['barriers']
  },

  // SECTION 4: Behavioral Indicators (8 questions)
  {
    id: 'q4.1',
    section: 4,
    sectionName: 'Behavioral Indicators',
    type: 'multiple-choice',
    question: 'In the past month, have you: (Check all that apply)',
    options: [
      'Helped a colleague use AI tools',
      'Shared a successful AI use case with others',
      'Created documentation or templates for AI usage',
      'Attended AI training or workshops',
      'Experimented with a new AI tool or technique',
      'Advocated for AI adoption in meetings',
      'None of the above'
    ],
    required: true,
    dimensions: ['socialInfluence', 'learningVelocity', 'trailblazer']
  },
  {
    id: 'q4.2',
    section: 4,
    sectionName: 'Behavioral Indicators',
    type: 'single-choice',
    question: 'When you encounter a problem at work, how often do you consider whether AI could help?',
    options: [
      'Always or almost always',
      'Often',
      'Sometimes',
      'Rarely',
      'Never'
    ],
    required: true,
    dimensions: ['strategicThinking', 'trailblazer', 'established']
  },
  {
    id: 'q4.3',
    section: 4,
    sectionName: 'Behavioral Indicators',
    type: 'multiple-choice',
    question: 'How do you typically learn about new AI tools and techniques? (Select all that apply)',
    options: [
      'Actively search and experiment on my own',
      'Follow AI-focused social media or newsletters',
      'Learn from colleagues who are ahead of me',
      'Wait for formal training from my organization',
      "Don't actively seek this information"
    ],
    required: true,
    dimensions: ['growthMindset', 'learningVelocity', 'trailblazer', 'emerging']
  },
  {
    id: 'q4.4',
    section: 4,
    sectionName: 'Behavioral Indicators',
    type: 'single-choice',
    question: 'If your organization offered optional AI training, would you:',
    options: [
      'Sign up immediately and attend enthusiastically',
      'Sign up if schedule permits',
      'Consider it but probably not prioritize it',
      'Likely not sign up unless required',
      'Definitely not sign up'
    ],
    required: true,
    dimensions: ['emerging', 'resistant']
  },
  {
    id: 'q4.5',
    section: 4,
    sectionName: 'Behavioral Indicators',
    type: 'single-choice',
    question: 'Which scenario sounds most like you?',
    options: [
      'Scenario A: You discover a new AI feature that could save you hours per week. You immediately test it, refine your approach, and share it with your team.',
      'Scenario B: You hear about an AI technique from a colleague. You try it a few times for your standard tasks and stick with what works.',
      "Scenario C: Someone suggests you try using AI for a task. You give it a shot but go back to your usual method if it doesn't work perfectly the first time.",
      "Scenario D: You're asked to use an AI tool for a project. You struggle with how to break down the task and spend a lot of time reviewing the output.",
      "Scenario E: You're skeptical about AI and prefer to stick with methods you know are reliable. You might try AI if explicitly required but won't seek it out."
    ],
    required: true,
    dimensions: ['trailblazer', 'established', 'emerging', 'overwhelmed', 'resistant']
  },
  {
    id: 'q4.6',
    section: 4,
    sectionName: 'Behavioral Indicators',
    type: 'single-choice',
    question: 'In team meetings, when AI is discussed, you typically:',
    options: [
      'Lead the conversation or share insights',
      'Contribute ideas and experiences',
      'Listen and learn from others',
      'Stay quiet or express concerns',
      'Try to change the subject'
    ],
    required: true,
    dimensions: ['trailblazer', 'established', 'emerging', 'resistant']
  },
  {
    id: 'q4.7',
    section: 4,
    sectionName: 'Behavioral Indicators',
    type: 'single-choice',
    question: 'Over the past 3 months, your use of AI tools has:',
    options: [
      'Increased significantly',
      'Increased somewhat',
      'Stayed about the same',
      'Decreased somewhat',
      'Decreased significantly',
      "N/A - I don't use AI tools"
    ],
    required: true,
    dimensions: ['learningVelocity', 'sustainability']
  },
  {
    id: 'q4.8',
    section: 4,
    sectionName: 'Behavioral Indicators',
    type: 'single-choice',
    question: 'If you had to teach a colleague how to use AI effectively, how would you feel?',
    options: [
      "Excited and confident - I'd love to",
      'Willing and capable with some preparation',
      "Nervous but would try my best",
      "Very uncomfortable - I don't know enough",
      "I wouldn't want to do this"
    ],
    required: true,
    dimensions: ['confidence', 'trailblazer', 'emerging', 'overwhelmed']
  }
];

export const getSectionQuestions = (sectionNumber: number): Question[] => {
  return assessmentQuestions.filter(q => q.section === sectionNumber);
};

export const getTotalSections = (): number => {
  return Math.max(...assessmentQuestions.map(q => q.section));
};
