import './globals.css'
import type { Metadata } from 'next'
import { ToastProvider } from '@/context/ToastContext'

export const metadata: Metadata = {
  title: 'Nexus ERP & POS Control Center',
  description: 'Enterprise Resource Planning & Point of Sale System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-slate-950 text-slate-100 min-h-screen">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
