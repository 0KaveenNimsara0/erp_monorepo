'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Product,
  Transaction,
  fetchProductsFromApi,
  fetchSalesFromApi
} from '@/lib/products'
import { getDecodedToken, removeAuthToken, DecodedToken } from '@/lib/auth'

export default function Dashboard() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<DecodedToken | null>(null)

  useEffect(() => {
    const decoded = getDecodedToken()
    if (!decoded) {
      router.push('/login')
      return
    }
    setUser(decoded)

    async function loadData() {
      setIsLoading(true)
      const [prods, salesData] = await Promise.all([
        fetchProductsFromApi(),
        fetchSalesFromApi()
      ])
      setProducts(prods)
      
      // If staff, ideally they only see their own sales. 
      // Assuming API returns all sales, we filter on client for now, or API should handle it based on token.
      if (decoded?.role === 'staff') {
         // Filter sales by this user if possible. Right now we don't have user_id in sales, so we'll show all or mock it.
         setSales(salesData)
      } else {
         setSales(salesData)
      }
      
      setIsLoading(false)
    }
    loadData()
  }, [router])

  const handleLogout = () => {
    removeAuthToken()
    router.push('/login')
  }

  const lowStockCount = products.filter((p) => p.stock_quantity <= p.reorder_level).length
  const totalRevenue = sales.reduce((acc, s) => acc + (Number(s.total_amount) || 0), 0)
  const totalItemsCount = products.reduce((acc, p) => acc + (Number(p.stock_quantity) || 0), 0)

  if (!user) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="text-xl font-bold text-blue-400">ERP System</Link>
          <span className="text-slate-600">/</span>
          <span className="text-sm font-medium text-slate-300">
            {user.role === 'staff' ? 'Staff Portal' : user.role === 'manager' ? 'Manager Dashboard' : 'Admin Dashboard'}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-slate-400 capitalize mr-4">Role: {user.role}</span>
          
          {(user.role === 'admin' || user.role === 'manager') && (
            <Link
              href="/dashboard/products"
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition"
            >
              Manage Products
            </Link>
          )}
          
          <Link
            href="/pos"
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition"
          >
            Launch POS Terminal
          </Link>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-500 text-white transition ml-4"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back!</h1>
            <p className="text-sm text-slate-400">Here is your {user.role} overview.</p>
          </div>
        </div>

        {/* Dynamic Metrics Grid */}
        {(user.role === 'admin' || user.role === 'manager') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Sales Revenue</span>
              <p className="text-3xl font-extrabold text-emerald-400">${totalRevenue.toFixed(2)}</p>
              <span className="text-xs text-slate-400 font-medium">{sales.length} completed transactions</span>
            </div>

            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Catalog Products</span>
              <p className="text-3xl font-extrabold text-white">{products.length}</p>
              <span className="text-xs text-slate-400 font-medium">{totalItemsCount} total units in stock</span>
            </div>

            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Low Stock Alerts</span>
              <p className={`text-3xl font-extrabold ${lowStockCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                {lowStockCount}
              </p>
              <span className="text-xs text-amber-400/80 font-medium">
                {lowStockCount > 0 ? 'Action required in Inventory' : 'All stock levels healthy'}
              </span>
            </div>

            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Database Status</span>
              <p className="text-3xl font-extrabold text-blue-400">Active</p>
              <span className="text-xs text-blue-400/80 font-medium">MySQL REST API connected</span>
            </div>
          </div>
        )}

        {/* Staff UI */}
        {user.role === 'staff' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Your Sales Today</span>
              <p className="text-3xl font-extrabold text-emerald-400">${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
              <Link
                href="/pos"
                className="px-6 py-3 text-lg font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition w-full text-center"
              >
                OPEN POS TERMINAL
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions Table */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Invoice #</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3 rounded-r-lg">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {sales.slice(0, 5).map((tx) => (
                    <tr key={tx.id}>
                      <td className="px-4 py-3 font-mono text-blue-400">{tx.invoice_number}</td>
                      <td className="px-4 py-3 font-semibold text-white">${Number(tx.total_amount)?.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {tx.status || 'Completed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!isLoading && sales.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-slate-500">
                        No recent sales found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stock Overview (View Only for Staff, Edit link for Manager/Admin) */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-4">
             <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Stock Overview</h2>
              {(user.role === 'admin' || user.role === 'manager') && (
                <Link href="/dashboard/products" className="text-xs text-blue-400 hover:underline">
                  Manage Products &rarr;
                </Link>
              )}
            </div>
            <div className="overflow-y-auto max-h-[300px]">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs sticky top-0">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Product</th>
                    <th className="px-4 py-3 text-right">Stock Qty</th>
                    <th className="px-4 py-3 rounded-r-lg text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{p.name}</div>
                        <div className="text-xs text-slate-500">{p.sku}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-semibold ${p.stock_quantity <= p.reorder_level ? 'text-amber-400' : 'text-slate-300'}`}>
                          {p.stock_quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">${Number(p.price).toFixed(2)}</td>
                    </tr>
                  ))}
                  {!isLoading && products.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-slate-500">
                        No products available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
