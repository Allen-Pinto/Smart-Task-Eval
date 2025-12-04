import { supabase } from './supabase-client'

class APIClient {
  private async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession()
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`,
    }
  }

  async triggerEvaluation(taskId: string) {
    const headers = await this.getAuthHeaders()
    const response = await fetch('/api/evaluate', {
      method: 'POST',
      headers,
      body: JSON.stringify({ taskId }),
    })
    return response.json()
  }

  async createPaymentOrder(taskId: string, amount: number) {
    const headers = await this.getAuthHeaders()
    const response = await fetch('/api/razorpay/order', {
      method: 'POST',
      headers,
      body: JSON.stringify({ taskId, amount }),
    })
    return response.json()
  }

  async verifyPayment(paymentData: {
    orderId: string
    paymentId: string
    signature: string
  }) {
    const headers = await this.getAuthHeaders()
    const response = await fetch('/api/razorpay/verify', {
      method: 'POST',
      headers,
      body: JSON.stringify(paymentData),
    })
    return response.json()
  }
}

export const apiClient = new APIClient()