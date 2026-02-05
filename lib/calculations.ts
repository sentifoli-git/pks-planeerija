import { 
  addDays, 
  differenceInWeeks, 
  eachDayOfInterval, 
  endOfWeek, 
  format, 
  getISOWeek, 
  getYear, 
  isWeekend, 
  parseISO, 
  startOfWeek 
} from 'date-fns';
import { et } from 'date-fns/locale';
import { DayType, Settings, List, CalendarDay, Holiday } from './types';

// Eesti riigipühad 2026
export const HOLIDAYS_2026: string[] = [
  '2026-01-01', // Uusaasta
  '2026-02-24', // Iseseisvuspäev
  '2026-04-10', // Suur Reede
  '2026-04-12', // Ülestõusmispühade 1. püha
  '2026-05-01', // Kevadpüha
  '2026-05-31', // Nelipühade 1. püha
  '2026-06-23', // Võidupüha
  '2026-06-24', // Jaanipäev
  '2026-08-20', // Taasiseseisvumispäev
  '2026-12-24', // Jõululaupäev
  '2026-12-25', // Esimene jõulupüha
  '2026-12-26', // Teine jõulupüha
];

// Kontrolli kas päev on puhkepäev
export function isHoliday(date: Date | string, holidays: string[] = HOLIDAYS_2026): boolean {
  const dateStr = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
  return holidays.includes(dateStr);
}

// Kontrolli kas päev on tööpäev (ei ole nädalavahetus ega pühad)
export function isWorkingDay(date: Date | string, holidays: string[] = HOLIDAYS_2026): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return !isWeekend(d) && !isHoliday(d, holidays);
}

// Arvuta tööpäevad perioodis
export function getWorkingDays(startDate: string, endDate: string, holidays: string[] = HOLIDAYS_2026): Date[] {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  
  const allDays = eachDayOfInterval({ start, end });
  return allDays.filter(day => isWorkingDay(day, holidays));
}

// Arvuta tööpäevade arv perioodis
export function countWorkingDays(startDate: string, endDate: string, holidays: string[] = HOLIDAYS_2026): number {
  return getWorkingDays(startDate, endDate, holidays).length;
}

// Arvuta nädalate arv perioodis
export function countWeeks(startDate: string, endDate: string): number {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  return differenceInWeeks(end, start) + 1;
}

// Arvuta nimistu aasta siht
export function calculateYearTarget(chronicTotal: number | null, targetPct: number): number {
  if (chronicTotal === null) return 0;
  return Math.ceil(chronicTotal * targetPct);
}

// Arvuta nimistu nädala siht
export function calculateWeeklyTarget(yearTarget: number, totalWeeks: number): number {
  if (totalWeeks <= 0) return 0;
  return Math.ceil(yearTarget / totalWeeks);
}

// Arvuta konkreetse nädala siht-kutsed (D-7 kuni D-10 reegel)
export function calculateRequiredCallsForWeek(
  weeklyVisitTarget: number,
  leadDaysMin: number = 7,
  leadDaysMax: number = 10
): number {
  // Kutsete sihtarv = sama mis visiitide sihtarv
  // (kutsed tehakse 7-10p ette)
  return weeklyVisitTarget;
}

// Hangi nädala algus ja lõpp kuupäevad
export function getWeekBounds(year: number, weekNumber: number): { start: Date; end: Date } {
  // Leia esimene päev aastas
  const firstDayOfYear = new Date(year, 0, 1);
  
  // Leia nädala algus (esmaspäev)
  const startOfFirstWeek = startOfWeek(firstDayOfYear, { weekStartsOn: 1 });
  
  // Lisa nädalad
  const targetWeekStart = addDays(startOfFirstWeek, (weekNumber - 1) * 7);
  const targetWeekEnd = endOfWeek(targetWeekStart, { weekStartsOn: 1 });
  
  return {
    start: targetWeekStart,
    end: targetWeekEnd,
  };
}

// Hangi kuupäeva nädala number
export function getWeekNumber(date: Date | string): number {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return getISOWeek(d);
}

// Hangi kuupäeva aasta
export function getDateYear(date: Date | string): number {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return getYear(d);
}

// Arvuta edenemise protsent
export function calculateProgress(actual: number, target: number): number {
  if (target <= 0) return 0;
  return Math.round((actual / target) * 100);
}

// Kontrolli kas siht on täidetud
export function isTargetMet(actual: number, target: number): boolean {
  return actual >= target;
}

// Hangi päeva slottide arv
export function getSlotsForDay(
  date: string,
  calendarDays: CalendarDay[],
  settings: Settings,
  holidays: string[] = HOLIDAYS_2026
): number {
  const d = parseISO(date);
  
  // Nädalavahetus või püha = 0 slotti
  if (isWeekend(d) || isHoliday(date, holidays)) {
    return 0;
  }
  
  // Vaata kas on kalendris override
  const calendarDay = calendarDays.find(cd => cd.date === date);
  
  if (calendarDay) {
    // Kui on slots_override, kasuta seda
    if (calendarDay.slots_override !== null) {
      return calendarDay.slots_override;
    }
    
    // Kasuta päevatüübi vaikimisi väärtust
    switch (calendarDay.day_type) {
      case 'FULL':
        return settings.slots_per_day_full;
      case 'HALF':
        return settings.slots_per_day_half;
      case 'OFF':
        return 0;
    }
  }
  
  // Vaikimisi = täispäev
  return settings.slots_per_day_full;
}

// Arvuta nädala slottide kogusumma
export function getTotalSlotsForWeek(
  weekStart: string,
  weekEnd: string,
  calendarDays: CalendarDay[],
  settings: Settings,
  holidays: string[] = HOLIDAYS_2026
): number {
  const days = eachDayOfInterval({
    start: parseISO(weekStart),
    end: parseISO(weekEnd),
  });
  
  return days.reduce((total, day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return total + getSlotsForDay(dateStr, calendarDays, settings, holidays);
  }, 0);
}

// Formaadi kuupäev eesti keeles
export function formatDateEt(date: Date | string, formatStr: string = 'dd.MM.yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr, { locale: et });
}

// Formaadi nädala vahemik
export function formatWeekRange(weekStart: Date | string, weekEnd: Date | string): string {
  return `${formatDateEt(weekStart, 'dd.MM')} – ${formatDateEt(weekEnd, 'dd.MM.yyyy')}`;
}

// Hangi praegune nädal
export function getCurrentWeek(): { year: number; week: number } {
  const now = new Date();
  return {
    year: getYear(now),
    week: getISOWeek(now),
  };
}

// Hangi "kutsumise nädal" (7-10 päeva ette)
export function getCallWeekForVisitWeek(
  visitWeekStart: string,
  leadDaysMin: number = 7,
  leadDaysMax: number = 10
): { start: Date; end: Date } {
  const visitStart = parseISO(visitWeekStart);
  
  // Kutsumise periood = D-10 kuni D-7 enne visiite
  return {
    start: addDays(visitStart, -leadDaysMax),
    end: addDays(visitStart, -leadDaysMin),
  };
}

// Genereeri perioodi nädalate nimekiri
export function generateWeeksList(
  periodStart: string,
  periodEnd: string
): Array<{ year: number; week: number; start: string; end: string }> {
  const weeks: Array<{ year: number; week: number; start: string; end: string }> = [];
  
  let current = parseISO(periodStart);
  const end = parseISO(periodEnd);
  
  // Liigu nädala algusesse
  current = startOfWeek(current, { weekStartsOn: 1 });
  
  while (current <= end) {
    const weekEnd = endOfWeek(current, { weekStartsOn: 1 });
    
    weeks.push({
      year: getYear(current),
      week: getISOWeek(current),
      start: format(current, 'yyyy-MM-dd'),
      end: format(weekEnd, 'yyyy-MM-dd'),
    });
    
    current = addDays(current, 7);
  }
  
  return weeks;
}

// Arvuta kumulatiivne siht kindla nädalani
export function calculateCumulativeTarget(
  yearTarget: number,
  totalWeeks: number,
  currentWeekNumber: number,
  periodStartWeek: number
): number {
  const weeksElapsed = currentWeekNumber - periodStartWeek + 1;
  const weeklyTarget = calculateWeeklyTarget(yearTarget, totalWeeks);
  return Math.min(weeksElapsed * weeklyTarget, yearTarget);
}

// Arvuta YTD (year-to-date) statistika
export function calculateYtdStats(
  chronicTotal: number | null,
  targetPct: number,
  totalWeeks: number,
  weeksElapsed: number,
  actualCalls: number,
  actualVisits: number
): {
  yearTarget: number;
  weeklyTarget: number;
  ytdTargetCalls: number;
  ytdTargetVisits: number;
  callsProgress: number;
  visitsProgress: number;
  onTrack: boolean;
} {
  const yearTarget = calculateYearTarget(chronicTotal, targetPct);
  const weeklyTarget = calculateWeeklyTarget(yearTarget, totalWeeks);
  const ytdTarget = Math.min(weeksElapsed * weeklyTarget, yearTarget);
  
  return {
    yearTarget,
    weeklyTarget,
    ytdTargetCalls: ytdTarget,
    ytdTargetVisits: ytdTarget,
    callsProgress: calculateProgress(actualCalls, ytdTarget),
    visitsProgress: calculateProgress(actualVisits, ytdTarget),
    onTrack: actualCalls >= ytdTarget && actualVisits >= ytdTarget,
  };
}
