import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UserRole } from "@prisma/client"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login')
  }

  // Redirect based on role
  switch (session.user.role) {
    case UserRole.ADMIN:
      redirect('/admin')
    case UserRole.COACH:
      redirect('/coach')
    case UserRole.MANAGER:
      redirect('/manager')
    case UserRole.EMPLOYEE:
      redirect('/employee')
    default:
      redirect('/auth/login')
  }
}
