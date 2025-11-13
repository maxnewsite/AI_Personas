# PersonaIQ - AI Adoption Persona Identification Platform

PersonaIQ helps organizations identify which of the five AI adoption personas each employee belongs to (Trailblazer, Established, Emerging, Overwhelmed, Resistant), then provides actionable coaching recommendations and tracks persona evolution over time.

## 🚀 Core Value Proposition

- **Assess** 100-10,000 employees in 15 minutes per person
- **Classify** with 85%+ accuracy using advanced algorithms
- **Generate** personalized coaching plans instantly
- **Track** organizational AI readiness in real-time
- **Identify** high-potential "winners" automatically

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [The Five Personas](#the-five-personas)
- [Assessment System](#assessment-system)
- [Classification Algorithm](#classification-algorithm)
- [User Roles](#user-roles)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)

## ✨ Features

### 1. **Comprehensive Assessment System**
- 40-question assessment across 4 sections
- Multiple question types (Likert, multiple choice, ranking, text)
- 15-minute completion time
- Progress tracking and save-resume functionality

### 2. **Advanced Classification Algorithm**
- 7-dimension scoring system
- Persona-specific indicators
- Confidence scoring (50-95%)
- Conflict detection and flagging

### 3. **Winner Identification**
- 5-component scoring (Business Impact, Social Influence, Learning Velocity, Strategic Thinking, Sustainability)
- Automatic high-performer detection
- Priority classification (High/Medium/Low)

### 4. **Personalized Coaching**
- Custom coaching plans per persona
- Resource recommendations
- Success metrics tracking
- Red flag monitoring

### 5. **Multi-Role Dashboards**
- **Admin**: Organization-wide analytics, campaign management, exports
- **Coach**: Individual & cohort tracking, coaching notes
- **Manager**: Team persona distribution, aggregated metrics
- **Employee**: Personal results, learning recommendations

### 6. **Real-Time Analytics**
- Persona distribution visualization
- Persona evolution tracking
- Department comparisons
- AI readiness scoring

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe code
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization
- **Lucide React** - Icons

### Backend
- **Next.js API Routes** - RESTful API
- **Prisma** - Type-safe ORM
- **PostgreSQL** - Primary database
- **NextAuth.js v5** - Authentication

### Infrastructure
- **Docker** - Containerization (optional)
- **Vercel/AWS/GCP** - Deployment platforms

## 🏁 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd personaiq
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/personaiq"
   NEXTAUTH_SECRET="your-secret-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run prisma:generate

   # Run migrations
   npm run prisma:migrate

   # (Optional) Seed with sample data
   npm run db:seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
personaiq/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── assessments/          # Assessment CRUD
│   │   ├── campaigns/            # Campaign management
│   │   └── analytics/            # Analytics endpoints
│   ├── admin/                    # Admin dashboard pages
│   ├── coach/                    # Coach dashboard pages
│   ├── employee/                 # Employee pages
│   ├── manager/                  # Manager dashboard pages
│   ├── assessment/               # Assessment interface
│   ├── auth/                     # Auth pages (login, register)
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
│
├── lib/                          # Core business logic
│   ├── algorithms/               # Classification algorithms
│   │   ├── persona-classification.ts    # 7-dimension scoring
│   │   ├── winner-identification.ts     # Winner detection
│   │   └── coaching-recommendations.ts  # Coaching engine
│   ├── db.ts                     # Prisma client
│   ├── auth.ts                   # Auth utilities
│   ├── assessment-questions.ts   # 40-question data
│   └── utils/                    # Helper functions
│
├── components/                   # Reusable React components
│   ├── ui/                       # UI primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── PersonaBadge.tsx
│   ├── dashboards/               # Dashboard components
│   ├── assessment/               # Assessment components
│   └── charts/                   # Chart components
│
├── prisma/                       # Database
│   ├── schema.prisma             # Database schema
│   ├── migrations/               # Migration history
│   └── seed.ts                   # Seed data
│
├── public/                       # Static assets
├── .env.example                  # Environment template
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

## 👥 The Five Personas

### 1. **Trailblazer** 🟢
Advanced users who actively experiment, share knowledge, and lead AI adoption initiatives.

**Characteristics:**
- High usage frequency (daily+)
- Advanced sophistication (prompt chaining)
- Teaches and mentors others
- Tracks and measures impact

**Coaching Focus:** Scale impact through innovation and teaching

### 2. **Established** 🔵
Consistent users who have established reliable AI workflows for recurring tasks.

**Characteristics:**
- Regular, consistent usage
- Good quality outputs
- Moderate confidence
- Contributes in team discussions

**Coaching Focus:** Expand use cases and break comfort zones

### 3. **Emerging** 🟡
Users with positive attitudes but inconsistent usage patterns and developing confidence.

**Characteristics:**
- Positive attitude toward AI
- Low-moderate usage
- Learning from others
- Would attend training

**Coaching Focus:** Build confidence through quick wins

### 4. **Overwhelmed** 🟠
Users who struggle with task decomposition, delegation, and managing AI integration.

**Characteristics:**
- Difficulty delegating
- Uncomfortable with ambiguity
- Time pressure
- Low confidence despite interest

**Coaching Focus:** Foundational skills - decomposition & delegation

### 5. **Resistant** 🔴
Users with concerns about ethics, job security, or preference for traditional methods.

**Characteristics:**
- Job security fears
- Ethical concerns
- Skill atrophy worry
- Low excitement

**Coaching Focus:** Address root concerns (ethical/security)

## 📝 Assessment System

### Structure
- **4 Sections, 40 Questions**
  1. Current AI Usage (10 questions)
  2. Attitudes & Beliefs (12 questions)
  3. Barriers & Challenges (10 questions)
  4. Behavioral Indicators (8 questions)

### Question Types
- **Likert Scale** (1-5): Attitude measurements
- **Single Choice**: Behavior patterns
- **Multiple Choice**: Use cases, barriers
- **Ranking**: Priority identification
- **Free Text**: Qualitative insights

### Completion
- **Time**: ~15 minutes
- **Progress**: Save and resume
- **Unique Links**: Tracked per employee
- **Confidentiality**: Individual responses private

## 🧮 Classification Algorithm

### 7 Dimension Scores (0-100)

1. **Usage Frequency** - How often AI is used
2. **Usage Breadth** - Variety of use cases
3. **Usage Sophistication** - Prompt quality & iteration
4. **Confidence** - Self-efficacy with AI
5. **Trust** - Belief in AI quality/value
6. **Barriers** (inverse) - Obstacles to adoption
7. **Growth Mindset** - Experimentation & learning

### Classification Process

```typescript
1. Calculate dimension scores from responses
2. Calculate persona-specific indicators (0-100 each)
3. Apply classification rules:
   - IF Trailblazer ≥ 70 AND Frequency ≥ 75 → TRAILBLAZER
   - ELSE IF Established ≥ 60 AND Frequency ≥ 50 → ESTABLISHED
   - ELSE IF Emerging ≥ 60 AND (Confidence ≤ 50 OR Frequency < 50) → EMERGING
   - ELSE IF Overwhelmed ≥ 60 AND Confidence ≤ 40 → OVERWHELMED
   - ELSE IF Resistant ≥ 60 AND (Frequency ≤ 25 OR Trust ≤ 40) → RESISTANT
   - ELSE → Weighted scoring approach
4. Calculate confidence score (50-95%)
5. Detect conflicting signals
```

### Winner Identification

Only for **Trailblazer** and high-potential **Emerging** personas.

**5 Components (Weighted):**
- Business Impact (30%): Hours saved
- Social Influence (20%): Sharing & teaching
- Learning Velocity (25%): Tools tried & growth
- Strategic Thinking (15%): Appropriate AI use
- Sustainability (10%): Consistent advanced usage

**Thresholds:**
- Score ≥ 80 + Trailblazer/Emerging → Winner (HIGH priority)
- Score 70-79 + Trailblazer → Winner (MEDIUM priority)
- Score ≥ 85 + Established → Potential (MEDIUM priority)

## 👤 User Roles

### Admin
**Permissions:**
- Create/manage assessment campaigns
- View all organizational data
- Export reports (PDF, CSV, PPTX)
- Configure scoring weights
- Manage user accounts

### Coach
**Permissions:**
- View assigned employees
- Access coaching recommendations
- Track cohort performance
- Add coaching notes
- Cannot see org-wide financials

### Manager
**Permissions:**
- View team persona distribution
- Access team-level metrics
- Cannot see individual responses
- View aggregated data only

### Employee
**Permissions:**
- Take assessments
- View own persona (if admin allows)
- See personal recommendations
- Track own progress

## 🔌 API Documentation

### Authentication
```
POST   /api/auth/register        # Create account
POST   /api/auth/login           # Sign in
POST   /api/auth/logout          # Sign out
GET    /api/auth/session         # Get current session
```

### Campaigns
```
GET    /api/campaigns            # List campaigns
POST   /api/campaigns            # Create campaign
GET    /api/campaigns/:id        # Get campaign details
PUT    /api/campaigns/:id        # Update campaign
DELETE /api/campaigns/:id        # Delete campaign
POST   /api/campaigns/:id/launch # Launch campaign
```

### Assessments
```
GET    /api/assessments/:id      # Get assessment
POST   /api/assessments          # Submit assessment
PUT    /api/assessments/:id      # Update (save progress)
```

### Analytics
```
GET    /api/analytics/overview   # Org-wide stats
GET    /api/analytics/personas   # Persona distribution
GET    /api/analytics/trends     # Persona evolution
GET    /api/analytics/departments # Dept comparison
GET    /api/analytics/winners    # Winner leaderboard
```

### Employees
```
GET    /api/employees            # List employees
GET    /api/employees/:id        # Get employee details
PUT    /api/employees/:id        # Update employee
GET    /api/employees/:id/history # Persona history
```

## 🚀 Deployment

### Environment Variables (Production)

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="<generate-with-openssl-rand-base64-32>"
NEXTAUTH_URL="https://your-domain.com"

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@example.com"
SMTP_PASSWORD="your-app-password"

# App
APP_URL="https://your-domain.com"
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Connect PostgreSQL database (Vercel Postgres or external)
```

### Deploy to Docker

```bash
# Build image
docker build -t personaiq .

# Run container
docker run -p 3000:3000 --env-file .env personaiq
```

## 📊 Database Schema

### Key Models

- **User** - Authentication and role
- **Employee** - Employee profile with persona
- **Campaign** - Assessment campaigns
- **AssessmentResponse** - Individual assessment data
- **PersonaHistory** - Persona evolution tracking
- **CoachingNote** - Coach session notes
- **AuditLog** - Security and compliance

See `prisma/schema.prisma` for complete schema.

## 🔒 Security & Privacy

### Data Privacy
- Individual responses: Visible to Employee, Coach, Admin only
- Managers: See aggregated data only (min 5 employees)
- Free text: Coach review only, optional redaction

### Security
- Bcrypt password hashing
- HTTPS only (enforced in production)
- Role-based access control (RBAC)
- Audit logging
- GDPR compliance (right to access, delete, export)

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

## 📖 Usage Guide

### For Admins

1. **Create Campaign**
   - Navigate to Admin → Campaigns
   - Click "Create New Campaign"
   - Set name, dates, target audience
   - Configure settings (show results, allow retakes)
   - Launch campaign

2. **Monitor Progress**
   - Dashboard shows completion rates
   - View persona distribution
   - Track organizational readiness

3. **Export Reports**
   - Executive Summary (PDF)
   - Detailed Report (PDF)
   - Raw Data (CSV)
   - PowerPoint Deck (PPTX)

### For Coaches

1. **Review Cohort**
   - View assigned employees
   - Check persona distribution
   - Identify needs attention

2. **Individual Coaching**
   - Click employee name
   - Review persona & dimensions
   - Read coaching recommendations
   - Add session notes

3. **Track Progress**
   - Monitor persona transitions
   - Track success metrics
   - Watch for red flags

### For Employees

1. **Take Assessment**
   - Click unique link from email
   - Complete 40 questions (~15 min)
   - Submit assessment

2. **View Results** (if enabled)
   - See persona classification
   - Read personalized recommendations
   - Access learning resources

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 📧 Support

For questions or issues:
- Email: support@personaiq.com
- Documentation: https://docs.personaiq.com
- GitHub Issues: https://github.com/your-org/personaiq/issues

---

**Built with ❤️ for organizations accelerating AI adoption**
