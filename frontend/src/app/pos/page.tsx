'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Product,
  SaleItem,
  fetchProductsFromApi,
  recordSaleApi
} from '@/lib/products'

export default function POSTerminal() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<SaleItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'online'>('cash')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const loadProducts = async () => {
    setIsLoading(true)
    const data = await fetchProductsFromApi()
    setProducts(data)
    setIsLoading(false)
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const addToCart = (product: Product) => {
    if (product.stock_quantity <= 0) {
      alert(`Out of stock! ${product.name} has no available inventory.`)
      return
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        if (existing.qty >= product.stock_quantity) {
          alert(`Cannot add more than current stock (${product.stock_quantity} available).`)
          return prev
        }
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      }
      return [...prev, { id: product.id, name: product.name, price: Number(product.price), qty: 1 }]
    })
  }

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0)
  const tax = subtotal * 0.08
  const total = subtotal + tax

  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      alert('Cart is empty!')
      return
    }

    const payload = {
      items: cart,
      payment_method: paymentMethod,
      subtotal,
      tax,
      total_amount: total,
    }

    const success = await recordSaleApi(payload)
    if (success) {
      alert(`Sale Processed Successfully!\nTotal Paid: $${total.toFixed(2)}`)
      setCart([])
      loadProducts()
    } else {
      alert('Failed to process sale. Please verify backend server & database connection.')
    }
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* POS Header */}
      <header className="h-14 border-b border-slate-800 bg-slate-900 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/dashboard" className="text-xs bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded text-slate-300">
            &larr; Dashboard
          </Link>
          <span className="font-bold text-white">POS Terminal #01</span>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search by name, SKU or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 w-64 focus:outline-none focus:border-blue-500"
          />
          <div className="text-xs text-slate-400">
            Status: <span className="text-emerald-400 font-semibold">MySQL API Connected</span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* Product Catalog Grid (Left Column) */}
        <div className="lg:col-span-7 p-6 border-r border-slate-800 space-y-4 overflow-y-auto">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Product Catalog (MySQL Database)</h2>
            <span className="text-xs text-slate-400">Showing {filteredProducts.length} items</span>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-slate-400">Loading products from database...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  disabled={p.stock_quantity <= 0}
                  className={`p-4 rounded-xl border text-left transition flex flex-col justify-between space-y-2 group ${
                    p.stock_quantity <= 0
                      ? 'bg-slate-900/40 border-slate-800 opacity-50 cursor-not-allowed'
                      : 'bg-slate-900 border-slate-800 hover:border-emerald-500'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-semibold text-slate-500">{p.category}</span>
                      <span className="text-[10px] font-mono text-slate-400">{p.sku}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-200 group-hover:text-emerald-400 line-clamp-1">{p.name}</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-base font-bold text-white">${Number(p.price).toFixed(2)}</p>
                    <span
                      className={`text-[10px] font-medium ${
                        p.stock_quantity <= p.reorder_level ? 'text-amber-400' : 'text-slate-400'
                      }`}
                    >
                      {p.stock_quantity > 0 ? `${p.stock_quantity} in stock` : 'Out of stock'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!isLoading && filteredProducts.length === 0 && (
            <div className="text-center py-12 text-slate-400 space-y-3">
              <p>No products found in MySQL database.</p>
              <Link href="/dashboard/products" className="inline-block px-4 py-2 bg-blue-600 text-white rounded text-xs font-semibold">
                + Add Products in Admin Panel
              </Link>
            </div>
          )}
        </div>

        {/* Cart & Checkout Terminal (Right Column) */}
        <div className="lg:col-span-5 p-6 bg-slate-900 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Current Order</h2>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Clear Cart
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-800 max-h-[350px] overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{item.name}</p>
                    <p className="text-xs text-slate-400">${item.price.toFixed(2)} x {item.qty}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <p className="text-sm font-bold text-emerald-400">${(item.price * item.qty).toFixed(2)}</p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-500 hover:text-rose-400 text-xs px-1"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="text-center py-12 text-slate-500 text-sm">
                  Cart is empty. Click items on the left to add to order.
                </div>
              )}
            </div>
          </div>

          {/* Payment Method & Checkout */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-400">Payment Method</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {(['cash', 'card', 'online'] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`py-1.5 text-xs font-semibold rounded uppercase transition border ${
                      paymentMethod === method
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-sm text-slate-400">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-400">
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-extrabold text-white pt-2 border-t border-slate-800">
                <span>Total Pay</span>
                <span className="text-emerald-400">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCompleteSale}
              disabled={cart.length === 0}
              className={`w-full py-3 rounded-lg font-bold text-white transition text-center ${
                cart.length === 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              Complete Sale & Save to Database
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
