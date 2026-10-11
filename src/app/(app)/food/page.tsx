import { Suspense } from 'react'
import { TopBar } from '@/components/layout/top-bar'
import { FoodContent } from '@/components/food/food-content'

export default function FoodPage() {
  return (
    <div>
      <TopBar title="Food Tracker" subtitle="Track your daily nutrition" />
      <Suspense fallback={<div className="p-4 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />)}</div>}>
        <FoodContent />
      </Suspense>
    </div>
  )
}
