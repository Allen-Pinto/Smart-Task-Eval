import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const { taskId, amount = 10 } = await request.json()
    
    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    // Verify task exists
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single()

    if (taskError || !task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Create order directly without external package
    const orderResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')}`
      },
      body: JSON.stringify({
        amount: amount * 100,
        currency: 'INR',
        receipt: `task_${taskId}`,
        notes: {
          taskId: taskId,
        }
      })
    })

    const order = await orderResponse.json()

    if (!orderResponse.ok) {
      throw new Error(order.error?.description || 'Failed to create order')
    }

    // Save order to database
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: task.user_id,
        task_id: taskId,
        amount: amount,
        status: 'created',
        razorpay_order_id: order.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (paymentError) {
      console.error('Error saving payment:', paymentError)
      throw paymentError
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    })

  } catch (error: any) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment order' },
      { status: 500 }
    )
  }
}