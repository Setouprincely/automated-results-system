'use client'
import { Bell, UserCircle } from 'lucide-react'

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
      <h1 className="text-xl font-semibold text-gray-800">GCE Admin Dashboard</h1>
      <div className="flex items-center gap-4">
        <button className="text-gray-600 hover:text-gray-800">
          <Bell size={20} />
        </button>
        <div className="flex items-center gap-2">
          <UserCircle size={24} className="text-blue-700" />
          <span className="text-sm text-gray-700">admin@gce.cm</span>
        </div>
      </div>
    </header>
  )
}
