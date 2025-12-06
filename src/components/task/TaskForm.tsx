'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CodeEditor } from './CodeEditor'
import { supabase } from '@/lib/supabase-client' 
import { apiClient } from '@/lib/api-client' 

export function TaskForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code_text: '',
    language: 'javascript',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert({
          ...formData,
          user_id: user.id,
          status: 'pending',
        })
        .select()
        .single()

      if (taskError) throw taskError

      await apiClient.triggerEvaluation(task.id)

      // FIXED: Changed from /task to /dashboard/task
      router.push(`/dashboard/task/${task.id}/results`)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel rounded-xl p-8">
      {error && (
        <div className="mb-6 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Task Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Binary Search Implementation"
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Programming Language *</label>
          <select
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe what your code does and any specific requirements..."
            required
            rows={4}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <CodeEditor
          value={formData.code_text}
          onChange={(value) => setFormData({ ...formData, code_text: value })}
        />

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold transition-all disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit for Evaluation'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  )
}