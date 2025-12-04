import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { callGroqAPI } from '../shared/groq';
import { supabaseAdmin } from '../shared/supabase';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TaskData {
  id: string;
  title: string;
  description: string;
  code_text: string;
  language: string;
}

interface EvaluationRequest {
  taskId: string;
  userId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { taskId, userId }: EvaluationRequest = await req.json();
    
    if (!taskId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing taskId or userId' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY not configured');
    }

    const { data: task, error: taskError } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single();

    if (taskError || !task) {
      return new Response(
        JSON.stringify({ error: 'Task not found or unauthorized' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (task.status === 'evaluated') {
      return new Response(
        JSON.stringify({ error: 'Task already evaluated' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    await supabaseAdmin
      .from('tasks')
      .update({ status: 'processing' })
      .eq('id', taskId);

    const prompt = createEvaluationPrompt(task);
    
    const evaluation = await callGroqAPI(
      prompt,
      groqApiKey,
      Deno.env.get('GROQ_MODEL_NAME') || 'llama3-70b-8192'
    );

    const isUnlocked = await checkUserCredits(userId);
    
    const evaluationData = {
      task_id: taskId,
      score: evaluation.score,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
      summary: evaluation.summary,
      is_unlocked: isUnlocked,
      full_report: isUnlocked ? createFullReport(evaluation) : null,
    };

    const { error: evalError } = await supabaseAdmin
      .from('evaluations')
      .upsert(evaluationData, { 
        onConflict: 'task_id',
        ignoreDuplicates: false 
      });

    if (evalError) {
      throw evalError;
    }

    const taskStatus = isUnlocked ? 'evaluated' : 'locked';
    
    await supabaseAdmin
      .from('tasks')
      .update({ 
        status: taskStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId);

    if (!isUnlocked) {
      await createPaymentRecord(userId, taskId);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        taskId, 
        status: taskStatus,
        evaluation: isUnlocked ? evaluationData : { summary: evaluation.summary }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Evaluation error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Evaluation failed',
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function createEvaluationPrompt(task: TaskData): string {
  return `You are evaluating a coding task.  
You must output your response in the following JSON format ONLY:

{
  "score": number (0-10 based on clarity, correctness, and completeness),
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "summary": "Short paragraph summarizing quality."
}

Evaluation Criteria:
1. Understanding of the task requirements
2. Code correctness and logic flow
3. Code quality (cleanliness, readability)
4. Edge-case handling
5. Performance considerations
6. Scalability and maintainability
7. Overall problem-solving clarity

Task Details:
Title: ${task.title}
Description: ${task.description}
Language: ${task.language}

Code to evaluate:
\`\`\`${task.language}
${task.code_text}
\`\`\`

Provide your evaluation:`;
}

async function checkUserCredits(userId: string): Promise<boolean> {
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('credits, is_premium')
    .eq('id', userId)
    .single();

  if (!user) return false;
  
  if (user.is_premium) return true;
  
  if (user.credits > 0) {
    await supabaseAdmin
      .from('users')
      .update({ credits: user.credits - 1 })
      .eq('id', userId);
    return true;
  }
  
  return false;
}

async function createPaymentRecord(userId: string, taskId: string) {
  await supabaseAdmin
    .from('payments')
    .insert({
      user_id: userId,
      task_id: taskId,
      amount: 999,
      currency: 'INR',
      status: 'created',
      plan_type: 'evaluation_unlock',
      notes: { task_id: taskId }
    });
}

function createFullReport(evaluation: any): string {
  return `
# Coding Task Evaluation Report

## Overall Score: ${evaluation.score}/10

## Summary
${evaluation.summary}

## Strengths
${evaluation.strengths.map((s: string) => `• ${s}`).join('\n')}

## Areas for Improvement
${evaluation.improvements.map((i: string) => `• ${i}`).join('\n')}

## Detailed Analysis
**Clarity & Understanding**: ${evaluation.score >= 8 ? 'Excellent' : evaluation.score >= 6 ? 'Good' : 'Needs improvement'}
**Code Quality**: ${evaluation.score >= 8 ? 'High' : evaluation.score >= 6 ? 'Acceptable' : 'Needs refactoring'}
**Robustness**: ${evaluation.score >= 7 ? 'Handles edge cases well' : 'Could improve edge case handling'}
`;
}