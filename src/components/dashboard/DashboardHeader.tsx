'use client'

import { Upload } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export function DashboardHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-400">Manage your code evaluations</p>
      </div>
      
      <Link href="/submit">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-lg shadow-purple-500/30"
        >
          <Upload className="w-5 h-5" />
          Submit New Task
        </motion.button>
      </Link>
    </div>
  )
}