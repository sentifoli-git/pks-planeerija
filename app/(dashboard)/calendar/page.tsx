'use client';

import { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Info,
  Sun,
  Moon,
  XCircle
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isWeekend,
  addMonths,
  subMonths,
  getDay,
  parseISO
} from 'date-fns';
import { et } from 'date-fns/locale';

type DayType = 'FULL' | 'HALF' | 'OFF';

interface CalendarDay {
  date: string;
  dayType: DayType;
  slotsOverride: number | null;
  isHoliday: boolean;
  holidayName?: string;
}

// Eesti riigipühad 2026
const HOLIDAYS_2026: Record<string, string> = {
  '2026-01-01': 'Uusaasta',
  '2026-02-24': 'Iseseisvuspäev',
  '2026-04-10': 'Suur Reede',
  '2026-04-12': 'Ülestõusmispühade 1. püha',
  '2026-05-01': 'Kevadpüha',
  '2026-05-31': 'Nelipühade 1. püha',
  '2026-06-23': 'Võidupüha',
  '2026-06-24': 'Jaanipäev',
  '2026-08-20': 'Taasiseseisvumispäev',
  '2026-12-24': 'Jõululaupäev',
  '2026-12-25': 'Esimene jõulupüha',
  '2026-12-26': 'Teine jõulupüha',
};

const SLOTS_FULL = 8;
const SLOTS_HALF = 4;

const WEEKDAYS = ['E', 'T', 'K', 'N', 'R', 'L', 'P'];

const DAY_TYPE_LABELS: Record<DayType, string> = {
  FULL: 'Täispäev',
  HALF: 'Poolpäev',
  OFF: 'Vaba',
};

const DAY_TYPE_COLORS: Record<DayType, string> = {
  FULL: 'bg-white hover:bg-slate-50 border-slate-200',
  HALF: 'bg-amber-50 hover:bg-amber-100 border-amber-200',
  OFF: 'bg-slate-100 border-slate-200 text-slate-400',
};

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 1, 1)); // February 2026
  const [calendarOverrides, setCalendarOverrides] = useState<Record<string, CalendarDay>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Täida kuu algus tühjade lahtritega
  const startDayOfWeek = getDay(monthStart);
  const paddingDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const getDayData = (date: Date): CalendarDay => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Kontrolli override'i
    if (calendarOverrides[dateStr]) {
      return calendarOverrides[dateStr];
    }
    
    // Kontrolli riigipüha
    if (HOLIDAYS_2026[dateStr]) {
      return {
        date: dateStr,
        dayType: 'OFF',
        slotsOverride: 0,
        isHoliday: true,
        holidayName: HOLIDAYS_2026[dateStr],
      };
    }
    
    // Nädalavahetus
    if (isWeekend(date)) {
      return {
        date: dateStr,
        dayType: 'OFF',
        slotsOverride: 0,
        isHoliday: false,
      };
    }
    
    // Vaikimisi täispäev
    return {
      date: dateStr,
      dayType: 'FULL',
      slotsOverride: null,
      isHoliday: false,
    };
  };

  const getSlots = (day: CalendarDay): number => {
    if (day.slotsOverride !== null) return day.slotsOverride;
    switch (day.dayType) {
      case 'FULL': return SLOTS_FULL;
      case 'HALF': return SLOTS_HALF;
      case 'OFF': return 0;
    }
  };

  const monthStats = useMemo(() => {
    let totalSlots = 0;
    let workingDays = 0;
    
    monthDays.forEach(date => {
      const day = getDayData(date);
      const slots = getSlots(day);
      totalSlots += slots;
      if (slots > 0) workingDays++;
    });
    
    return { totalSlots, workingDays };
  }, [monthDays, calendarOverrides]);

  const handleDayClick = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isWeekend(date) || HOLIDAYS_2026[dateStr]) return;
    
    setSelectedDate(dateStr);
  };

  const handleDayTypeChange = (dayType: DayType) => {
    if (!selectedDate) return;
    
    setCalendarOverrides(prev => ({
      ...prev,
      [selectedDate]: {
        date: selectedDate,
        dayType,
        slotsOverride: null,
        isHoliday: false,
      },
    }));
  };

  const handleSlotsOverride = (slots: number) => {
    if (!selectedDate) return;
    
    const current = calendarOverrides[selectedDate] || getDayData(parseISO(selectedDate));
    
    setCalendarOverrides(prev => ({
      ...prev,
      [selectedDate]: {
        ...current,
        date: selectedDate,
        slotsOverride: slots,
      },
    }));
  };

  const clearOverride = () => {
    if (!selectedDate) return;
    
    setCalendarOverrides(prev => {
      const updated = { ...prev };
      delete updated[selectedDate];
      return updated;
    });
    setSelectedDate(null);
  };

  const selectedDayData = selectedDate ? getDayData(parseISO(selectedDate)) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Graafik</h1>
          <p className="text-slate-600 mt-1">
            Halda tööpäevade tüüpe ja slottide arvu
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="card">
            {/* Month navigation */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold text-slate-900">
                {format(currentMonth, 'MMMM yyyy', { locale: et })}
              </h2>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-slate-200">
              {WEEKDAYS.map((day, i) => (
                <div 
                  key={day} 
                  className={`p-2 text-center text-sm font-medium ${
                    i >= 5 ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 p-2 gap-1">
              {/* Padding days */}
              {Array.from({ length: paddingDays }).map((_, i) => (
                <div key={`pad-${i}`} className="aspect-square" />
              ))}
              
              {/* Month days */}
              {monthDays.map(date => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const dayData = getDayData(date);
                const slots = getSlots(dayData);
                const isSelected = selectedDate === dateStr;
                const isClickable = !isWeekend(date) && !dayData.isHoliday;
                
                return (
                  <button
                    key={dateStr}
                    onClick={() => isClickable && handleDayClick(dateStr)}
                    disabled={!isClickable}
                    className={`
                      aspect-square p-1 rounded-lg border text-left transition-all
                      ${DAY_TYPE_COLORS[dayData.dayType]}
                      ${isSelected ? 'ring-2 ring-pks-500 ring-offset-1' : ''}
                      ${isWeekend(date) ? 'bg-slate-50 border-slate-100' : ''}
                      ${dayData.isHoliday ? 'bg-red-50 border-red-200' : ''}
                      ${isClickable ? 'cursor-pointer' : 'cursor-default'}
                    `}
                  >
                    <div className="flex flex-col h-full">
                      <span className={`text-sm font-medium ${
                        isWeekend(date) || dayData.isHoliday ? 'text-slate-400' : ''
                      }`}>
                        {format(date, 'd')}
                      </span>
                      {slots > 0 && (
                        <span className="text-xs text-pks-600 mt-auto">
                          {slots} sl
                        </span>
                      )}
                      {dayData.isHoliday && (
                        <span className="text-[10px] text-red-500 truncate">
                          {dayData.holidayName}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Month stats */}
            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">
                  Tööpäevi: <strong>{monthStats.workingDays}</strong>
                </span>
                <span className="text-slate-600">
                  Slotte kokku: <strong className="text-pks-600">{monthStats.totalSlots}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Day editor */}
        <div className="lg:col-span-1">
          {selectedDate && selectedDayData ? (
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">
                  {format(parseISO(selectedDate), 'd. MMMM yyyy', { locale: et })}
                </h3>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="p-1 rounded hover:bg-slate-100"
                >
                  <XCircle className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Day type selector */}
              <div>
                <label className="form-label">Päeva tüüp</label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {(['FULL', 'HALF', 'OFF'] as DayType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => handleDayTypeChange(type)}
                      className={`
                        p-3 rounded-lg border-2 text-center transition-all
                        ${selectedDayData.dayType === type 
                          ? 'border-pks-500 bg-pks-50' 
                          : 'border-slate-200 hover:border-slate-300'
                        }
                      `}
                    >
                      <div className="flex flex-col items-center gap-1">
                        {type === 'FULL' && <Sun className="w-5 h-5 text-amber-500" />}
                        {type === 'HALF' && <Moon className="w-5 h-5 text-slate-500" />}
                        {type === 'OFF' && <XCircle className="w-5 h-5 text-slate-400" />}
                        <span className="text-xs font-medium">{DAY_TYPE_LABELS[type]}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slots override */}
              {selectedDayData.dayType !== 'OFF' && (
                <div>
                  <label className="form-label">Slottide arv (override)</label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="number"
                      value={selectedDayData.slotsOverride ?? ''}
                      onChange={(e) => handleSlotsOverride(parseInt(e.target.value) || 0)}
                      placeholder={`Vaikimisi: ${selectedDayData.dayType === 'FULL' ? SLOTS_FULL : SLOTS_HALF}`}
                      className="form-input"
                      min="0"
                      max="20"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Jäta tühjaks vaikimisi väärtuse kasutamiseks
                  </p>
                </div>
              )}

              {/* Current slots display */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-slate-600">Slotte sel päeval</p>
                  <p className="text-3xl font-bold text-pks-600 mt-1">
                    {getSlots(selectedDayData)}
                  </p>
                </div>
              </div>

              {/* Clear override */}
              {calendarOverrides[selectedDate] && (
                <button
                  onClick={clearOverride}
                  className="btn-secondary w-full"
                >
                  Eemalda kohandus
                </button>
              )}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">
                Vali kalendrist päev selle muutmiseks
              </p>
            </div>
          )}

          {/* Legend */}
          <div className="card p-5 mt-4">
            <h4 className="font-medium text-slate-900 mb-3">Legend</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-white border border-slate-200" />
                <span>Täispäev ({SLOTS_FULL} slotti)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-amber-50 border border-amber-200" />
                <span>Poolpäev ({SLOTS_HALF} slotti)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-slate-100 border border-slate-200" />
                <span>Vaba / nädalavahetus</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-50 border border-red-200" />
                <span>Riigipüha</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
