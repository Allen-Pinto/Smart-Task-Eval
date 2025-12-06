'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase-client'  
import { Evaluation } from '@/types'  

export function useEvaluation(taskId: string) {
  const { data: evaluation, isLoading: loading } = useQuery({
    queryKey: ['evaluation', taskId],
    queryFn: async (): Promise<Evaluation | null> => {
      const { data, error } = await supabase
        .from('evaluations')
        .select('*')
        .eq('task_id', taskId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
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