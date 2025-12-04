'use client'

import { TaskCard } from './TaskCard'
import { Task } from '../../types'

interface TaskListProps {
  tasks: Task[] | null
  loading: boolean
}

export function TaskList({ tasks, loading }: TaskListProps) {
  if (loading) {
    return (
      <div className="glass-panel rounded-xl p-6">
        <div className="text-center py-12 text-gray-400">Loading tasks...</div>
      </div>
    )
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-6">
        <div className="text-center py-12 text-gray-400">
          No tasks yet. Submit your first task to get started!
        </div>
      </div>
    )
  }

  return (
    <div className="glass-panel rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-6">Recent Tasks</h2>
      <div className="space-y-4">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}