import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { 
  validatePassword, 
  createSession, 
  setSessionCookie,
  needsUnitSelection,
  ROLE_NAMES 
} from '@/lib/auth';
import { UnitCode } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { password, selectedUnit } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Parool on kohustuslik' },
        { status: 400 }
      );
    }

    const role = validatePassword(password);

    if (!role) {
      return NextResponse.json(
        { error: 'Vale parool' },
        { status: 401 }
      );
    }

    // Kui roll vajab üksuse valikut, kontrolli et see on antud
    if (needsUnitSelection(role)) {
      if (!selectedUnit || !['PELGULINN', 'ULEMISTE'].includes(selectedUnit)) {
        return NextResponse.json(
          { error: 'Palun vali üksus' },
          { status: 400 }
        );
      }
    }

    // Loo sessioon
    const sessionToken = createSession(
      role, 
      selectedUnit as UnitCode | null
    );
    
    const cookieConfig = setSessionCookie(sessionToken);

    // Loo vastus ja sea cookie
    const response = NextResponse.json({
      success: true,
      role: ROLE_NAMES[role],
    });

    response.cookies.set(
      cookieConfig.name,
      cookieConfig.value,
      cookieConfig.options as any
    );

    return response;
  } catch (error) {
    console.error('Auth login error:', error);
    return NextResponse.json(
      { error: 'Serveri viga' },
      { status: 500 }
    );
  }
}
