'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Product,
  fetchProductsFromApi,
  createProductApi,
  updateProductApi,
  deleteProductApi
} from '@/lib/products'

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Form State
  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Hardware')
  const [price, setPrice] = useState('')
  const [costPrice, setCostPrice] = useState('')
  const [stockQuantity, setStockQuantity] = useState('')
  const [reorderLevel, setReorderLevel] = useState('10')

  const loadProducts = async () => {
    setIsLoading(true)
    const data = await fetchProductsFromApi()
    setProducts(data)
    setIsLoading(false)
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const openAddModal = () => {
    setEditingProduct(null)
    setSku(`SKU-${Math.floor(100 + Math.random() * 900)}`)
    setName('')
    setCategory('Hardware')
    setPrice('')
    setCostPrice('')
    setStockQuantity('')
    setReorderLevel('10')
    setIsModalOpen(true)
  }

  const openEditModal = (p: Product) => {
    setEditingProduct(p)
    setSku(p.sku)
    setName(p.name)
    setCategory(p.category)
    setPrice(p.price.toString())
    setCostPrice(p.cost_price.toString())
    setStockQuantity(p.stock_quantity.toString())
    setReorderLevel(p.reorder_level.toString())
    setIsModalOpen(true)
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      sku,
      name,
      category,
      price: parseFloat(price) || 0,
      cost_price: parseFloat(costPrice) || 0,
      stock_quantity: parseInt(stockQuantity) || 0,
      reorder_level: parseInt(reorderLevel) || 10,
    }

    if (editingProduct) {
      const ok = await updateProductApi(editingProduct.id, payload)
      if (ok) {
        setIsModalOpen(false)
        loadProducts()
      } else {
        alert('Failed to update product in database.')
      }
    } else {
      const created = await createProductApi(payload)
      if (created) {
        setIsModalOpen(false)
        loadProducts()
      } else {
        alert('Failed to insert product into database. Make sure SKU is unique and backend MySQL is running.')
      }
    }
  }

  const handleDeleteProduct = async (id: number) => {
    if (confirm('Are you sure you want to delete this product from MySQL database?')) {
      const ok = await deleteProductApi(id)
      if (ok) {
        loadProducts()
      } else {
        alert('Failed to delete product from database.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="text-sm font-semibold text-slate-400 hover:text-white">
            &larr; Dashboard
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-sm font-bold text-white">Product Inventory Management (MySQL)</span>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-lg transition"
        >
          + Add New Product
        </button>
      </header>

      {/* Main Table Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Dynamic Product Catalog</h1>
            <p className="text-sm text-slate-400">Directly connected to CodeIgniter 4 MySQL API</p>
          </div>
          <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-full border border-slate-700">
            Total Database Records: {products.length}
          </span>
        </div>

        <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Selling Price</th>
                  <th className="px-4 py-3">Cost Price</th>
                  <th className="px-4 py-3">Stock Qty</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-mono text-blue-400 text-xs">{p.sku}</td>
                    <td className="px-4 py-3 font-medium text-white">{p.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 text-xs rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-400">${Number(p.price).toFixed(2)}</td>
                    <td className="px-4 py-3 text-slate-400">${Number(p.cost_price).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-xs ${
                          p.stock_quantity <= p.reorder_level
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'text-slate-200'
                        }`}
                      >
                        {p.stock_quantity} units
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="px-2.5 py-1 text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {!isLoading && products.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-500">
                      No products found in database. Click &quot;Add New Product&quot; above to create records.
                    </td>
                  </tr>
                )}
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      Loading items from MySQL database...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h2 className="text-xl font-bold text-white">
              {editingProduct ? 'Edit Product' : 'Add New Product to Database'}
            </h2>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400">SKU Code</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full mt-1 p-2 rounded bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-1 p-2 rounded bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Hardware">Hardware</option>
                    <option value="Supplies">Supplies</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Apparel">Apparel</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wireless Barcode Scanner"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 p-2 rounded bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400">Retail Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="89.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full mt-1 p-2 rounded bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400">Cost Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="50.00"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full mt-1 p-2 rounded bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    placeholder="25"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full mt-1 p-2 rounded bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400">Reorder Alert Level</label>
                  <input
                    type="number"
                    required
                    placeholder="5"
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(e.target.value)}
                    className="w-full mt-1 p-2 rounded bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition"
                >
                  Save to MySQL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
