'use client'

import { useState, useEffect } from 'react'
import { fetchSales, fetchSalesSummary, fetchSalesReport, Sale, SalesSummary, ReportItem } from '@/lib/sales'
import { getDecodedToken, DecodedToken } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'
import { 
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Activity,
  CalendarDays,
  FileText,
  Search,
  Filter
} from 'lucide-react'

export default function OrdersPage() {
  const [user, setUser] = useState<DecodedToken | null>(null)
  
  // Data States
  const [sales, setSales] = useState<Sale[]>([])
  const [summary, setSummary] = useState<SalesSummary | null>(null)
  const [report, setReport] = useState<ReportItem[]>([])
  
  // UI States
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'orders' | 'analytics'>('orders')
  const [reportRange, setReportRange] = useState<number | 'all'>(30)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const decoded = getDecodedToken()
    setUser(decoded)

    const loadData = async () => {
      setIsLoading(true)
      
      const salesData = await fetchSales()
      setSales(salesData)

      if (decoded && (decoded.role === 'manager' || decoded.role === 'admin')) {
        const sumData = await fetchSalesSummary()
        setSummary(sumData)
      }

      if (decoded && decoded.role === 'admin') {
        const repData = await fetchSalesReport(30)
        setReport(repData)
      }

      setIsLoading(false)
    }

    loadData()
  }, [])

  // Reload report when range changes (Admin only)
  useEffect(() => {
    if (user?.role !== 'admin' || activeTab !== 'analytics') return;
    
    const reloadReport = async () => {
      const repData = await fetchSalesReport(reportRange)
      setReport(repData)
    }
    reloadReport()
  }, [reportRange, activeTab, user])

  const filteredSales = sales.filter(s => 
    s.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.cashier_name && s.cashier_name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const renderSummaryCards = () => {
    if (!summary) return null;
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-indigo-500/10 to-blue-600/10 border border-indigo-500/20 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-400">Today's Revenue</h3>
            <DollarSign className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-3xl font-black text-white">Rs. {summary.today_revenue.toFixed(2)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border border-emerald-500/20 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-400">Today's Orders</h3>
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-white">{summary.today_orders}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border border-purple-500/20 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-400">Total Revenue</h3>
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-black text-white">Rs. {summary.total_revenue.toFixed(2)}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/20 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-400">Avg Order Value</h3>
            <Activity className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-white">Rs. {summary.average_order_value.toFixed(2)}</p>
        </div>
      </div>
    )
  }

  const renderAnalytics = () => {
    // Find max revenue to scale the simple CSS bar chart
    const maxRev = report.length > 0 ? Math.max(...report.map(r => Number(r.revenue))) : 1;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <span>Revenue Timeline</span>
          </h3>
          <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
            <button 
              onClick={() => setReportRange(30)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${reportRange === 30 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              30 Days
            </button>
            <button 
              onClick={() => setReportRange(60)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${reportRange === 60 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              60 Days
            </button>
            <button 
              onClick={() => setReportRange('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${reportRange === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Lifetime
            </button>
          </div>
        </div>

        {report.length === 0 ? (
          <div className="text-center p-12 text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800/50 border-dashed">
            No report data found for this period.
          </div>
        ) : (
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 overflow-x-auto">
            <div className="min-w-[600px] flex items-end space-x-2 h-64 mt-4 relative">
              {/* Simple CSS Bar Chart */}
              {report.map((item, idx) => {
                const heightPct = (Number(item.revenue) / maxRev) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative">
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-12 bg-slate-800 text-white text-[10px] py-1 px-2 rounded font-bold whitespace-nowrap pointer-events-none transition-opacity z-10 border border-slate-700">
                      {item.date}<br/>Rs. {Number(item.revenue).toFixed(2)}
                    </div>
                    {/* Bar */}
                    <div 
                      className="w-full bg-indigo-500/20 group-hover:bg-indigo-500/40 border-t border-indigo-500 transition-all rounded-t-sm"
                      style={{ height: `${Math.max(heightPct, 1)}%` }}
                    ></div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-row relative overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300">
        <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8 relative z-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div className="flex-1 text-left">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <FileText className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">Orders & Sales</h1>
              </div>
              <p className="text-sm text-slate-400 font-medium">
                {user?.role === 'staff' 
                  ? 'Track your individual sales performance and invoices.'
                  : 'Monitor global transaction data and system revenue.'}
              </p>
            </div>

            {/* Admin Tabs */}
            {user?.role === 'admin' && (
              <div className="flex items-center space-x-3">
                <div className="flex bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition ${
                      activeTab === 'orders' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Ledger</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition ${
                      activeTab === 'analytics' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Analytics</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {activeTab === 'orders' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              
              {/* Manager/Admin Summary */}
              {renderSummaryCards()}

              {/* Data Table */}
              <div className="bg-slate-900/50 rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl shadow-black/20">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="font-bold text-white">Transaction Ledger</h3>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search invoices..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full md:w-64 bg-slate-950 border border-slate-800 text-sm text-white rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">
                        <th className="px-5 py-4">Invoice</th>
                        <th className="px-5 py-4">Date</th>
                        {user?.role !== 'staff' && <th className="px-5 py-4">Cashier</th>}
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4">Method</th>
                        <th className="px-5 py-4 text-right">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-xs">
                      {filteredSales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-slate-900/40 transition">
                          <td className="px-5 py-4 font-mono text-indigo-400 font-bold">
                            {sale.invoice_number}
                          </td>
                          <td className="px-5 py-4 text-slate-300">
                            {new Date(sale.created_at).toLocaleString()}
                          </td>
                          {user?.role !== 'staff' && (
                            <td className="px-5 py-4 font-bold text-white">
                              {sale.cashier_name || 'System'}
                            </td>
                          )}
                          <td className="px-5 py-4">
                            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold tracking-wide text-[10px] uppercase">
                              {sale.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-400 uppercase font-bold tracking-wide text-[10px]">
                            {sale.payment_method}
                          </td>
                          <td className="px-5 py-4 text-right font-black text-white">
                            Rs. {Number(sale.total_amount).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      {!isLoading && filteredSales.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                            No transactions found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && renderAnalytics()}

        </main>
      </div>
    </div>
  )
}
