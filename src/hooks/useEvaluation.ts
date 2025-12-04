'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase-client'
import { Evaluation } from '../types'

export function useEvaluation(taskId: string) {
  const { data: evaluation, isLoading: loading } = useQuery({
    queryKey: ['evaluation', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('evaluations')
        .select('*')
        .eq('task_id', taskId)
        .single()

      if (error) {
        // Return null instead of throwing for 404
        if (error.code === 'PGRST116') { // Not found error code
          return null
        }
        throw error
      }
      return data as Evaluation
    },
    enabled: !!taskId,
  })

  return { evaluation: evaluation ?? null, loading }
}