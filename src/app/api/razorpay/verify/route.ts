import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentSignature } from '../../../lib/razorpay-server';
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

    const { orderId, paymentId, signature } = await request.json();
    
    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: 'Missing payment verification data' },
        { status: 400 }
      );
    }

    // Verify signature
    const isValid = verifyPaymentSignature(orderId, paymentId, signature);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Update payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .update({
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('razorpay_order_id', orderId)
      .eq('user_id', user.id)
      .select('task_id')
      .single();

    if (paymentError || !payment) {
      console.error('Payment update failed:', paymentError);
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 500 }
      );
    }

    // Unlock the evaluation
    if (payment.task_id) {
      const { error: evalError } = await supabase
        .from('evaluations')
        .update({
          is_unlocked: true,
          updated_at: new Date().toISOString()
        })
        .eq('task_id', payment.task_id);

      if (evalError) {
        console.error('Failed to unlock evaluation:', evalError);
      }

      // Update task status
      await supabase
        .from('tasks')
        .update({
          status: 'evaluated',
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.task_id);

      // Update user to premium
      await supabase
        .from('users')
        .update({
          is_premium: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and evaluation unlocked',
      taskId: payment.task_id,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Payment verification failed',
        code: error.code || 'VERIFICATION_ERROR'
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';