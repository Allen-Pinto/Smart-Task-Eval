'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase-client'
import { Evaluation } from '@/types'

export function useEvaluation(taskId: string) {
  const { data: evaluation, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['evaluation', taskId],
    queryFn: async (): Promise<Evaluation | null> => {
      console.log('Fetching evaluation for task:', taskId)
      
      if (!taskId) {
        console.log('No task ID provided')
        return null
      }

      try {
        // First check if task exists and get its status
        console.log('Fetching task status...')
        const { data: task, error: taskError } = await supabase
          .from('tasks')
          .select('status, title')
          .eq('id', taskId)
          .single()

        if (taskError) {
          console.error('Error fetching task:', taskError)
          return null
        }

        console.log(`Task found: "${task.title}", Status: ${task.status}`)

        // If task is still processing, return null (will keep polling)
        if (task.status === 'processing' || task.status === 'pending') {
          console.log('Task still processing, will poll again')
          return null
        }

        // If task has error status
        if (task.status === 'error') {
          console.log('Task has error status')
          return null
        }

        // If task is evaluated, fetch the evaluation
        console.log('Task is evaluated, fetching evaluation data...')
        const { data, error } = await supabase
          .from('evaluations')
          .select('*')
          .eq('task_id', taskId)
          .maybeSingle()

        if (error) {
          console.error('Error fetching evaluation:', error)
          return null
        }
        
        if (data) {
          console.log('Evaluation data found:', {
            id: data.id,
            score: data.score
          })
          return data as Evaluation
        } else {
          console.log('No evaluation record found, but task status is:', task.status)
          return null
        }
      } catch (err: any) {
        console.error('Unexpected error in useEvaluation:', err)
        return null
      }
    },
    enabled: !!taskId,
    refetchInterval: (query) => {
      // If we have no data, keep polling every 3 seconds
      return !query.state.data ? 3000 : false
    },
    retry: 2,
    retryDelay: 1000
  })

  return { 
    evaluation: evaluation ?? null, 
    loading, 
    error: error as Error | null,
    refetch 
  }
}