'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ShoppingBag,
  Search,
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  DollarSign,
  Smartphone,
  CheckCircle2,
  Package,
  Printer,
  X,
  Sparkles,
  RefreshCw
} from 'lucide-react'
import {
  Product,
  SaleItem,
  fetchProductsFromApi,
  recordSaleApi,
  checkHealthApi
} from '@/lib/products'

import Sidebar from '@/components/Sidebar'
import { useToast } from '@/context/ToastContext'
import { getCategories, getTaxSettings, TaxSettings, Category } from '@/lib/settings'

export default function POSTerminal() {
  const toast = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<SaleItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'online'>('cash')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)
  const [lastOrderDetails, setLastOrderDetails] = useState<{ invoice: string; total: number; date: string } | null>(null)
  
  const [taxSettings, setTaxSettings] = useState<TaxSettings>({ enabled: true, rate: 8.0 })
  const [dynamicCategories, setDynamicCategories] = useState<Category[]>([])
  const [isOnline, setIsOnline] = useState(true)

  const loadData = async () => {
    setIsLoading(true)
    const [data, cats, tax, online] = await Promise.all([
      fetchProductsFromApi(),
      getCategories(),
      getTaxSettings(),
      checkHealthApi()
    ])
    setProducts(data)
    setDynamicCategories(cats)
    setTaxSettings(tax)
    setIsOnline(online)
    setIsLoading(false)
  }

  useEffect(() => {
    loadData()
    // Optional: Poll health every 15 seconds
    const interval = setInterval(async () => {
      const online = await checkHealthApi()
      setIsOnline(online)
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const categories = [{ id: 0, name: 'All' }, ...dynamicCategories]

  const addToCart = (product: Product) => {
    if (product.stock_quantity <= 0) {
      toast.warning(`Out of stock! ${product.name} has no available inventory.`)
      return
    }

    const existing = cart.find((item) => item.id === product.id)
    if (existing) {
      if (existing.qty >= product.stock_quantity) {
        toast.warning(`Cannot add more than current stock (${product.stock_quantity} available).`)
        return
      }
      setCart((prev) =>
        prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      )
      toast.info(`Added another ${product.name} to cart.`)
    } else {
      setCart((prev) => [...prev, { id: product.id, name: product.name, price: Number(product.price), qty: 1 }])
      toast.success(`Added ${product.name} to cart.`)
    }
  }

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const product = products.find((p) => p.id === id)
            const maxQty = product ? product.stock_quantity : 999
            const newQty = item.qty + delta
            if (newQty > maxQty) {
              toast.warning(`Maximum available stock is ${maxQty} units.`)
              return item
            }
            return newQty > 0 ? { ...item, qty: newQty } : null
          }
          return item
        })
        .filter(Boolean) as SaleItem[]
    )
  }

  const removeFromCart = (id: number) => {
    const itemToRemove = cart.find(i => i.id === id)
    if (itemToRemove) {
      toast.info(`Removed ${itemToRemove.name} from cart.`)
    }
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0)
  const taxRate = taxSettings.enabled ? taxSettings.rate / 100 : 0
  const tax = subtotal * taxRate
  const total = subtotal + tax

  const handleCompleteSale = async () => {
    if (cart.length === 0) return

    const payload = {
      items: cart,
      payment_method: paymentMethod,
      subtotal,
      tax,
      total_amount: total,
    }

    const success = await recordSaleApi(payload)
    if (success) {
      const generatedInvoice = `INV-${Math.floor(100000 + Math.random() * 900000)}`
      setLastOrderDetails({
        invoice: generatedInvoice,
        total,
        date: new Date().toLocaleString()
      })
      toast.success(`Sale Processed Successfully! Total Paid: Rs. ${total.toFixed(2)}`)
      setIsReceiptModalOpen(true)
      setCart([])
      loadData()
    } else {
      toast.error('Failed to process sale. Please verify backend server & database connection.')
    }
  }

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 0 || p.category_id === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-row h-screen overflow-hidden">
      {/* Collapsible Sidebar */}
      <Sidebar />

      {/* Main POS Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-800/80 glass-panel px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            <span className="font-black text-white tracking-tight">POS Terminal #01</span>
          </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search product, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 w-72 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <button
            onClick={loadData}
            title="Reload Catalog"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <span className={`text-xs px-3 py-1.5 rounded-xl border font-semibold flex items-center space-x-1.5 ${isOnline ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </span>
        </div>
      </header>

      {/* Main Terminal Body */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Left Column: Product Catalog Grid (8 cols on lg, 8.5/9 on xl) */}
        <div className="lg:col-span-8 xl:col-span-9 p-6 border-r border-slate-800/80 flex flex-col space-y-4 overflow-hidden">
          
          {/* Category Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none shrink-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition border whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/25'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Catalog Grid */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Catalog items ({filteredProducts.length})</span>
              <span>Click item to add to order</span>
            </div>

            {isLoading ? (
              <div className="text-center py-20 text-slate-500 text-sm space-y-2">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Syncing products from MySQL API...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {filteredProducts.map((p) => {
                  const isOutOfStock = p.stock_quantity <= 0
                  const isLowStock = p.stock_quantity <= p.reorder_level

                  return (
                    <button
                      key={p.id}
                      onClick={() => addToCart(p)}
                      disabled={isOutOfStock}
                      className={`glass-panel p-4 rounded-2xl text-left transition flex flex-col justify-between space-y-3 group border ${
                        isOutOfStock
                          ? 'opacity-40 cursor-not-allowed border-slate-800 bg-slate-900/40'
                          : 'border-slate-800 hover:border-emerald-500/60 hover:bg-slate-900/90'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                            {p.category || 'Uncategorized'}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{p.sku}</span>
                        </div>
                        <h3 className="text-xs font-bold text-white group-hover:text-emerald-400 transition line-clamp-2">
                          {p.name}
                        </h3>
                      </div>

                      <div className="flex items-end justify-between pt-2 border-t border-slate-800/60">
                        <div>
                          <span className="text-xs text-slate-400">Rs. </span>
                          <span className="text-base font-extrabold text-white">{Number(p.price).toFixed(2)}</span>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            isOutOfStock
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : isLowStock
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isOutOfStock ? 'Out' : `${p.stock_quantity} left`}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {!isLoading && filteredProducts.length === 0 && (
              <div className="text-center py-20 text-slate-500 space-y-3">
                <Package className="w-10 h-10 mx-auto text-slate-700" />
                <p className="text-sm">No products found matching criteria.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Cart & Terminal Checkout (4 cols on lg, 3 on xl) */}
        <div className="lg:col-span-4 xl:col-span-3 bg-slate-900/80 p-5 flex flex-col justify-between space-y-4 overflow-hidden border-t lg:border-t-0 border-slate-800">
          
          <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 shrink-0">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">Current Cart</h2>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-800/50">
              {cart.map((item) => (
                <div key={item.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3">
                  <div className="flex-1 space-y-0.5">
                    <p className="text-xs font-bold text-white">{item.name}</p>
                    <p className="text-[11px] text-slate-400">Rs. {item.price.toFixed(2)} each</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-white">{item.qty}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right w-20">
                    <p className="text-xs font-bold text-emerald-400">Rs. {(item.price * item.qty).toFixed(2)}</p>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="text-center py-20 text-slate-500 text-xs space-y-2">
                  <ShoppingBag className="w-8 h-8 mx-auto text-slate-700" />
                  <p>Cart is currently empty.</p>
                  <p className="text-[11px] text-slate-400">Select items from the catalog on the left to begin.</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment & Action Drawer */}
          <div className="glass-panel p-4 rounded-2xl space-y-3 shrink-0 border border-slate-800/80">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Payment Method</label>
              <div className="grid grid-cols-3 gap-2 mt-1.5">
                {[
                  { id: 'cash', label: 'Cash', icon: DollarSign },
                  { id: 'card', label: 'Card', icon: CreditCard },
                  { id: 'online', label: 'NFC', icon: Smartphone }
                ].map((m) => {
                  const Icon = m.icon
                  const active = paymentMethod === m.id
                  return (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 border ${
                        active
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{m.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tax ({taxSettings.enabled ? `${taxSettings.rate}%` : 'OFF'})</span>
                <span>Rs. {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-slate-800">
                <span>Total Amount</span>
                <span className="text-emerald-400 text-base">Rs. {total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCompleteSale}
              disabled={cart.length === 0}
              className={`w-full py-3.5 rounded-xl font-extrabold text-xs tracking-wider uppercase transition shadow-lg flex items-center justify-center space-x-2 ${
                cart.length === 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/25'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Transaction</span>
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {isReceiptModalOpen && lastOrderDetails && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel p-6 rounded-2xl max-w-sm w-full space-y-5 border border-slate-800 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Payment Successful</h3>
              <p className="text-xs text-slate-400 mt-1">Transaction recorded to MySQL database</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs text-left">
              <div className="flex justify-between text-slate-400">
                <span>Invoice:</span>
                <span className="font-mono text-indigo-400 font-bold">{lastOrderDetails.invoice}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Date:</span>
                <span className="text-slate-200">{lastOrderDetails.date}</span>
              </div>
              <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800 font-bold text-sm">
                <span className="text-white">Amount Paid:</span>
                <span className="text-emerald-400">Rs. {lastOrderDetails.total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => setIsReceiptModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/20"
            >
              Close & Next Order
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
