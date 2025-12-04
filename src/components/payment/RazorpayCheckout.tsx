'use client'

import { useState } from 'react'
import { CreditCard } from 'lucide-react'
import { usePayment } from '../../hooks/usePayment'

interface RazorpayCheckoutProps {
  taskId: string
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export function RazorpayCheckout({ taskId }: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false)
  const { createOrder, verifyPayment } = usePayment()

  const handlePayment = async () => {
    setLoading(true)
    try {
      const orderData = await createOrder(taskId, 999)

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      document.body.appendChild(script)

      script.onload = () => {
        const options = {
          key: orderData.key,
          amount: orderData.amount,
          currency: orderData.currency,
          name: orderData.name,
          description: orderData.description,
          order_id: orderData.orderId,
          handler: async (response: any) => {
            try {
              await verifyPayment({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              })
              window.location.reload()
            } catch (error) {
              console.error('Payment verification failed:', error)
            }
          },
          prefill: orderData.prefill,
          notes: orderData.notes,
          theme: {
            color: '#9333ea',
          },
        }

        const razorpay = new window.Razorpay(options)
        razorpay.open()
        setLoading(false)
      }
    } catch (error) {
      console.error('Payment initiation failed:', error)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
    >
      <CreditCard className="w-5 h-5" />
      {loading ? 'Processing...' : 'Unlock Full Report - ₹999'}
    </button>
  )
}