import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { supabaseAdmin } from '../shared/supabase';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateCheckoutRequest {
  userId: string;
  taskId: string;
  amount: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, taskId, amount = 999 }: CreateCheckoutRequest = await req.json();
    
    if (!userId || !taskId) {
      return new Response(
        JSON.stringify({ error: 'Missing userId or taskId' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { data: task, error: taskError } = await supabaseAdmin
      .from('tasks')
      .select('id, status')
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

    const { data: evaluation } = await supabaseAdmin
      .from('evaluations')
      .select('is_unlocked')
      .eq('task_id', taskId)
      .single();

    if (evaluation?.is_unlocked) {
      return new Response(
        JSON.stringify({ error: 'Evaluation is already unlocked' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const orderId = `order_${taskId}_${Date.now()}`;
    
    const { error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        user_id: userId,
        task_id: taskId,
        razorpay_order_id: orderId,
        amount,
        currency: 'INR',
        status: 'created',
        plan_type: 'evaluation_unlock',
        notes: { task_id: taskId }
      });

    if (paymentError) {
      throw paymentError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderId,
        amount,
        currency: 'INR',
        key: Deno.env.get('NEXT_PUBLIC_RAZORPAY_KEY_ID'),
        name: 'SmartTaskEval',
        description: 'Unlock Full Evaluation Report',
        notes: {
          taskId,
          userId,
        },
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Create checkout error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create checkout',
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});