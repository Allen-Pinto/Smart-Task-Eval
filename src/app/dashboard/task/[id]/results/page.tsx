// app/dashboard/task/[id]/results/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { useTask } from '@/hooks/useTasks'
import { Loader } from '@/components/shared/Loader'
import { ArrowLeft, RefreshCw, AlertCircle, CheckCircle, Lock, Eye, Sparkles, Bug } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import PaymentButton from '@/components/payment/PaymentButton'
import { supabase } from '@/lib/supabase-client'

export default function ResultsPage() {
  const params = useParams()
  const taskId = params.id as string
  const { task, loading: taskLoading, refetch: refetchTask } = useTask(taskId)
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false)
  const [showDetailedReview, setShowDetailedReview] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [manualEvaluation, setManualEvaluation] = useState<any>(null)

  // Debug function
  const runDebug = useCallback(async () => {
    console.log('\n=== RUNNING DEBUG ===')
    
    try {
      // 1. Check task
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single()
      
      // 2. Check evaluations
      const { data: evaluations, error: evalError } = await supabase
        .from('evaluations')
        .select('*')
        .eq('task_id', taskId)
      
      // 3. Check payments
      const { data: payments, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('task_id', taskId)
      
      const info = {
        task: taskData,
        taskError: taskError?.message,
        evaluations,
        evalError: evalError?.message,
        payments,
        paymentError: paymentError?.message,
        hasEvaluation: !!evaluations?.[0],
        isUnlocked: evaluations?.[0]?.is_unlocked
      }
      
      setDebugInfo(info)
      console.log('Debug info:', info)
      
      // If we found an evaluation but component doesn't have it, set it manually
      if (evaluations?.[0] && !task?.evaluation) {
        console.log('Found evaluation in DB but not in component. Setting manually...')
        setManualEvaluation(evaluations[0])
      }
      
    } catch (error) {
      console.error('Debug error:', error)
    }
  }, [taskId, task?.evaluation])

  // Auto-run debug on load and when task changes
  useEffect(() => {
    if (taskId) {
      runDebug()
    }
  }, [taskId, runDebug])

  // Enhanced debug logging
  useEffect(() => {
    console.log('\n=== Results Page State ===')
    console.log('Task ID:', taskId)
    console.log('Task loading:', taskLoading)
    console.log('Task:', task)
    
    if (task) {
      console.log('Task status:', task.status)
      console.log('Has evaluation property:', 'evaluation' in task)
      console.log('Task evaluation:', task.evaluation)
      
      if (task.evaluation) {
        console.log('Evaluation score:', task.evaluation.score)
        console.log('Evaluation unlocked:', task.evaluation.is_unlocked)
        console.log('Evaluation type:', typeof task.evaluation)
        console.log('Evaluation keys:', Object.keys(task.evaluation))
      } else if (task.status === 'evaluated') {
        console.log('🚨 CRITICAL: Task is evaluated but evaluation is missing!')
        console.log('Full task object keys:', Object.keys(task))
        
        // Try to find evaluation in task object
        if (task.evaluation) {
          console.log('Found evaluations array:', task.evaluation)
        }
      }
    }
    console.log('========================\n')
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

  // Clear success message after 5 seconds
  useEffect(() => {
    if (showPaymentSuccess) {
      const timer = setTimeout(() => setShowPaymentSuccess(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [showPaymentSuccess])

  const handleRefresh = useCallback(() => {
    console.log('Manual refresh triggered')
    refetchTask()
    runDebug()
  }, [refetchTask, runDebug])

  const handlePaymentSuccess = useCallback((data?: any) => {
    console.log('✅ Payment successful callback:', data)
    setShowPaymentSuccess(true)
    setPaymentError(null)
    setShowDetailedReview(true) // Auto-show details after payment
    
    // Refresh after 1 second to get updated unlocked status
    setTimeout(() => {
      refetchTask()
      runDebug()
    }, 1000)
  }, [refetchTask, runDebug])

  const handlePaymentError = useCallback((error: string, errorData?: any) => {
    console.error('❌ Payment error callback:', error, errorData)
    setPaymentError(error)
    setTimeout(() => setPaymentError(null), 5000)
  }, [])

  const handleViewDetailsClick = useCallback(() => {
    // Use manual evaluation if component evaluation is missing
    const evaluationToUse = task?.evaluation || manualEvaluation
    const isUnlocked = evaluationToUse?.is_unlocked
    
    console.log('View details clicked. Is unlocked:', isUnlocked)
    console.log('Using evaluation:', evaluationToUse)
    
    if (isUnlocked) {
      setShowDetailedReview(true)
    } else {
      // If not unlocked, show payment UI
      setShowDetailedReview(true)
    }
  }, [task?.evaluation, manualEvaluation])

  // Fix evaluation data - use manual evaluation if component evaluation is missing
  const evaluation = task?.evaluation || manualEvaluation
  const isEvaluationUnlocked = evaluation?.is_unlocked === true

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
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="glass-panel rounded-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Task Not Found</h1>
          <p className="text-gray-400 mb-6">The task you're looking for doesn't exist or has been deleted.</p>
          <Link href="/dashboard" className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold inline-block">
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Processing state
  if (task.status === 'processing' || task.status === 'pending') {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <button onClick={handleRefresh} className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
        <div className="glass-panel rounded-xl p-8 text-center">
          <RefreshCw className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-4">AI Evaluation in Progress</h1>
          <p className="text-gray-400 mb-4">Our AI is analyzing your code. This usually takes 10-30 seconds.</p>
          <div className="space-y-2 text-sm text-gray-500 mb-6">
            <p>Task: {task.title}</p>
            <p>Language: {task.language}</p>
            <p>Status: {task.status}</p>
          </div>
          <button onClick={handleRefresh} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold">
            Check Now
          </button>
        </div>
      </div>
    )
  }

  // Error state
  if (task.status === 'error') {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="glass-panel rounded-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4 text-red-400">Evaluation Failed</h1>
          <p className="text-gray-400 mb-6">Sorry, we encountered an error while evaluating your code.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard/submit" className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold">
              Try Again
            </Link>
            <Link href="/dashboard" className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Evaluated state - MAIN CONTENT
  console.log('Rendering evaluated state. Evaluation:', evaluation, 'Unlocked:', isEvaluationUnlocked)

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <button onClick={handleRefresh} className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
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

      {paymentError && (
        <div className="mb-6 glass-panel rounded-xl p-4 border border-red-500/30 bg-red-500/10">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <div>
              <h3 className="font-semibold text-red-400">Payment Error</h3>
              <p className="text-sm text-gray-400">{paymentError}</p>
            </div>
          </div>
        </div>
      )}

      {evaluation ? (
        <div className="glass-panel rounded-xl p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <h1 className="text-3xl font-bold">Evaluation Complete</h1>
              {manualEvaluation && (
                <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                  Using manual data
                </span>
              )}
            </div>
            <p className="text-gray-400">Task: {task.title}</p>
            <p className="text-gray-400">Language: {task.language}</p>
            {isEvaluationUnlocked && (
              <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                <Sparkles className="w-3 h-3" />
                Premium Evaluation Unlocked
              </div>
            )}
          </div>

          {/* Score - ALWAYS VISIBLE */}
          <div className="mb-8 p-8 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-xl border border-purple-500/20">
            <div className="text-center">
              <div className="text-7xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-3">
                {evaluation.score}/10
              </div>
              <div className="text-xl text-gray-300">Overall Score</div>
            </div>
          </div>

          {/* Dynamic Content Section */}
          {!showDetailedReview ? (
            // Initial view - Show "View Details" button
            <div className="mb-8 text-center">
              {isEvaluationUnlocked ? (
                <button
                  onClick={handleViewDetailsClick}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl font-semibold text-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <Eye className="w-5 h-5" />
                  View Detailed AI Review
                </button>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={() => setShowDetailedReview(true)}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl font-semibold text-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <Lock className="w-5 h-5" />
                    Unlock Detailed AI Review
                  </button>
                  <p className="text-gray-500 text-sm">
                    Get comprehensive AI feedback for just ₹10
                  </p>
                </div>
              )}
            </div>
          ) : !isEvaluationUnlocked ? (
            // Payment wall
            <div className="mb-8 glass-panel border border-purple-500/30 rounded-xl p-8 text-center">
              <Lock className="w-16 h-16 text-purple-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">Unlock Premium AI Analysis</h2>
              <p className="text-gray-400 mb-6">
                Get comprehensive AI analysis for just ₹10. Unlock these premium features:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-white mb-2">📊 Detailed Analysis</h3>
                  <p className="text-sm text-gray-300">In-depth code review with expert feedback</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-white mb-2">⚡ Optimization Tips</h3>
                  <p className="text-sm text-gray-300">Performance improvements and best practices</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-white mb-2">🎯 Strengths & Weaknesses</h3>
                  <p className="text-sm text-gray-300">Identify what you did well and where to improve</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-white mb-2">📝 Comprehensive Summary</h3>
                  <p className="text-sm text-gray-300">Actionable insights for next steps</p>
                </div>
              </div>
              
              <PaymentButton 
                taskId={taskId} 
                amount={10}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                buttonText="Unlock Premium Analysis"
                className="w-full max-w-md mx-auto"
                companyName="CodeMaster AI"
                productDescription="Premium Code Evaluation Report"
              />
              
              <p className="mt-4 text-xs text-gray-500 max-w-md mx-auto">
                Test mode: Use card <code className="bg-gray-800 px-2 py-1 rounded">4111 1111 1111 1111</code>
              </p>
              
              <button
                onClick={() => setShowDetailedReview(false)}
                className="mt-6 text-gray-400 hover:text-white text-sm"
              >
                ← Back to score
              </button>
            </div>
          ) : (
            // Unlocked premium content
            <div className="mb-8 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl p-6 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-semibold">Premium AI Analysis</h2>
              </div>
              
              {evaluation.summary && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 text-white">Executive Summary</h3>
                  <div className="bg-gray-800/50 p-4 rounded-lg border-l-4 border-purple-500">
                    <p className="text-gray-300 leading-relaxed">{evaluation.summary}</p>
                  </div>
                </div>
              )}

              {evaluation.strengths && Array.isArray(evaluation.strengths) && evaluation.strengths.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 text-green-400">Key Strengths</h3>
                  <div className="space-y-3">
                    {evaluation.strengths.map((strength: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 bg-green-900/10 p-3 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-green-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-green-500 text-sm">✓</span>
                        </div>
                        <span className="text-gray-300">{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {evaluation.improvements && Array.isArray(evaluation.improvements) && evaluation.improvements.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 text-yellow-400">Areas for Improvement</h3>
                  <div className="space-y-3">
                    {evaluation.improvements.map((improvement: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 bg-yellow-900/10 p-3 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-yellow-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-yellow-500 text-sm">→</span>
                        </div>
                        <span className="text-gray-300">{improvement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => setShowDetailedReview(false)}
                  className="text-gray-400 hover:text-white text-sm flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Hide detailed analysis
                </button>
              </div>
            </div>
          )}

          {/* Original Code */}
          <div className="mt-12 pt-8 border-t border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Your Original Code</h2>
              <div className="text-sm text-gray-500">
                {task.language} • {task.code_text?.length || 0} characters
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto border border-gray-700">
              <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
                {task.code_text}
              </pre>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Evaluation Details Not Available</h1>
          <p className="text-gray-400 mb-6">
            The task was marked as evaluated, but evaluation data could not be loaded.
          </p>
          <div className="space-y-4">
            <button onClick={handleRefresh} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold">
              Refresh Data
            </button>
            <button onClick={runDebug} className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold ml-4">
              Debug Database
            </button>
          </div>
        </div>
      )}

      {/* Debug section - only show in development */}
      {process.env.NODE_ENV === 'development' && debugInfo && (
        <div className="mt-8 p-4 bg-gray-900 rounded-lg border border-yellow-500/30">
          <div className="flex items-center gap-2 mb-3">
            <Bug className="w-4 h-4 text-yellow-500" />
            <h3 className="font-semibold text-yellow-400">Debug Info</h3>
            <button 
              onClick={runDebug}
              className="ml-auto text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded"
            >
              Refresh Debug
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-xs mb-3">
            <div className="p-2 bg-gray-800 rounded">
              <div className="font-semibold">Task Status</div>
              <div>{task?.status || 'loading...'}</div>
            </div>
            <div className="p-2 bg-gray-800 rounded">
              <div className="font-semibold">Has Evaluation</div>
              <div className={debugInfo.hasEvaluation ? 'text-green-400' : 'text-red-400'}>
                {debugInfo.hasEvaluation ? '✅ Yes' : '❌ No'}
              </div>
            </div>
            <div className="p-2 bg-gray-800 rounded">
              <div className="font-semibold">Is Unlocked</div>
              <div className={debugInfo.isUnlocked ? 'text-green-400' : 'text-yellow-400'}>
                {debugInfo.isUnlocked ? '✅ Unlocked' : '🔒 Locked'}
              </div>
            </div>
          </div>
          
          <details className="text-xs text-gray-400">
            <summary className="cursor-pointer">View Debug Details</summary>
            <pre className="mt-2 overflow-x-auto bg-black/50 p-2 rounded text-[10px]">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  )
}