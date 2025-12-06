'use client'

import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { TaskList } from '@/components/dashboard/TaskList'
import { useTasks } from '@/hooks/useTasks'
import { FileCode, CheckCircle, TrendingUp, Clock } from 'lucide-react'

export default function DashboardPage() {
  const { tasks, loading } = useTasks()

  const stats = {
    total: tasks?.length || 0,
    completed: tasks?.filter(t => t.status === 'evaluated').length || 0,
    pending: tasks?.filter(t => t.status === 'processing').length || 0,
    avgScore: 7.8,
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <DashboardHeader />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Tasks"
          value={stats.total.toString()}
          icon={FileCode}
          gradient="from-purple-500/20 to-pink-500/20"
          iconColor="text-purple-400"
        />
        <StatsCard
          title="Completed"
          value={stats.completed.toString()}
          icon={CheckCircle}
          gradient="from-green-500/20 to-emerald-500/20"
          iconColor="text-green-400"
        />
        <StatsCard
          title="Processing"
          value={stats.pending.toString()}
          icon={Clock}
          gradient="from-yellow-500/20 to-orange-500/20"
          iconColor="text-yellow-400"
        />
        <StatsCard
          title="Avg Score"
          value={stats.avgScore.toFixed(1)}
          icon={TrendingUp}
          gradient="from-blue-500/20 to-cyan-500/20"
          iconColor="text-blue-400"
        />
      </div>

      <TaskList tasks={tasks} loading={loading} />
    </div>
  )
}