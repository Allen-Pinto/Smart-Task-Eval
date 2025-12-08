import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const { taskId, amount = 10 } = await request.json()
    
    console.log('🔐 Payment API - Creating order for task:', taskId)
    
    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    // 1. Get Razorpay credentials
    const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET
    
    console.log('🔐 Razorpay Key ID:', RAZORPAY_KEY_ID ? 'Set' : 'Missing')
    
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error(' Razorpay credentials missing!')
      return NextResponse.json(
        { 
          error: 'Payment gateway not configured',
          details: 'RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing'
        },
        { status: 500 }
      )
    }

    // 2. Verify task exists
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*, user_id')
      .eq('id', taskId)
      .single()

    if (taskError || !task) {
      console.error(' Task not found:', taskError)
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    console.log('Task found:', task.title)

    // 3. Create Razorpay order with SHORT receipt
    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')
    
    // FIX: Create a short receipt (max 40 characters)
    const shortTaskId = taskId.substring(0, 8) // Use first 8 chars
    const timestamp = Date.now().toString().slice(-6) // Last 6 digits
    const receipt = `rcpt_${shortTaskId}_${timestamp}` // Should be < 40 chars
    
    console.log('📝 Using receipt:', receipt, 'Length:', receipt.length)
    
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to paise (₹10 = 1000)
        currency: 'INR',
        receipt: receipt, // Fixed: Short receipt
        notes: {
          taskId: taskId, // Full taskId in notes (unlimited length)
          userId: task.user_id,
          taskTitle: task.title.substring(0, 50) // Limit title length
        }
      })
    })

    const orderData = await razorpayResponse.json()
    
    console.log('📋 Razorpay response status:', razorpayResponse.status)
    console.log('📋 Razorpay response:', orderData)

    if (!razorpayResponse.ok) {
      console.error(' Razorpay API error:', orderData)
      return NextResponse.json(
        { 
          error: orderData.error?.description || 'Failed to create payment order',
          razorpayError: orderData.error
        },
        { status: razorpayResponse.status }
      )
    }

    console.log('  Razorpay order created:', orderData.id)

    // 4. Save payment to database
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: task.user_id,
        task_id: taskId,
        amount: amount * 100, // Store in paise
        currency: 'INR',
        status: 'created',
        razorpay_order_id: orderData.id,
        receipt_id: receipt, // Store the receipt ID too
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (paymentError) {
      console.error(' Error saving payment:', paymentError)
      throw paymentError
    }

    console.log('  Payment saved to database')

    return NextResponse.json({
      success: true,
      orderId: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID // Send public key for frontend
    })

  } catch (error: any) {
    console.error(' Payment creation error:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create payment order',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}