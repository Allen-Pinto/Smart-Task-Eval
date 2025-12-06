import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

export async function evaluateCode(code: string, language: string, description?: string) {
  try {
    const prompt = `Evaluate the following ${language} code and provide a score from 0-10 with detailed feedback:

${description ? `Task Description: ${description}\n\n` : ''}Code:
\`\`\`${language}
${code}
\`\`\`

Please respond in this EXACT JSON format:
{
  "score": number between 0-10,
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "summary": "brief overall summary"
}`

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert code reviewer. Evaluate code quality, best practices, efficiency, and correctness. Provide constructive feedback.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: process.env.GROQ_MODEL_NAME || 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    })

    const response = completion.choices[0]?.message?.content
    if (!response) throw new Error('No response from AI')

    const evaluation = JSON.parse(response)
    
    if (typeof evaluation.score !== 'number' || evaluation.score < 0 || evaluation.score > 10) {
      throw new Error('Invalid score from AI')
    }

    return evaluation

  } catch (error) {
    console.error('Groq evaluation error:', error)
    throw error
  }
}