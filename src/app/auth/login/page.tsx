'use client'

import { AuthLayout } from '@/components/auth/AuthLayout'
import { LoginForm } from '@/components/auth/LoginForm'
import { OAuthButtons } from '@/components/auth/OAuthButtons'

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue evaluating"
    >
      <OAuthButtons />
      
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 text-gray-400">Or continue with email</span>
        </div>
      </div>

      <LoginForm />
    </AuthLayout>
  )
}