'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  DollarSign,
  Package,
  AlertTriangle,
  Activity,
  LogOut,
  ShoppingBag,
  TrendingUp,
  RefreshCw,
  Plus,
  Search,
  ArrowUpRight,
  ShieldCheck,
  User,
  Layers,
  FileText
} from 'lucide-react'
import {
  Product,
  Transaction,
  fetchProductsFromApi,
  fetchSalesFromApi
} from '@/lib/products'
import { getDecodedToken, removeAuthToken, DecodedToken } from '@/lib/auth'

import Sidebar from '@/components/Sidebar'

export default function Dashboard() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<DecodedToken | null>(null)
  const [searchTx, setSearchTx] = useState('')

  const loadData = async () => {
    setIsLoading(true)
    const [prods, salesData] = await Promise.all([
      fetchProductsFromApi(),
      fetchSalesFromApi()
    ])
    setProducts(prods)
    setSales(salesData)
    setIsLoading(false)
  }

  useEffect(() => {
    const decoded = getDecodedToken()
    if (!decoded) {
      router.push('/login')
      return
    }
    setUser(decoded)
    loadData()
  }, [router])

  const handleLogout = () => {
    removeAuthToken()
    router.push('/login')
  }

  const lowStockProducts = products.filter((p) => p.stock_quantity <= p.reorder_level)
  const totalRevenue = sales.reduce((acc, s) => acc + (Number(s.total_amount) || 0), 0)
  const totalItemsCount = products.reduce((acc, p) => acc + (Number(p.stock_quantity) || 0), 0)

  const filteredSales = sales.filter((tx) =>
    tx.invoice_number?.toLowerCase().includes(searchTx.toLowerCase()) ||
    tx.payment_method?.toLowerCase().includes(searchTx.toLowerCase())
  )

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Authenticating ERP Session...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-row relative overflow-x-hidden">
      {/* Collapsible Sidebar */}
      <Sidebar />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Navigation */}
        <header className="h-16 border-b border-slate-800/80 glass-panel sticky top-0 z-20 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-white capitalize bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>{user.role} Control Panel</span>
            </span>
          </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            title="Refresh Data"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {(user.role === 'admin' || user.role === 'manager') && (
            <Link
              href="/dashboard/products"
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center space-x-1.5 shadow-lg shadow-indigo-600/20"
            >
              <Package className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Manage Products</span>
            </Link>
          )}

          <Link
            href="/pos"
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center space-x-1.5 shadow-lg shadow-emerald-600/20"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>POS Terminal</span>
          </Link>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-rose-900/40 text-slate-300 hover:text-rose-400 border border-slate-800 hover:border-rose-800/50 transition flex items-center space-x-1.5 ml-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8 relative z-10">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center space-x-3">
              <span>Executive Overview</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live Data
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Logged in as <span className="text-slate-200 font-semibold uppercase">{user.role}</span> &bull; Real-time MySQL REST Synchronization
            </p>
          </div>
        </div>

        {/* Low Stock Warning Banner */}
        {lowStockProducts.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-amber-300 text-xs font-medium">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                <strong>Inventory Warning:</strong> {lowStockProducts.length} product(s) have reached or dropped below reorder levels.
              </span>
            </div>
            {(user.role === 'admin' || user.role === 'manager') && (
              <Link
                href="/dashboard/products"
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-bold shrink-0 transition"
              >
                Reorder Stock &rarr;
              </Link>
            )}
          </div>
        )}

        {/* Executive Metrics Cards Grid */}
        {(user.role === 'admin' || user.role === 'manager') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Total Revenue */}
            <div className="glass-panel p-5 rounded-2xl space-y-3 relative overflow-hidden group">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Sales Revenue</span>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-black text-white tracking-tight">Rs. {totalRevenue.toFixed(2)}</p>
                <div className="flex items-center space-x-1.5 mt-1 text-xs text-emerald-400 font-medium">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{sales.length} Total Transactions</span>
                </div>
              </div>
            </div>

            {/* Card 2: Catalog Products */}
            <div className="glass-panel p-5 rounded-2xl space-y-3 relative overflow-hidden group">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Product Catalog</span>
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-black text-white tracking-tight">{products.length}</p>
                <p className="text-xs text-slate-400 mt-1 font-medium">{totalItemsCount} total units in stock</p>
              </div>
            </div>

            {/* Card 3: Stock Health */}
            <div className="glass-panel p-5 rounded-2xl space-y-3 relative overflow-hidden group">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Stock Alerts</span>
                <div className={`p-2 rounded-lg ${lowStockProducts.length > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className={`text-3xl font-black tracking-tight ${lowStockProducts.length > 0 ? 'text-amber-400' : 'text-white'}`}>
                  {lowStockProducts.length}
                </p>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  {lowStockProducts.length > 0 ? 'Items below reorder point' : 'All stock levels healthy'}
                </p>
              </div>
            </div>

            {/* Card 4: System Status */}
            <div className="glass-panel p-5 rounded-2xl space-y-3 relative overflow-hidden group">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">API Gateway</span>
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-black text-blue-400 tracking-tight">Active</p>
                <p className="text-xs text-slate-400 mt-1 font-medium">CodeIgniter 4 REST API</p>
              </div>
            </div>
          </div>
        )}

        {/* Staff Overview View */}
        {user.role === 'staff' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-2xl space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today&apos;s Sales Summary</span>
              <p className="text-4xl font-black text-emerald-400">Rs. {totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-slate-400">{sales.length} transactions processed</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center space-y-3 text-center">
              <p className="text-sm text-slate-300 font-medium">Ready for retail transactions?</p>
              <Link
                href="/pos"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/20 transition flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>OPEN POS TERMINAL</span>
              </Link>
            </div>
          </div>
        )}

        {/* Data Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Recent Sales Transactions (Left 7 Cols) */}
          <div className="lg:col-span-7 glass-panel p-6 rounded-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">Recent Transactions</h2>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter invoice..."
                  value={searchTx}
                  onChange={(e) => setSearchTx(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Invoice #</th>
                    <th className="px-4 py-3">Terminal</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3 text-right">Total Amount</th>
                    <th className="px-4 py-3 rounded-r-lg text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {filteredSales.slice(0, 7).map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-900/50 transition">
                      <td className="px-4 py-3 font-mono text-indigo-400 font-semibold">{tx.invoice_number}</td>
                      <td className="px-4 py-3 text-slate-400">{tx.terminal || 'POS #01'}</td>
                      <td className="px-4 py-3 uppercase font-medium text-slate-300">{tx.payment_method}</td>
                      <td className="px-4 py-3 text-right font-bold text-white">Rs. {Number(tx.total_amount)?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {tx.status || 'Completed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!isLoading && filteredSales.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-slate-500">
                        No recent transactions found.
                      </td>
                    </tr>
                  )}
                  {isLoading && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-slate-400">
                        Loading transaction logs...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Product Inventory Quick View (Right 5 Cols) */}
          <div className="lg:col-span-5 glass-panel p-6 rounded-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">Live Inventory</h2>
              </div>
              {(user.role === 'admin' || user.role === 'manager') && (
                <Link href="/dashboard/products" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 font-semibold">
                  <span>Manage</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            <div className="overflow-y-auto max-h-[380px] space-y-2 pr-1">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-white">{p.name}</p>
                    <p className="text-[11px] font-mono text-slate-400">{p.sku} &bull; <span className="text-slate-400">{p.category}</span></p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <p className="text-xs font-bold text-emerald-400">Rs. {Number(p.price).toFixed(2)}</p>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block ${
                        p.stock_quantity <= p.reorder_level
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {p.stock_quantity} units
                    </span>
                  </div>
                </div>
              ))}
              {!isLoading && products.length === 0 && (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No inventory products found in MySQL database.
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
      </div>
    </div>
  )
}
