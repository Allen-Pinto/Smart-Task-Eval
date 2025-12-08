export const apiClient = {
  async triggerEvaluation(taskId: string) {
    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Evaluation failed')
      }

      return await response.json()
    } catch (error) {
      console.error('Error triggering evaluation:', error)
      throw error
    }
  },

  async createPaymentOrder(taskId: string, amount: number) {
    try {
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId, amount }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create payment order')
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating payment order:', error)
      throw error
    }
  },

  async verifyPayment(paymentData: any) {
    try {
      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Payment verification failed')
      }

      return await response.json()
    } catch (error) {
      console.error('Error verifying payment:', error)
      throw error
    }
  }
}