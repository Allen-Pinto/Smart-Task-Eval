import { createClient } from '@/app/lib/supabase-server';

export async function createTask(taskData: {
  title: string;
  description: string;
  code_text: string;
  language?: string;
  file_url?: string;
}) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title: taskData.title,
        description: taskData.description,
        code_text: taskData.code_text,
        language: taskData.language || 'javascript',
        file_url: taskData.file_url || null,
        status: 'pending',
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return task;
  } catch (error) {
    console.error('Create task error:', error);
    throw error;
  }
}

export async function getUserTasks(options?: {
  limit?: number;
  offset?: number;
  status?: string;
}) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }
    
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (options?.status) {
      query = query.eq('status', options.status);
    }
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }
    
    const { data: tasks, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return tasks || [];
  } catch (error) {
    console.error('Get tasks error:', error);
    return [];
  }
}

export async function getTaskWithEvaluation(taskId: string) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', user.id)
      .single();
    
    if (taskError || !task) {
      throw new Error('Task not found');
    }
    
    const { data: evaluation, error: evalError } = await supabase
      .from('evaluations')
      .select('*')
      .eq('task_id', taskId)
      .single();
    
    return {
      task,
      evaluation: evaluation || null,
    };
  } catch (error) {
    console.error('Get task with evaluation error:', error);
    throw error;
  }
}

export async function updateTaskStatus(taskId: string, status: string) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { data: task, error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', taskId)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return task;
  } catch (error) {
    console.error('Update task status error:', error);
    throw error;
  }
}

export async function getUserPayments() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }
    
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return payments || [];
  } catch (error) {
    console.error('Get payments error:', error);
    return [];
  }
}