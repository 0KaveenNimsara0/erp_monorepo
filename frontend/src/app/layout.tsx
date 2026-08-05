import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ERP & POS System',
  description: 'Enterprise Resource Planning & Point of Sale System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-slate-900 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  )
}
