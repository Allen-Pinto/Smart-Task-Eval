'use client'

import { motion } from 'framer-motion'

interface ScoreDisplayProps {
  score: number | null
}

export function ScoreDisplay({ score }: ScoreDisplayProps) {
  const displayScore = score || 0
  const percentage = (displayScore / 10) * 100

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-8 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="text-6xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
      >
        {displayScore.toFixed(1)}
      </motion.div>
      <div className="text-gray-400 mb-4">Overall Score</div>
      <div className="w-full bg-white/10 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
        />
      </div>
    </motion.div>
  )
}