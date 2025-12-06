'use client'

import { useParams } from 'next/navigation'
import { useTask } from '@/hooks/useTasks'
import { Loader } from '@/components/shared/Loader'
import { ArrowLeft, RefreshCw, AlertCircle, CheckCircle, Lock, Eye } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import PaymentButton from '@/components/payment/PaymentButton'

export default function ResultsPage() {
  const params = useParams()
  const taskId = params.id as string
  const { task, loading: taskLoading, refetch: refetchTask } = useTask(taskId)
  const [manualRefreshCount, setManualRefreshCount] = useState(0)
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false)
  const [showDetailedReview, setShowDetailedReview] = useState(false)

  // Debug logging
  useEffect(() => {
    console.log('Results Page State:')
    console.log('Task ID:', taskId)
    console.log('Task:', task)
    console.log('Task loading:', taskLoading)
    if (task) {
      console.log('Task status:', task.status)
      console.log('Task evaluation:', task.evaluation)
      console.log('Evaluation unlocked:', task.evaluation?.is_unlocked)
    }
  }, [taskId, task, taskLoading])

  // Auto-refresh if task is processing
  useEffect(() => {
    if (task?.status === 'processing' || task?.status === 'pending') {
      const interval = setInterval(() => {
        console.log('Auto-refreshing task data...')
        refetchTask()
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [task?.status, refetchTask])

  const handleManualRefresh = () => {
    console.log('Manual refresh triggered')
    setManualRefreshCount(prev => prev + 1)
    refetchTask()
  }

  const handlePaymentSuccess = () => {
    setShowPaymentSuccess(true)
    setShowDetailedReview(true) // Automatically show details after payment
    refetchTask()
  }

  const handleViewDetailsClick = () => {
    if (task?.evaluation?.is_unlocked) {
      setShowDetailedReview(true)
    }
    // If not unlocked, PaymentButton will handle it
  }

  if (taskLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Loader />
        <p className="mt-4 text-center text-gray-400">Loading task details...</p>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="glass-panel rounded-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Task Not Found</h1>
          <p className="text-gray-400 mb-6">
            The task you're looking for doesn't exist or has been deleted.
          </p>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold inline-block"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Show processing state
  if (task.status === 'processing' || task.status === 'pending') {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <button
            onClick={handleManualRefresh}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="glass-panel rounded-xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <RefreshCw className="w-16 h-16 text-purple-500 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold mb-4">AI Evaluation in Progress</h1>
          <p className="text-gray-400 mb-4">
            Our AI is analyzing your code. This usually takes 10-30 seconds.
          </p>
          <div className="space-y-2 text-sm text-gray-500 mb-6">
            <p>Task: {task.title}</p>
            <p>Language: {task.language}</p>
            <p>Status: {task.status}</p>
            <p>Last checked: {new Date().toLocaleTimeString()}</p>
          </div>
          <button
            onClick={handleManualRefresh}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold"
          >
            Check Now
          </button>
        </div>
      </div>
    )
  }

  // Show error state
  if (task.status === 'error') {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="glass-panel rounded-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4 text-red-400">Evaluation Failed</h1>
          <p className="text-gray-400 mb-4">
            Sorry, we encountered an error while evaluating your code.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Task: {task.title}<br/>
            Error occurred at: {new Date(task.updated_at || task.created_at).toLocaleString()}
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/dashboard/submit"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold"
            >
              Try Again
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Show evaluation results (task.status === 'evaluated')
  const evaluation = task.evaluation
  const isEvaluationUnlocked = evaluation?.is_unlocked

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <button
          onClick={handleManualRefresh}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {showPaymentSuccess && (
        <div className="mb-6 glass-panel rounded-xl p-4 border border-green-500/30 bg-green-500/10">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <div>
              <h3 className="font-semibold text-green-400">Payment Successful!</h3>
              <p className="text-sm text-gray-400">Your detailed evaluation has been unlocked.</p>
            </div>
          </div>
        </div>
      )}

      {evaluation ? (
        <div className="glass-panel rounded-xl p-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <h1 className="text-3xl font-bold">Evaluation Complete</h1>
            </div>
            <p className="text-gray-400">Task: {task.title}</p>
            <p className="text-gray-400">Language: {task.language}</p>
          </div>

          {/* Score - Always visible */}
          <div className="mb-8">
            <div className="text-center">
              <div className="text-6xl font-bold text-white mb-2">
                {evaluation.score}/10
              </div>
              <div className="text-gray-400">Overall Score</div>
            </div>
          </div>

          {/* View Details Button or Payment Gate */}
          {!showDetailedReview ? (
            <div className="mb-8 text-center">
              <button
                onClick={handleViewDetailsClick}
                className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold text-lg transition-colors"
              >
                <Eye className="w-5 h-5" />
                View Detailed AI Review
              </button>
              <p className="mt-3 text-gray-500 text-sm">
                See strengths, improvements, and comprehensive feedback
              </p>
            </div>
          ) : !isEvaluationUnlocked ? (
            <div className="mb-8 glass-panel border border-purple-500/30 rounded-xl p-8 text-center">
              <div className="flex justify-center mb-6">
                <Lock className="w-16 h-16 text-purple-500" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Unlock Detailed Review</h2>
              <p className="text-gray-400 mb-6">
                Get comprehensive AI analysis including:
              </p>
              <ul className="text-left max-w-md mx-auto mb-8 space-y-3 text-gray-300">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Detailed code analysis</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Strengths and weaknesses</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Improvement suggestions</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Comprehensive summary</span>
                </li>
              </ul>
              <div className="space-y-4">
                <PaymentButton 
                  taskId={taskId} 
                  amount={10}
                  onSuccess={handlePaymentSuccess}
                  onError={(error) => alert(`Payment error: ${error}`)}
                />
                <p className="text-sm text-gray-500">
                  Secure payment via Razorpay • Test mode (no real money charged)
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Summary - Only visible after payment */}
              {evaluation.summary && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-3">Summary</h2>
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <p className="text-gray-300">{evaluation.summary}</p>
                  </div>
                </div>
              )}

              {/* Strengths - Only visible after payment */}
              {evaluation.strengths && evaluation.strengths.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-3">Strengths</h2>
                  <ul className="space-y-3">
                    {evaluation.strengths.map((strength: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-green-500 text-sm">✓</span>
                        </div>
                        <span className="text-gray-300">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements - Only visible after payment */}
              {evaluation.improvements && evaluation.improvements.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-3">Areas for Improvement</h2>
                  <ul className="space-y-3">
                    {evaluation.improvements.map((improvement: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-yellow-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-yellow-500 text-sm">→</span>
                        </div>
                        <span className="text-gray-300">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {/* Original Code Preview */}
          <div className="mt-12 pt-8 border-t border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Your Code</h2>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-gray-300 text-sm whitespace-pre-wrap">
                {task.code_text}
              </pre>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Evaluation Details Not Available</h1>
          <p className="text-gray-400 mb-4">
            The task was marked as evaluated, but the detailed evaluation data could not be loaded.
          </p>
          <div className="space-y-2 text-sm text-gray-500 mb-6">
            <p>Task: {task.title}</p>
            <p>Status: {task.status}</p>
            <p>Task ID: {task.id}</p>
            <p>Last updated: {new Date(task.updated_at || task.created_at).toLocaleString()}</p>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleManualRefresh}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold"
            >
              Refresh Data
            </button>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}