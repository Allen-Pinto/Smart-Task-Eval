// hooks/useTasks.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase-client'  // Use absolute path
import { Task } from '@/types'  // Use absolute path

export function useTasks() {
  const { data: tasks, isLoading: loading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: async (): Promise<Task[]> => {  // Explicit return type
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return [] 
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Task[]
    },
    initialData: [], 
  })

  return { tasks: tasks ?? [], loading, error }  
}