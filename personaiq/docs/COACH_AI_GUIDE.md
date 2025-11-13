# Coach's Guide to AI-Powered Features

Welcome to PersonaIQ's AI-powered coaching toolkit! This guide will help you understand and effectively use the AI features available to enhance your coaching practice.

## Table of Contents

1. [Overview](#overview)
2. [Setup and Configuration](#setup-and-configuration)
3. [AI Coaching Recommendations](#ai-coaching-recommendations)
4. [Free-Text Analysis](#free-text-analysis)
5. [Risk Detection & Predictive Analytics](#risk-detection--predictive-analytics)
6. [Trend Analysis](#trend-analysis)
7. [Employee Chatbot](#employee-chatbot)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Overview

PersonaIQ integrates AI/LLM capabilities to augment your coaching practice with data-driven insights. These tools are designed to **support**, not replace, your human expertise and judgment.

### Available AI Features

- **AI Coaching Recommendations**: Personalized coaching plans based on assessment data
- **Free-Text Analysis**: Sentiment analysis and theme extraction from employee responses
- **Risk Detection**: Identify employees at risk of regression or needing intervention
- **Trend Analysis**: Understand persona evolution patterns across your organization
- **Employee Chatbot**: 24/7 AI assistant to answer employee questions

### Supported AI Providers

- **OpenAI** (GPT-4o, GPT-4o-mini, GPT-3.5-turbo)
- **Anthropic** (Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku)

---

## Setup and Configuration

### Checking AI Availability

Before using AI features, ensure that an administrator has configured the system:

1. Look for the ✨ **AI Recommendations** button on employee detail pages
2. If the button is greyed out or shows an error, AI services are not configured
3. Contact your system administrator to set up API keys

### Configuration Requirements

Your administrator needs to set the following environment variables:

```bash
# Choose provider
LLM_PROVIDER="openai"  # or "anthropic"

# For OpenAI
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4o-mini"

# For Anthropic
ANTHROPIC_API_KEY="sk-ant-..."
ANTHROPIC_MODEL="claude-3-5-sonnet-20241022"
```

---

## AI Coaching Recommendations

### What It Does

Generates personalized coaching recommendations based on:
- Employee's persona classification
- Assessment responses and confidence scores
- Dimension scores (confidence, barriers, engagement, etc.)
- Free-text responses
- Department and job role

### How to Use

1. Navigate to an employee's detail page in the **Coach Dashboard**
2. Click the **✨ AI Recommendations** button
3. Wait for the AI to analyze the employee's data (usually 5-10 seconds)
4. Review the generated recommendations in the modal

### Understanding the Output

The AI provides five key sections:

#### 1. **Summary**
A high-level overview of the employee's current state and primary needs.

**Example:**
> "Sarah is an Emerging persona with moderate confidence (72%). She's making good progress but needs consistent practice to solidify habits."

#### 2. **Red Flags** 🚩
Urgent concerns that need immediate attention.

**Common Red Flags:**
- Very low confidence scores (<40%)
- Significant barriers to adoption
- Signs of burnout or overwhelm
- Resistance stemming from ethical concerns

**Action:** Address red flags in your next 1:1 session.

#### 3. **Action Items**
Specific, numbered steps to take in your coaching session.

**Example:**
1. Celebrate recent wins with ChatGPT for email drafting
2. Identify 2-3 low-stakes tasks for daily AI practice
3. Address time management concerns through task prioritization workshop

#### 4. **Session Plan**
A recommended structure for your coaching session, including:
- Opening questions
- Discussion topics
- Practice exercises
- Homework assignments

#### 5. **Estimated Session Length**
Suggested duration based on complexity (typically 30-60 minutes).

### Best Practices

✅ **DO:**
- Review recommendations before your coaching session
- Adapt suggestions to fit your coaching style
- Use AI insights to prepare questions
- Combine AI recommendations with your observations
- Save useful recommendations as coaching notes

❌ **DON'T:**
- Read recommendations verbatim to employees
- Ignore your human judgment in favor of AI
- Share AI-generated content without review
- Rely solely on AI for high-stakes decisions
- Use recommendations for employees you haven't met

### Saving Recommendations

To save AI recommendations for future reference:

1. Copy key insights from the modal
2. Navigate to **Coaching Notes** section
3. Create a new coaching note
4. Paste and edit the recommendations
5. Add your own observations and planned actions

---

## Free-Text Analysis

### What It Does

Analyzes open-ended text responses from assessments using natural language processing to extract:
- **Sentiment**: Overall emotional tone (positive, neutral, negative)
- **Key Themes**: Common topics and patterns
- **Concerns**: Specific worries or barriers mentioned
- **Opportunities**: Areas of interest or enthusiasm

### How to Use

#### For a Single Campaign

1. Navigate to **Admin Dashboard** → **Campaigns**
2. Click on a campaign to view details
3. Click **🧠 AI Analysis** button
4. Review the analysis in the modal

#### For a Single Employee

1. Go to the employee's detail page
2. Find their latest assessment response
3. Use the API endpoint: `POST /api/ai/analyze` with `employeeId`

### Understanding the Output

#### Sentiment Score

- **Positive** 😊: Employee is enthusiastic and optimistic
- **Neutral** 😐: Balanced or pragmatic responses
- **Negative** 😟: Concerns, frustration, or resistance

**Tip:** Negative sentiment isn't always bad! It can indicate thoughtful concerns that need addressing.

#### Key Themes

Common patterns in employee responses across the campaign.

**Example Themes:**
- "Time constraints and workload concerns"
- "Enthusiasm for learning but uncertainty about tools"
- "Ethical concerns about data privacy"
- "Desire for hands-on training"

#### Concerns

Specific worries or barriers mentioned by employees.

**How to Use:**
- Address common concerns in team meetings
- Create FAQ documents for recurring questions
- Adjust training materials based on feedback
- Identify systemic issues requiring leadership attention

#### Opportunities

Areas where employees show interest or readiness to grow.

**How to Use:**
- Design workshops around high-interest topics
- Match enthusiastic employees with hesitant peers for mentoring
- Prioritize use cases that align with employee interests

### Best Practices

✅ **DO:**
- Run analysis after campaign completion
- Look for patterns across multiple employees
- Use insights to inform coaching strategy
- Share anonymized themes with leadership
- Validate AI findings with manual review of sample responses

❌ **DON'T:**
- Over-interpret sentiment scores
- Ignore context when reading themes
- Share individual analysis without consent
- Make major decisions on sentiment alone

---

## Risk Detection & Predictive Analytics

### What It Does

Identifies employees at risk of:
- Persona regression (moving to a "worse" persona)
- Disengagement from AI adoption
- Needing immediate intervention

Uses a multi-factor risk scoring algorithm (0-100) based on:
1. Low classification confidence (<70%)
2. Persona regression detected
3. OVERWHELMED or RESISTANT status
4. Low dimension scores
5. No recent assessments (>90 days)

### Risk Levels

- **High Risk** (50-100) 🚨: Immediate 1:1 coaching needed
- **Medium Risk** (30-49) ⚠️: Check-in within 2 weeks
- **Low Risk** (0-29) ✅: Continue regular cadence

### How to Use

1. Navigate to **Admin Dashboard**
2. Click **Risk Analysis** button (red-orange gradient)
3. Choose scope:
   - Campaign-specific analysis
   - Organization-wide analysis
4. Review the results

### Understanding the Output

#### Summary Statistics

- **Total Analyzed**: Number of employees assessed
- **High/Medium/Low Risk**: Distribution across risk levels
- **Avg Risk Score**: Overall organizational risk

#### AI Insights

If high-risk employees are detected, the AI generates strategic insights:

**Example:**
> "3 employees show regression patterns. Common factors: time pressure (60%), tool confusion (40%). Recommend skill-building workshops and tool simplification."

#### Individual Risk Cards

Each employee card shows:
- **Risk Level**: High/Medium/Low with emoji indicator
- **Risk Score**: 0-100 with visual progress bar
- **Current Persona**: Badge indicating classification
- **Risk Factors**: Specific issues detected
- **Recommendation**: Suggested next steps
- **Last Assessment**: Days since completion

### Prioritizing Interventions

**Priority 1: High Risk + Multiple Red Flags**
- Schedule 1:1 within 24-48 hours
- Clear your calendar if needed
- Prepare to address barriers comprehensively

**Priority 2: High Risk + Single Issue**
- Schedule 1:1 within 1 week
- Focus on specific risk factor
- Monitor closely after intervention

**Priority 3: Medium Risk**
- Email check-in or quick call within 2 weeks
- Offer resources proactively
- Schedule follow-up assessment

**Priority 4: Low Risk**
- Continue regular coaching cadence
- Celebrate progress
- Encourage peer mentoring

### Best Practices

✅ **DO:**
- Run risk analysis monthly
- Focus on high-risk employees first
- Document interventions in coaching notes
- Track whether interventions reduce risk scores
- Share aggregate patterns with leadership

❌ **DON'T:**
- Treat risk scores as absolute truth
- Ignore employees labeled "low risk"
- Use risk levels to evaluate coach performance
- Share risk scores with employees directly
- Make employment decisions based solely on risk analysis

### Addressing Common Risk Factors

#### Low Confidence
- **Strategy**: Small wins approach
- **Actions**: Simple tasks, positive reinforcement, quick feedback loop

#### Persona Regression
- **Strategy**: Root cause analysis
- **Actions**: 1:1 discussion to understand barriers, adjust expectations

#### Overwhelmed Status
- **Strategy**: Reduce cognitive load
- **Actions**: Focus on one tool, break tasks into micro-steps, extend timeline

#### Resistant Status
- **Strategy**: Empathy and choice
- **Actions**: Validate concerns, offer autonomy, align AI with values

#### No Recent Assessment
- **Strategy**: Re-engagement
- **Actions**: Personal invitation, explain value, offer scheduling help

---

## Trend Analysis

### What It Does

Analyzes persona evolution patterns across your organization over the last 6 months:
- **Progressions**: Employees moving to "better" personas
- **Regressions**: Employees moving to "worse" personas
- **Stable**: Employees maintaining their persona
- **Persona Flow**: Inflow and outflow for each persona type

### Persona Value Hierarchy

Understanding progression vs regression:

1. **Trailblazer** 🚀 (Highest)
2. **Established** ⭐
3. **Emerging** 🌱
4. **Overwhelmed** 😰
5. **Resistant** 🛑 (Lowest)

**Progression Example**: Emerging → Established
**Regression Example**: Established → Overwhelmed

### How to Use

1. Navigate to **Admin Dashboard**
2. Click **Trend Analysis** button (indigo-purple gradient)
3. Review the organizational trends

### Understanding the Output

#### Overall Movement Bar

Visual representation of:
- Green: Progressions (⬆️)
- Red: Regressions (⬇️)
- Gray: Stable (➡️)

**Healthy Organization**: 60%+ progressions, <20% regressions

#### Per-Persona Flow Analysis

For each persona, you'll see:

**Current Population**: Number of employees currently in this persona

**Inflow**: How many employees moved TO this persona
- High inflow to Trailblazer = excellent momentum
- High inflow to Resistant = organizational concern

**Outflow**: How many employees moved FROM this persona
- High outflow from Resistant = coaching is working
- High outflow from Trailblazer = investigate causes

**Net Flow**: Inflow - Outflow
- Positive = persona is growing
- Negative = persona is shrinking
- Zero = stable population

### Strategic Insights

#### Scenario 1: Growing Trailblazer Population
**Signal**: AI adoption is accelerating
**Actions**:
- Celebrate wins publicly
- Ask Trailblazers to mentor others
- Document successful strategies

#### Scenario 2: Growing Resistant Population
**Signal**: Organizational barriers or concerns
**Actions**:
- Investigate root causes
- Address systemic issues (tools, policies, culture)
- Leadership messaging may need adjustment

#### Scenario 3: High Regression Rate
**Signal**: Sustainability issues
**Actions**:
- Review workload and time allocation
- Check for tool availability/reliability
- Reassess training effectiveness
- Consider organizational change fatigue

#### Scenario 4: Stagnant Movement
**Signal**: Coaching or program may need refresh
**Actions**:
- Introduce new use cases
- Offer advanced workshops
- Increase coaching touchpoints
- Revamp incentive structure

### Best Practices

✅ **DO:**
- Review trends quarterly
- Look for patterns over time
- Compare trends to organizational goals
- Share insights with leadership
- Adjust coaching strategy based on trends

❌ **DON'T:**
- Expect linear progression
- Panic over short-term regressions
- Compare employees based on progression speed
- Use trends to evaluate individual coaches

---

## Employee Chatbot

### What It Does

Provides employees with 24/7 access to an AI assistant that can:
- Answer questions about AI tools and techniques
- Provide quick tips and best practices
- Offer encouragement and motivation
- Help troubleshoot common issues

**Important**: The chatbot is contextually aware of the employee's persona and recent responses.

### How Employees Access It

The chatbot appears as a floating button (💬) in the bottom-right corner of employee pages:
- Dashboard
- Assessment pages
- Results pages

### Example Questions Employees Might Ask

- "How can I improve my AI prompt writing?"
- "What are best practices for using AI tools at work?"
- "How do I overcome my concerns about AI?"
- "What AI tools are best for my role?"
- "How can I use AI more effectively?"

### What Coaches Should Know

#### The Chatbot is NOT a Replacement

- Chatbot provides general guidance and encouragement
- Complex issues still require human coaching
- Chatbot refers employees to coaches for sensitive topics

#### Contextual Awareness

The chatbot knows:
- Employee's current persona
- Recent assessment responses (if available)
- This allows for somewhat personalized answers

#### Privacy and Safety

- All chatbot interactions are logged (audit trail)
- Chatbot is programmed to avoid giving harmful advice
- Cannot access sensitive employee data beyond assessment results

### Best Practices

✅ **DO:**
- Encourage employees to try the chatbot for quick questions
- Review chatbot logs if an employee mentions it
- Use chatbot as ice-breaker: "Have you tried asking the AI assistant?"
- Provide feedback if chatbot gives unhelpful answers

❌ **DON'T:**
- Assume chatbot replaces your coaching role
- Discourage employees from using it
- Expect chatbot to handle complex coaching needs

---

## Best Practices for AI-Augmented Coaching

### 1. Human Judgment First

AI provides insights, but you provide wisdom. Always:
- Review AI recommendations critically
- Adapt suggestions to individual contexts
- Trust your coaching intuition
- Prioritize relationship over data

### 2. Transparency with Employees

Be open about AI use:
- "I used an AI tool to help prepare for our session"
- "The system flagged some areas we should discuss"
- "I'd like to share some AI-generated insights, but I want your thoughts first"

### 3. Validate AI Insights

Don't assume AI is always correct:
- Cross-reference with your observations
- Ask employees if insights resonate
- Update your understanding based on conversations
- Report inaccuracies to administrators

### 4. Combine Quantitative and Qualitative

Use AI for:
- Pattern recognition across large datasets
- Identifying outliers and risk factors
- Generating coaching hypotheses
- Tracking trends over time

Use human coaching for:
- Building trust and rapport
- Understanding emotional nuance
- Addressing sensitive topics
- Making ethical judgments
- Celebrating wins meaningfully

### 5. Continuous Improvement

Help improve the AI system:
- Document when recommendations are helpful vs unhelpful
- Share feedback with administrators
- Suggest new features or analyses
- Participate in AI feature training sessions

### 6. Ethical Considerations

Be mindful of:
- **Bias**: AI may reflect biases in training data
- **Privacy**: Don't share AI-generated insights about individuals publicly
- **Fairness**: Ensure all employees have equal access to AI-enhanced coaching
- **Transparency**: Explain how AI influences your coaching decisions

---

## Troubleshooting

### "AI service not configured" Error

**Cause**: Administrator has not set up API keys

**Solution**: Contact your system administrator. They need to configure environment variables with OpenAI or Anthropic API keys.

### AI Recommendations Seem Generic

**Possible Causes**:
- Employee hasn't completed enough assessment questions
- Free-text responses are very brief
- Classification confidence is low

**Solutions**:
- Encourage more detailed free-text responses
- Wait for additional assessment data
- Rely more on your coaching expertise

### Risk Analysis Shows Unexpected Results

**Possible Causes**:
- Employee missed recent assessments
- Recent life/work changes affecting responses
- Algorithm sensitivity to specific factors

**Solutions**:
- Review individual risk factors carefully
- Talk to employee to understand context
- Don't over-react to risk scores
- Focus on trends over single data points

### Sentiment Analysis Seems Inaccurate

**Possible Causes**:
- Sarcasm or irony in text responses
- Mixed emotions in same response
- Cultural or linguistic factors

**Solutions**:
- Read original responses manually
- Look at themes alongside sentiment
- Use sentiment as a starting point, not conclusion
- Provide feedback to improve AI models

### Chatbot Gives Unhelpful Answers

**Possible Causes**:
- Question is outside chatbot's scope
- Unclear or ambiguous question
- Chatbot lacks specific context

**Solutions**:
- Advise employee to rephrase question
- Recommend they ask you directly instead
- Report persistent issues to administrators
- Document specific examples for system improvement

### API Rate Limits or Timeouts

**Symptoms**:
- "Service temporarily unavailable" errors
- Long wait times for AI responses
- Intermittent failures

**Solutions**:
- Wait a few minutes and retry
- Contact administrator about rate limits
- Check if organization has reached API quota
- Consider using AI features during off-peak hours

---

## Measuring AI Feature Impact

### Key Metrics to Track

1. **Coaching Efficiency**
   - Time spent per coaching session
   - Number of employees coached per week
   - Preparation time before sessions

2. **Employee Outcomes**
   - Persona progression rates
   - Confidence score improvements
   - Assessment completion rates
   - Employee satisfaction with coaching

3. **Risk Management**
   - Time to intervention for high-risk employees
   - Regression prevention rate
   - Early detection success stories

4. **AI Utilization**
   - Percentage of sessions using AI insights
   - Chatbot usage rates among employees
   - Feedback on AI recommendation quality

### Before and After Comparison

Consider tracking:
- **Before AI Features**: Your baseline coaching metrics
- **After AI Features**: Changes in efficiency and outcomes
- **Qualitative Feedback**: Coach and employee experiences

---

## Feedback and Support

### Providing Feedback

Help us improve AI features by:
- Documenting specific cases where AI was helpful/unhelpful
- Suggesting new analyses or insights you'd like
- Reporting bugs or unexpected behavior
- Sharing success stories

### Getting Help

- **Technical Issues**: Contact your system administrator
- **Feature Questions**: Refer to this guide or API documentation
- **Coaching Strategy**: Consult with senior coaches or leadership
- **Ethical Concerns**: Escalate to leadership immediately

---

## Appendix: API Endpoints Reference

### For Coaches with API Access

#### Generate AI Coaching Recommendations
```
POST /api/ai/coaching
Body: { employeeId: string, assessmentResponseId?: string }
```

#### Analyze Free-Text Responses
```
POST /api/ai/analyze
Body: { campaignId?: string, employeeId?: string, assessmentResponseId?: string }
```

#### Risk Detection
```
POST /api/ai/predict
Body: { campaignId?: string, employeeIds?: string[] }
```

#### Trend Analysis
```
GET /api/ai/predict/trends
```

#### Chatbot (Employee Use)
```
POST /api/ai/chatbot
Body: { question: string }
```

---

## Conclusion

AI-powered features in PersonaIQ are designed to augment, not replace, your coaching expertise. Use these tools to:
- Prepare more effectively for coaching sessions
- Identify at-risk employees proactively
- Understand organizational trends
- Scale your impact across more employees
- Free up time for high-touch, human interactions

Remember: **Data informs, but coaches transform.** Your empathy, experience, and relationship-building skills remain irreplaceable.

Happy coaching! 🚀

---

*Last Updated: November 2025*
*Version: 1.0*
*For questions or feedback, contact your PersonaIQ administrator*
