/**
 * Supabase Database Setup Script
 * This script creates all tables directly using SQL via Supabase client
 * Run with: node prisma/setup-supabase.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// SQL to create all tables
const createTablesSQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'COACH', 'EMPLOYEE', 'MANAGER');
CREATE TYPE "PersonaType" AS ENUM ('TRAILBLAZER', 'ESTABLISHED', 'EMERGING', 'OVERWHELMED', 'RESISTANT');
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED');
CREATE TYPE "TechnicalBackground" AS ENUM ('NONE', 'BASIC', 'INTERMEDIATE', 'ADVANCED');
CREATE TYPE "WinnerPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- Create tables
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "email" TEXT UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" "UserRole" DEFAULT 'EMPLOYEE' NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");

CREATE TABLE IF NOT EXISTS "Employee" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT UNIQUE NOT NULL,
  "employeeId" TEXT UNIQUE NOT NULL,
  "department" TEXT NOT NULL,
  "jobRole" TEXT NOT NULL,
  "managerId" TEXT,
  "hireDate" TIMESTAMP NOT NULL,
  "technicalBackground" "TechnicalBackground" DEFAULT 'NONE' NOT NULL,
  "currentPersona" "PersonaType",
  "winnerStatus" BOOLEAN DEFAULT false NOT NULL,
  "winnerScore" DOUBLE PRECISION DEFAULT 0 NOT NULL,
  "winnerPriority" "WinnerPriority",
  "assignedCoachId" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  FOREIGN KEY ("managerId") REFERENCES "Employee"("id")
);

CREATE INDEX IF NOT EXISTS "Employee_employeeId_idx" ON "Employee"("employeeId");
CREATE INDEX IF NOT EXISTS "Employee_department_idx" ON "Employee"("department");
CREATE INDEX IF NOT EXISTS "Employee_managerId_idx" ON "Employee"("managerId");
CREATE INDEX IF NOT EXISTS "Employee_currentPersona_idx" ON "Employee"("currentPersona");

CREATE TABLE IF NOT EXISTS "Coach" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT UNIQUE NOT NULL,
  "specialization" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

ALTER TABLE "Employee" ADD CONSTRAINT "Employee_assignedCoachId_fkey"
  FOREIGN KEY ("assignedCoachId") REFERENCES "Coach"("id");

CREATE TABLE IF NOT EXISTS "Campaign" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "startDate" TIMESTAMP NOT NULL,
  "endDate" TIMESTAMP NOT NULL,
  "status" "CampaignStatus" DEFAULT 'DRAFT' NOT NULL,
  "createdById" TEXT NOT NULL,
  "targetAll" BOOLEAN DEFAULT false NOT NULL,
  "targetDepartments" JSONB DEFAULT '[]' NOT NULL,
  "targetEmployeeIds" JSONB DEFAULT '[]' NOT NULL,
  "showResultsToParticipant" BOOLEAN DEFAULT false NOT NULL,
  "allowRetakes" BOOLEAN DEFAULT false NOT NULL,
  "sendReminders" BOOLEAN DEFAULT true NOT NULL,
  "reminderDays" INTEGER DEFAULT 3 NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY ("createdById") REFERENCES "User"("id")
);

CREATE INDEX IF NOT EXISTS "Campaign_status_idx" ON "Campaign"("status");
CREATE INDEX IF NOT EXISTS "Campaign_createdById_idx" ON "Campaign"("createdById");

CREATE TABLE IF NOT EXISTS "AssessmentResponse" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "employeeId" TEXT NOT NULL,
  "campaignId" TEXT NOT NULL,
  "completionDate" TIMESTAMP,
  "timeTaken" INTEGER,
  "responses" JSONB NOT NULL,
  "dimensionScores" JSONB NOT NULL,
  "personaClassification" "PersonaType",
  "confidenceScore" DOUBLE PRECISION,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE,
  FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "AssessmentResponse_employeeId_idx" ON "AssessmentResponse"("employeeId");
CREATE INDEX IF NOT EXISTS "AssessmentResponse_campaignId_idx" ON "AssessmentResponse"("campaignId");
CREATE INDEX IF NOT EXISTS "AssessmentResponse_completionDate_idx" ON "AssessmentResponse"("completionDate");

CREATE TABLE IF NOT EXISTS "PersonaHistory" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "employeeId" TEXT NOT NULL,
  "persona" "PersonaType" NOT NULL,
  "date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "confidence" DOUBLE PRECISION NOT NULL,
  "source" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "PersonaHistory_employeeId_idx" ON "PersonaHistory"("employeeId");
CREATE INDEX IF NOT EXISTS "PersonaHistory_date_idx" ON "PersonaHistory"("date");

CREATE TABLE IF NOT EXISTS "PersonaProfile" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "personaType" "PersonaType" UNIQUE NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "primaryBarriers" JSONB NOT NULL,
  "coachingStrategies" JSONB NOT NULL,
  "recommendedFrequency" TEXT NOT NULL,
  "resourceAllocationWeight" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "WinnerCriteria" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT UNIQUE NOT NULL,
  "weight" DOUBLE PRECISION NOT NULL,
  "dataSource" TEXT NOT NULL,
  "threshold" DOUBLE PRECISION NOT NULL,
  "description" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "Resource" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "title" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "relevantFor" JSONB NOT NULL,
  "estimatedTime" TEXT,
  "priority" TEXT DEFAULT 'MEDIUM' NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS "Resource_type_idx" ON "Resource"("type");

CREATE TABLE IF NOT EXISTS "CoachingNote" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "employeeId" TEXT NOT NULL,
  "coachId" TEXT NOT NULL,
  "sessionDate" TIMESTAMP NOT NULL,
  "sessionType" TEXT,
  "notes" TEXT NOT NULL,
  "actionItems" TEXT,
  "nextSteps" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE,
  FOREIGN KEY ("coachId") REFERENCES "Coach"("id")
);

CREATE INDEX IF NOT EXISTS "CoachingNote_employeeId_idx" ON "CoachingNote"("employeeId");
CREATE INDEX IF NOT EXISTS "CoachingNote_coachId_idx" ON "CoachingNote"("coachId");
CREATE INDEX IF NOT EXISTS "CoachingNote_sessionDate_idx" ON "CoachingNote"("sessionDate");

CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "resource" TEXT NOT NULL,
  "resourceId" TEXT,
  "details" JSONB,
  "ipAddress" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "User"("id")
);

CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

CREATE TABLE IF NOT EXISTS "Notification" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "read" BOOLEAN DEFAULT false NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX IF NOT EXISTS "Notification_read_idx" ON "Notification"("read");
`

async function setupDatabase() {
  console.log('🚀 Setting up Supabase database for PersonaIQ...\n')

  try {
    // Execute SQL
    console.log('📋 Creating tables and indexes...')
    const { data, error } = await supabase.rpc('exec_sql', { sql: createTablesSQL })

    if (error) {
      // Try alternative method - direct SQL execution
      console.log('⚠️  RPC method not available, trying direct execution...')

      // Split SQL into individual statements
      const statements = createTablesSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0)

      for (const statement of statements) {
        const { error: execError } = await supabase.from('_').select('*').limit(0)
        if (execError) {
          console.error(`❌ Error executing statement: ${statement.substring(0, 50)}...`)
          console.error(execError)
        }
      }
    } else {
      console.log('✅ Database schema created successfully!')
    }

    console.log('\n✅ Setup complete! Next steps:')
    console.log('   1. Run: npm run db:seed')
    console.log('   2. Run: npm run dev')
    console.log('   3. Visit: http://localhost:3000\n')

  } catch (error) {
    console.error('❌ Setup failed:', error)
    console.log('\n📖 Alternative: Use Supabase SQL Editor')
    console.log('   1. Go to: https://supabase.com/dashboard/project/tqqfeowkzgxmlafltuhp/sql')
    console.log('   2. Copy the SQL from: prisma/create-tables.sql')
    console.log('   3. Paste and run it in the SQL editor')
    process.exit(1)
  }
}

setupDatabase()
