import { NextRequest, NextResponse } from 'next/server';
import { validatePassword, createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const role = validatePassword(password);

  if (!role) {
    return NextResponse.json({ success: false, error: 'Vale parool' });
  }

  const sessionToken = createSession(role);
  const response = NextResponse.json({ success: true, role });
  
  response.cookies.set('pks-session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  });

  return response;
}
