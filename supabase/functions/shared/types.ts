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

export interface GroqResponse {
  score: number;
  strengths: string[];
  improvements: string[];
  summary: string;
}

export interface TaskData {
  id: string;
  title: string;
  description: string;
  code_text: string;
  language: string;
}

export interface EvaluationResult {
  score: number;
  strengths: string[];
  improvements: string[];
  summary: string;
}

export interface PaymentData {
  orderId: string;
  amount: number;
  currency: string;
  userId: string;
  taskId: string;
}