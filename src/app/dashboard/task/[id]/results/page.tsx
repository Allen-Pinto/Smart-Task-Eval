'use client'

import { useParams } from 'next/navigation'
import { EvaluationReport } from '../../../../../components/evaluation/EvaluationReport'
import { useEvaluation } from '../../../../../hooks/useEvaluation'
import { Loader } from '../../../../../components/shared/Loader'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ResultsPage() {
  const params = useParams()
  const taskId = params.id as string
  const { evaluation, loading } = useEvaluation(taskId)

  if (loading) {
    return <Loader />
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <EvaluationReport evaluation={evaluation} taskId={taskId} />
    </div>
  )
}