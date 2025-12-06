'use client'

import { Code } from 'lucide-react'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
}

export function CodeEditor({ value, onChange, language }: CodeEditorProps) {
  return (
    <div>
      <label className="text-sm font-medium mb-2 flex items-center gap-2">
        <Code className="w-4 h-4" />
        Code *
        {language && (
          <span className="ml-auto text-xs text-gray-400 px-2 py-1 bg-gray-800 rounded">
            {language}
          </span>
        )}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste your code here..."
        required
        rows={16}
        className="w-full px-4 py-3 bg-gray-950 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
        spellCheck={false}
      />
      <p className="text-xs text-gray-400 mt-2">
        Paste your complete code for evaluation
      </p>
    </div>
  )
}