'use client'

import { useState, useEffect } from 'react'
import {
  Users as UsersIcon,
  Search,
  Plus,
  Shield,
  ShieldCheck,
  User,
  Power,
  X,
  Edit2
} from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import { useToast } from '@/context/ToastContext'
import { getDecodedToken, DecodedToken } from '@/lib/auth'
import { fetchUsersApi, createUserApi, updateUserApi, User as UserType } from '@/lib/users'
import { useRouter } from 'next/navigation'

export default function UserManagement() {
  const toast = useToast()
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<DecodedToken | null>(null)
  
  const [users, setUsers] = useState<UserType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserType | null>(null)
  
  // Form State
  const [username, setUsername] = useState('')
  const [role, setRole] = useState<'admin' | 'manager' | 'staff'>('staff')
  const [password, setPassword] = useState('')
  const [pin, setPin] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')

  useEffect(() => {
    const decoded = getDecodedToken()
    setCurrentUser(decoded)

    if (decoded?.role === 'staff') {
      router.push('/dashboard') // Redirect staff away
      return
    }

    loadUsers()
  }, [])

  const loadUsers = async () => {
    setIsLoading(true)
    const data = await fetchUsersApi()
    setUsers(data)
    setIsLoading(false)
  }

  const filteredUsers = users.filter((u) => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openAddModal = () => {
    setEditingUser(null)
    setUsername('')
    setRole('staff')
    setPassword('')
    setPin('')
    setStatus('active')
    setIsModalOpen(true)
  }

  const openEditModal = (u: UserType) => {
    setEditingUser(u)
    setUsername(u.username)
    setRole(u.role)
    setPassword('') // Don't show hash
    setPin('')     // Don't show hash
    setStatus(u.status)
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload: Partial<UserType> = {
      username,
      role,
      status
    }
    if (password) payload.password = password
    if (pin) payload.pin = pin

    try {
      if (editingUser) {
        await updateUserApi(editingUser.id, payload)
        toast.success(`User ${username} updated successfully!`)
      } else {
        await createUserApi(payload)
        toast.success(`User ${username} created successfully!`)
      }
      setIsModalOpen(false)
      loadUsers()
    } catch (err: any) {
      toast.error(err.message || 'An error occurred.')
    }
  }

  const handleToggleStatus = async (u: UserType) => {
    const newStatus = u.status === 'active' ? 'inactive' : 'active'
    try {
      await updateUserApi(u.id, { status: newStatus })
      toast.info(`User ${u.username} is now ${newStatus}.`)
      loadUsers()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status.')
    }
  }

  const isManager = currentUser?.role === 'manager'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Header */}
        <header className="h-16 border-b border-slate-800/80 glass-panel px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-2">
            <UsersIcon className="w-5 h-5 text-indigo-400" />
            <span className="font-black text-sm tracking-widest text-slate-300 uppercase">Team Operations</span>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New User</span>
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-6 relative z-10">
          
          {/* Title & Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <h1 className="text-2xl font-black text-white">User Management</h1>
              <p className="text-xs text-slate-400">Manage employee access, roles, and status.</p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-56"
                />
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800/80">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/50 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-bold">Username</th>
                    <th className="px-5 py-4 font-bold">Role</th>
                    <th className="px-5 py-4 font-bold">Status</th>
                    <th className="px-5 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-slate-500 text-xs">
                        Loading users...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-slate-500 text-xs">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/20 transition group">
                        <td className="px-5 py-4 font-bold text-white">{u.username}</td>
                        <td className="px-5 py-4">
                          <span className={`flex items-center space-x-1.5 w-max px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'admin' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                            u.role === 'manager' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            {u.role === 'admin' ? <ShieldCheck className="w-3 h-3" /> :
                             u.role === 'manager' ? <Shield className="w-3 h-3" /> :
                             <User className="w-3 h-3" />}
                            <span>{u.role}</span>
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                            u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleToggleStatus(u)}
                              disabled={isManager && u.role !== 'staff'}
                              className={`p-1.5 rounded-lg transition ${
                                isManager && u.role !== 'staff' 
                                  ? 'opacity-30 cursor-not-allowed text-slate-600' 
                                  : u.status === 'active'
                                    ? 'text-rose-400 hover:bg-rose-500/10'
                                    : 'text-emerald-400 hover:bg-emerald-500/10'
                              }`}
                              title={u.status === 'active' ? 'Deactivate User' : 'Activate User'}
                            >
                              <Power className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(u)}
                              disabled={isManager && u.role !== 'staff'}
                              className={`p-1.5 rounded-lg transition ${
                                isManager && u.role !== 'staff' 
                                  ? 'opacity-30 cursor-not-allowed text-slate-600' 
                                  : 'text-indigo-400 hover:bg-indigo-500/10'
                              }`}
                              title="Edit User"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <h2 className="text-base font-bold text-white">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4 flex-1 overflow-y-auto">
                <form id="user-form" onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Username</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      {/* Managers can only select Staff */}
                      <option value="staff">Staff</option>
                      {!isManager && <option value="manager">Manager</option>}
                      {!isManager && <option value="admin">Admin</option>}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">
                      Login Password {editingUser && '(Leave blank to keep current)'}
                    </label>
                    <input
                      type="password"
                      required={!editingUser}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">
                      POS PIN {editingUser && '(Leave blank to keep current)'}
                    </label>
                    <input
                      type="password"
                      required={!editingUser}
                      maxLength={6}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </form>
              </div>
              
              <div className="px-5 py-4 border-t border-slate-800 flex justify-end space-x-3 bg-slate-900/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="user-form"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/20"
                >
                  Save User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
