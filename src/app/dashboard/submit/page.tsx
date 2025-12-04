'use client'

import { TaskForm } from '../../../components/task/TaskForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function SubmitPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Submit New Task</h1>
        <p className="text-gray-400">Upload your code for AI evaluation</p>
      </div>

      <TaskForm />
    </div>
  )
}