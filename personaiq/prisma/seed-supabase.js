/**
 * Supabase Database Seed Script
 * Seeds the database with demo users, campaigns, and persona profiles
 * Run with: node prisma/seed-supabase.js
 */

const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')

// Load environment variables
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedDatabase() {
  console.log('🌱 Seeding Supabase database...\n')

  try {
    // Create Admin User
    console.log('Creating admin user...')
    const adminPassword = await bcrypt.hash('admin123', 10)
    const { data: admin, error: adminError } = await supabase
      .from('User')
      .upsert({
        email: 'admin@personaiq.com',
        password: adminPassword,
        name: 'Admin User',
        role: 'ADMIN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { onConflict: 'email' })
      .select()
      .single()

    if (adminError && adminError.code !== '23505') {
      console.error('❌ Error creating admin:', adminError)
    } else {
      console.log('✅ Admin user created:', 'admin@personaiq.com')
    }

    // Get admin user
    const { data: adminUser } = await supabase
      .from('User')
      .select('*')
      .eq('email', 'admin@personaiq.com')
      .single()

    // Create Demo Campaign
    console.log('Creating demo campaign...')
    const { error: campaignError } = await supabase
      .from('Campaign')
      .upsert({
        id: 'demo-campaign',
        name: 'Q4 2024 AI Adoption Assessment',
        startDate: new Date('2024-10-01').toISOString(),
        endDate: new Date('2024-12-31').toISOString(),
        status: 'ACTIVE',
        createdById: adminUser.id,
        targetAll: true,
        targetDepartments: [],
        targetEmployeeIds: [],
        showResultsToParticipant: true,
        allowRetakes: false,
        sendReminders: true,
        reminderDays: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { onConflict: 'id' })

    if (campaignError && campaignError.code !== '23505') {
      console.error('❌ Error creating campaign:', campaignError)
    } else {
      console.log('✅ Demo campaign created')
    }

    // Create Coach User
    console.log('Creating coach user...')
    const coachPassword = await bcrypt.hash('coach123', 10)
    await supabase
      .from('User')
      .upsert({
        email: 'coach@personaiq.com',
        password: coachPassword,
        name: 'Sarah Coach',
        role: 'COACH',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { onConflict: 'email' })

    const { data: coachUser } = await supabase
      .from('User')
      .select('*')
      .eq('email', 'coach@personaiq.com')
      .single()

    await supabase
      .from('Coach')
      .upsert({
        userId: coachUser.id,
        specialization: 'AI Adoption & Change Management',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { onConflict: 'userId' })

    const { data: coach } = await supabase
      .from('Coach')
      .select('*')
      .eq('userId', coachUser.id)
      .single()

    console.log('✅ Coach created:', coachUser.email)

    // Create Manager User
    console.log('Creating manager user...')
    const managerPassword = await bcrypt.hash('manager123', 10)
    await supabase
      .from('User')
      .upsert({
        email: 'manager@personaiq.com',
        password: managerPassword,
        name: 'Mike Manager',
        role: 'MANAGER',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { onConflict: 'email' })

    const { data: managerUser } = await supabase
      .from('User')
      .select('*')
      .eq('email', 'manager@personaiq.com')
      .single()

    await supabase
      .from('Employee')
      .upsert({
        userId: managerUser.id,
        employeeId: 'MGR001',
        department: 'Engineering',
        jobRole: 'Engineering Manager',
        hireDate: new Date('2020-01-15').toISOString(),
        technicalBackground: 'ADVANCED',
        currentPersona: 'ESTABLISHED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { onConflict: 'userId' })

    const { data: managerEmployee } = await supabase
      .from('Employee')
      .select('*')
      .eq('userId', managerUser.id)
      .single()

    console.log('✅ Manager created:', managerUser.email)

    // Create Employee Users
    const employees = [
      {
        email: 'employee@personaiq.com',
        password: await bcrypt.hash('emp123', 10),
        name: 'John Employee',
        employeeId: 'EMP001',
        department: 'Engineering',
        jobRole: 'Software Engineer',
        persona: 'EMERGING',
        technical: 'INTERMEDIATE'
      },
      {
        email: 'trailblazer@personaiq.com',
        password: await bcrypt.hash('trail123', 10),
        name: 'Alex Trailblazer',
        employeeId: 'EMP002',
        department: 'Engineering',
        jobRole: 'Senior Engineer',
        persona: 'TRAILBLAZER',
        technical: 'ADVANCED'
      },
      {
        email: 'established@personaiq.com',
        password: await bcrypt.hash('est123', 10),
        name: 'Emma Established',
        employeeId: 'EMP003',
        department: 'Marketing',
        jobRole: 'Marketing Manager',
        persona: 'ESTABLISHED',
        technical: 'INTERMEDIATE'
      },
      {
        email: 'overwhelmed@personaiq.com',
        password: await bcrypt.hash('over123', 10),
        name: 'Oliver Overwhelmed',
        employeeId: 'EMP004',
        department: 'Sales',
        jobRole: 'Account Executive',
        persona: 'OVERWHELMED',
        technical: 'BASIC'
      },
      {
        email: 'resistant@personaiq.com',
        password: await bcrypt.hash('resist123', 10),
        name: 'Rachel Resistant',
        employeeId: 'EMP005',
        department: 'Legal',
        jobRole: 'Legal Counsel',
        persona: 'RESISTANT',
        technical: 'NONE'
      }
    ]

    console.log('Creating employee users...')
    for (const emp of employees) {
      await supabase
        .from('User')
        .upsert({
          email: emp.email,
          password: emp.password,
          name: emp.name,
          role: 'EMPLOYEE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { onConflict: 'email' })

      const { data: user } = await supabase
        .from('User')
        .select('*')
        .eq('email', emp.email)
        .single()

      await supabase
        .from('Employee')
        .upsert({
          userId: user.id,
          employeeId: emp.employeeId,
          department: emp.department,
          jobRole: emp.jobRole,
          hireDate: new Date('2021-06-01').toISOString(),
          technicalBackground: emp.technical,
          currentPersona: emp.persona,
          managerId: managerEmployee.id,
          assignedCoachId: coach.id,
          winnerStatus: emp.persona === 'TRAILBLAZER',
          winnerScore: emp.persona === 'TRAILBLAZER' ? 85 : 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { onConflict: 'userId' })

      console.log('✅ Employee created:', emp.email)
    }

    // Create Persona Profiles
    console.log('Creating persona profiles...')
    const personaProfiles = [
      {
        personaType: 'TRAILBLAZER',
        name: 'Trailblazer',
        description: 'Advanced users who actively experiment, share knowledge, and lead AI adoption initiatives.',
        primaryBarriers: ['Time to mentor others', 'Organizational pace'],
        coachingStrategies: ['Scale impact through teaching', 'Lead innovation challenges', 'Mentor emerging users'],
        recommendedFrequency: 'Bi-weekly 1:1 Executive Coaching',
        resourceAllocationWeight: 1.5
      },
      {
        personaType: 'ESTABLISHED',
        name: 'Established',
        description: 'Consistent users who have established reliable AI workflows for recurring tasks.',
        primaryBarriers: ['Comfort zone', 'Limited exploration'],
        coachingStrategies: ['Expand use cases', 'Try new tools', 'Peer learning sessions'],
        recommendedFrequency: 'Bi-weekly Group Coaching',
        resourceAllocationWeight: 1.0
      },
      {
        personaType: 'EMERGING',
        name: 'Emerging',
        description: 'Users with positive attitudes but inconsistent usage patterns and developing confidence.',
        primaryBarriers: ['Low confidence', 'Inconsistent usage', 'Limited skills'],
        coachingStrategies: ['Build confidence through wins', 'Buddy pairing', 'Daily usage challenges'],
        recommendedFrequency: 'Weekly 15-min Check-ins',
        resourceAllocationWeight: 1.2
      },
      {
        personaType: 'OVERWHELMED',
        name: 'Overwhelmed',
        description: 'Users who struggle with task decomposition, delegation, and managing AI integration.',
        primaryBarriers: ['Perfectionism', 'Delegation difficulty', 'Time pressure'],
        coachingStrategies: ['Task decomposition', 'Good enough framework', 'Reduce review cycles'],
        recommendedFrequency: 'Bi-weekly 30-min Intensive Coaching',
        resourceAllocationWeight: 1.3
      },
      {
        personaType: 'RESISTANT',
        name: 'Resistant',
        description: 'Users with concerns about ethics, job security, or preference for traditional methods.',
        primaryBarriers: ['Job security fears', 'Ethical concerns', 'Skill atrophy worry'],
        coachingStrategies: ['Address root concerns', 'Values alignment', 'Optional engagement'],
        recommendedFrequency: 'Monthly Optional 1:1',
        resourceAllocationWeight: 0.8
      }
    ]

    for (const profile of personaProfiles) {
      await supabase
        .from('PersonaProfile')
        .upsert({
          ...profile,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { onConflict: 'personaType' })
    }

    console.log('✅ Persona profiles created')

    console.log('\n✅ Seeding completed successfully!')
    console.log('\n📊 Demo Users:')
    console.log('   Admin:    admin@personaiq.com / admin123')
    console.log('   Coach:    coach@personaiq.com / coach123')
    console.log('   Manager:  manager@personaiq.com / manager123')
    console.log('   Employee: employee@personaiq.com / emp123')
    console.log('\n🚀 Next step: npm run dev\n')

  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

seedDatabase()
