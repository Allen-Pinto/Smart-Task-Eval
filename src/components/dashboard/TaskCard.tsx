'use client'

import { Code, Eye, Clock } from 'lucide-react'
import Link from 'next/link'
import { Task } from '@/types'
import { motion } from 'framer-motion'

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const statusConfig = {
    evaluated: { color: 'text-green-400', bg: 'bg-green-500/20', label: 'Evaluated' },
    processing: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Processing' },
    locked: { color: 'text-purple-400', bg: 'bg-purple-500/20', label: 'Locked' },
    pending: { color: 'text-gray-400', bg: 'bg-gray-500/20', label: 'Pending' },
    error: { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Error' },
  }

  const config = statusConfig[task.status as keyof typeof statusConfig] || statusConfig.pending

  return (
    <Link href={`/dashboard/task/${task.id}/results`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex justify-between items-center cursor-pointer transition-all"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <Code className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <div className="font-semibold">{task.title}</div>
            <div className="text-sm text-gray-400">
              {new Date(task.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 ${config.bg} ${config.color} rounded-full text-sm flex items-center gap-2`}>
            {task.status === 'processing' && <Clock className="w-4 h-4 animate-spin" />}
            {config.label}
          </div>
          <Eye className="w-5 h-5 text-gray-400" />
        </div>
      </motion.div>
    </Link>
  )
}