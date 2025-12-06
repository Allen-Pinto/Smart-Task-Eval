'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Zap, LogOut, Menu, X, User, FileText, Upload, Home } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'
import { useAuth } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'

export function Navigation() {
  const router = useRouter()
  const { user } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/submit', label: 'Submit Task', icon: Upload },
    { href: '/dashboard/reports', label: 'Reports', icon: FileText },
  ]

  return (
    <nav className="bg-gray-800/50 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center py-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold hidden sm:block">SmartTaskEval</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">{user?.email}</span>
            </div>
            
            <button
              onClick={handleSignOut}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-white/10 rounded-lg"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden pb-4 space-y-2 overflow-hidden"
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 rounded-lg transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
              
              <div className="px-4 py-2 border-t border-white/10 pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">{user?.email}</span>
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg transition-all flex items-center gap-2 text-red-400 hover:text-red-300"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}