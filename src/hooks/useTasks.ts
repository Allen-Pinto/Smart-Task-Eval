'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase-client'
import { Task } from '../types'

export function useTasks() {
  const { data: tasks, isLoading: loading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null  // Return null instead of throwing
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Task[]
    },
  })

  return { tasks: tasks ?? null, loading, error }
}