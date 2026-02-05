import { NextRequest, NextResponse } from 'next/server';
import { validatePassword, needsUnitSelection, ROLE_NAMES } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

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

    return NextResponse.json({
      success: true,
      role: ROLE_NAMES[role],
      roleCode: role,
      needsUnitSelection: needsUnitSelection(role),
    });
  } catch (error) {
    console.error('Auth validate error:', error);
    return NextResponse.json(
      { error: 'Serveri viga' },
      { status: 500 }
    );
  }
}
