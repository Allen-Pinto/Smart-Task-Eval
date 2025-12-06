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
    // Mock implementation
    return { orderId: `order_${Date.now()}`, amount }
  },

  async verifyPayment(paymentData: any) {
    // Mock implementation
    return { success: true, paymentId: paymentData.paymentId }
  }
}