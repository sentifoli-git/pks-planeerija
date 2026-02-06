'use client';

import React, { useState } from 'react';

import { Users, Edit2, Save, X, AlertTriangle, CheckCircle, Calculator } from 'lucide-react';

type UnitCode = 'PELGULINN' | 'ULEMISTE';

interface ListItem {
  id: number;
  unit: UnitCode;
  teamName: string | null;
  label: string;
  chronicTotal: number | null;
  needsReview: boolean;
  yearTarget: number;
  weeklyTarget: number;
}

const INITIAL_LISTS: ListItem[] = [
  { id: 1, unit: 'PELGULINN', teamName: 'I tiim', label: 'dr Lill', chronicTotal: 482, needsReview: false, yearTarget: 434, weeklyTarget: 10 },
  { id: 2, unit: 'PELGULINN', teamName: 'I tiim', label: 'dr Abramov', chronicTotal: 387, needsReview: false, yearTarget: 349, weeklyTarget: 8 },
  { id: 3, unit: 'PELGULINN', teamName: 'II tiim', label: 'dr Guskova', chronicTotal: 476, needsReview: false, yearTarget: 429, weeklyTarget: 10 },
  { id: 4, unit: 'PELGULINN', teamName: 'II tiim', label: 'dr Melan', chronicTotal: 299, needsReview: false, yearTarget: 270, weeklyTarget: 6 },
  { id: 5, unit: 'PELGULINN', teamName: 'III tiim', label: 'dr Kõressaar', chronicTotal: 333, needsReview: false, yearTarget: 300, weeklyTarget: 7 },
  { id: 6, unit: 'PELGULINN', teamName: 'III tiim', label: 'dr Männik', chronicTotal: 317, needsReview: false, yearTarget: 286, weeklyTarget: 7 },
  { id: 7, unit: 'PELGULINN', teamName: 'IV tiim', label: 'dr Pranstibel', chronicTotal: 279, needsReview: false, yearTarget: 252, weeklyTarget: 6 },
  { id: 8, unit: 'PELGULINN', teamName: 'IV tiim', label: 'dr Einberg', chronicTotal: 235, needsReview: false, yearTarget: 212, weeklyTarget: 5 },
  { id: 9, unit: 'ULEMISTE', teamName: null, label: 'dr Vessel', chronicTotal: null, needsReview: true, yearTarget: 0, weeklyTarget: 0 },
  { id: 10, unit: 'ULEMISTE', teamName: null, label: 'dr Gretšenko', chronicTotal: null, needsReview: true, yearTarget: 0, weeklyTarget: 0 },
  { id: 11, unit: 'ULEMISTE', teamName: null, label: 'dr Kolts', chronicTotal: null, needsReview: true, yearTarget: 0, weeklyTarget: 0 },
  { id: 12, unit: 'ULEMISTE', teamName: null, label: 'dr Lindström', chronicTotal: null, needsReview: true, yearTarget: 0, weeklyTarget: 0 },
];

const UNIT_NAMES: Record<UnitCode, string> = { PELGULINN: 'Pelgulinn', ULEMISTE: 'Ülemiste' };
const TARGET_PCT = 0.90;
const TOTAL_WEEKS = 45;

function calcTargets(ct: number | null) {
  if (!ct) return { yearTarget: 0, weeklyTarget: 0 };
  const y = Math.ceil(ct * TARGET_PCT);
  return { yearTarget: y, weeklyTarget: Math.ceil(y / TOTAL_WEEKS) };
}

export default function ListsPage() {
  const [lists, setLists] = useState<ListItem[]>(INITIAL_LISTS);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [activeUnit, setActiveUnit] = useState<UnitCode | 'ALL'>('ALL');

  const filteredLists = activeUnit === 'ALL' ? lists : lists.filter(l => l.unit === activeUnit);

  const handleEdit = (item: ListItem) => { setEditingId(item.id); setEditValue(item.chronicTotal?.toString() || ''); };
  const handleCancel = () => { setEditingId(null); setEditValue(''); };
  const handleSave = (id: number) => {
    const val = editValue.trim() === '' ? null : parseInt(editValue);
    if (val !== null && (isNaN(val) || val < 0)) { alert('Palun sisesta korrektne number'); return; }
    const targets = calcTargets(val);
    setLists(prev => prev.map(i => i.id === id ? { ...i, chronicTotal: val, needsReview: val === null, ...targets } : i));
    setEditingId(null); setEditValue('');
  };

  const getUnitTotals = (unit: UnitCode) => {
    const ul = lists.filter(l => l.unit === unit);
    const tc = ul.reduce((s, l) => s + (l.chronicTotal || 0), 0);
    return { totalChronics: tc, hasIncomplete: ul.some(l => l.needsReview), ...calcTargets(tc) };
  };

  // Group by team
  const getGroupedLists = (unitLists: ListItem[]) => {
    const teams = new Map<string, ListItem[]>();
    unitLists.forEach(l => {
      const key = l.teamName || 'Nimistud';
      if (!teams.has(key)) teams.set(key, []);
      teams.get(key)!.push(l);
    });
    return teams;
  };

  const renderListRow = (item: ListItem) => (
    <tr key={item.id} className="hover:bg-slate-50">
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <span className="font-medium text-slate-900">{item.label}</span>
        </div>
      </td>
      <td className="px-4 py-2.5 text-right">
        {editingId === item.id ? (
          <input type="number" value={editValue} onChange={e => setEditValue(e.target.value)}
            className="w-24 px-2 py-1 text-right rounded border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" autoFocus min="0" />
        ) : (
          <span className={item.chronicTotal === null ? 'text-slate-400 italic' : 'font-medium'}>{item.chronicTotal?.toLocaleString() || '—'}</span>
        )}
      </td>
      <td className="px-4 py-2.5 text-right text-emerald-600 font-medium">{item.yearTarget || '—'}</td>
      <td className="px-4 py-2.5 text-right text-slate-600">{item.weeklyTarget || '—'}</td>
      <td className="px-4 py-2.5 text-center">
        {item.needsReview ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700"><AlertTriangle className="w-3 h-3" /> Täpsusta</span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700"><CheckCircle className="w-3 h-3" /> OK</span>
        )}
      </td>
      <td className="px-4 py-2.5 text-right">
        {editingId === item.id ? (
          <div className="flex items-center justify-end gap-1">
            <button onClick={() => handleSave(item.id)} className="p-1.5 rounded text-emerald-600 hover:bg-emerald-50"><Save className="w-4 h-4" /></button>
            <button onClick={handleCancel} className="p-1.5 rounded text-slate-400 hover:bg-slate-100"><X className="w-4 h-4" /></button>
          </div>
        ) : (
          <button onClick={() => handleEdit(item)} className="p-1.5 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"><Edit2 className="w-4 h-4" /></button>
        )}
      </td>
    </tr>
  );

  const renderTeamSubtotal = (teamName: string, teamLists: ListItem[]) => {
    const tc = teamLists.reduce((s, l) => s + (l.chronicTotal || 0), 0);
    const t = calcTargets(tc);
    return (
      <tr key={`sub-${teamName}`} className="bg-slate-50 border-t border-slate-200">
        <td className="px-4 py-2 font-semibold text-xs text-slate-600">{teamName} kokku</td>
        <td className="px-4 py-2 text-right font-semibold text-sm">{tc || '—'}</td>
        <td className="px-4 py-2 text-right font-semibold text-sm text-emerald-600">{t.yearTarget || '—'}</td>
        <td className="px-4 py-2 text-right font-semibold text-sm">{t.weeklyTarget || '—'}</td>
        <td colSpan={2}></td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nimistud</h1>
        <p className="text-slate-600 mt-1">Halda nimistute kroonikute arve ja vaata sihtarve</p>
      </div>

      {/* Unit filter */}
      <div className="flex gap-2">
        {(['ALL', 'PELGULINN', 'ULEMISTE'] as const).map(u => (
          <button key={u} onClick={() => setActiveUnit(u)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeUnit === u ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>
            {u === 'ALL' ? 'Kõik' : UNIT_NAMES[u]}
          </button>
        ))}
      </div>

      {/* Unit summaries */}
      {activeUnit === 'ALL' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(['PELGULINN', 'ULEMISTE'] as UnitCode[]).map(unit => {
            const t = getUnitTotals(unit);
            return (
              <div key={unit} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900">{UNIT_NAMES[unit]}</h3>
                  {t.hasIncomplete && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700"><AlertTriangle className="w-3 h-3" /> Täpsusta</span>}
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div><p className="text-2xl font-bold text-slate-900">{t.totalChronics || '–'}</p><p className="text-xs text-slate-500">Kroonikuid</p></div>
                  <div><p className="text-2xl font-bold text-emerald-600">{t.yearTarget || '–'}</p><p className="text-xs text-slate-500">Aasta siht</p></div>
                  <div><p className="text-2xl font-bold text-slate-700">{t.weeklyTarget || '–'}</p><p className="text-xs text-slate-500">/nädal</p></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lists table grouped by team */}
      {(activeUnit === 'ALL' ? ['PELGULINN', 'ULEMISTE'] as UnitCode[] : [activeUnit as UnitCode]).map(unit => {
        const unitLists = filteredLists.filter(l => l.unit === unit);
        const grouped = getGroupedLists(unitLists);

        return (
          <div key={unit}>
            {activeUnit === 'ALL' && <h3 className="font-semibold text-slate-900 mb-2">{UNIT_NAMES[unit]}</h3>}
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-3 text-left font-medium text-slate-600">Nimistu</th>
                      <th className="px-4 py-3 text-right font-medium text-slate-600">Kroonikuid</th>
                      <th className="px-4 py-3 text-right font-medium text-slate-600">Aasta siht</th>
                      <th className="px-4 py-3 text-right font-medium text-slate-600">/nädal</th>
                      <th className="px-4 py-3 text-center font-medium text-slate-600">Staatus</th>
                      <th className="px-4 py-3 text-right font-medium text-slate-600">Muuda</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from(grouped.entries()).map(([teamName, teamLists]) => (
                      <React.Fragment key={teamName}>
                        {grouped.size > 1 && (
                          <tr className="bg-slate-100"><td colSpan={6} className="px-4 py-1.5 font-semibold text-xs text-slate-500 uppercase tracking-wide">{teamName}</td></tr>
                        )}
                        {teamLists.map(renderListRow)}
                        {grouped.size > 1 && renderTeamSubtotal(teamName, teamLists)}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })}

      {/* Info */}
      <div className="card p-5 bg-slate-50">
        <div className="flex items-start gap-3">
          <Calculator className="w-5 h-5 text-slate-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-slate-900">Arvutuse loogika</h4>
            <p className="text-sm text-slate-600 mt-1">
              <strong>Aasta siht</strong> = Kroonikuid kokku × 90%<br />
              <strong>Nädala siht</strong> = Aasta siht ÷ 45 nädalat (01.02–13.12.2026)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
