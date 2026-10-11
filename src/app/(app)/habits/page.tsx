import { TopBar } from '@/components/layout/top-bar'
import { HabitsContent } from '@/components/habits/habits-content'

export default function HabitsPage() {
  return (
    <div>
      <TopBar title="Daily Habits" subtitle="Build lasting routines" />
      <HabitsContent />
    </div>
  )
}
