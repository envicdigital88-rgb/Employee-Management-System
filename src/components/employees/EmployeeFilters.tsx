import React from 'react';
import { SearchIcon, XIcon } from 'lucide-react';
import { useHrms } from '../../store/HrmsContext';
import { EmployeeStatus } from '../../types';
const selectClass =
'h-10 rounded-xl border border-line bg-surface px-3 text-sm text-content focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30';
const STATUSES: EmployeeStatus[] = [
'Active',
'On Leave',
'Probation',
'Terminated'];

export function EmployeeFilters({
  query,
  onQuery,
  dept,
  onDept,
  status,
  onStatus,
  onClear








}: {query: string;onQuery: (v: string) => void;dept: string;onDept: (v: string) => void;status: string;onStatus: (v: string) => void;onClear: () => void;}) {
  const { departments } = useHrms();
  const hasFilters = query || dept !== 'all' || status !== 'all';
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-faint" />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search by name, role, or ID…"
          className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-4 text-sm text-content placeholder:text-content-faint focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
          aria-label="Search employees" />
        
      </div>
      <select
        className={selectClass}
        value={dept}
        onChange={(e) => onDept(e.target.value)}
        aria-label="Filter by department">
        
        <option value="all">All departments</option>
        {departments.map((d) =>
        <option key={d.id} value={d.id}>
            {d.name}
          </option>
        )}
      </select>
      <select
        className={selectClass}
        value={status}
        onChange={(e) => onStatus(e.target.value)}
        aria-label="Filter by status">
        
        <option value="all">All statuses</option>
        {STATUSES.map((s) =>
        <option key={s} value={s}>
            {s}
          </option>
        )}
      </select>
      {hasFilters &&
      <button
        onClick={onClear}
        className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm text-content-muted transition-colors hover:text-content">
        
          <XIcon className="h-4 w-4" />
          Clear
        </button>
      }
    </div>);

}