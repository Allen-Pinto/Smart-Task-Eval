import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function getStatusColor(status: string) {
  const colors = {
    evaluated: 'text-green-400 bg-green-500/20',
    processing: 'text-yellow-400 bg-yellow-500/20',
    locked: 'text-purple-400 bg-purple-500/20',
    pending: 'text-gray-400 bg-gray-500/20',
    error: 'text-red-400 bg-red-500/20',
  }
  return colors[status as keyof typeof colors] || colors.pending
}