'use client'

import { ScoreDisplay } from './ScoreDisplay'
import { LockedContent } from './LockedContent'
import { Evaluation } from '../../types'
import { CheckCircle, TrendingUp, AlertCircle } from 'lucide-react'

interface EvaluationReportProps {
  evaluation: Evaluation | null
  taskId: string
}

export function EvaluationReport({ evaluation, taskId }: EvaluationReportProps) {
  if (!evaluation) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400">Evaluation not found</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Evaluation Results</h1>
        <p className="text-gray-400">Task ID: {taskId}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <ScoreDisplay score={evaluation.score} />
        
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-400" />
              Summary
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {evaluation.summary || 'No summary available'}
            </p>
          </div>

          {evaluation.is_unlocked ? (
            <>
              <div className="glass-panel rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                  Strengths
                </h3>
                <ul className="space-y-3">
                  {evaluation.strengths?.map((strength, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-300">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-panel rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-yellow-400" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-3">
                  {evaluation.improvements?.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-300">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <LockedContent taskId={taskId} />
          )}
        </div>
      </div>
    </div>
  )
}