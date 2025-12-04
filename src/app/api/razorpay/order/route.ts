import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrder } from '../../../lib/razorpay-server';
import { createClient } from '../../../lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { taskId, amount = 999 } = await request.json();
    
    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Check if task exists and belongs to user
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id, status')
      .eq('id', taskId)
      .eq('user_id', user.id)
      .single();

    if (taskError || !task) {
      return NextResponse.json(
        { error: 'Task not found or unauthorized' },
        { status: 404 }
      );
    }

    // Check if task is locked
    const { data: evaluation } = await supabase
      .from('evaluations')
      .select('is_unlocked')
      .eq('task_id', taskId)
      .single();

    if (evaluation?.is_unlocked) {
      return NextResponse.json(
        { error: 'Evaluation is already unlocked' },
        { status: 400 }
      );
    }

    // Check for existing pending payment
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id, razorpay_order_id')
      .eq('task_id', taskId)
      .eq('status', 'created')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingPayment?.razorpay_order_id) {
      return NextResponse.json(
        { error: 'Payment already initiated for this task', orderId: existingPayment.razorpay_order_id },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const order = await createRazorpayOrder({
      amount,
      currency: 'INR',
      receipt: `task_${taskId}_${Date.now()}`,
      userId: user.id,
      taskId,
    });

    // Save payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        task_id: taskId,
        razorpay_order_id: order.id,
        amount,
        currency: 'INR',
        status: 'created',
        plan_type: 'evaluation_unlock',
        notes: { 
          task_id: taskId,
          amount_paise: amount * 100
        }
      });

    if (paymentError) {
      console.error('Failed to save payment record:', paymentError);
      throw paymentError;
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      name: 'SmartTaskEval',
      description: 'Unlock Full Evaluation Report',
      prefill: {
        name: user.user_metadata?.full_name || '',
        email: user.email || '',
      },
      notes: {
        taskId,
        userId: user.id,
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create order',
        code: error.code || 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';