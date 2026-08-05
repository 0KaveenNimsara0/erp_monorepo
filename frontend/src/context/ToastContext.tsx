'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  toast: {
    success: (msg: string) => void
    error: (msg: string) => void
    warning: (msg: string) => void
    info: (msg: string) => void
  }
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((message: string, type: ToastType) => {
    if (!message) return
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])

    setTimeout(() => {
      removeToast(id)
    }, 4500)
  }, [removeToast])

  useEffect(() => {
    const handleCustomToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type: ToastType }>
      if (customEvent.detail) {
        addToast(customEvent.detail.message, customEvent.detail.type)
      }
    }

    window.addEventListener('app:toast', handleCustomToast)
    return () => {
      window.removeEventListener('app:toast', handleCustomToast)
    }
  }, [addToast])

  const toast = useMemo(
    () => ({
      success: (msg: string) => addToast(msg, 'success'),
      error: (msg: string) => addToast(msg, 'error'),
      warning: (msg: string) => addToast(msg, 'warning'),
      info: (msg: string) => addToast(msg, 'info'),
    }),
    [addToast]
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Render Container with Explicit Inline Styles for 100% Guaranteed Visibility */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 999999,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          maxWidth: '380px',
          width: 'calc(100% - 40px)',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => {
          let bg = 'rgba(15, 23, 42, 0.88)'
          let border = '1px solid rgba(99, 102, 241, 0.25)'
          let textColor = '#e2e8f0'
          let icon = <Info className="w-4 h-4 text-indigo-400 shrink-0" />

          if (t.type === 'success') {
            bg = 'rgba(6, 26, 18, 0.88)'
            border = '1px solid rgba(16, 185, 129, 0.25)'
            textColor = '#a7f3d0'
            icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          } else if (t.type === 'error') {
            bg = 'rgba(28, 12, 18, 0.88)'
            border = '1px solid rgba(225, 29, 72, 0.25)'
            textColor = '#fecdd3'
            icon = <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          } else if (t.type === 'warning') {
            bg = 'rgba(28, 20, 10, 0.88)'
            border = '1px solid rgba(245, 158, 11, 0.25)'
            textColor = '#fde68a'
            icon = <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          }

          return (
            <div
              key={t.id}
              className="toast-animate"
              style={{
                pointerEvents: 'auto',
                padding: '12px 16px',
                borderRadius: '14px',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                background: bg,
                border: border,
                color: textColor,
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {icon}
                <p style={{ fontSize: '12px', fontWeight: 700, lineHeight: 1.5, margin: 0 }}>
                  {t.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  flexShrink: 0,
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    return {
      success: (msg: string) => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: msg, type: 'success' } }))
        }
      },
      error: (msg: string) => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: msg, type: 'error' } }))
        }
      },
      warning: (msg: string) => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: msg, type: 'warning' } }))
        }
      },
      info: (msg: string) => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: msg, type: 'info' } }))
        }
      },
    }
  }
  return context.toast
}
