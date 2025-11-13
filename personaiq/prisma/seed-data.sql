-- Seed Data for PersonaIQ
-- Run this in Supabase SQL Editor after creating tables
-- This creates demo users, campaigns, and persona profiles

-- Note: Passwords are bcrypt hashed (admin123, coach123, manager123, emp123, etc.)

-- 1. Admin User
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  'admin-user-001',
  'admin@personaiq.com',
  '$2a$10$Rq5vX3Cq6DZM5YXQ3gQl0O8lB2.YZ5fPZz9YX3Cq6DZM5YXQ3gQl0O',
  'Admin User',
  'ADMIN',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

-- 2. Coach User
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  'coach-user-001',
  'coach@personaiq.com',
  '$2a$10$Rq5vX3Cq6DZM5YXQ3gQl0O8lB2.YZ5fPZz9YX3Cq6DZM5YXQ3gQl0O',
  'Sarah Coach',
  'COACH',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

INSERT INTO "Coach" (id, "userId", specialization, "createdAt", "updatedAt")
VALUES (
  'coach-001',
  'coach-user-001',
  'AI Adoption & Change Management',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("userId") DO NOTHING;

-- 3. Manager User
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  'manager-user-001',
  'manager@personaiq.com',
  '$2a$10$Rq5vX3Cq6DZM5YXQ3gQl0O8lB2.YZ5fPZz9YX3Cq6DZM5YXQ3gQl0O',
  'Mike Manager',
  'MANAGER',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

INSERT INTO "Employee" (id, "userId", "employeeId", department, "jobRole", "managerId", "hireDate", "technicalBackground", "currentPersona", "createdAt", "updatedAt")
VALUES (
  'manager-emp-001',
  'manager-user-001',
  'MGR001',
  'Engineering',
  'Engineering Manager',
  NULL,
  '2020-01-15',
  'ADVANCED',
  'ESTABLISHED',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("userId") DO NOTHING;

-- 4. Employee Users (5 personas)
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt") VALUES
('emp-user-001', 'employee@personaiq.com', '$2a$10$Rq5vX3Cq6DZM5YXQ3gQl0O8lB2.YZ5fPZz9YX3Cq6DZM5YXQ3gQl0O', 'John Employee', 'EMPLOYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('emp-user-002', 'trailblazer@personaiq.com', '$2a$10$Rq5vX3Cq6DZM5YXQ3gQl0O8lB2.YZ5fPZz9YX3Cq6DZM5YXQ3gQl0O', 'Alex Trailblazer', 'EMPLOYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('emp-user-003', 'established@personaiq.com', '$2a$10$Rq5vX3Cq6DZM5YXQ3gQl0O8lB2.YZ5fPZz9YX3Cq6DZM5YXQ3gQl0O', 'Emma Established', 'EMPLOYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('emp-user-004', 'overwhelmed@personaiq.com', '$2a$10$Rq5vX3Cq6DZM5YXQ3gQl0O8lB2.YZ5fPZz9YX3Cq6DZM5YXQ3gQl0O', 'Oliver Overwhelmed', 'EMPLOYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('emp-user-005', 'resistant@personaiq.com', '$2a$10$Rq5vX3Cq6DZM5YXQ3gQl0O8lB2.YZ5fPZz9YX3Cq6DZM5YXQ3gQl0O', 'Rachel Resistant', 'EMPLOYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

INSERT INTO "Employee" (id, "userId", "employeeId", department, "jobRole", "managerId", "hireDate", "technicalBackground", "currentPersona", "assignedCoachId", "winnerStatus", "winnerScore", "createdAt", "updatedAt") VALUES
('emp-001', 'emp-user-001', 'EMP001', 'Engineering', 'Software Engineer', 'manager-emp-001', '2021-06-01', 'INTERMEDIATE', 'EMERGING', 'coach-001', false, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('emp-002', 'emp-user-002', 'EMP002', 'Engineering', 'Senior Engineer', 'manager-emp-001', '2021-06-01', 'ADVANCED', 'TRAILBLAZER', 'coach-001', true, 85, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('emp-003', 'emp-user-003', 'EMP003', 'Marketing', 'Marketing Manager', 'manager-emp-001', '2021-06-01', 'INTERMEDIATE', 'ESTABLISHED', 'coach-001', false, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('emp-004', 'emp-user-004', 'EMP004', 'Sales', 'Account Executive', 'manager-emp-001', '2021-06-01', 'BASIC', 'OVERWHELMED', 'coach-001', false, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('emp-005', 'emp-user-005', 'EMP005', 'Legal', 'Legal Counsel', 'manager-emp-001', '2021-06-01', 'NONE', 'RESISTANT', 'coach-001', false, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("userId") DO NOTHING;

-- 5. Demo Campaign
INSERT INTO "Campaign" (id, name, "startDate", "endDate", status, "createdById", "targetAll", "targetDepartments", "targetEmployeeIds", "showResultsToParticipant", "allowRetakes", "sendReminders", "reminderDays", "createdAt", "updatedAt")
VALUES (
  'demo-campaign',
  'Q4 2024 AI Adoption Assessment',
  '2024-10-01',
  '2024-12-31',
  'ACTIVE',
  'admin-user-001',
  true,
  '[]'::jsonb,
  '[]'::jsonb,
  true,
  false,
  true,
  3,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 6. Persona Profiles
INSERT INTO "PersonaProfile" (id, "personaType", name, description, "primaryBarriers", "coachingStrategies", "recommendedFrequency", "resourceAllocationWeight", "createdAt", "updatedAt") VALUES
(
  'persona-trailblazer',
  'TRAILBLAZER',
  'Trailblazer',
  'Advanced users who actively experiment, share knowledge, and lead AI adoption initiatives.',
  '["Time to mentor others", "Organizational pace"]'::jsonb,
  '["Scale impact through teaching", "Lead innovation challenges", "Mentor emerging users"]'::jsonb,
  'Bi-weekly 1:1 Executive Coaching',
  1.5,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'persona-established',
  'ESTABLISHED',
  'Established',
  'Consistent users who have established reliable AI workflows for recurring tasks.',
  '["Comfort zone", "Limited exploration"]'::jsonb,
  '["Expand use cases", "Try new tools", "Peer learning sessions"]'::jsonb,
  'Bi-weekly Group Coaching',
  1.0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'persona-emerging',
  'EMERGING',
  'Emerging',
  'Users with positive attitudes but inconsistent usage patterns and developing confidence.',
  '["Low confidence", "Inconsistent usage", "Limited skills"]'::jsonb,
  '["Build confidence through wins", "Buddy pairing", "Daily usage challenges"]'::jsonb,
  'Weekly 15-min Check-ins',
  1.2,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'persona-overwhelmed',
  'OVERWHELMED',
  'Overwhelmed',
  'Users who struggle with task decomposition, delegation, and managing AI integration.',
  '["Perfectionism", "Delegation difficulty", "Time pressure"]'::jsonb,
  '["Task decomposition", "Good enough framework", "Reduce review cycles"]'::jsonb,
  'Bi-weekly 30-min Intensive Coaching',
  1.3,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'persona-resistant',
  'RESISTANT',
  'Resistant',
  'Users with concerns about ethics, job security, or preference for traditional methods.',
  '["Job security fears", "Ethical concerns", "Skill atrophy worry"]'::jsonb,
  '["Address root concerns", "Values alignment", "Optional engagement"]'::jsonb,
  'Monthly Optional 1:1',
  0.8,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("personaType") DO NOTHING;

-- Summary
SELECT 'Seed data created successfully!' as message;
SELECT 'Demo users:' as message;
SELECT '  Admin: admin@personaiq.com / admin123' as message;
SELECT '  Coach: coach@personaiq.com / coach123' as message;
SELECT '  Manager: manager@personaiq.com / manager123' as message;
SELECT '  Employee: employee@personaiq.com / emp123' as message;
