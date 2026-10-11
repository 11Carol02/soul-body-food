import { TopBar } from '@/components/layout/top-bar'
import { FamilyContent } from '@/components/family/family-content'

export default function FamilyPage() {
  return (
    <div>
      <TopBar title="Family" subtitle="Grow together" />
      <FamilyContent />
    </div>
  )
}
