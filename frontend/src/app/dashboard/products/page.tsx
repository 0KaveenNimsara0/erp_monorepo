'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  ArrowLeft,
  Layers,
  AlertTriangle,
  DollarSign,
  CheckCircle2,
  X,
  RefreshCw,
  Filter,
  Tags
} from 'lucide-react'
import {
  Product,
  fetchProductsFromApi,
  createProductApi,
  updateProductApi,
  deleteProductApi
} from '@/lib/products'

import Sidebar from '@/components/Sidebar'
import { useToast } from '@/context/ToastContext'
import { getCategories, addCategory, deleteCategory, Category } from '@/lib/settings'
import { getDecodedToken, DecodedToken } from '@/lib/auth'

export default function ProductManagement() {
  const toast = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<DecodedToken | null>(null)

  // Category Management State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [newCatName, setNewCatName] = useState('')

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('0')

  // Form State
  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState<number>(0)
  const [price, setPrice] = useState('')
  const [costPrice, setCostPrice] = useState('')
  const [stockQuantity, setStockQuantity] = useState('')
  const [reorderLevel, setReorderLevel] = useState('10')

  const [dynamicCategories, setDynamicCategories] = useState<Category[]>([])

  const loadProducts = async () => {
    setIsLoading(true)
    const data = await fetchProductsFromApi()
    setProducts(data)

    const cats = await getCategories()
    setDynamicCategories(cats)

    setIsLoading(false)
  }

  useEffect(() => {
    setUser(getDecodedToken())
    loadProducts()
  }, [])

  const openAddModal = () => {
    setEditingProduct(null)
    setSku(`SKU-${Math.floor(100 + Math.random() * 900)}`)
    setName('')
    setCategoryId(dynamicCategories.length > 0 ? dynamicCategories[0].id : 0)
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
    setCategoryId(p.category_id || (dynamicCategories.length > 0 ? dynamicCategories[0].id : 0))
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
      category_id: categoryId,
      price: parseFloat(price) || 0,
      cost_price: parseFloat(costPrice) || 0,
      stock_quantity: parseInt(stockQuantity) || 0,
      reorder_level: parseInt(reorderLevel) || 10,
    }

    if (editingProduct) {
      const ok = await updateProductApi(editingProduct.id, payload)
      if (ok) {
        toast.success(`Product "${name}" updated successfully!`)
        setIsModalOpen(false)
        loadProducts()
      } else {
        toast.error('Failed to update product in database.')
      }
    } else {
      const created = await createProductApi(payload)
      if (created) {
        toast.success(`Product "${name}" created successfully!`)
        setIsModalOpen(false)
        loadProducts()
      } else {
        toast.error('Failed to insert product into database. Make sure SKU is unique.')
      }
    }
  }

  const [deletingProductId, setDeletingProductId] = useState<number | null>(null)

  const confirmDeleteProduct = async () => {
    if (!deletingProductId) return
    const ok = await deleteProductApi(deletingProductId)
    if (ok) {
      toast.info('Product removed from database.')
      loadProducts()
    } else {
      toast.error('Failed to delete product from database.')
    }
    setDeletingProductId(null)
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) return

    const updated = await addCategory(newCatName.trim())
    setDynamicCategories(updated)
    toast.success(`Category "${newCatName.trim()}" added successfully!`)
    setNewCatName('')
  }

  const handleDeleteCategory = async (id: number, name: string) => {
    const updated = await deleteCategory(id)
    setDynamicCategories(updated)
    toast.info(`Category "${name}" removed.`)
  }
  const categories = [{ id: 0, name: 'All' }, ...dynamicCategories]

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === '0' || String(p.category_id) === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-row relative overflow-x-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <header className="h-16 border-b border-slate-800/80 glass-panel px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-indigo-400" />
            <span className="font-black text-white tracking-tight">Product Inventory Management</span>
          </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold rounded-lg transition"
          >
            <Tags className="w-3.5 h-3.5" />
            <span>Manage Categories</span>
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-6 relative z-10">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-black text-white">Product Catalog Studio</h1>
            <p className="text-xs text-slate-400">Directly synchronized with CodeIgniter 4 MySQL API</p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-56"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id.toString()}>Category: {c.name}</option>
              ))}
            </select>

            <button
              onClick={loadProducts}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-4">SKU</th>
                  <th className="px-5 py-4">Product Details</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Retail Price</th>
                  <th className="px-5 py-4">Cost Price</th>
                  <th className="px-5 py-4">Stock Level</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredProducts.map((p) => {
                  const stock = Number(p.stock_quantity)
                  const reorder = Number(p.reorder_level)
                  const isCritical = stock <= reorder
                  const isWarning = stock > reorder && stock <= reorder + 20
                  
                  return (
                    <tr key={p.id} className="hover:bg-slate-900/40 transition">
                      <td className="px-5 py-4 font-mono text-indigo-400 font-semibold">{p.sku}</td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-white text-sm">{p.name}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-medium">
                          {p.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-extrabold text-emerald-400">Rs. {Number(p.price).toFixed(2)}</td>
                      <td className="px-5 py-4 text-slate-400">Rs. {Number(p.cost_price).toFixed(2)}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`font-semibold px-2.5 py-1 rounded-full text-[10px] inline-flex items-center space-x-1 ${
                            isCritical
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : isWarning
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-slate-900 text-slate-300 border border-slate-800'
                          }`}
                        >
                          {(isCritical || isWarning) && (
                            <AlertTriangle className={`w-3 h-3 ${isCritical ? 'text-rose-400' : 'text-amber-400'}`} />
                          )}
                          <span>{stock} units</span>
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="px-2.5 py-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg transition inline-flex items-center space-x-1"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => setDeletingProductId(p.id)}
                            className="px-2.5 py-1.5 text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg transition inline-flex items-center space-x-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {!isLoading && filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">
                      No products found. Click &quot;Add New Product&quot; to create items.
                    </td>
                  </tr>
                )}
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      Syncing products with MySQL database...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {deletingProductId !== null && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel p-6 rounded-2xl max-w-sm w-full space-y-4 border border-slate-800 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Delete Product Record?</h3>
              <p className="text-xs text-slate-400">Are you sure you want to permanently delete this product from the MySQL database?</p>
            </div>
            <div className="flex justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeletingProductId(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl transition border border-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProduct}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-rose-600/20"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel p-6 rounded-2xl max-w-lg w-full space-y-4 border border-slate-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">
                {editingProduct ? 'Edit Product Record' : 'Add New Product to Database'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400">SKU Code</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(parseInt(e.target.value) || 0)}
                    className="w-full mt-1 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {dynamicCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
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
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400">Retail Price (Rs.)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="89.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400">Cost Price (Rs.)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="50.00"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
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
                    className="w-full mt-1 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
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
                    className="w-full mt-1 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/20"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h2 className="text-base font-bold text-white">Manage Categories</h2>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-6 flex-1 overflow-y-auto max-h-[70vh]">
              <form onSubmit={handleAddCategory} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="New category (e.g. Bakery)..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition flex items-center shrink-0"
                >
                  <Plus className="w-3 h-3 mr-1" /> Add
                </button>
              </form>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Active Categories</label>
                <div className="space-y-2">
                  {dynamicCategories.map((cat) => (
                    <div key={cat.id} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between group hover:border-slate-700 transition">
                      <span className="text-xs font-bold text-slate-200">{cat.name}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition rounded-lg hover:bg-rose-500/10"
                        title={`Remove ${cat.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {dynamicCategories.length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-4">No categories found.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
