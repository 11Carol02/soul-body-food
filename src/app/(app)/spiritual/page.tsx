import { Suspense } from 'react'
import { TopBar } from '@/components/layout/top-bar'
import { SpiritualContent } from '@/components/spiritual/spiritual-content'

export default function SpiritualPage() {
  return (
    <div>
      <TopBar title="Spiritual Growth" subtitle="Nurture your soul daily" />
      <Suspense fallback={<div className="p-4 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />)}</div>}>
        <SpiritualContent />
      </Suspense>
    </div>
  )
}
