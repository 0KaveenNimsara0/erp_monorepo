import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-slate-950">
      <div className="max-w-3xl w-full p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
          Enterprise Resource Planning & POS Monorepo
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
          ERP System Control Center
        </h1>
        
        <p className="text-slate-400 text-lg">
          CodeIgniter 4 REST API Backend & Next.js Tailwind CSS Frontend Architecture.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
          <Link
            href="/dashboard"
            className="p-6 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-blue-500 transition duration-200 text-left group"
          >
            <h2 className="text-xl font-semibold text-white group-hover:text-blue-400 flex items-center justify-between">
              ERP Dashboard
              <span>&rarr;</span>
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              View sales analytics, track inventory levels, manage user access, and operational overview.
            </p>
          </Link>

          <Link
            href="/pos"
            className="p-6 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-emerald-500 transition duration-200 text-left group"
          >
            <h2 className="text-xl font-semibold text-white group-hover:text-emerald-400 flex items-center justify-between">
              Point of Sale (POS)
              <span>&rarr;</span>
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              High-speed retail checkout terminal, product search, cart summary, and receipt processing.
            </p>
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-800 text-xs text-slate-500 flex justify-between items-center">
          <span>Backend: CodeIgniter 4 (PHP REST API)</span>
          <span>Frontend: Next.js + Tailwind CSS</span>
        </div>
      </div>
    </main>
  )
}
