'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Product,
  Transaction,
  fetchProductsFromApi,
  fetchSalesFromApi
} from '@/lib/products'

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      const [prods, salesData] = await Promise.all([
        fetchProductsFromApi(),
        fetchSalesFromApi()
      ])
      setProducts(prods)
      setSales(salesData)
      setIsLoading(false)
    }
    loadData()
  }, [])

  const lowStockCount = products.filter((p) => p.stock_quantity <= p.reorder_level).length
  const totalRevenue = sales.reduce((acc, s) => acc + (Number(s.total_amount) || 0), 0)
  const totalItemsCount = products.reduce((acc, p) => acc + (Number(p.stock_quantity) || 0), 0)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold text-blue-400">ERP System</Link>
          <span className="text-slate-600">/</span>
          <span className="text-sm font-medium text-slate-300">Management Dashboard</span>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/products"
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition"
          >
            Manage Products
          </Link>
          <Link
            href="/pos"
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition"
          >
            Launch POS Terminal
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Executive Dashboard</h1>
            <p className="text-sm text-slate-400">Real-time enterprise metrics from MySQL Database</p>
          </div>
        </div>

        {/* Dynamic Metrics Grid */}
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

        {/* Recent Transactions Table */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Recent POS Transactions (Database Records)</h2>
            <Link href="/pos" className="text-xs text-blue-400 hover:underline">
              + New Sale
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Invoice #</th>
                  <th className="px-4 py-3">Terminal</th>
                  <th className="px-4 py-3">Payment Method</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sales.map((tx) => (
                  <tr key={tx.id}>
                    <td className="px-4 py-3 font-mono text-blue-400">{tx.invoice_number}</td>
                    <td className="px-4 py-3">{tx.terminal || 'POS Terminal 01'}</td>
                    <td className="px-4 py-3 uppercase text-xs">{tx.payment_method}</td>
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
                    <td colSpan={5} className="text-center py-8 text-slate-500">
                      No sales transactions recorded in database. Launch POS terminal to process a sale.
                    </td>
                  </tr>
                )}
                {isLoading && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400">
                      Loading sales from database...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
