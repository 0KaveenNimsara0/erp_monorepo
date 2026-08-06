'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  ShieldCheck,
  Zap,
  Activity,
  Database,
  ArrowRight,
  Sparkles,
  Clock,
  TrendingUp,
  Server,
  Terminal,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  LogOut
} from 'lucide-react'
import { fetchProductsFromApi, fetchSalesFromApi, Product, Transaction, checkHealthApi } from '@/lib/products'
import { getDecodedToken, removeAuthToken, DecodedToken } from '@/lib/auth'

export default function Home() {
  const [time, setTime] = useState<string>('')
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Transaction[]>([])
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking')
  const [user, setUser] = useState<DecodedToken | null>(null)

  useEffect(() => {
    const decoded = getDecodedToken()
    if (decoded) {
      setUser(decoded)
    }

    const updateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)

    async function checkApiAndLoad() {
      try {
        const [prods, salesData, isOnline] = await Promise.all([
          fetchProductsFromApi(),
          fetchSalesFromApi(),
          checkHealthApi()
        ])
        setProducts(prods)
        setSales(salesData)
        setApiStatus(isOnline ? 'online' : 'offline')
      } catch (e) {
        setApiStatus('offline')
      }
    }
    checkApiAndLoad()

    return () => clearInterval(timer)
  }, [])

  const handleLogout = () => {
    removeAuthToken()
    setUser(null)
  }

  const totalRevenue = sales.reduce((acc, s) => acc + (Number(s.total_amount) || 0), 0)
  const lowStockCount = products.filter(p => p.stock_quantity <= p.reorder_level).length

  return (
    <div className="min-h-screen text-slate-100 flex flex-col relative overflow-hidden bg-slate-950">
      {/* Background Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/15 rounded-full blur-[128px] pointer-events-none" />

      {/* Top Header */}
      <header className="border-b border-slate-800/80 glass-panel sticky top-0 z-40 px-6 lg:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/25">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight text-white">NEXUS</span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                ERP v2.5
              </span>
            </div>
            <p className="text-xs text-slate-400">Enterprise Control & Operations Suite</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 text-xs font-medium text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-mono text-slate-200">{time || '00:00:00'}</span>
          </div>

          <div className="flex items-center space-x-2 text-xs px-3 py-1.5 rounded-lg border bg-slate-900/60 border-slate-800">
            <span className={`w-2 h-2 rounded-full ${apiStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-slate-300 font-medium capitalize">API: {apiStatus}</span>
          </div>

          {user ? (
            <div className="flex items-center space-x-2.5">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/20 flex items-center space-x-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="capitalize">{user.role} Dashboard</span>
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-rose-900/40 text-slate-300 hover:text-rose-400 border border-slate-800 hover:border-rose-800/50 transition flex items-center space-x-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/20 flex items-center space-x-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-12 py-10 space-y-12 relative z-10">
        
        {/* Hero Section */}
        <section className="space-y-6 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-8 pt-4">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Next-Gen Monorepo ERP & POS System</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Unified Enterprise <br />
              <span className="gradient-text">Operations Platform</span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Seamlessly sync high-speed POS transactions with real-time MySQL inventory management powered by a CodeIgniter 4 REST backend and Next.js frontend architecture.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/dashboard"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm transition shadow-xl shadow-indigo-600/25 flex items-center space-x-2 group"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Launch ERP Dashboard</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>

              <Link
                href="/pos"
                className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-white font-bold text-sm transition flex items-center space-x-2 group"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <span>Open POS Terminal</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
              </Link>
            </div>
          </div>

          {/* Quick Metrics Live Card */}
          <div className="w-full lg:w-96 glass-panel p-6 rounded-2xl space-y-5 border border-slate-800/80 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Live System Snapshot</span>
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/60 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Total Sales Revenue</p>
                  <p className="text-2xl font-black text-emerald-400 mt-0.5">Rs. {totalRevenue.toFixed(2)}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/60">
                  <p className="text-[11px] text-slate-400 font-medium">Total Products</p>
                  <p className="text-xl font-bold text-white mt-1">{products.length}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/60">
                  <p className="text-[11px] text-slate-400 font-medium">Low Stock Alerts</p>
                  <p className={`text-xl font-bold mt-1 ${lowStockCount > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                    {lowStockCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/60">
              <span className="flex items-center space-x-1">
                <Database className="w-3 h-3 text-blue-400" />
                <span>MySQL Connected</span>
              </span>
              <span className="font-mono text-slate-400">{sales.length} Transactions</span>
            </div>
          </div>
        </section>

        {/* Primary Command Hub Grid */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-white">System Applications & Portals</h2>
              <p className="text-xs text-slate-400">Select a operational module to launch</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Dashboard */}
            <Link
              href="/dashboard"
              className="glass-panel glass-panel-hover p-6 rounded-2xl space-y-4 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition duration-300">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition flex items-center justify-between">
                  ERP Management Dashboard
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition" />
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real-time analytics dashboard, revenue KPIs, stock level monitors, and transaction history records.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span className="text-blue-400">Access Control Panel</span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
              </div>
            </Link>

            {/* Card 2: POS Terminal */}
            <Link
              href="/pos"
              className="glass-panel glass-panel-hover p-6 rounded-2xl space-y-4 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition duration-300">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition flex items-center justify-between">
                  Point of Sale (POS)
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition" />
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  High-throughput checkout interface with visual catalog grid, barcode search, cart summary, and invoice creation.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span className="text-emerald-400">Launch Terminal</span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
              </div>
            </Link>

            {/* Card 3: Inventory Products */}
            <Link
              href="/dashboard/products"
              className="glass-panel glass-panel-hover p-6 rounded-2xl space-y-4 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition duration-300">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition flex items-center justify-between">
                  Product Inventory Studio
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition" />
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  CRUD catalog control, cost vs price tracking, reorder alert threshold configuration, and stock updates.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span className="text-purple-400">Manage Catalog</span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400" />
              </div>
            </Link>
          </div>
        </section>

        {/* System Architecture Topology Banner */}
        <section className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <Server className="w-4 h-4" />
                <span>Monorepo Full-Stack Architecture</span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1">High Performance Decoupled Design</h3>
            </div>
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>REST API Active</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Backend Core</span>
                <span className="text-[11px] font-mono text-indigo-400">CodeIgniter 4 PHP</span>
              </div>
              <p className="text-xs text-slate-400">
                RESTful API routes handling MySQL transactions, JWT authentication tokens, role-based security filters, and migration schemas.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Frontend Core</span>
                <span className="text-[11px] font-mono text-blue-400">Next.js 16 + Tailwind</span>
              </div>
              <p className="text-xs text-slate-400">
                React 18 client-side rendering with Tailwind CSS glassmorphism components, JWT auth context, and Lucide icons.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 glass-panel py-6 px-6 lg:px-12 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <span>Nexus ERP Platform &copy; 2026</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="hover:text-slate-200 transition">CodeIgniter 4 REST API</span>
          <span>&bull;</span>
          <span className="hover:text-slate-200 transition">Next.js Frontend</span>
        </div>
      </footer>
    </div>
  )
}
