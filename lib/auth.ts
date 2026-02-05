import { cookies } from 'next/headers';
import { RoleCode, UnitCode, UserSession } from './types';

// Paroolide mapping rollidele
const PASSWORD_TO_ROLE: Record<string, RoleCode> = {
  [process.env.AUTH_PASSWORD_ADMIN || 'pks-admin-2026']: 'ADMIN',
  [process.env.AUTH_PASSWORD_NURSING_LEAD || 'pks-nursing-2026']: 'NURSING_LEAD',
  [process.env.AUTH_PASSWORD_UNIT_LEAD_PELGULINN || 'pks-pelgulinn-2026']: 'UNIT_LEAD_PELGULINN',
  [process.env.AUTH_PASSWORD_UNIT_LEAD_ULEMISTE || 'pks-ulemiste-2026']: 'UNIT_LEAD_ULEMISTE',
  [process.env.AUTH_PASSWORD_CALL_NURSE || 'pks-callnurse-2026']: 'CALL_NURSE',
};

// Rolli nimed eesti keeles
export const ROLE_NAMES: Record<RoleCode, string> = {
  ADMIN: 'Admin',
  NURSING_LEAD: 'Õendusjuht',
  UNIT_LEAD_PELGULINN: 'Vastutav õde: Pelgulinn',
  UNIT_LEAD_ULEMISTE: 'Vastutav õde: Ülemiste',
  CALL_NURSE: 'Kõneliini õde',
};

// Üksuste nimed
export const UNIT_NAMES: Record<UnitCode, string> = {
  PELGULINN: 'Pelgulinn',
  ULEMISTE: 'Ülemiste',
};

// Rolli õigused
export interface RolePermissions {
  canViewAllUnits: boolean;
  canEditSettings: boolean;
  canEditLists: boolean;
  canEditCalendar: boolean;
  canEnterDailyData: boolean;
  canConfirmWeek: boolean;
  canViewAuditLog: boolean;
  allowedUnits: UnitCode[] | 'all';
  needsUnitSelection: boolean;
}

export const ROLE_PERMISSIONS: Record<RoleCode, RolePermissions> = {
  ADMIN: {
    canViewAllUnits: true,
    canEditSettings: true,
    canEditLists: true,
    canEditCalendar: true,
    canEnterDailyData: true,
    canConfirmWeek: true,
    canViewAuditLog: true,
    allowedUnits: 'all',
    needsUnitSelection: false,
  },
  NURSING_LEAD: {
    canViewAllUnits: true,
    canEditSettings: false,
    canEditLists: true,
    canEditCalendar: false,
    canEnterDailyData: true,
    canConfirmWeek: false,
    canViewAuditLog: true,
    allowedUnits: 'all',
    needsUnitSelection: false,
  },
  UNIT_LEAD_PELGULINN: {
    canViewAllUnits: false,
    canEditSettings: false,
    canEditLists: true,
    canEditCalendar: true,
    canEnterDailyData: true,
    canConfirmWeek: true,
    canViewAuditLog: false,
    allowedUnits: ['PELGULINN'],
    needsUnitSelection: false,
  },
  UNIT_LEAD_ULEMISTE: {
    canViewAllUnits: false,
    canEditSettings: false,
    canEditLists: true,
    canEditCalendar: true,
    canEnterDailyData: true,
    canConfirmWeek: true,
    canViewAuditLog: false,
    allowedUnits: ['ULEMISTE'],
    needsUnitSelection: false,
  },
  CALL_NURSE: {
    canViewAllUnits: false,
    canEditSettings: false,
    canEditLists: false,
    canEditCalendar: false,
    canEnterDailyData: true,
    canConfirmWeek: false,
    canViewAuditLog: false,
    allowedUnits: 'all', // Võib valida kummagi
    needsUnitSelection: true,
  },
};

// Sessiooni cookie nimi
const SESSION_COOKIE = 'pks-session';

// Parooli valideerimine ja rolli tuvastamine
export function validatePassword(password: string): RoleCode | null {
  return PASSWORD_TO_ROLE[password] || null;
}

// Sessiooni loomine
export function createSession(role: RoleCode, selectedUnit: UnitCode | null): string {
  const session: UserSession = {
    role,
    selectedUnit,
    loggedInAt: new Date().toISOString(),
  };
  // Lihtne base64 kodeering (tootmises kasuta JWT)
  return Buffer.from(JSON.stringify(session)).toString('base64');
}

// Sessiooni dekodeerimine
export function decodeSession(sessionToken: string): UserSession | null {
  try {
    const decoded = Buffer.from(sessionToken, 'base64').toString('utf-8');
    return JSON.parse(decoded) as UserSession;
  } catch {
    return null;
  }
}

// Sessiooni lugemine (server component)
export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);
  
  if (!sessionCookie?.value) {
    return null;
  }
  
  return decodeSession(sessionCookie.value);
}

// Sessiooni seadmine (API route)
export function setSessionCookie(sessionToken: string): { name: string; value: string; options: object } {
  return {
    name: SESSION_COOKIE,
    value: sessionToken,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24, // 24 tundi
      path: '/',
    },
  };
}

// Sessiooni kustutamine
export function clearSessionCookie(): { name: string; value: string; options: object } {
  return {
    name: SESSION_COOKIE,
    value: '',
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 0,
      path: '/',
    },
  };
}

// Kontroll, kas kasutaja saab vaadata üksust
export function canAccessUnit(session: UserSession, unit: UnitCode): boolean {
  const permissions = ROLE_PERMISSIONS[session.role];
  
  if (permissions.allowedUnits === 'all') {
    return true;
  }
  
  return permissions.allowedUnits.includes(unit);
}

// Kasutaja aktiivne üksus
export function getActiveUnit(session: UserSession): UnitCode | null {
  const permissions = ROLE_PERMISSIONS[session.role];
  
  // Kui vajab valikut ja on valitud
  if (permissions.needsUnitSelection) {
    return session.selectedUnit;
  }
  
  // Kui on ühe üksuse juht
  if (permissions.allowedUnits !== 'all' && permissions.allowedUnits.length === 1) {
    return permissions.allowedUnits[0];
  }
  
  // Admin ja nursing lead näevad kõiki, üksust pole vaja
  return null;
}

// Kas vajab üksuse valikut
export function needsUnitSelection(role: RoleCode): boolean {
  return ROLE_PERMISSIONS[role].needsUnitSelection;
}
