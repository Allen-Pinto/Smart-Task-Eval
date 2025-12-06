import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { evaluateCode } from '@/lib/groq-client'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing')
console.log('Supabase Key:', supabaseKey ? 'Set' : 'Missing')

const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  console.log('\n ========== /api/evaluate CALLED ==========')
  console.log('Time:', new Date().toISOString())
  
  let taskId: string | null = null
  
  try {
    console.log('Parsing request...')
    const body = await request.json()
    taskId = body.taskId
    
    console.log('Received taskId:', taskId)
    
    if (!taskId) {
      console.error('ERROR: No taskId provided')
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    // Get the task
    console.log('Fetching task from database...')
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single()

    if (taskError || !task) {
      console.error('ERROR: Task not found:', taskError)
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    console.log('Task found:')
    console.log('   Title:', task.title)
    console.log('   Language:', task.language)
    console.log('   Code length:', task.code_text?.length || 0, 'chars')
    console.log('   Current status:', task.status)

    // Update status to processing
    console.log('Updating task status to "processing"...')
    const { error: updateError } = await supabase
      .from('tasks')
      .update({ 
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)

    if (updateError) {
      console.error('ERROR updating task:', updateError)
      throw updateError
    }
    
    console.log('Task status updated to "processing"')

    // Call AI for evaluation
    console.log('Calling Groq AI for evaluation...')
    console.log('   Model:', process.env.GROQ_MODEL_NAME || 'default')
    
    const evaluation = await evaluateCode(
      task.code_text,
      task.language,
      task.description
    )

    console.log('AI Evaluation complete!')
    console.log('   Score:', evaluation.score)
    console.log('   Strengths:', evaluation.strengths?.length || 0)
    console.log('   Improvements:', evaluation.improvements?.length || 0)
    console.log('   Summary:', evaluation.summary?.substring(0, 50) + '...')

    // First update the task status to evaluated
    console.log('Updating task status to "evaluated"...')
    const { error: statusUpdateError } = await supabase
      .from('tasks')
      .update({
        status: 'evaluated',
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)

    if (statusUpdateError) {
      console.error('ERROR updating task status:', statusUpdateError)
      throw statusUpdateError
    }
    
    console.log('Task status updated to "evaluated"')

    // Create evaluation record with score - SET is_unlocked TO false
    console.log('Creating evaluation record...')
    const { error: evalError } = await supabase
      .from('evaluations')
      .insert({
        task_id: taskId,
        score: evaluation.score,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        summary: evaluation.summary,
        is_unlocked: false, // CHANGED FROM true TO false
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (evalError) {
      console.error('ERROR creating evaluation:', evalError)
      throw evalError
    }
    
    console.log('Evaluation record created with is_unlocked: false')
    console.log('========== EVALUATION COMPLETE ==========\n')

    return NextResponse.json({
      success: true,
      evaluation
    })

  } catch (error: any) {
    console.error('\n ========== EVALUATION ERROR ==========')
    console.error('Error:', error.message)
    console.error('Stack:', error.stack)
    console.error('Task ID:', taskId)
    console.error('=======================================\n')
    
    // Mark task as error (only if we have taskId)
    if (taskId) {
      try {
        console.log('Marking task as "error"...')
        await supabase
          .from('tasks')
          .update({ 
            status: 'error',
            updated_at: new Date().toISOString()
          })
          .eq('id', taskId)
        console.log('Task marked as "error"')
      } catch (e: any) {
        console.error('Failed to update task status:', e.message)
      }
    }

    return NextResponse.json(
      { 
        error: error.message || 'Evaluation failed',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  console.log('/api/evaluate GET called - Testing endpoint')
  return NextResponse.json({
    status: 'API is running',
    timestamp: new Date().toISOString(),
    supabase: supabaseUrl ? 'Configured' : 'Missing URL',
    groq: process.env.GROQ_API_KEY ? 'Configured' : 'Missing API Key'
  })
}