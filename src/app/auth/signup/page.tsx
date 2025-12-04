'use client'

import { AuthLayout } from '@/components/auth/AuthLayout'
import { SignupForm } from '@/components/auth/SignupForm'
import { OAuthButtons } from '@/components/auth/OAuthButtons'

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create Account"
      subtitle="Start evaluating your code with AI"
    >
      <OAuthButtons />
      
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-900 text-gray-400">Or sign up with email</span>
        </div>
      </div>

      <SignupForm />
    </AuthLayout>
  )
}