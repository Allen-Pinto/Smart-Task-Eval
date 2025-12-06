'use client'

import { useState } from 'react'

interface PaymentButtonProps {
  taskId: string
  amount?: number
  onSuccess?: () => void
  onError?: (error: string) => void
}

export default function PaymentButton({ 
  taskId, 
  amount = 10, 
  onSuccess, 
  onError 
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    setLoading(true)
    
    try {
      // Step 1: Create order on server
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId, amount })
      })

      const orderData = await orderResponse.json()
      
      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create order')
      }

      // Step 2: Load Razorpay script dynamically
      if (typeof window === 'undefined') {
        throw new Error('Window is not available')
      }

      // Check if Razorpay is already loaded
      if (!(window as any).Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.async = true
          
          script.onload = () => {
            if ((window as any).Razorpay) {
              resolve(true)
            } else {
              reject(new Error('Razorpay failed to load'))
            }
          }
          
          script.onerror = () => reject(new Error('Failed to load Razorpay script'))
          
          document.body.appendChild(script)
        })
      }

      // Step 3: Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Code Evaluator Pro",
        description: "Unlock detailed AI evaluation",
        order_id: orderData.orderId,
        handler: async function(response: any) {
          try {
            // Step 4: Verify payment on server
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                taskId: taskId
              })
            })

            const verifyData = await verifyResponse.json()
            
            if (verifyResponse.ok && verifyData.success) {
              onSuccess?.()
            } else {
              onError?.(verifyData.error || 'Payment verification failed')
            }
          } catch (error: any) {
            console.error('Payment verification error:', error)
            onError?.(error.message || 'Payment verification failed')
          } finally {
            setLoading(false)
          }
        },
        prefill: {
          name: "Test User",
          email: "test@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#8B5CF6"
        },
        modal: {
          ondismiss: function() {
            setLoading(false)
          }
        }
      }

      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()

    } catch (error: any) {
      console.error('Payment error:', error)
      onError?.(error.message || 'Payment failed')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
    >
      {loading ? 'Processing...' : `Pay ₹${amount} to Unlock`}
    </button>
  )
}