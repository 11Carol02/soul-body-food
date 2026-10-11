import { Suspense } from 'react'
import { TopBar } from '@/components/layout/top-bar'
import { GoalsContent } from '@/components/goals/goals-content'

export default function GoalsPage() {
  return (
    <div>
      <TopBar title="Goals" subtitle="Set and track your aspirations" />
      <Suspense fallback={<div className="p-4 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />)}</div>}>
        <GoalsContent />
      </Suspense>
    </div>
  )
}
