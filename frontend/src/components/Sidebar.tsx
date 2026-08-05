'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Zap,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
  Home,
  UserCheck,
  Sparkles,
  Settings,
  Users,
  Activity
} from 'lucide-react'
import { getDecodedToken, removeAuthToken, DecodedToken } from '@/lib/auth'

interface SidebarProps {
  onToggleCollapse?: (collapsed: boolean) => void
}

export default function Sidebar({ onToggleCollapse }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [user, setUser] = useState<DecodedToken | null>(null)

  useEffect(() => {
    // Load saved collapse preference
    const saved = localStorage.getItem('nexus_sidebar_collapsed')
    if (saved === 'true') {
      setIsCollapsed(true)
      onToggleCollapse?.(true)
    }

    const decoded = getDecodedToken()
    if (decoded) {
      setUser(decoded)
    }
  }, [onToggleCollapse])

  const toggleSidebar = () => {
    const nextState = !isCollapsed
    setIsCollapsed(nextState)
    localStorage.setItem('nexus_sidebar_collapsed', String(nextState))
    onToggleCollapse?.(nextState)
  }

  const handleLogout = () => {
    removeAuthToken()
    router.push('/login')
  }

  const navItems = [
    {
      label: 'Control Hub',
      href: '/',
      icon: Home,
      role: 'all'
    },
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      role: 'all'
    },
    {
      label: 'POS Terminal',
      href: '/pos',
      icon: ShoppingBag,
      role: 'all',
      badge: 'Live'
    },
    {
      label: 'Inventory Products',
      href: '/dashboard/products',
      icon: Package,
      role: 'admin-manager'
    },
    {
      label: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
      role: 'admin'
    },
    {
      label: 'Audit Trail',
      href: '/dashboard/audit',
      icon: Activity,
      role: 'admin'
    }
  ]

  return (
    <>
      {/* Fixed Sidebar */}
      <aside
        className={`glass-panel border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 ease-in-out fixed top-0 left-0 h-screen overflow-y-auto scrollbar-none z-40 shrink-0 select-none ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Top Header & Brand */}
        <div className="p-4 space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 overflow-hidden">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/25 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col transition-opacity duration-300">
                  <span className="font-extrabold text-base tracking-tight text-white leading-tight">NEXUS ERP</span>
                  <span className="text-[10px] font-semibold text-indigo-400">Enterprise v2.5</span>
                </div>
              )}
            </Link>

            {/* Expand / Collapse Button */}
            <button
              onClick={toggleSidebar}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition shadow-md shrink-0"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-indigo-400" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-indigo-400" />
              )}
            </button>
          </div>

          {/* User Profile Pill */}
          {user && (
            <div
              className={`p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center ${
                isCollapsed ? 'justify-center' : 'space-x-3'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden space-y-0.5">
                  <p className="text-xs font-bold text-white uppercase tracking-wider line-clamp-1">{user.role}</p>
                  <p className="text-[10px] text-slate-400">Authenticated Session</p>
                </div>
              )}
            </div>
          )}

          {/* Nav Links List */}
          <nav className="space-y-1.5 pt-2">
            {!isCollapsed && (
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 pb-1">
                Navigation
              </p>
            )}

            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              // Hide admin-only links
              if (item.role === 'admin' && user && user.role !== 'admin') {
                return null
              }
              // Hide products menu for staff if desired
              if (item.role === 'admin-manager' && user && user.role === 'staff') {
                return null
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center px-3.5 py-3 rounded-xl text-xs font-bold transition group ${
                    isCollapsed ? 'justify-center' : 'justify-between'
                  } ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-600/25 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 shrink-0 transition ${isActive ? 'text-white' : 'group-hover:text-indigo-400'}`} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>

                  {!isCollapsed && item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}

            {user?.role !== 'staff' && (
              <Link
                href="/dashboard/users"
                title={isCollapsed ? "Team & Users" : undefined}
                className={`flex items-center px-3.5 py-3 rounded-xl text-xs font-bold transition group ${
                  isCollapsed ? 'justify-center' : 'justify-between'
                } ${
                  pathname === '/dashboard/users'
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-600/25 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Users className={`w-4 h-4 shrink-0 transition ${pathname === '/dashboard/users' ? 'text-white' : 'group-hover:text-indigo-400'}`} />
                  {!isCollapsed && <span>Team & Users</span>}
                </div>
              </Link>
            )}
          </nav>
        </div>

        {/* Bottom Footer Actions */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          {user ? (
            <button
              onClick={handleLogout}
              title={isCollapsed ? "Logout Session" : undefined}
              className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center ${
                isCollapsed ? 'justify-center' : 'space-x-3'
              } bg-slate-900/80 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-800/50`}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Logout Session</span>}
            </button>
          ) : (
            <Link
              href="/login"
              title={isCollapsed ? "Sign In" : undefined}
              className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center ${
                isCollapsed ? 'justify-center' : 'space-x-3'
              } bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Sign In</span>}
            </Link>
          )}
        </div>
      </aside>

      {/* Phantom Layout Spacer */}
      <div className={`shrink-0 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`} />
    </>
  )
}
