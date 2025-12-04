'use client'

import { apiClient } from '../lib/api-client'

export function usePayment() {
  const createOrder = async (taskId: string, amount: number) => {
    const response = await apiClient.createPaymentOrder(taskId, amount)
    return response
  }

  const verifyPayment = async (paymentData: {
    orderId: string
    paymentId: string
    signature: string
  }) => {
    const response = await apiClient.verifyPayment(paymentData)
    return response
  }

  return { createOrder, verifyPayment }
}