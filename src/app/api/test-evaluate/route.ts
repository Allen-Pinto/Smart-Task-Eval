import { NextRequest, NextResponse } from 'next/server'
import { evaluateCode } from '@/lib/groq-client'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Groq API...')
    const testCode = `function add(a, b) {
  return a + b;
}`

    const result = await evaluateCode(testCode, 'javascript', 'Simple addition function')
    
    return NextResponse.json({
      success: true,
      result,
      message: 'Groq API is working!'
    })
  } catch (error: any) {
    console.error('Groq test failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Groq API failed'
    }, { status: 500 })
  }
}