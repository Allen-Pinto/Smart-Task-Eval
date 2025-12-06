'use client'

import { apiClient } from '@/lib/api-client' 

interface PaymentData {
  orderId: string
  paymentId: string
  signature: string
}

export function usePayment() {
  const createOrder = async (taskId: string, amount: number) => {
    const response = await apiClient.createPaymentOrder(taskId, amount)
    return response
  }

  const verifyPayment = async (paymentData: PaymentData) => {
    const response = await apiClient.verifyPayment(paymentData)
    return response
  }

  return { createOrder, verifyPayment }
}