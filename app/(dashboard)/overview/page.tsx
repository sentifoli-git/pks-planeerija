'use client';

import { useState } from 'react';
import { 
  Users, 
  Target, 
  Phone, 
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronRight,
  UserX,
  PhoneOff,
  BarChart3
} from 'lucide-react';

type UnitCode = 'PELGULINN' | 'ULEMISTE';
type ViewPeriod = 'day' | 'week' | 'month' | 'ytd';

const UNIT_NAMES: Record<UnitCode, string> = {
  PELGULINN: 'Pelgulinn',
  ULEMISTE: 'Ülemiste',
};

// Tiimide struktuur
interface TeamData {
  name: string;
  lists: ListStats[];
}

interface ListStats {
  id: number;
  label: string;
  chronicTotal: number | null;
  yearTarget: number;
  weeklyTarget: number;
  // Päev
  dayCalls: number;
  dayCallsRefused: number;
  dayVisits: number;
  dayVisitsNoShow: number;
  // Nädal
  weekCalls: number;
  weekCallsRefused: number;
  weekVisits: number;
  weekVisitsNoShow: number;
  // Kuu
  monthCalls: number;
  monthCallsRefused: number;
  monthVisits: number;
  monthVisitsNoShow: number;
  // YTD
  ytdCalls: number;
  ytdCallsRefused: number;
  ytdVisits: number;
  ytdVisitsNoShow: number;
}

interface UnitData {
  totalChronics: number;
  yearTarget: number;
  weeklyTarget: number;
  teams: TeamData[];
  weeksCompleted: number;
  weeksMet: number;
  currentWeekNumber: number;
}

// Mock data
const MOCK_DATA: Record<UnitCode, UnitData> = {
  PELGULINN: {
    totalChronics: 2808,
    yearTarget: 2528,
    weeklyTarget: 57,
    weeksCompleted: 8,
    weeksMet: 6,
    currentWeekNumber: 8,
    teams: [
      {
        name: 'I tiim',
        lists: [
          { id: 1, label: 'dr Lill', chronicTotal: 482, yearTarget: 434, weeklyTarget: 10,
            dayCalls: 3, dayCallsRefused: 1, dayVisits: 2, dayVisitsNoShow: 0,
            weekCalls: 11, weekCallsRefused: 2, weekVisits: 9, weekVisitsNoShow: 1,
            monthCalls: 42, monthCallsRefused: 5, monthVisits: 38, monthVisitsNoShow: 3,
            ytdCalls: 78, ytdCallsRefused: 9, ytdVisits: 72, ytdVisitsNoShow: 5 },
          { id: 2, label: 'dr Abramov', chronicTotal: 387, yearTarget: 349, weeklyTarget: 8,
            dayCalls: 2, dayCallsRefused: 0, dayVisits: 1, dayVisitsNoShow: 1,
            weekCalls: 8, weekCallsRefused: 1, weekVisits: 7, weekVisitsNoShow: 2,
            monthCalls: 33, monthCallsRefused: 3, monthVisits: 30, monthVisitsNoShow: 4,
            ytdCalls: 62, ytdCallsRefused: 6, ytdVisits: 58, ytdVisitsNoShow: 7 },
        ],
      },
      {
        name: 'II tiim',
        lists: [
          { id: 3, label: 'dr Guskova', chronicTotal: 476, yearTarget: 429, weeklyTarget: 10,
            dayCalls: 2, dayCallsRefused: 1, dayVisits: 3, dayVisitsNoShow: 0,
            weekCalls: 10, weekCallsRefused: 2, weekVisits: 8, weekVisitsNoShow: 1,
            monthCalls: 41, monthCallsRefused: 6, monthVisits: 37, monthVisitsNoShow: 4,
            ytdCalls: 75, ytdCallsRefused: 10, ytdVisits: 68, ytdVisitsNoShow: 6 },
          { id: 4, label: 'dr Melan', chronicTotal: 299, yearTarget: 270, weeklyTarget: 6,
            dayCalls: 1, dayCallsRefused: 0, dayVisits: 2, dayVisitsNoShow: 0,
            weekCalls: 6, weekCallsRefused: 1, weekVisits: 5, weekVisitsNoShow: 1,
            monthCalls: 25, monthCallsRefused: 2, monthVisits: 23, monthVisitsNoShow: 2,
            ytdCalls: 48, ytdCallsRefused: 4, ytdVisits: 44, ytdVisitsNoShow: 3 },
        ],
      },
      {
        name: 'III tiim',
        lists: [
          { id: 5, label: 'dr Kõressaar', chronicTotal: 333, yearTarget: 300, weeklyTarget: 7,
            dayCalls: 2, dayCallsRefused: 0, dayVisits: 1, dayVisitsNoShow: 1,
            weekCalls: 7, weekCallsRefused: 1, weekVisits: 6, weekVisitsNoShow: 2,
            monthCalls: 28, monthCallsRefused: 3, monthVisits: 26, monthVisitsNoShow: 3,
            ytdCalls: 54, ytdCallsRefused: 5, ytdVisits: 50, ytdVisitsNoShow: 5 },
          { id: 6, label: 'dr Männik', chronicTotal: 317, yearTarget: 286, weeklyTarget: 7,
            dayCalls: 1, dayCallsRefused: 1, dayVisits: 2, dayVisitsNoShow: 0,
            weekCalls: 7, weekCallsRefused: 2, weekVisits: 6, weekVisitsNoShow: 1,
            monthCalls: 29, monthCallsRefused: 4, monthVisits: 26, monthVisitsNoShow: 2,
            ytdCalls: 53, ytdCallsRefused: 7, ytdVisits: 48, ytdVisitsNoShow: 4 },
        ],
      },
      {
        name: 'IV tiim',
        lists: [
          { id: 7, label: 'dr Pranstibel', chronicTotal: 279, yearTarget: 252, weeklyTarget: 6,
            dayCalls: 1, dayCallsRefused: 0, dayVisits: 1, dayVisitsNoShow: 0,
            weekCalls: 6, weekCallsRefused: 1, weekVisits: 5, weekVisitsNoShow: 1,
            monthCalls: 24, monthCallsRefused: 2, monthVisits: 22, monthVisitsNoShow: 2,
            ytdCalls: 44, ytdCallsRefused: 4, ytdVisits: 40, ytdVisitsNoShow: 3 },
          { id: 8, label: 'dr Einberg', chronicTotal: 235, yearTarget: 212, weeklyTarget: 5,
            dayCalls: 1, dayCallsRefused: 0, dayVisits: 1, dayVisitsNoShow: 0,
            weekCalls: 5, weekCallsRefused: 0, weekVisits: 4, weekVisitsNoShow: 0,
            monthCalls: 20, monthCallsRefused: 1, monthVisits: 19, monthVisitsNoShow: 1,
            ytdCalls: 38, ytdCallsRefused: 2, ytdVisits: 35, ytdVisitsNoShow: 2 },
        ],
      },
    ],
  },
  ULEMISTE: {
    totalChronics: 0,
    yearTarget: 0,
    weeklyTarget: 0,
    weeksCompleted: 0,
    weeksMet: 0,
    currentWeekNumber: 8,
    teams: [
      {
        name: 'Nimistud',
        lists: [
          { id: 9, label: 'dr Vessel', chronicTotal: null, yearTarget: 0, weeklyTarget: 0,
            dayCalls: 0, dayCallsRefused: 0, dayVisits: 0, dayVisitsNoShow: 0,
            weekCalls: 0, weekCallsRefused: 0, weekVisits: 0, weekVisitsNoShow: 0,
            monthCalls: 0, monthCallsRefused: 0, monthVisits: 0, monthVisitsNoShow: 0,
            ytdCalls: 0, ytdCallsRefused: 0, ytdVisits: 0, ytdVisitsNoShow: 0 },
          { id: 10, label: 'dr Gretšenko', chronicTotal: null, yearTarget: 0, weeklyTarget: 0,
            dayCalls: 0, dayCallsRefused: 0, dayVisits: 0, dayVisitsNoShow: 0,
            weekCalls: 0, weekCallsRefused: 0, weekVisits: 0, weekVisitsNoShow: 0,
            monthCalls: 0, monthCallsRefused: 0, monthVisits: 0, monthVisitsNoShow: 0,
            ytdCalls: 0, ytdCallsRefused: 0, ytdVisits: 0, ytdVisitsNoShow: 0 },
          { id: 11, label: 'dr Kolts', chronicTotal: null, yearTarget: 0, weeklyTarget: 0,
            dayCalls: 0, dayCallsRefused: 0, dayVisits: 0, dayVisitsNoShow: 0,
            weekCalls: 0, weekCallsRefused: 0, weekVisits: 0, weekVisitsNoShow: 0,
            monthCalls: 0, monthCallsRefused: 0, monthVisits: 0, monthVisitsNoShow: 0,
            ytdCalls: 0, ytdCallsRefused: 0, ytdVisits: 0, ytdVisitsNoShow: 0 },
          { id: 12, label: 'dr Lindström', chronicTotal: null, yearTarget: 0, weeklyTarget: 0,
            dayCalls: 0, dayCallsRefused: 0, dayVisits: 0, dayVisitsNoShow: 0,
            weekCalls: 0, weekCallsRefused: 0, weekVisits: 0, weekVisitsNoShow: 0,
            monthCalls: 0, monthCallsRefused: 0, monthVisits: 0, monthVisitsNoShow: 0,
            ytdCalls: 0, ytdCallsRefused: 0, ytdVisits: 0, ytdVisitsNoShow: 0 },
        ],
      },
    ],
  },
};

// Helper: summeeri kõik list stats perioodi kaupa
function getListPeriodData(list: ListStats, period: ViewPeriod) {
  switch (period) {
    case 'day': return { calls: list.dayCalls, callsRefused: list.dayCallsRefused, visits: list.dayVisits, visitsNoShow: list.dayVisitsNoShow };
    case 'week': return { calls: list.weekCalls, callsRefused: list.weekCallsRefused, visits: list.weekVisits, visitsNoShow: list.weekVisitsNoShow };
    case 'month': return { calls: list.monthCalls, callsRefused: list.monthCallsRefused, visits: list.monthVisits, visitsNoShow: list.monthVisitsNoShow };
    case 'ytd': return { calls: list.ytdCalls, callsRefused: list.ytdCallsRefused, visits: list.ytdVisits, visitsNoShow: list.ytdVisitsNoShow };
  }
}

function getTeamPeriodTotals(team: TeamData, period: ViewPeriod) {
  return team.lists.reduce((acc, list) => {
    const d = getListPeriodData(list, period);
    return {
      calls: acc.calls + d.calls,
      callsRefused: acc.callsRefused + d.callsRefused,
      visits: acc.visits + d.visits,
      visitsNoShow: acc.visitsNoShow + d.visitsNoShow,
      chronicTotal: acc.chronicTotal + (list.chronicTotal || 0),
      yearTarget: acc.yearTarget + list.yearTarget,
      weeklyTarget: acc.weeklyTarget + list.weeklyTarget,
    };
  }, { calls: 0, callsRefused: 0, visits: 0, visitsNoShow: 0, chronicTotal: 0, yearTarget: 0, weeklyTarget: 0 });
}

function getUnitPeriodTotals(data: UnitData, period: ViewPeriod) {
  return data.teams.reduce((acc, team) => {
    const t = getTeamPeriodTotals(team, period);
    return {
      calls: acc.calls + t.calls,
      callsRefused: acc.callsRefused + t.callsRefused,
      visits: acc.visits + t.visits,
      visitsNoShow: acc.visitsNoShow + t.visitsNoShow,
    };
  }, { calls: 0, callsRefused: 0, visits: 0, visitsNoShow: 0 });
}

function getPeriodTarget(data: UnitData, period: ViewPeriod): number {
  switch (period) {
    case 'day': return Math.ceil(data.weeklyTarget / 5);
    case 'week': return data.weeklyTarget;
    case 'month': return data.weeklyTarget * 4;
    case 'ytd': return data.weeklyTarget * data.weeksCompleted;
  }
}

const PERIOD_LABELS: Record<ViewPeriod, string> = {
  day: 'Täna',
  week: 'Jooksev nädal',
  month: 'Jooksev kuu',
  ytd: 'Aasta algusest (YTD)',
};

// ============ Komponendid ============

function ProgressBar({ value, max }: { value: number; max: number }) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const isOnTrack = percentage >= 100;
  
  return (
    <div className="w-full">
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${
            isOnTrack ? 'bg-emerald-500' : percentage >= 80 ? 'bg-amber-500' : 'bg-red-400'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function MiniStat({ label, value, icon: Icon, color = 'text-slate-600' }: { label: string; value: number; icon: any; color?: string }) {
  if (value === 0) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${color}`}>
      <Icon className="w-3 h-3" />
      {value} {label}
    </span>
  );
}

function TeamSection({ team, period, isExpanded, onToggle }: { team: TeamData; period: ViewPeriod; isExpanded: boolean; onToggle: () => void }) {
  const totals = getTeamPeriodTotals(team, period);
  const callsPct = totals.weeklyTarget > 0 ? Math.round((totals.calls / (period === 'week' ? totals.weeklyTarget : totals.yearTarget)) * 100) : 0;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* Team header */}
      <button 
        onClick={onToggle}
        className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between transition-colors"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          <span className="font-semibold text-slate-900">{team.name}</span>
          <span className="text-xs text-slate-500">({team.lists.length} nimistut · {totals.chronicTotal} kroonikut)</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-blue-500" />
            <span className="font-medium">{totals.calls}</span>
            {totals.callsRefused > 0 && <span className="text-red-400 text-xs">(+{totals.callsRefused} keeld.)</span>}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-medium">{totals.visits}</span>
            {totals.visitsNoShow > 0 && <span className="text-amber-500 text-xs">(+{totals.visitsNoShow} ei tulnud)</span>}
          </span>
        </div>
      </button>

      {/* List details */}
      {isExpanded && (
        <div className="divide-y divide-slate-100">
          {team.lists.map(list => {
            const d = getListPeriodData(list, period);
            const target = period === 'week' ? list.weeklyTarget : period === 'day' ? Math.ceil(list.weeklyTarget / 5) : period === 'month' ? list.weeklyTarget * 4 : list.yearTarget;
            const callsPct = target > 0 ? Math.min((d.calls / target) * 100, 100) : 0;
            const visitsPct = target > 0 ? Math.min((d.visits / target) * 100, 100) : 0;

            return (
              <div key={list.id} className="px-4 py-3 hover:bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium text-slate-900">{list.label}</span>
                    <span className="text-xs text-slate-400 ml-2">
                      {list.chronicTotal || '–'} kroon. · siht {target}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {(callsPct >= 100 && visitsPct >= 100) ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <span className="text-xs text-slate-500">{Math.round(Math.min(callsPct, visitsPct))}%</span>
                    )}
                  </div>
                </div>
                
                {/* Kutsed */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Kutsed
                      </span>
                      <span className="text-xs font-medium">{d.calls}/{target}</span>
                    </div>
                    <ProgressBar value={d.calls} max={target} />
                    {d.callsRefused > 0 && (
                      <MiniStat label="keeldus" value={d.callsRefused} icon={PhoneOff} color="text-red-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Visiidid
                      </span>
                      <span className="text-xs font-medium">{d.visits}/{target}</span>
                    </div>
                    <ProgressBar value={d.visits} max={target} />
                    {d.visitsNoShow > 0 && (
                      <MiniStat label="ei tulnud" value={d.visitsNoShow} icon={UserX} color="text-amber-500" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function UnitOverview({ unit, data }: { unit: UnitCode; data: UnitData }) {
  const [period, setPeriod] = useState<ViewPeriod>('week');
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set(data.teams.map(t => t.name)));

  const hasData = data.totalChronics > 0;
  const totals = getUnitPeriodTotals(data, period);
  const target = getPeriodTarget(data, period);
  const callsPct = target > 0 ? (totals.calls / target) * 100 : 0;
  const visitsPct = target > 0 ? (totals.visits / target) * 100 : 0;

  const ytdTotals = getUnitPeriodTotals(data, 'ytd');
  const ytdTarget = getPeriodTarget(data, 'ytd');
  const ytdCallsPct = ytdTarget > 0 ? (ytdTotals.calls / ytdTarget) * 100 : 0;
  const ytdVisitsPct = ytdTarget > 0 ? (ytdTotals.visits / ytdTarget) * 100 : 0;

  const toggleTeam = (teamName: string) => {
    setExpandedTeams(prev => {
      const next = new Set(prev);
      if (next.has(teamName)) next.delete(teamName);
      else next.add(teamName);
      return next;
    });
  };

  if (!hasData && unit === 'ULEMISTE') {
    return (
      <div className="card p-8 text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900">{UNIT_NAMES[unit]}</h3>
        <p className="text-slate-600 mt-2">
          Kroonikute arvud on sisestamata. Palun täpsustage nimistute andmed.
        </p>
        <a href="/lists" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
          Mine nimistute lehele
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Unit header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">{UNIT_NAMES[unit]}</h2>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          ytdCallsPct >= 100 && ytdVisitsPct >= 100 ? 'bg-emerald-100 text-emerald-700' : 
          ytdCallsPct >= 80 && ytdVisitsPct >= 80 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
        }`}>
          {ytdCallsPct >= 100 && ytdVisitsPct >= 100 ? 'Graafikus' : 
           ytdCallsPct >= 80 && ytdVisitsPct >= 80 ? 'Vajab tähelepanu' : 'Mahajäämuses'}
        </span>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs">Kroonikuid</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{data.totalChronics.toLocaleString()}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Target className="w-4 h-4" />
            <span className="text-xs">Aasta siht (90%)</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{data.yearTarget.toLocaleString()}</p>
          <p className="text-xs text-slate-500">~{data.weeklyTarget}/näd</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Phone className="w-4 h-4" />
            <span className="text-xs">Kutsed YTD</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{ytdTotals.calls}</p>
          <p className="text-xs text-slate-500">siht {ytdTarget} · {Math.round(ytdCallsPct)}%</p>
          {ytdTotals.callsRefused > 0 && (
            <p className="text-xs text-red-400 mt-1">{ytdTotals.callsRefused} keeldunud</p>
          )}
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">Visiidid YTD</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{ytdTotals.visits}</p>
          <p className="text-xs text-slate-500">siht {ytdTarget} · {Math.round(ytdVisitsPct)}%</p>
          {ytdTotals.visitsNoShow > 0 && (
            <p className="text-xs text-amber-500 mt-1">{ytdTotals.visitsNoShow} ei tulnud</p>
          )}
        </div>
      </div>

      {/* YTD progress */}
      <div className="card p-5">
        <h3 className="font-semibold text-slate-900 mb-4">Aasta edenemine</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1.5 text-sm">
              <span className="text-slate-600">Kutsed</span>
              <span className="font-medium">{ytdTotals.calls} / {ytdTarget} ({Math.round(ytdCallsPct)}%)</span>
            </div>
            <ProgressBar value={ytdTotals.calls} max={ytdTarget} />
          </div>
          <div>
            <div className="flex justify-between mb-1.5 text-sm">
              <span className="text-slate-600">Visiidid</span>
              <span className="font-medium">{ytdTotals.visits} / {ytdTarget} ({Math.round(ytdVisitsPct)}%)</span>
            </div>
            <ProgressBar value={ytdTotals.visits} max={ytdTarget} />
          </div>
        </div>
      </div>

      {/* Period selector + details */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Edenemine periooditi
          </h3>
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            {(['day', 'week', 'month', 'ytd'] as ViewPeriod[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  period === p ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {p === 'day' ? 'Päev' : p === 'week' ? 'Nädal' : p === 'month' ? 'Kuu' : 'YTD'}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-4">{PERIOD_LABELS[period]}</p>

        {/* Period summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <Phone className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-slate-900">{totals.calls}</p>
            <p className="text-xs text-slate-500">kutseid (siht {target})</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <PhoneOff className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-red-600">{totals.callsRefused}</p>
            <p className="text-xs text-slate-500">keeldunud</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3 text-center">
            <Calendar className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-slate-900">{totals.visits}</p>
            <p className="text-xs text-slate-500">visiite (siht {target})</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-center">
            <UserX className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-amber-600">{totals.visitsNoShow}</p>
            <p className="text-xs text-slate-500">ei ilmunud</p>
          </div>
        </div>

        {/* Teams */}
        <div className="space-y-3">
          {data.teams.map(team => (
            <TeamSection
              key={team.name}
              team={team}
              period={period}
              isExpanded={expandedTeams.has(team.name)}
              onToggle={() => toggleTeam(team.name)}
            />
          ))}
        </div>
      </div>

      {/* Weeks summary */}
      <div className="card p-5">
        <h3 className="font-semibold text-slate-900 mb-4">Nädalate kokkuvõte</h3>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span className="text-sm text-slate-600">Täidetud:</span>
            <span className="font-bold text-slate-900">{data.weeksMet}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            <span className="text-sm text-slate-600">Kokku:</span>
            <span className="font-bold text-slate-900">{data.weeksCompleted}</span>
          </div>
          <span className="text-sm text-slate-500">Nädal {data.currentWeekNumber}/45</span>
        </div>
        <div className="mt-3">
          <ProgressBar value={data.weeksMet} max={data.weeksCompleted} />
        </div>
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const [activeUnit, setActiveUnit] = useState<UnitCode>('PELGULINN');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ülevaade</h1>
        <p className="text-slate-600 mt-1">
          PKS 2026 periood: 01.02 – 13.12.2026
        </p>
      </div>

      {/* Unit tabs */}
      <div className="flex gap-2">
        {(['PELGULINN', 'ULEMISTE'] as UnitCode[]).map(unit => (
          <button
            key={unit}
            onClick={() => setActiveUnit(unit)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeUnit === unit 
                ? 'bg-emerald-600 text-white' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {UNIT_NAMES[unit]}
          </button>
        ))}
      </div>

      <UnitOverview unit={activeUnit} data={MOCK_DATA[activeUnit]} />
    </div>
  );
}
