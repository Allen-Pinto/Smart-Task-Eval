'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase-client'
import { Task } from '@/types'

export function useTask(taskId: string) {
  const { data: task, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async (): Promise<Task | null> => {
      if (!taskId) return null
      
      console.log('Fetching task:', taskId)
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          evaluations (
            id,
            score,
            strengths,
            improvements,
            summary,
            is_unlocked,
            created_at
          )
        `)
        .eq('id', taskId)
        .single()

      if (error) {
        console.error('Error fetching task:', error)
        if (error.code === 'PGRST116') return null
        throw error
      }
      
      console.log('Task fetched, status:', data.status)
      console.log('Has evaluations:', data.evaluations?.length || 0)
      
      // Map evaluation data to task
      const evaluation = data.evaluations?.[0] as any
      const taskWithEvaluation: Task = {
        ...data,
        evaluation: evaluation || undefined
      }
      
      return taskWithEvaluation
    },
    enabled: !!taskId,
    refetchOnWindowFocus: true,
    refetchInterval: (query) => {
      const task = query.state.data
      // If task is still processing, poll every 3 seconds
      if (task?.status === 'processing' || task?.status === 'pending') {
        return 3000
      }
      return false
    }
  })

  return { 
    task: task ?? null, 
    loading, 
    error: error as Error | null,
    refetch 
  }
}

// Multiple tasks hook
export function useTasks() {
  const { data: tasks, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['tasks'],
    queryFn: async (): Promise<Task[]> => {
      console.log('Fetching all tasks')
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.log('No user found')
        return []
      }
      
      console.log('Fetching tasks for user:', user.id)
      
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          evaluations (
            score
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError)
        throw tasksError
      }
      
      console.log(`Fetched ${tasksData?.length || 0} tasks`)
      
      const tasksWithScores = (tasksData || []).map(taskData => {
        const evaluation = taskData.evaluations?.[0] as any
        const task: Task = {
          ...taskData,
          score: evaluation?.score || undefined
        }
        return task
      })
      
      return tasksWithScores
    },
    refetchOnWindowFocus: false,
    staleTime: 30000
  })

  return { 
    tasks: tasks ?? [], 
    loading, 
    error: error as Error | null,
    refetch 
  }
}