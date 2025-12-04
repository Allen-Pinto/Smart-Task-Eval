'use client'

import { useState } from 'react'
import { TaskCard } from '../../../components/dashboard/TaskCard'
import { useTasks } from '../../../hooks/useTasks'
import { Search } from 'lucide-react'

export default function ReportsPage() {
  const { tasks, loading } = useTasks()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTasks = tasks?.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Past Reports</h1>
        <p className="text-gray-400">View all your evaluation reports</p>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : filteredTasks?.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No tasks found</div>
        ) : (
          filteredTasks?.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))
        )}
      </div>
    </div>
  )
}