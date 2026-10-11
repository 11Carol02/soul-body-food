'use client'

import { Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TopBarProps {
  title: string
  subtitle?: string
}

export function TopBar({ title, subtitle }: TopBarProps) {
  return (
    <div className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 lg:px-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-gray-500">
          <Search className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-500 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
        </Button>
      </div>
    </div>
  )
}
