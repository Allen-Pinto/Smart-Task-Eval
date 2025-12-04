import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    
    if (!code) {
      return NextResponse.redirect(new URL('/auth/error?error=missing_code', request.url));
    }

    const supabase = createClient();
    
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(new URL('/auth/error?error=auth_failed', request.url));
    }

    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error: any) {
    console.error('Auth callback exception:', error);
    return NextResponse.redirect(new URL('/auth/error?error=server_error', request.url));
  }
}