import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { 
  getSession, 
  createSession, 
  setSessionCookie,
  ROLE_PERMISSIONS
} from '@/lib/auth';
import { UnitCode } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Pole sisse logitud' },
        { status: 401 }
      );
    }

    // Ainult CALL_NURSE saab üksust vahetada
    if (!ROLE_PERMISSIONS[session.role].needsUnitSelection) {
      return NextResponse.json(
        { error: 'Teil pole õigust üksust vahetada' },
        { status: 403 }
      );
    }

    const { unit } = await request.json();

    if (!unit || !['PELGULINN', 'ULEMISTE'].includes(unit)) {
      return NextResponse.json(
        { error: 'Vigane üksus' },
        { status: 400 }
      );
    }

    // Loo uus sessioon uue üksusega
    const sessionToken = createSession(session.role, unit as UnitCode);
    const cookieConfig = setSessionCookie(sessionToken);

    const response = NextResponse.json({
      success: true,
      unit,
    });

    response.cookies.set(
      cookieConfig.name,
      cookieConfig.value,
      cookieConfig.options as any
    );

    return response;
  } catch (error) {
    console.error('Change unit error:', error);
    return NextResponse.json(
      { error: 'Serveri viga' },
      { status: 500 }
    );
  }
}
