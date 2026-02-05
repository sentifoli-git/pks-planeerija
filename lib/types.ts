// =====================
// PKS-planeerija tüübid
// =====================

export type RoleCode = 
  | 'ADMIN' 
  | 'NURSING_LEAD' 
  | 'UNIT_LEAD_PELGULINN' 
  | 'UNIT_LEAD_ULEMISTE' 
  | 'CALL_NURSE';

export type UnitCode = 'PELGULINN' | 'ULEMISTE';

export type DayType = 'FULL' | 'HALF' | 'OFF';

export type ConfirmationStatus = 'MET' | 'NOT_MET' | 'PENDING';

// =====================
// Andmebaasi tabelid
// =====================

export interface Settings {
  id: number;
  target_pct: number;
  buffer_pct: number;
  invite_lead_days_min: number;
  invite_lead_days_max: number;
  rr_diary_days: number;
  period_start: string;
  period_end: string;
  slots_per_day_full: number;
  slots_per_day_half: number;
  appointment_duration_min: number;
  break_duration_min: number;
  end_of_day_buffer_min: number;
  transition_admin_min: number;
  weekly_confirmation_day: string;
  created_at: string;
  updated_at: string;
}

export interface Unit {
  id: number;
  code: UnitCode;
  name: string;
  created_at: string;
}

export interface Team {
  id: number;
  unit_id: number;
  unit_code: UnitCode;
  name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface List {
  id: number;
  unit_id: number;
  unit_code: UnitCode;
  team_id: number | null;
  label: string;
  chronic_total: number | null;
  needs_review: boolean;
  created_at: string;
  updated_at: string;
  // Arvutuslikud väljad
  year_target?: number;
  weekly_target?: number;
  // Tiimi info
  team_name?: string;
}

export interface Holiday {
  id: number;
  date: string;
  name: string;
}

export interface CalendarDay {
  id: number;
  date: string;
  day_type: DayType;
  slots_override: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailyEntry {
  id: number;
  list_id: number;
  date: string;
  calls_made: number;
  calls_refused: number;
  visits_made: number;
  visits_no_show: number;
  entered_by_role: RoleCode;
  entered_by_unit: UnitCode | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeeklyConfirmation {
  id: number;
  unit_code: UnitCode;
  year: number;
  week_number: number;
  week_start: string;
  week_end: string;
  target_calls: number;
  actual_calls: number;
  actual_calls_refused: number;
  target_visits: number;
  actual_visits: number;
  actual_visits_no_show: number;
  calls_met: boolean;
  visits_met: boolean;
  status: ConfirmationStatus;
  confirmed_by_role: RoleCode | null;
  confirmed_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface AuditLog {
  id: number;
  table_name: string;
  record_id: number;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  changed_by_role: RoleCode;
  changed_by_unit: UnitCode | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  created_at: string;
}

// =====================
// Session / Auth
// =====================

export interface UserSession {
  role: RoleCode;
  selectedUnit: UnitCode | null;
  loggedInAt: string;
}

// =====================
// API vastused
// =====================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// =====================
// Vaadete tüübid
// =====================

export interface WeekSummary {
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  lists: {
    listId: number;
    label: string;
    teamName?: string;
    targetCalls: number;
    actualCalls: number;
    actualCallsRefused: number;
    targetVisits: number;
    actualVisits: number;
    actualVisitsNoShow: number;
    callsProgress: number;
    visitsProgress: number;
  }[];
  unitTotals: {
    targetCalls: number;
    actualCalls: number;
    actualCallsRefused: number;
    targetVisits: number;
    actualVisits: number;
    actualVisitsNoShow: number;
    callsProgress: number;
    visitsProgress: number;
  };
  confirmation: WeeklyConfirmation | null;
}

export interface DashboardStats {
  unit: UnitCode;
  totalChronics: number;
  yearTarget: number;
  weeklyTarget: number;
  ytdTargetCalls: number;
  ytdActualCalls: number;
  ytdActualCallsRefused: number;
  ytdTargetVisits: number;
  ytdActualVisits: number;
  ytdActualVisitsNoShow: number;
  callsProgress: number;
  visitsProgress: number;
  weeksCompleted: number;
  weeksMet: number;
  currentWeekStatus: ConfirmationStatus;
}

export interface TeamStats {
  teamId: number;
  teamName: string;
  lists: {
    listId: number;
    label: string;
    chronicTotal: number | null;
    yearTarget: number;
    weeklyTarget: number;
    ytdCalls: number;
    ytdCallsRefused: number;
    ytdVisits: number;
    ytdVisitsNoShow: number;
    weekCalls: number;
    weekCallsRefused: number;
    weekVisits: number;
    weekVisitsNoShow: number;
  }[];
  totals: {
    chronicTotal: number;
    yearTarget: number;
    weeklyTarget: number;
    ytdCalls: number;
    ytdCallsRefused: number;
    ytdVisits: number;
    ytdVisitsNoShow: number;
    weekCalls: number;
    weekCallsRefused: number;
    weekVisits: number;
    weekVisitsNoShow: number;
  };
}

// =====================
// Vormid
// =====================

export interface DailyEntryForm {
  listId: number;
  date: string;
  callsMade: number;
  callsRefused: number;
  visitsMade: number;
  visitsNoShow: number;
  notes?: string;
}

export interface ListUpdateForm {
  chronicTotal: number | null;
}

export interface CalendarDayForm {
  date: string;
  dayType: DayType;
  slotsOverride?: number | null;
  notes?: string;
}
