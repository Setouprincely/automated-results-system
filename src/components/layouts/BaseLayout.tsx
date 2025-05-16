'use client'
import { ReactNode } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

export default function BaseLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
