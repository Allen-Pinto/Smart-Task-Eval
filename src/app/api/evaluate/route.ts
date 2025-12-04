import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../lib/supabase-server';

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 5,
  windowMs: 60 * 1000, // 1 minute
};

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): { allowed: boolean; resetIn: number } {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
    return { allowed: true, resetIn: RATE_LIMIT.windowMs };
  }
  
  if (userLimit.count >= RATE_LIMIT.maxRequests) {
    return { allowed: false, resetIn: userLimit.resetTime - now };
  }
  
  userLimit.count++;
  return { allowed: true, resetIn: userLimit.resetTime - now };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting check
    const rateLimit = checkRateLimit(user.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          retryAfter: Math.ceil(rateLimit.resetIn / 1000) 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil(rateLimit.resetIn / 1000).toString(),
            'X-RateLimit-Limit': RATE_LIMIT.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': (Date.now() + rateLimit.resetIn).toString(),
          }
        }
      );
    }

    const { taskId } = await request.json();
    
    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Validate task exists and belongs to user
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id, status')
      .eq('id', taskId)
      .eq('user_id', user.id)
      .single();

    if (taskError || !task) {
      return NextResponse.json(
        { error: 'Task not found or unauthorized' },
        { status: 404 }
      );
    }

    if (task.status === 'evaluated' || task.status === 'processing') {
      return NextResponse.json(
        { error: `Task already ${task.status}` },
        { status: 400 }
      );
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/evaluate-task`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        taskId,
        userId: user.id,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Evaluation failed: ${error}` },
        { status: 500 }
      );
    }

    const result = await response.json();
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Evaluation API error:', error);
    return NextResponse.json(
      { error: error.message || 'Evaluation failed' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';