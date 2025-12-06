import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const { orderId, paymentId, signature, taskId } = await request.json()
    
    if (!orderId || !paymentId || !signature || !taskId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Verify payment signature
    const body = orderId + '|' + paymentId
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex')
    
    const isValid = expectedSignature === signature
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      )
    }

    // Update payment status
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'paid',
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        updated_at: new Date().toISOString()
      })
      .eq('razorpay_order_id', orderId)

    if (paymentError) {
      console.error('Error updating payment:', paymentError)
      throw paymentError
    }

    // Unlock the evaluation
    const { error: evaluationError } = await supabase
      .from('evaluations')
      .update({
        is_unlocked: true,
        updated_at: new Date().toISOString()
      })
      .eq('task_id', taskId)

    if (evaluationError) {
      console.error('Error unlocking evaluation:', evaluationError)
      throw evaluationError
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and evaluation unlocked'
    })

  } catch (error: any) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Payment verification failed' },
      { status: 500 }
    )
  }
}