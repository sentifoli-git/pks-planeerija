import { cookies } from 'next/headers';

export type RoleCode = 'ADMIN' | 'UNIT_PELGULINN' | 'UNIT_ULEMISTE' | 'UNIT_KIILI';

export interface UserSession {
  role: RoleCode;
  loggedInAt: string;
}

const PASSWORDS: Record<string, RoleCode> = {
  'pks-admin-2026': 'ADMIN',
  'pks-pelgulinn-2026': 'UNIT_PELGULINN',
  'pks-ulemiste-2026': 'UNIT_ULEMISTE',
  'pks-kiili-2026': 'UNIT_KIILI',
};

export const ROLE_NAMES: Record<RoleCode, string> = {
  ADMIN: 'Admin',
  UNIT_PELGULINN: 'Pelgulinn',
  UNIT_ULEMISTE: 'Ülemiste',
  UNIT_KIILI: 'Kiili',
};

export function validatePassword(password: string): RoleCode | null {
  return PASSWORDS[password] || null;
}

export function createSession(role: RoleCode): string {
  const session: UserSession = { role, loggedInAt: new Date().toISOString() };
  return Buffer.from(JSON.stringify(session)).toString('base64');
}

export function decodeSession(token: string): UserSession | null {
  try {
    return JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
  } catch {
    return null;
  }
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('pks-session');
  if (!sessionCookie?.value) return null;
  return decodeSession(sessionCookie.value);
}
