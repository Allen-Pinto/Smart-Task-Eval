'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import { Loader } from '@/components/shared/Loader'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Get the session from URL hash
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Auth error:', error)
        router.push('/auth/login')
        return
      }
      
      if (session) {
        router.push('/dashboard')
      } else {
        router.push('/auth/login')
      }
    }
    
    handleAuthCallback()
  }, [router])

  return <Loader />
}