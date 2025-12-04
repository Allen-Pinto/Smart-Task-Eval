'use client'

import { Lock, CreditCard } from 'lucide-react'
import { RazorpayCheckout } from '../../components/payment/RazorpayCheckout'

interface LockedContentProps {
  taskId: string
}

export function LockedContent({ taskId }: LockedContentProps) {
  return (
    <div className="glass-panel rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Lock className="w-6 h-6 text-purple-400" />
          Detailed Report
        </h3>
        <div className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
          Locked
        </div>
      </div>
      
      <p className="text-gray-400 mb-6">
        Unlock the full detailed report with comprehensive strengths, improvements, and actionable insights to improve your code.
      </p>
      
      <RazorpayCheckout taskId={taskId} />
    </div>
  )
}