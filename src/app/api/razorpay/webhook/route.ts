import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase-server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  let event;
  
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature') || '';
    
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');
    
    if (expectedSignature !== signature) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }
    
    event = JSON.parse(body);
    
    const supabase = createClient();
    
    switch (event.event) {
      case 'payment.captured': {
        const payment = event.payload.payment.entity;
        const orderId = payment.order_id;
        
        // Update payment record
        const { error: paymentError } = await supabase
          .from('payments')
          .update({
            razorpay_payment_id: payment.id,
            razorpay_signature: signature,
            status: 'paid',
            updated_at: new Date().toISOString()
          })
          .eq('razorpay_order_id', orderId);
        
        if (paymentError) {
          console.error('Failed to update payment:', paymentError);
          throw paymentError;
        }
        
        // Get payment details to get taskId
        const { data: paymentRecord } = await supabase
          .from('payments')
          .select('task_id, user_id')
          .eq('razorpay_order_id', orderId)
          .single();
        
        if (paymentRecord?.task_id) {
          // Unlock the evaluation
          const { error: evalError } = await supabase
            .from('evaluations')
            .update({
              is_unlocked: true,
              updated_at: new Date().toISOString()
            })
            .eq('task_id', paymentRecord.task_id);
          
          if (evalError) {
            console.error('Failed to unlock evaluation:', evalError);
          }
          
          // Update task status
          const { error: taskError } = await supabase
            .from('tasks')
            .update({
              status: 'evaluated',
              updated_at: new Date().toISOString()
            })
            .eq('id', paymentRecord.task_id);
          
          if (taskError) {
            console.error('Failed to update task:', taskError);
          }
          
          // Update user to premium
          if (paymentRecord.user_id) {
            const { error: userError } = await supabase
              .from('users')
              .update({
                is_premium: true,
                updated_at: new Date().toISOString()
              })
              .eq('id', paymentRecord.user_id);
            
            if (userError) {
              console.error('Failed to update user:', userError);
            }
          }
        }
        
        break;
      }
      
      case 'payment.failed': {
        const payment = event.payload.payment.entity;
        const orderId = payment.order_id;
        
        await supabase
          .from('payments')
          .update({
            razorpay_payment_id: payment.id,
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('razorpay_order_id', orderId);
        
        break;
      }
      
      case 'order.paid': {
        const order = event.payload.order.entity;
        
        await supabase
          .from('payments')
          .update({
            status: 'paid',
            updated_at: new Date().toISOString()
          })
          .eq('razorpay_order_id', order.id);
        
        break;
      }

      case 'payment.refunded': {
        const payment = event.payload.payment.entity;
        const orderId = payment.order_id;
        
        await supabase
          .from('payments')
          .update({
            status: 'refunded',
            updated_at: new Date().toISOString()
          })
          .eq('razorpay_order_id', orderId);
        
        break;
      }
    }
    
    return NextResponse.json({ 
      received: true,
      event: event.event,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { 
        error: 'Webhook handler failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export const runtime = 'nodejs';