import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateShort(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function getTodayDate() {
  return new Date().toISOString().split('T')[0]
}

export function getMealTypeColor(type: string) {
  const colors: Record<string, string> = {
    breakfast: 'bg-yellow-100 text-yellow-800',
    lunch: 'bg-blue-100 text-blue-800',
    dinner: 'bg-purple-100 text-purple-800',
    snack: 'bg-green-100 text-green-800',
  }
  return colors[type] ?? 'bg-gray-100 text-gray-800'
}

export function getSpiritualTypeColor(type: string) {
  const colors: Record<string, string> = {
    prayer: 'bg-indigo-100 text-indigo-800',
    meditation: 'bg-purple-100 text-purple-800',
    scripture: 'bg-blue-100 text-blue-800',
    gratitude: 'bg-pink-100 text-pink-800',
    worship: 'bg-violet-100 text-violet-800',
    fasting: 'bg-orange-100 text-orange-800',
    journal: 'bg-teal-100 text-teal-800',
  }
  return colors[type] ?? 'bg-gray-100 text-gray-800'
}

export function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    food: 'text-green-600',
    spiritual: 'text-purple-600',
    fitness: 'text-blue-600',
    family: 'text-pink-600',
    personal: 'text-orange-600',
  }
  return colors[category] ?? 'text-gray-600'
}

export function calculateProgress(current: number, target: number) {
  if (target === 0) return 0
  return Math.min(Math.round((current / target) * 100), 100)
}
