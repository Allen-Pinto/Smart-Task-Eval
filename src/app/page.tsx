'use client'

import { motion } from 'framer-motion'
import { Code, Zap, TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDEyNywgMTI3LCAyNTUsIDAuMSkiLz48L2c+PC9zdmc+')] opacity-20"></div>
      
      <nav className="relative z-10 flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold">SmartTaskEval</span>
        </div>
        <Link href="/auth/login">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all"
          >
            Get Started
          </motion.button>
        </Link>
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="inline-block mb-6 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300">
            AI-Powered Code Evaluation
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Evaluate Smarter.<br />Build Better.
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Get instant AI-powered feedback on your code with detailed scores, strengths, and improvements using Llama 3.1 70B
          </p>
          
          <Link href="/auth/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-lg font-semibold inline-flex items-center gap-2 shadow-lg shadow-purple-500/50"
            >
              Start Evaluating Now
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20"
        >
          <motion.div
            whileHover={{ y: -5 }}
            className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-lg border border-purple-500/30 rounded-xl"
          >
            <Code className="w-12 h-12 text-purple-400 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Smart Analysis</h3>
            <p className="text-gray-400">AI evaluates code quality and logic</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="p-6 bg-gradient-to-br from-pink-500/20 to-pink-600/20 backdrop-blur-lg border border-pink-500/30 rounded-xl"
          >
            <TrendingUp className="w-12 h-12 text-pink-400 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Detailed Scores</h3>
            <p className="text-gray-400">Get scores 0-10 with feedback</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg border border-purple-500/30 rounded-xl"
          >
            <Zap className="w-12 h-12 text-purple-400 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Instant Results</h3>
            <p className="text-gray-400">Receive reports in seconds</p>
          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}