import { PrismaClient, UserRole, TechnicalBackground, PersonaType, CampaignStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@personaiq.com' },
    update: {},
    create: {
      email: 'admin@personaiq.com',
      password: adminPassword,
      name: 'Admin User',
      role: UserRole.ADMIN
    }
  })
  console.log('Created admin user:', admin.email)

  // Create Demo Campaign
  const demoCampaign = await prisma.campaign.upsert({
    where: { id: 'demo-campaign' },
    update: {},
    create: {
      id: 'demo-campaign',
      name: 'Q4 2024 AI Adoption Assessment',
      startDate: new Date('2024-10-01'),
      endDate: new Date('2024-12-31'),
      status: CampaignStatus.ACTIVE,
      createdById: admin.id,
      targetAll: true,
      targetDepartments: [],
      targetEmployeeIds: [],
      showResultsToParticipant: true,
      allowRetakes: false,
      sendReminders: true,
      reminderDays: 3
    }
  })
  console.log('Created demo campaign:', demoCampaign.name)

  // Create Coach User
  const coachPassword = await bcrypt.hash('coach123', 10)
  const coachUser = await prisma.user.upsert({
    where: { email: 'coach@personaiq.com' },
    update: {},
    create: {
      email: 'coach@personaiq.com',
      password: coachPassword,
      name: 'Sarah Coach',
      role: UserRole.COACH
    }
  })

  const coach = await prisma.coach.upsert({
    where: { userId: coachUser.id },
    update: {},
    create: {
      userId: coachUser.id,
      specialization: 'AI Adoption & Change Management'
    }
  })
  console.log('Created coach:', coachUser.email)

  // Create Manager User
  const managerPassword = await bcrypt.hash('manager123', 10)
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@personaiq.com' },
    update: {},
    create: {
      email: 'manager@personaiq.com',
      password: managerPassword,
      name: 'Mike Manager',
      role: UserRole.MANAGER
    }
  })

  const managerEmployee = await prisma.employee.upsert({
    where: { userId: managerUser.id },
    update: {},
    create: {
      userId: managerUser.id,
      employeeId: 'MGR001',
      department: 'Engineering',
      jobRole: 'Engineering Manager',
      hireDate: new Date('2020-01-15'),
      technicalBackground: TechnicalBackground.ADVANCED,
      currentPersona: PersonaType.ESTABLISHED
    }
  })
  console.log('Created manager:', managerUser.email)

  // Create Employee Users with different personas
  const employees = [
    {
      email: 'employee@personaiq.com',
      password: await bcrypt.hash('emp123', 10),
      name: 'John Employee',
      employeeId: 'EMP001',
      department: 'Engineering',
      jobRole: 'Software Engineer',
      persona: PersonaType.EMERGING,
      technical: TechnicalBackground.INTERMEDIATE
    },
    {
      email: 'trailblazer@personaiq.com',
      password: await bcrypt.hash('trail123', 10),
      name: 'Alex Trailblazer',
      employeeId: 'EMP002',
      department: 'Engineering',
      jobRole: 'Senior Engineer',
      persona: PersonaType.TRAILBLAZER,
      technical: TechnicalBackground.ADVANCED
    },
    {
      email: 'established@personaiq.com',
      password: await bcrypt.hash('est123', 10),
      name: 'Emma Established',
      employeeId: 'EMP003',
      department: 'Marketing',
      jobRole: 'Marketing Manager',
      persona: PersonaType.ESTABLISHED,
      technical: TechnicalBackground.INTERMEDIATE
    },
    {
      email: 'overwhelmed@personaiq.com',
      password: await bcrypt.hash('over123', 10),
      name: 'Oliver Overwhelmed',
      employeeId: 'EMP004',
      department: 'Sales',
      jobRole: 'Account Executive',
      persona: PersonaType.OVERWHELMED,
      technical: TechnicalBackground.BASIC
    },
    {
      email: 'resistant@personaiq.com',
      password: await bcrypt.hash('resist123', 10),
      name: 'Rachel Resistant',
      employeeId: 'EMP005',
      department: 'Legal',
      jobRole: 'Legal Counsel',
      persona: PersonaType.RESISTANT,
      technical: TechnicalBackground.NONE
    }
  ]

  for (const emp of employees) {
    const user = await prisma.user.upsert({
      where: { email: emp.email },
      update: {},
      create: {
        email: emp.email,
        password: emp.password,
        name: emp.name,
        role: UserRole.EMPLOYEE
      }
    })

    await prisma.employee.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        employeeId: emp.employeeId,
        department: emp.department,
        jobRole: emp.jobRole,
        hireDate: new Date('2021-06-01'),
        technicalBackground: emp.technical,
        currentPersona: emp.persona,
        managerId: managerEmployee.id,
        assignedCoachId: coach.id,
        winnerStatus: emp.persona === PersonaType.TRAILBLAZER,
        winnerScore: emp.persona === PersonaType.TRAILBLAZER ? 85 : 0
      }
    })
    console.log('Created employee:', emp.email)
  }

  // Create Persona Profiles
  const personaProfiles = [
    {
      personaType: PersonaType.TRAILBLAZER,
      name: 'Trailblazer',
      description: 'Advanced users who actively experiment, share knowledge, and lead AI adoption initiatives.',
      primaryBarriers: ['Time to mentor others', 'Organizational pace'],
      coachingStrategies: ['Scale impact through teaching', 'Lead innovation challenges', 'Mentor emerging users'],
      recommendedFrequency: 'Bi-weekly 1:1 Executive Coaching',
      resourceAllocationWeight: 1.5
    },
    {
      personaType: PersonaType.ESTABLISHED,
      name: 'Established',
      description: 'Consistent users who have established reliable AI workflows for recurring tasks.',
      primaryBarriers: ['Comfort zone', 'Limited exploration'],
      coachingStrategies: ['Expand use cases', 'Try new tools', 'Peer learning sessions'],
      recommendedFrequency: 'Bi-weekly Group Coaching',
      resourceAllocationWeight: 1.0
    },
    {
      personaType: PersonaType.EMERGING,
      name: 'Emerging',
      description: 'Users with positive attitudes but inconsistent usage patterns and developing confidence.',
      primaryBarriers: ['Low confidence', 'Inconsistent usage', 'Limited skills'],
      coachingStrategies: ['Build confidence through wins', 'Buddy pairing', 'Daily usage challenges'],
      recommendedFrequency: 'Weekly 15-min Check-ins',
      resourceAllocationWeight: 1.2
    },
    {
      personaType: PersonaType.OVERWHELMED,
      name: 'Overwhelmed',
      description: 'Users who struggle with task decomposition, delegation, and managing AI integration.',
      primaryBarriers: ['Perfectionism', 'Delegation difficulty', 'Time pressure'],
      coachingStrategies: ['Task decomposition', 'Good enough framework', 'Reduce review cycles'],
      recommendedFrequency: 'Bi-weekly 30-min Intensive Coaching',
      resourceAllocationWeight: 1.3
    },
    {
      personaType: PersonaType.RESISTANT,
      name: 'Resistant',
      description: 'Users with concerns about ethics, job security, or preference for traditional methods.',
      primaryBarriers: ['Job security fears', 'Ethical concerns', 'Skill atrophy worry'],
      coachingStrategies: ['Address root concerns', 'Values alignment', 'Optional engagement'],
      recommendedFrequency: 'Monthly Optional 1:1',
      resourceAllocationWeight: 0.8
    }
  ]

  for (const profile of personaProfiles) {
    await prisma.personaProfile.upsert({
      where: { personaType: profile.personaType },
      update: {},
      create: profile
    })
  }
  console.log('Created persona profiles')

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
