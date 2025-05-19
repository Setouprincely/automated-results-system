'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Settings, DatabaseBackup, Monitor, ScrollText } from 'lucide-react'

const navItems = [
  { href: '/system-configuration', icon: <Settings size={18} />, label: 'System Config' },
  { href: '/data-backup', icon: <DatabaseBackup size={18} />, label: 'Backup & Restore' },
  { href: '/system-monitoring', icon: <Monitor size={18} />, label: 'Monitoring' },
  { href: '/system-logs', icon: <ScrollText size={18} />, label: 'Logs & Audit' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white shadow-lg hidden md:block">
      <div className="p-6 text-xl font-bold text-blue-700">Admin Panel</div>
      <nav className="flex flex-col gap-1 px-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition hover:bg-blue-50 ${
              pathname === item.href ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700'
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
