'use client'

import { useState, useEffect } from 'react'
import { fetchAuditLogs, AuditLog } from '@/lib/audit'
import { getDecodedToken, DecodedToken } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'
import { 
  Activity, 
  Search, 
  Eye, 
  X,
  FileJson,
  Calendar,
  User as UserIcon,
  Tag,
  Monitor
} from 'lucide-react'

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([])
  const [user, setUser] = useState<DecodedToken | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Modal state
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  useEffect(() => {
    const decoded = getDecodedToken()
    setUser(decoded)
    
    // Strict RBAC on Frontend
    if (decoded && decoded.role !== 'admin') {
      window.location.href = '/dashboard'
      return
    }

    const loadLogs = async () => {
      const data = await fetchAuditLogs()
      setLogs(data)
      setFilteredLogs(data)
      setIsLoading(false)
    }

    loadLogs()
  }, [])

  useEffect(() => {
    if (!searchQuery) {
      setFilteredLogs(logs)
      return
    }
    
    const q = searchQuery.toLowerCase()
    const filtered = logs.filter(l => 
      l.action.toLowerCase().includes(q) ||
      l.entity.toLowerCase().includes(q) ||
      (l.username && l.username.toLowerCase().includes(q)) ||
      (l.ip_address && l.ip_address.toLowerCase().includes(q))
    )
    setFilteredLogs(filtered)
  }, [searchQuery, logs])

  const getActionBadge = (action: string) => {
    switch(action.toUpperCase()) {
      case 'CREATE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'UPDATE':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'DELETE':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      case 'LOGIN_SUCCESS':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      case 'LOGIN_FAILED':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  const renderJsonDiff = (log: AuditLog) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-slate-300 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Old Values</span>
          </h4>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto">
            <pre className="text-xs text-rose-300 font-mono">
              {log.old_values ? JSON.stringify(log.old_values, null, 2) : 'null'}
            </pre>
          </div>
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-slate-300 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>New Values</span>
          </h4>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto">
            <pre className="text-xs text-emerald-300 font-mono">
              {log.new_values ? JSON.stringify(log.new_values, null, 2) : 'null'}
            </pre>
          </div>
        </div>
      </div>
    )
  }

  // Prevents flicker for non-admins
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex selection:bg-indigo-500/30">
      <Sidebar />
      <main className="flex-1 ml-20 transition-all duration-300">
        <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Activity className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">System Audit Trail</h1>
              </div>
              <p className="text-sm text-slate-400 font-medium">
                Immutable ledger of all system modifications.
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-64 bg-slate-900 border border-slate-800 text-sm text-white rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl shadow-black/20">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">
                    <th className="px-5 py-4">Timestamp</th>
                    <th className="px-5 py-4">User</th>
                    <th className="px-5 py-4">Action</th>
                    <th className="px-5 py-4">Entity</th>
                    <th className="px-5 py-4">IP Address</th>
                    <th className="px-5 py-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/40 transition">
                      <td className="px-5 py-4 text-slate-300 font-medium whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        {log.username ? (
                          <span className="font-bold text-white">{log.username}</span>
                        ) : (
                          <span className="text-slate-500 italic">System</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-md border font-bold text-[10px] tracking-wide ${getActionBadge(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-slate-300 font-mono bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
                          {log.entity} {log.entity_id ? `#${log.entity_id}` : ''}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400 font-mono">
                        {log.ip_address || 'Unknown'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg transition inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!isLoading && filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                        No audit logs found.
                      </td>
                    </tr>
                  )}
                  {isLoading && (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                        <div className="flex items-center justify-center space-x-2">
                          <Activity className="w-4 h-4 animate-spin text-purple-500" />
                          <span>Loading logs...</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Diff Viewer Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setSelectedLog(null)}
          ></div>
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-800/80">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <FileJson className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Log Details</h2>
                  <p className="text-xs text-slate-400">ID: {selectedLog.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center space-x-2 text-slate-400 mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Timestamp</span>
                  </div>
                  <p className="text-sm font-medium text-white">{new Date(selectedLog.created_at).toLocaleString()}</p>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center space-x-2 text-slate-400 mb-1">
                    <UserIcon className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">User</span>
                  </div>
                  <p className="text-sm font-medium text-white">{selectedLog.username || 'System'}</p>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center space-x-2 text-slate-400 mb-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Entity</span>
                  </div>
                  <p className="text-sm font-medium text-white">{selectedLog.entity} {selectedLog.entity_id ? `#${selectedLog.entity_id}` : ''}</p>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center space-x-2 text-slate-400 mb-1">
                    <Monitor className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Action</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getActionBadge(selectedLog.action)}`}>
                    {selectedLog.action}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Data Snapshot</h3>
                {renderJsonDiff(selectedLog)}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}
