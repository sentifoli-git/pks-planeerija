import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const cookieConfig = clearSessionCookie();
    
    const response = NextResponse.json({
      success: true,
      message: 'Välja logitud',
    });

    response.cookies.set(
      cookieConfig.name,
      cookieConfig.value,
      cookieConfig.options as any
    );

    return response;
  } catch (error) {
    console.error('Auth logout error:', error);
    return NextResponse.json(
      { error: 'Serveri viga' },
      { status: 500 }
    );
  }
}
