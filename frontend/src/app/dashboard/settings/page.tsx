'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Settings,
  Tags,
  Percent,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  HelpCircle,
  RefreshCw
} from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import { useToast } from '@/context/ToastContext'
import { getDecodedToken, DecodedToken } from '@/lib/auth'
import {
  getTaxSettings,
  saveTaxSettings,
  TaxSettings
} from '@/lib/settings'

export default function SettingsPage() {
  const toast = useToast()
  const [user, setUser] = useState<DecodedToken | null>(null)
  
  // Tax State
  const [taxEnabled, setTaxEnabled] = useState(true)
  const [taxRate, setTaxRate] = useState<number>(8.0)

  useEffect(() => {
    const decoded = getDecodedToken()
    setUser(decoded)

    const loadData = async () => {
      const tax = await getTaxSettings()
      setTaxEnabled(tax.enabled)
      setTaxRate(tax.rate)
    }
    loadData()
  }, [])



  const handleSaveTaxSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    const rateNum = Number(taxRate) || 0
    if (rateNum < 0) {
      toast.warning('Tax rate cannot be negative.')
      return
    }

    const settings: TaxSettings = {
      enabled: taxEnabled,
      rate: rateNum
    }
    await saveTaxSettings(settings)
    toast.success(`Tax settings updated! Tax is now ${taxEnabled ? `ON (${rateNum}%)` : 'OFF'}.`)
  }

  // Sample tax calculation preview
  const sampleSubtotal = 1000.00
  const sampleTax = taxEnabled ? (sampleSubtotal * (Number(taxRate) || 0)) / 100 : 0
  const sampleTotal = sampleSubtotal + sampleTax

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Pinned Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 space-y-8 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Settings className="w-4 h-4" />
              <span>System & Operations Config</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              Settings
            </h1>
            <p className="text-xs text-slate-400">
              Manage system configurations and operational preferences for POS system.
            </p>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="max-w-3xl mx-auto w-full">
          
          {/* Admin Tax Settings & ON/OFF Control */}
          <div className="glass-panel p-6 rounded-2xl space-y-6 border border-slate-800">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <Percent className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Tax Configuration</h2>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                taxEnabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {taxEnabled ? 'Tax Active' : 'Tax Disabled'}
              </span>
            </div>

            <form onSubmit={handleSaveTaxSettings} className="space-y-5">
              {/* ON/OFF Switch */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-white block">Automated Tax Calculation</label>
                  <p className="text-[11px] text-slate-400 mt-0.5">Toggle tax calculations ON or OFF for POS terminal checkouts</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTaxEnabled(!taxEnabled)}
                  className={`p-1 transition-colors ${taxEnabled ? 'text-emerald-400' : 'text-slate-600'}`}
                >
                  {taxEnabled ? (
                    <ToggleRight className="w-10 h-10 transition transform scale-105" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 transition" />
                  )}
                </button>
              </div>

              {/* Tax Percentage Rate Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Tax Rate Percentage (%)</span>
                  <span className="text-[11px] font-normal text-slate-400">e.g. 8.0 for 8%</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    disabled={!taxEnabled}
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 disabled:opacity-40 transition font-bold"
                  />
                  <span className="absolute right-4 top-2.5 text-xs text-slate-400 font-bold">%</span>
                </div>
              </div>

              {/* Live Sample Calculation Box */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-400 border-b border-slate-800/80 pb-2">
                  <span className="font-bold text-slate-300">Live POS Calculation Preview</span>
                  <span className="text-[10px] text-indigo-400 font-mono">Sample Rs. 1,000 Order</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>Rs. {sampleSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tax Rate ({taxEnabled ? `${taxRate}%` : 'OFF'})</span>
                  <span className={taxEnabled ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                    Rs. {sampleTax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-white pt-1 border-t border-slate-800">
                  <span>Total Bill Amount</span>
                  <span className="text-emerald-400 font-extrabold">Rs. {sampleTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs tracking-wider uppercase transition shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Tax Configuration</span>
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
