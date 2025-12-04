'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string
  icon: LucideIcon
  gradient: string
  iconColor: string
}

export function StatsCard({ title, value, icon: Icon, gradient, iconColor }: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`p-6 bg-gradient-to-br ${gradient} border border-white/10 rounded-xl`}
    >
      <Icon className={`w-10 h-10 ${iconColor} mb-4`} />
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-gray-400">{title}</div>
    </motion.div>
  )
}