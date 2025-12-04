import Razorpay from 'razorpay';
import crypto from 'crypto';

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error('Razorpay credentials are not set');
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export interface CreateOrderParams {
  amount: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
  userId: string;
  taskId: string;
}

export async function createRazorpayOrder(params: CreateOrderParams) {
  const { amount, currency = 'INR', receipt, notes = {}, userId, taskId } = params;
  
  const order = await razorpay.orders.create({
    amount: amount * 100,
    currency,
    receipt,
    notes: {
      ...notes,
      userId,
      taskId,
      purpose: 'evaluation_unlock'
    },
  });

  return order;
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body.toString())
    .digest('hex');

  return expectedSignature === signature;
}