# AI/LLM Integration Features

PersonaIQ now includes powerful AI/LLM capabilities powered by OpenAI and Anthropic to enhance coaching effectiveness and provide data-driven insights.

## Features Overview

### 1. AI-Powered Coaching Recommendations
- **Location**: Coach Dashboard → Employee Details
- **Component**: `AICoachingButton.tsx`
- **API**: `POST /api/ai/coaching`
- **Purpose**: Generate personalized coaching plans based on assessment data

**Provides:**
- Executive summary of employee's current state
- Red flags requiring immediate attention
- Actionable coaching items
- Structured session plan
- Estimated session duration

### 2. Free-Text Response Analysis
- **Location**: Admin Dashboard → Campaign Details
- **Component**: `AICampaignAnalysisButton.tsx`
- **API**: `POST /api/ai/analyze`
- **Purpose**: Extract insights from open-ended assessment responses

**Provides:**
- Sentiment analysis (positive/neutral/negative)
- Key themes across responses
- Common concerns and barriers
- Opportunities for growth

### 3. Risk Detection & Predictive Analytics
- **Location**: Admin Dashboard
- **Component**: `RiskAnalysisButton.tsx`
- **API**: `POST /api/ai/predict`
- **Purpose**: Identify employees at risk of regression or needing intervention

**Analyzes:**
- Low classification confidence
- Persona regression patterns
- Overwhelmed or resistant employees
- Low dimension scores
- Assessment recency

**Risk Levels:**
- High (50-100): Immediate 1:1 coaching needed
- Medium (30-49): Check-in within 2 weeks
- Low (0-29): Continue regular cadence

### 4. Trend Analysis
- **Location**: Admin Dashboard
- **Component**: `TrendAnalysisButton.tsx`
- **API**: `GET /api/ai/predict/trends`
- **Purpose**: Understand persona evolution patterns organization-wide

**Tracks:**
- Progressions vs regressions
- Per-persona inflow/outflow
- Net growth by persona type
- 6-month historical trends

### 5. Employee AI Chatbot
- **Location**: All employee pages (floating button)
- **Component**: `Chatbot.tsx`
- **API**: `POST /api/ai/chatbot`
- **Purpose**: 24/7 AI assistant for employee questions

**Features:**
- Context-aware responses based on employee persona
- Suggested starter questions
- Conversation history during session
- Graceful fallback when AI unavailable

## Setup Instructions

### 1. Choose Your AI Provider

PersonaIQ supports two LLM providers:

#### Option A: OpenAI (Recommended for cost-effectiveness)

```bash
LLM_PROVIDER="openai"
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4o-mini"  # or "gpt-4o", "gpt-3.5-turbo"
```

**Get API Key**: https://platform.openai.com/api-keys

#### Option B: Anthropic (Recommended for quality)

```bash
LLM_PROVIDER="anthropic"
ANTHROPIC_API_KEY="sk-ant-..."
ANTHROPIC_MODEL="claude-3-5-sonnet-20241022"  # or "claude-3-opus-20240229"
```

**Get API Key**: https://console.anthropic.com/

### 2. Add to `.env` File

Copy the appropriate configuration from `.env.example`:

```bash
cp .env.example .env
# Edit .env and add your API keys
```

### 3. Restart the Application

```bash
npm run dev
# or
yarn dev
```

### 4. Verify AI is Working

1. Log in as a coach or admin
2. Look for AI feature buttons (they should be enabled)
3. Try generating coaching recommendations for an employee
4. Check the console for any errors

## Cost Considerations

### OpenAI Pricing (as of 2024)

- **GPT-4o-mini**: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- **GPT-4o**: ~$2.50 per 1M input tokens, ~$10 per 1M output tokens

**Typical Usage per Request:**
- Coaching recommendations: ~2,000 tokens ($0.0003 with gpt-4o-mini)
- Free-text analysis: ~3,000 tokens ($0.0005 with gpt-4o-mini)
- Chatbot response: ~500 tokens ($0.0001 with gpt-4o-mini)

**Monthly Estimate for 100 employees:**
- ~$5-10/month with gpt-4o-mini
- ~$50-100/month with gpt-4o

### Anthropic Pricing (as of 2024)

- **Claude 3.5 Sonnet**: ~$3 per 1M input tokens, ~$15 per 1M output tokens
- **Claude 3 Haiku**: ~$0.25 per 1M input tokens, ~$1.25 per 1M output tokens

**Monthly Estimate for 100 employees:**
- ~$2-5/month with Haiku
- ~$15-30/month with Sonnet

### Cost Optimization Tips

1. Use cheaper models (gpt-4o-mini or claude-haiku) for most features
2. Reserve premium models (gpt-4o or claude-sonnet) for critical analyses
3. Set up rate limiting in production
4. Cache common responses
5. Monitor token usage via provider dashboard

## Architecture

### Backend: LLM Service Layer

**File**: `lib/llm-service.ts`

Provides unified interface for both OpenAI and Anthropic:

```typescript
// Core function - routes to appropriate provider
async function callLLM(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse>

// Specialized functions
async function generateAICoachingRecommendations(params: CoachingParams)
async function analyzeFreeTextResponses(responses: Record<string, string>)
async function chatbotAssistant(params: ChatbotParams)
```

### Frontend: React Components

All AI components follow this pattern:
1. Button triggers analysis
2. Loading state during API call
3. Modal displays results
4. Error handling with fallbacks

**Component Files:**
- `components/ai/Chatbot.tsx` - Floating chatbot widget
- `components/ai/AICoachingButton.tsx` - Coaching recommendations
- `components/ai/AICampaignAnalysisButton.tsx` - Free-text analysis
- `components/ai/RiskAnalysisButton.tsx` - Risk detection
- `components/ai/TrendAnalysisButton.tsx` - Trend analysis

### API Routes

All API routes include:
- Authentication checks
- Role-based authorization
- Error handling
- Audit logging

**Endpoints:**
- `POST /api/ai/coaching` - Generate coaching recommendations
- `GET /api/ai/coaching?employeeId=xxx` - Get cached recommendations
- `POST /api/ai/chatbot` - Chat with AI assistant
- `GET /api/ai/chatbot` - Check chatbot availability
- `POST /api/ai/analyze` - Analyze free-text responses
- `GET /api/ai/analyze?campaignId=xxx` - Get campaign insights
- `POST /api/ai/predict` - Risk detection
- `GET /api/ai/predict/trends` - Trend analysis

## Using AI Components in Your Pages

### Example: Adding AI Coaching Button to Coach Dashboard

```tsx
import { AICoachingButton } from '@/components/ai/AICoachingButton'

export default function CoachEmployeeDetail({ employee }) {
  return (
    <div>
      {/* Employee details */}

      <AICoachingButton
        employeeId={employee.id}
        employeeName={employee.user.name}
        assessmentResponseId={employee.latestAssessmentId}
      />
    </div>
  )
}
```

### Example: Adding Campaign Analysis Button

```tsx
import { AICampaignAnalysisButton } from '@/components/ai/AICampaignAnalysisButton'

export default function CampaignDetail({ campaign }) {
  return (
    <div>
      {/* Campaign details */}

      <AICampaignAnalysisButton
        campaignId={campaign.id}
        campaignName={campaign.name}
      />
    </div>
  )
}
```

### Example: Adding Risk Analysis Button

```tsx
import { RiskAnalysisButton } from '@/components/ai/RiskAnalysisButton'

export default function AdminDashboard({ campaign }) {
  return (
    <div>
      {/* Dashboard content */}

      <RiskAnalysisButton
        campaignId={campaign?.id}
        campaignName={campaign?.name}
      />
    </div>
  )
}
```

### Example: Adding Trend Analysis Button

```tsx
import { TrendAnalysisButton } from '@/components/ai/TrendAnalysisButton'

export default function AdminDashboard() {
  return (
    <div>
      {/* Dashboard content */}

      <TrendAnalysisButton />
    </div>
  )
}
```

### Example: Adding Chatbot to Employee Pages

```tsx
import { Chatbot } from '@/components/ai/Chatbot'

export default function EmployeePage() {
  return (
    <div>
      {/* Page content */}

      {/* Chatbot appears as floating button */}
      <Chatbot />
    </div>
  )
}
```

## Security and Privacy

### Data Handling

- **What is sent to AI providers:**
  - Assessment responses (anonymized when possible)
  - Persona classifications
  - Dimension scores
  - Department/role information (for context)

- **What is NOT sent:**
  - Employee email addresses
  - Personal identifiable information beyond name
  - Internal company secrets
  - Other employees' data

### Best Practices

1. **Review AI outputs** before sharing with employees
2. **Don't share raw AI responses** in public channels
3. **Audit logs** track all AI feature usage
4. **Configure rate limits** to prevent abuse
5. **Monitor costs** via provider dashboard

### Compliance

- All AI interactions are logged in `AuditLog` table
- Coaches can explain AI-generated insights to employees
- Employees can request copies of their AI-analyzed data
- Data is not used to train third-party models (per provider policies)

## Troubleshooting

### "AI service not configured"

**Cause**: Missing API keys
**Fix**: Add `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` to `.env`

### Slow response times

**Cause**: Large context or complex analysis
**Fix**:
- Use faster models (gpt-4o-mini or haiku)
- Reduce token limits in `llm-service.ts`
- Consider caching frequent requests

### Rate limit errors

**Cause**: Too many requests to AI provider
**Fix**:
- Upgrade API tier with provider
- Implement request queuing
- Add cooldown between requests

### Inaccurate recommendations

**Cause**: Insufficient assessment data or low-quality responses
**Fix**:
- Ensure employees complete all assessment questions
- Encourage detailed free-text responses
- Manually review and adjust recommendations

## Documentation

- **Coach Guide**: See `docs/COACH_AI_GUIDE.md` for comprehensive coaching instructions
- **API Documentation**: See individual API route files for endpoint details
- **Component Docs**: See component files for props and usage examples

## Future Enhancements

Potential features for future development:

- [ ] Executive summary generation for leadership
- [ ] Automated coaching note drafting
- [ ] Predictive persona trajectory forecasting
- [ ] A/B testing for coaching interventions
- [ ] Multi-language support for chatbot
- [ ] Voice interface for chatbot
- [ ] Integration with external learning platforms
- [ ] Custom fine-tuned models for organization-specific insights

## Support

For technical questions or issues:
1. Check this documentation first
2. Review the Coach's AI Guide (`docs/COACH_AI_GUIDE.md`)
3. Check provider status pages (OpenAI/Anthropic)
4. Review application logs for errors
5. Contact your system administrator

## Version History

- **v1.0** (Nov 2024) - Initial AI integration
  - AI coaching recommendations
  - Free-text analysis
  - Risk detection
  - Trend analysis
  - Employee chatbot

---

*For the complete coaching guide, see `docs/COACH_AI_GUIDE.md`*
