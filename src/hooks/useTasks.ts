'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase-client'
import { Task } from '@/types'

export function useTask(taskId: string) {
  const { data: task, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async (): Promise<Task | null> => {
      if (!taskId) return null
      
      console.log('🔍 Fetching task with ID:', taskId)
      
      // Method 1: First try the JOIN query
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
            created_at,
            updated_at
          )
        `)
        .eq('id', taskId)
        .single()

      if (error) {
        console.error('  JOIN query error:', error)
        if (error.code === 'PGRST116') return null
        throw error
      }
      
      console.log(' Task fetched:', {
        id: data.id,
        title: data.title,
        status: data.status,
        evaluationCount: data.evaluations?.length || 0,
        hasEvaluation: !!(data.evaluations?.[0]),
        evaluationData: data.evaluations?.[0]
      })
      
      // Map evaluation data to task
      const evaluation = data.evaluations?.[0] as any
      const taskWithEvaluation: Task = {
        ...data,
        evaluation: evaluation || undefined
      }
      
      // If no evaluation but task is evaluated, try direct fetch
      if (!evaluation && data.status === 'evaluated') {
        console.log('⚠️ Task is evaluated but no evaluation found. Fetching separately...')
        const { data: evalData } = await supabase
          .from('evaluations')
          .select('*')
          .eq('task_id', taskId)
          .maybeSingle()
          
        if (evalData) {
          console.log('  Found evaluation via separate query:', evalData)
          taskWithEvaluation.evaluation = evalData
        } else {
          console.log('  Still no evaluation found in database')
        }
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
      console.log('📋 Fetching all tasks')
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.log('👤 No user found')
        return []
      }
      
      console.log('👤 User ID:', user.id)
      
      const { data: tasksData, error: tasksError } = await supabase
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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (tasksError) {
        console.error('  Error fetching tasks:', tasksError)
        throw tasksError
      }
      
      console.log(`  Fetched ${tasksData?.length || 0} tasks`)
      
      const tasksWithEvaluations = (tasksData || []).map(taskData => {
        const evaluation = taskData.evaluations?.[0] as any
        
        console.log(`   Task "${taskData.title}":`, {
          status: taskData.status,
          hasEvaluation: !!evaluation,
          evaluationId: evaluation?.id,
          isUnlocked: evaluation?.is_unlocked,
          score: evaluation?.score
        })
        
        const task: Task = {
          ...taskData,
          evaluation: evaluation || undefined,
          score: evaluation?.score || undefined
        }
        return task
      })
      
      return tasksWithEvaluations
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