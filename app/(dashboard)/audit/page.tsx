'use client';

import { useState } from 'react';
import { ScrollText, Filter, ChevronDown, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { et } from 'date-fns/locale';

interface AuditEntry {
  id: number;
  timestamp: string;
  action: 'UPDATE' | 'INSERT' | 'DELETE';
  tableName: string;
  recordLabel: string;
  changedByRole: string;
  changedByUnit: string | null;
  oldValue: string | null;
  newValue: string | null;
  field: string;
}

const MOCK_AUDIT: AuditEntry[] = [
  { id: 1, timestamp: '2026-03-01T14:32:00', action: 'UPDATE', tableName: 'lists', recordLabel: 'dr Lill', changedByRole: 'Õendusjuht', changedByUnit: null, field: 'chronic_total', oldValue: '480', newValue: '482' },
  { id: 2, timestamp: '2026-03-01T10:15:00', action: 'INSERT', tableName: 'daily_entries', recordLabel: 'dr Abramov - 01.03.2026', changedByRole: 'Kõneliini õde', changedByUnit: 'Pelgulinn', field: 'calls_made', oldValue: null, newValue: '5' },
  { id: 3, timestamp: '2026-02-28T16:45:00', action: 'UPDATE', tableName: 'daily_entries', recordLabel: 'dr Guskova - 28.02.2026', changedByRole: 'Vastutav õde: Pelgulinn', changedByUnit: 'Pelgulinn', field: 'visits_made', oldValue: '3', newValue: '4' },
  { id: 4, timestamp: '2026-02-28T09:00:00', action: 'UPDATE', tableName: 'lists', recordLabel: 'dr Vessel', changedByRole: 'Admin', changedByUnit: null, field: 'chronic_total', oldValue: null, newValue: '520' },
  { id: 5, timestamp: '2026-02-27T15:30:00', action: 'INSERT', tableName: 'weekly_confirmations', recordLabel: 'Nädal 9 - Pelgulinn', changedByRole: 'Vastutav õde: Pelgulinn', changedByUnit: 'Pelgulinn', field: 'status', oldValue: null, newValue: 'MET' },
];

const ACTION_LABELS = {
  UPDATE: 'Muudetud',
  INSERT: 'Lisatud',
  DELETE: 'Kustutatud',
};

const ACTION_COLORS = {
  UPDATE: 'bg-blue-100 text-blue-700',
  INSERT: 'bg-emerald-100 text-emerald-700',
  DELETE: 'bg-red-100 text-red-700',
};

export default function AuditPage() {
  const [entries] = useState<AuditEntry[]>(MOCK_AUDIT);
  const [filterTable, setFilterTable] = useState<string>('all');

  const filteredEntries = filterTable === 'all' 
    ? entries 
    : entries.filter(e => e.tableName === filterTable);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Auditlogi</h1>
          <p className="text-slate-600 mt-1">Kõik süsteemi muudatused</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-slate-400" />
          <select
            value={filterTable}
            onChange={(e) => setFilterTable(e.target.value)}
            className="form-select w-auto"
          >
            <option value="all">Kõik tabelid</option>
            <option value="lists">Nimistud</option>
            <option value="daily_entries">Päevased sisestused</option>
            <option value="weekly_confirmations">Nädala kinnitused</option>
          </select>
        </div>
      </div>

      {/* Entries */}
      <div className="space-y-3">
        {filteredEntries.map((entry) => (
          <div key={entry.id} className="card p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`px-2 py-1 rounded text-xs font-medium ${ACTION_COLORS[entry.action]}`}>
                  {ACTION_LABELS[entry.action]}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{entry.recordLabel}</p>
                  <p className="text-sm text-slate-600 mt-1">
                    <span className="font-medium">{entry.field}</span>
                    {entry.oldValue && <span className="text-slate-400"> {entry.oldValue}</span>}
                    {entry.oldValue && entry.newValue && <span className="text-slate-400"> → </span>}
                    {entry.newValue && <span className="text-pks-600 font-medium">{entry.newValue}</span>}
                  </p>
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="flex items-center gap-1 text-slate-500">
                  <User className="w-4 h-4" />
                  <span>{entry.changedByRole}</span>
                  {entry.changedByUnit && <span className="text-slate-400">({entry.changedByUnit})</span>}
                </div>
                <div className="flex items-center gap-1 text-slate-400 mt-1">
                  <Clock className="w-4 h-4" />
                  <span>{format(new Date(entry.timestamp), 'dd.MM.yyyy HH:mm', { locale: et })}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredEntries.length === 0 && (
          <div className="card p-8 text-center">
            <ScrollText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">Auditlogi kirjeid ei leitud</p>
          </div>
        )}
      </div>
    </div>
  );
}
