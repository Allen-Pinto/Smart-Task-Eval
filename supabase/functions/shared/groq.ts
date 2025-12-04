import { CreateChatCompletionRequest } from './types';

export interface GroqResponse {
  score: number;
  strengths: string[];
  improvements: string[];
  summary: string;
}

export async function callGroqAPI(
  prompt: string,
  apiKey: string,
  model: string = 'llama3-70b-8192'
): Promise<GroqResponse> {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  
  const requestBody: CreateChatCompletionRequest = {
    model,
    messages: [
      {
        role: 'system',
        content: 'You are an expert coding task evaluator. You must output your response in valid JSON format ONLY.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.3,
    max_tokens: 2000,
    response_format: { type: 'json_object' }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content in Groq response');
  }

  try {
    const parsed = JSON.parse(content);
    
    if (!validateEvaluation(parsed)) {
      throw new Error('Invalid evaluation structure');
    }
    
    return parsed as GroqResponse;
  } catch (error) {
    console.error('Failed to parse Groq response:', content);
    throw new Error(`Invalid JSON response: ${error.message}`);
  }
}

function validateEvaluation(evaluation: any): boolean {
  return (
    evaluation &&
    typeof evaluation.score === 'number' &&
    evaluation.score >= 0 &&
    evaluation.score <= 10 &&
    Array.isArray(evaluation.strengths) &&
    Array.isArray(evaluation.improvements) &&
    typeof evaluation.summary === 'string'
  );
}

export interface CreateChatCompletionRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' | 'text' };
}