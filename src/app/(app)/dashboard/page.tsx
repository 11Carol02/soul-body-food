import { TopBar } from '@/components/layout/top-bar'
import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { formatDate } from '@/lib/utils'

export default function DashboardPage() {
  const today = formatDate(new Date())
  return (
    <div>
      <TopBar title="Dashboard" subtitle={today} />
      <DashboardContent />
    </div>
  )
}
