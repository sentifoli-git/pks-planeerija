// Üksuste ja nimistute andmed

export type UnitCode = 'PELGULINN' | 'ULEMISTE' | 'KIILI';

export interface ListData {
  id: number;
  unit: UnitCode;
  name: string;
  target: number; // sihtrühm
  done: number;   // tehtud (hõlmatus %)
}

export interface DailyEntry {
  id: number;
  listId: number;
  date: string;
  called: number;      // kutsutud
  completed: number;   // tehtud
  refused?: number;    // keeldujad (valikuline)
  noShow?: number;     // mitteilmujad (valikuline)
}

export const UNITS: Record<UnitCode, string> = {
  PELGULINN: 'Pelgulinn',
  ULEMISTE: 'Ülemiste',
  KIILI: 'Kiili',
};

// Algandmed tabelist
export const LISTS: ListData[] = [
  // PELGULINN
  { id: 1, unit: 'PELGULINN', name: 'dr Lill', target: 448, done: 59 },
  { id: 2, unit: 'PELGULINN', name: 'dr Abramov', target: 326, done: 68 },
  { id: 3, unit: 'PELGULINN', name: 'dr Guskova', target: 436, done: 65 },
  { id: 4, unit: 'PELGULINN', name: 'dr Melan', target: 259, done: 66 },
  { id: 5, unit: 'PELGULINN', name: 'dr Kõressaar', target: 290, done: 68 },
  { id: 6, unit: 'PELGULINN', name: 'dr Männik', target: 278, done: 64 },
  { id: 7, unit: 'PELGULINN', name: 'dr Pranstibel', target: 237, done: 63 },
  { id: 8, unit: 'PELGULINN', name: 'dr Einberg', target: 186, done: 70 },
  { id: 9, unit: 'PELGULINN', name: 'dr Maripuu', target: 163, done: 85 },
  
  // ÜLEMISTE
  { id: 10, unit: 'ULEMISTE', name: 'dr Lindström', target: 108, done: 62 },
  { id: 11, unit: 'ULEMISTE', name: 'dr Kolts', target: 107, done: 59 },
  { id: 12, unit: 'ULEMISTE', name: 'dr Vessel', target: 388, done: 66 },
  { id: 13, unit: 'ULEMISTE', name: 'dr Gretšenko', target: 166, done: 76 },
  
  // KIILI
  { id: 14, unit: 'KIILI', name: 'dr Lutter', target: 283, done: 68 },
  { id: 15, unit: 'KIILI', name: 'dr Pintsaar', target: 338, done: 76 },
];

// Mock päevased sisestused
export const MOCK_ENTRIES: DailyEntry[] = [
  { id: 1, listId: 1, date: '2026-02-16', called: 5, completed: 4, refused: 1 },
  { id: 2, listId: 2, date: '2026-02-16', called: 3, completed: 3 },
  { id: 3, listId: 3, date: '2026-02-16', called: 4, completed: 3, noShow: 1 },
];

// Arvutused
export function getUnitLists(unit: UnitCode): ListData[] {
  return LISTS.filter(l => l.unit === unit);
}

export function getUnitTotals(unit: UnitCode) {
  const lists = getUnitLists(unit);
  const target = lists.reduce((sum, l) => sum + l.target, 0);
  const doneCount = lists.reduce((sum, l) => sum + Math.round(l.target * l.done / 100), 0);
  const donePercent = target > 0 ? Math.round((doneCount / target) * 100) : 0;
  return { target, doneCount, donePercent, listCount: lists.length };
}

export function getAllTotals() {
  const target = LISTS.reduce((sum, l) => sum + l.target, 0);
  const doneCount = LISTS.reduce((sum, l) => sum + Math.round(l.target * l.done / 100), 0);
  const donePercent = target > 0 ? Math.round((doneCount / target) * 100) : 0;
  return { target, doneCount, donePercent, listCount: LISTS.length };
}
