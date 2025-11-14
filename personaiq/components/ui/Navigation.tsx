'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Brain, LogOut, LayoutDashboard, Users, Target, BarChart3, ClipboardList } from 'lucide-react'
import { Button } from './Button'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavigationProps {
  role: string
  userName: string
  onSignOut: () => void
}

export function Navigation({ role, userName, onSignOut }: NavigationProps) {
  const pathname = usePathname()

  const navItems: Record<string, NavItem[]> = {
    ADMIN: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/campaigns', label: 'Campaigns', icon: Target },
      { href: '/admin/employees', label: 'Employees', icon: Users },
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 }
    ],
    COACH: [
      { href: '/coach', label: 'Dashboard', icon: LayoutDashboard }
    ],
    MANAGER: [
      { href: '/manager', label: 'Dashboard', icon: LayoutDashboard }
    ],
    EMPLOYEE: [
      { href: '/employee', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/employee/assessment', label: 'Take Assessment', icon: ClipboardList }
    ]
  }

  const items = navItems[role] || []

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">PersonaIQ</span>
            </Link>

            <div className="hidden md:flex items-center space-x-4">
              {items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <div className="font-medium text-gray-900">{userName}</div>
              <div className="text-gray-500">{role}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSignOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
