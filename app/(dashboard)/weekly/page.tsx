'use client';

import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Save,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Calendar,
  Lock,
  Unlock,
  PhoneOff,
  UserX
} from 'lucide-react';
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek, getISOWeek } from 'date-fns';
import { et } from 'date-fns/locale';

type UnitCode = 'PELGULINN' | 'ULEMISTE';
type ConfirmationStatus = 'PENDING' | 'MET' | 'NOT_MET';

interface ListEntry {
  listId: number;
  label: string;
  teamName: string;
  targetCalls: number;
  targetVisits: number;
  // Kutsed per päev
  callsMon: number; callsTue: number; callsWed: number; callsThu: number; callsFri: number;
  // Keeldujad per päev
  refusedMon: number; refusedTue: number; refusedWed: number; refusedThu: number; refusedFri: number;
  // Visiidid per päev
  visitsMon: number; visitsTue: number; visitsWed: number; visitsThu: number; visitsFri: number;
  // Mitteilmujad per päev
  noShowMon: number; noShowTue: number; noShowWed: number; noShowThu: number; noShowFri: number;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;
const DAY_LABELS = { Mon: 'E', Tue: 'T', Wed: 'K', Thu: 'N', Fri: 'R' };

// Mock data - Pelgulinn with teams
const MOCK_LISTS: ListEntry[] = [
  { listId: 1, label: 'dr Lill', teamName: 'I tiim', targetCalls: 10, targetVisits: 10,
    callsMon: 3, callsTue: 2, callsWed: 1, callsThu: 2, callsFri: 3,
    refusedMon: 1, refusedTue: 0, refusedWed: 0, refusedThu: 0, refusedFri: 1,
    visitsMon: 2, visitsTue: 2, visitsWed: 1, visitsThu: 2, visitsFri: 2,
    noShowMon: 0, noShowTue: 1, noShowWed: 0, noShowThu: 0, noShowFri: 0 },
  { listId: 2, label: 'dr Abramov', teamName: 'I tiim', targetCalls: 8, targetVisits: 8,
    callsMon: 2, callsTue: 1, callsWed: 2, callsThu: 1, callsFri: 2,
    refusedMon: 0, refusedTue: 1, refusedWed: 0, refusedThu: 0, refusedFri: 0,
    visitsMon: 1, visitsTue: 2, visitsWed: 1, visitsThu: 2, visitsFri: 2,
    noShowMon: 1, noShowTue: 0, noShowWed: 1, noShowThu: 0, noShowFri: 0 },
  { listId: 3, label: 'dr Guskova', teamName: 'II tiim', targetCalls: 10, targetVisits: 10,
    callsMon: 2, callsTue: 2, callsWed: 2, callsThu: 2, callsFri: 2,
    refusedMon: 1, refusedTue: 0, refusedWed: 1, refusedThu: 0, refusedFri: 0,
    visitsMon: 2, visitsTue: 1, visitsWed: 2, visitsThu: 2, visitsFri: 1,
    noShowMon: 0, noShowTue: 0, noShowWed: 1, noShowThu: 0, noShowFri: 0 },
  { listId: 4, label: 'dr Melan', teamName: 'II tiim', targetCalls: 6, targetVisits: 6,
    callsMon: 1, callsTue: 1, callsWed: 1, callsThu: 1, callsFri: 2,
    refusedMon: 0, refusedTue: 0, refusedWed: 1, refusedThu: 0, refusedFri: 0,
    visitsMon: 1, visitsTue: 1, visitsWed: 1, visitsThu: 1, visitsFri: 2,
    noShowMon: 0, noShowTue: 1, noShowWed: 0, noShowThu: 0, noShowFri: 0 },
  { listId: 5, label: 'dr Kõressaar', teamName: 'III tiim', targetCalls: 7, targetVisits: 7,
    callsMon: 1, callsTue: 2, callsWed: 1, callsThu: 1, callsFri: 2,
    refusedMon: 0, refusedTue: 0, refusedWed: 1, refusedThu: 0, refusedFri: 0,
    visitsMon: 1, visitsTue: 1, visitsWed: 2, visitsThu: 1, visitsFri: 2,
    noShowMon: 1, noShowTue: 0, noShowWed: 0, noShowThu: 1, noShowFri: 0 },
  { listId: 6, label: 'dr Männik', teamName: 'III tiim', targetCalls: 7, targetVisits: 7,
    callsMon: 2, callsTue: 1, callsWed: 1, callsThu: 2, callsFri: 1,
    refusedMon: 1, refusedTue: 0, refusedWed: 0, refusedThu: 1, refusedFri: 0,
    visitsMon: 1, visitsTue: 2, visitsWed: 1, visitsThu: 1, visitsFri: 2,
    noShowMon: 0, noShowTue: 0, noShowWed: 0, noShowThu: 1, noShowFri: 0 },
  { listId: 7, label: 'dr Pranstibel', teamName: 'IV tiim', targetCalls: 6, targetVisits: 6,
    callsMon: 1, callsTue: 1, callsWed: 1, callsThu: 1, callsFri: 2,
    refusedMon: 0, refusedTue: 1, refusedWed: 0, refusedThu: 0, refusedFri: 0,
    visitsMon: 1, visitsTue: 1, visitsWed: 1, visitsThu: 1, visitsFri: 2,
    noShowMon: 0, noShowTue: 0, noShowWed: 1, noShowThu: 0, noShowFri: 0 },
  { listId: 8, label: 'dr Einberg', teamName: 'IV tiim', targetCalls: 5, targetVisits: 5,
    callsMon: 1, callsTue: 1, callsWed: 1, callsThu: 1, callsFri: 1,
    refusedMon: 0, refusedTue: 0, refusedWed: 0, refusedThu: 0, refusedFri: 0,
    visitsMon: 1, visitsTue: 1, visitsWed: 1, visitsThu: 1, visitsFri: 1,
    noShowMon: 0, noShowTue: 0, noShowWed: 0, noShowThu: 0, noShowFri: 0 },
];

type DayField = `${'calls' | 'refused' | 'visits' | 'noShow'}${'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'}`;

export default function WeeklyPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date(2026, 2, 2);
    return startOfWeek(now, { weekStartsOn: 1 });
  });
  const [lists, setLists] = useState<ListEntry[]>(MOCK_LISTS);
  const [status, setStatus] = useState<ConfirmationStatus>('PENDING');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'calls' | 'visits'>('calls');

  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const weekNumber = getISOWeek(currentWeekStart);
  const isLocked = status !== 'PENDING';

  const goToPreviousWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const goToNextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));

  const updateEntry = (listId: number, field: DayField, value: number) => {
    if (isLocked) return;
    setLists(prev => prev.map(list => 
      list.listId === listId ? { ...list, [field]: Math.max(0, value) } : list
    ));
  };

  // Totals helpers
  const getTotalCalls = (l: ListEntry) => l.callsMon + l.callsTue + l.callsWed + l.callsThu + l.callsFri;
  const getTotalRefused = (l: ListEntry) => l.refusedMon + l.refusedTue + l.refusedWed + l.refusedThu + l.refusedFri;
  const getTotalVisits = (l: ListEntry) => l.visitsMon + l.visitsTue + l.visitsWed + l.visitsThu + l.visitsFri;
  const getTotalNoShow = (l: ListEntry) => l.noShowMon + l.noShowTue + l.noShowWed + l.noShowThu + l.noShowFri;

  const grandTotals = {
    calls: lists.reduce((s, l) => s + getTotalCalls(l), 0),
    refused: lists.reduce((s, l) => s + getTotalRefused(l), 0),
    visits: lists.reduce((s, l) => s + getTotalVisits(l), 0),
    noShow: lists.reduce((s, l) => s + getTotalNoShow(l), 0),
    targetCalls: lists.reduce((s, l) => s + l.targetCalls, 0),
    targetVisits: lists.reduce((s, l) => s + l.targetVisits, 0),
  };

  const callsMet = grandTotals.calls >= grandTotals.targetCalls;
  const visitsMet = grandTotals.visits >= grandTotals.targetVisits;
  const callsPct = grandTotals.targetCalls > 0 ? (grandTotals.calls / grandTotals.targetCalls) * 100 : 0;
  const visitsPct = grandTotals.targetVisits > 0 ? (grandTotals.visits / grandTotals.targetVisits) * 100 : 0;

  // Group by team
  const teams = Array.from(new Set(lists.map(l => l.teamName)));

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setSaving(false);
  };

  const handleConfirm = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setStatus(callsMet && visitsMet ? 'MET' : 'NOT_MET');
    setSaving(false);
  };

  const handleUnlock = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setStatus('PENDING');
    setSaving(false);
  };

  const renderInputCell = (list: ListEntry, prefix: string, day: string) => {
    const field = `${prefix}${day}` as DayField;
    const val = list[field as keyof ListEntry] as number;
    return (
      <td key={`${prefix}-${day}`} className="px-0.5 py-1 border-l border-slate-100">
        <input
          type="number"
          min="0"
          value={val}
          onChange={(e) => updateEntry(list.listId, field, parseInt(e.target.value) || 0)}
          disabled={isLocked}
          className="w-10 px-1 py-1 text-center text-sm rounded border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-400"
        />
      </td>
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nädala sisestus</h1>
        <p className="text-slate-600 mt-1">Kutsed, visiidid, keeldujad ja mitteilmujad</p>
      </div>

      {/* Week navigation */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <button onClick={goToPreviousWeek} className="p-2 rounded-lg hover:bg-slate-100">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-slate-900">Nädal {weekNumber}</h2>
            <p className="text-sm text-slate-600">
              {format(currentWeekStart, 'd. MMM', { locale: et })} – {format(weekEnd, 'd. MMM yyyy', { locale: et })}
            </p>
          </div>
          <button onClick={goToNextWeek} className="p-2 rounded-lg hover:bg-slate-100">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="flex justify-center mt-3">
          {status === 'PENDING' && <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700"><Unlock className="w-3 h-3" /> Sisestamine pooleli</span>}
          {status === 'MET' && <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700"><CheckCircle className="w-3 h-3" /> TÄIDETUD</span>}
          {status === 'NOT_MET' && <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"><XCircle className="w-3 h-3" /> TÄITMATA</span>}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-3">
          <div className="flex items-center gap-2 mb-1">
            <Phone className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-slate-500">Kutsed</span>
          </div>
          <p className="text-xl font-bold">{grandTotals.calls} <span className="text-sm font-normal text-slate-400">/ {grandTotals.targetCalls}</span></p>
          <div className="h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
            <div className={`h-full rounded-full ${callsMet ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(callsPct, 100)}%` }} />
          </div>
        </div>
        <div className="card p-3">
          <div className="flex items-center gap-2 mb-1">
            <PhoneOff className="w-4 h-4 text-red-400" />
            <span className="text-xs text-slate-500">Keeldunud</span>
          </div>
          <p className="text-xl font-bold text-red-600">{grandTotals.refused}</p>
        </div>
        <div className="card p-3">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-slate-500">Visiidid</span>
          </div>
          <p className="text-xl font-bold">{grandTotals.visits} <span className="text-sm font-normal text-slate-400">/ {grandTotals.targetVisits}</span></p>
          <div className="h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
            <div className={`h-full rounded-full ${visitsMet ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(visitsPct, 100)}%` }} />
          </div>
        </div>
        <div className="card p-3">
          <div className="flex items-center gap-2 mb-1">
            <UserX className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-slate-500">Ei ilmunud</span>
          </div>
          <p className="text-xl font-bold text-amber-600">{grandTotals.noShow}</p>
        </div>
      </div>

      {/* Tab: Kutsed / Visiidid */}
      <div className="flex bg-slate-100 rounded-lg p-0.5 w-fit">
        <button
          onClick={() => setActiveTab('calls')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
            activeTab === 'calls' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Phone className="w-4 h-4" /> Kutsed + keeldujad
        </button>
        <button
          onClick={() => setActiveTab('visits')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
            activeTab === 'visits' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Calendar className="w-4 h-4" /> Visiidid + mitteilmujad
        </button>
      </div>

      {/* Data table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-3 py-2 text-left font-medium text-slate-600 sticky left-0 bg-slate-50 z-10" rowSpan={2}>Nimistu</th>
                <th className="px-2 py-2 text-center font-medium text-slate-600 border-l border-slate-200" colSpan={6}>
                  {activeTab === 'calls' ? (
                    <span className="flex items-center justify-center gap-1"><Phone className="w-3.5 h-3.5" /> Kutsed</span>
                  ) : (
                    <span className="flex items-center justify-center gap-1"><Calendar className="w-3.5 h-3.5" /> Visiidid</span>
                  )}
                </th>
                <th className="px-2 py-2 text-center font-medium text-slate-600 border-l border-slate-200" colSpan={6}>
                  {activeTab === 'calls' ? (
                    <span className="flex items-center justify-center gap-1 text-red-500"><PhoneOff className="w-3.5 h-3.5" /> Keeldujad</span>
                  ) : (
                    <span className="flex items-center justify-center gap-1 text-amber-500"><UserX className="w-3.5 h-3.5" /> Ei ilmunud</span>
                  )}
                </th>
              </tr>
              <tr className="bg-slate-50 border-b border-slate-200">
                {DAYS.map(d => <th key={`m-${d}`} className="px-1 py-1.5 text-center font-medium text-slate-500 text-xs border-l border-slate-100">{DAY_LABELS[d]}</th>)}
                <th className="px-2 py-1.5 text-center font-medium text-slate-600 text-xs border-l border-slate-200">Σ</th>
                {DAYS.map(d => <th key={`s-${d}`} className="px-1 py-1.5 text-center font-medium text-slate-500 text-xs border-l border-slate-100">{DAY_LABELS[d]}</th>)}
                <th className="px-2 py-1.5 text-center font-medium text-slate-600 text-xs border-l border-slate-200">Σ</th>
              </tr>
            </thead>
            <tbody>
              {teams.map(teamName => {
                const teamLists = lists.filter(l => l.teamName === teamName);
                const prefix1 = activeTab === 'calls' ? 'calls' : 'visits';
                const prefix2 = activeTab === 'calls' ? 'refused' : 'noShow';
                const getTotal1 = activeTab === 'calls' ? getTotalCalls : getTotalVisits;
                const getTotal2 = activeTab === 'calls' ? getTotalRefused : getTotalNoShow;
                const getTarget = activeTab === 'calls' ? (l: ListEntry) => l.targetCalls : (l: ListEntry) => l.targetVisits;

                const teamTotal1 = teamLists.reduce((s, l) => s + getTotal1(l), 0);
                const teamTotal2 = teamLists.reduce((s, l) => s + getTotal2(l), 0);
                const teamTarget = teamLists.reduce((s, l) => s + getTarget(l), 0);

                return (
                  <React.Fragment key={teamName}>
                    {/* Team header row */}
                    <tr className="bg-slate-100">
                      <td colSpan={13} className="px-3 py-1.5 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                        {teamName}
                      </td>
                    </tr>
                    {teamLists.map((list, idx) => {
                      const total1 = getTotal1(list);
                      const total2 = getTotal2(list);
                      const target = getTarget(list);
                      const isOk = total1 >= target;

                      return (
                        <tr key={list.listId} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                          <td className="px-3 py-1.5 font-medium text-slate-900 sticky left-0 bg-inherit z-10">
                            {list.label}
                            <span className="text-xs text-slate-400 ml-1">({target})</span>
                          </td>
                          {DAYS.map(d => renderInputCell(list, prefix1, d))}
                          <td className={`px-2 py-1.5 text-center font-semibold border-l border-slate-200 ${isOk ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {total1}
                          </td>
                          {DAYS.map(d => renderInputCell(list, prefix2, d))}
                          <td className={`px-2 py-1.5 text-center font-semibold border-l border-slate-200 ${total2 > 0 ? (activeTab === 'calls' ? 'text-red-500' : 'text-amber-500') : 'text-slate-400'}`}>
                            {total2}
                          </td>
                        </tr>
                      );
                    })}
                    {/* Team subtotal */}
                    <tr className="bg-slate-100/80 border-t border-slate-200">
                      <td className="px-3 py-1.5 text-xs font-semibold text-slate-600 sticky left-0 bg-slate-100/80 z-10">{teamName} kokku</td>
                      {DAYS.map(d => {
                        const val = teamLists.reduce((s, l) => s + (l[`${prefix1}${d}` as keyof ListEntry] as number), 0);
                        return <td key={d} className="px-1 py-1.5 text-center text-xs font-medium text-slate-600 border-l border-slate-100">{val}</td>;
                      })}
                      <td className={`px-2 py-1.5 text-center text-xs font-bold border-l border-slate-200 ${teamTotal1 >= teamTarget ? 'text-emerald-600' : 'text-amber-600'}`}>{teamTotal1}</td>
                      {DAYS.map(d => {
                        const val = teamLists.reduce((s, l) => s + (l[`${prefix2}${d}` as keyof ListEntry] as number), 0);
                        return <td key={d} className="px-1 py-1.5 text-center text-xs font-medium text-slate-500 border-l border-slate-100">{val}</td>;
                      })}
                      <td className={`px-2 py-1.5 text-center text-xs font-bold border-l border-slate-200 ${teamTotal2 > 0 ? (activeTab === 'calls' ? 'text-red-500' : 'text-amber-500') : 'text-slate-400'}`}>{teamTotal2}</td>
                    </tr>
                  </React.Fragment>
                );
              })}

              {/* Grand total */}
              <tr className="bg-emerald-50 border-t-2 border-emerald-200 font-bold">
                <td className="px-3 py-2.5 text-slate-900 sticky left-0 bg-emerald-50 z-10">KOKKU</td>
                {DAYS.map(d => {
                  const prefix = activeTab === 'calls' ? 'calls' : 'visits';
                  const val = lists.reduce((s, l) => s + (l[`${prefix}${d}` as keyof ListEntry] as number), 0);
                  return <td key={d} className="px-1 py-2.5 text-center text-slate-700 border-l border-emerald-100">{val}</td>;
                })}
                <td className={`px-2 py-2.5 text-center border-l border-emerald-200 ${
                  activeTab === 'calls' ? (callsMet ? 'text-emerald-600' : 'text-amber-600') : (visitsMet ? 'text-emerald-600' : 'text-amber-600')
                }`}>
                  {activeTab === 'calls' ? grandTotals.calls : grandTotals.visits}
                </td>
                {DAYS.map(d => {
                  const prefix = activeTab === 'calls' ? 'refused' : 'noShow';
                  const val = lists.reduce((s, l) => s + (l[`${prefix}${d}` as keyof ListEntry] as number), 0);
                  return <td key={d} className="px-1 py-2.5 text-center text-slate-500 border-l border-emerald-100">{val}</td>;
                })}
                <td className={`px-2 py-2.5 text-center border-l border-emerald-200 ${
                  activeTab === 'calls' ? 'text-red-500' : 'text-amber-500'
                }`}>
                  {activeTab === 'calls' ? grandTotals.refused : grandTotals.noShow}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">
          {isLocked ? (
            <span className="flex items-center gap-1"><Lock className="w-4 h-4" /> Nädal on kinnitatud</span>
          ) : (
            <span>Salvesta muudatused enne kinnitamist</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isLocked ? (
            <button onClick={handleUnlock} disabled={saving} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-2">
              <Unlock className="w-4 h-4" /> Ava muutmiseks
            </button>
          ) : (
            <>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                <Save className="w-4 h-4" /> Salvesta
              </button>
              <button onClick={handleConfirm} disabled={saving} className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Kinnita nädal
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
