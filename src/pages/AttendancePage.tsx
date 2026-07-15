import React, { useMemo, useState } from 'react';
import {
  CheckCircle2Icon,
  XCircleIcon,
  ClockIcon,
  HomeIcon,
  EyeIcon } from
'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Modal';
import { KpiCard } from '../components/dashboard/KpiCard';
import { EmptyState } from '../components/ui/EmptyState';
import { useHrms } from '../store/HrmsContext';
import { fullName } from '../data/employees';
import { todayISO } from '../data/attendance';
import { attendanceTone } from '../components/ui/statusMaps';
import { AttendanceRecord } from '../types';
import { formatDate } from '../lib/format';

const selectClass =
'h-10 rounded-xl border border-line bg-surface px-3 text-sm text-content focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30';

export function AttendancePage() {
  const { employees, departments, getDepartment, getEmployee, attendanceRecords } = useHrms();
  const dates = useMemo(
    () =>
    [...new Set(attendanceRecords.map((a) => a.date))].sort((a, b) =>
    b.localeCompare(a)
    ),
    []
  );
  const [date, setDate] = useState(todayISO);
  const [dept, setDept] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  const records = useMemo(() => {
    const empIds = new Set(employees.map((e) => e.id));
    return attendanceRecords.filter((a) => {
      if (a.date !== date) return false;
      if (!empIds.has(a.employeeId)) return false;
      if (dept !== 'all') {
        const emp = getEmployee(a.employeeId);
        if (emp?.departmentId !== dept) return false;
      }
      return true;
    });
  }, [date, dept, employees]);

  const summary = useMemo(() => {
    const present = records.filter((r) => r.status === 'Present').length;
    const wfh = records.filter((r) => r.status === 'WFH').length;
    const late = records.filter((r) => r.status === 'Late').length;
    const absent = records.filter((r) => r.status === 'Absent').length;
    return {
      present,
      wfh,
      late,
      absent
    };
  }, [records]);

  const selectedEmp = selectedRecord ? getEmployee(selectedRecord.employeeId) : null;

  return (
    <div>
      <PageHeader
        title="Attendance"
        description="Daily clock-in and clock-out records across the company."
        actions={
        <div className="flex gap-2">
            <select
            className={selectClass}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-label="Select date">
            
              {dates.map((d) =>
            <option key={d} value={d}>
                  {new Date(d).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
                </option>
            )}
            </select>
            <select
            className={selectClass}
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            aria-label="Filter by department">
            
              <option value="all">All departments</option>
              {departments.map((d) =>
            <option key={d.id} value={d.id}>
                  {d.name}
                </option>
            )}
            </select>
          </div>
        } />
      

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Present"
          value={String(summary.present)}
          icon={CheckCircle2Icon}
          index={0}
          accent />
        
        <KpiCard
          label="Working from home"
          value={String(summary.wfh)}
          icon={HomeIcon}
          index={1} />
        
        <KpiCard
          label="Late arrivals"
          value={String(summary.late)}
          icon={ClockIcon}
          index={2} />
        
        <KpiCard
          label="Absent"
          value={String(summary.absent)}
          icon={XCircleIcon}
          index={3} />
        
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-content-muted">
                <th className="px-5 py-3 font-medium">Employee</th>
                <th className="px-5 py-3 font-medium">Department</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Clock in</th>
                <th className="px-5 py-3 font-medium">Clock out</th>
                <th className="px-5 py-3 font-medium">Hours</th>
                <th className="px-5 py-3 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const emp = getEmployee(r.employeeId);
                if (!emp) return null;
                return (
                  <tr
                    key={r.id}
                    className="border-b border-line/60 transition-colors hover:bg-white/[0.02] cursor-pointer group"
                    onClick={() => setSelectedRecord(r)}>
                    
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={emp.avatarUrl}
                          name={fullName(emp)}
                          size="xs" />
                        
                        <span className="font-medium text-content group-hover:text-accent transition-colors">
                          {fullName(emp)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-content-muted">
                      {getDepartment(emp.departmentId)?.name}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={attendanceTone[r.status]} dot>
                        {r.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-content-muted">
                      {r.clockIn ?? '—'}
                    </td>
                    <td className="px-5 py-3 text-content-muted">
                      {r.clockOut ?? '—'}
                    </td>
                    <td className="px-5 py-3 text-content-muted">
                      {r.hours || '—'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedRecord(r); }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-content-muted transition-colors hover:bg-white/5 hover:text-accent"
                        aria-label={`View shift details for ${fullName(emp)}`}>
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>);

              })}
            </tbody>
          </table>
        </div>
        {records.length === 0 &&
        <EmptyState
          icon={CheckCircle2Icon}
          title="No records"
          description="No attendance recorded for this date and filter." />

        }
      </Card>

      {/* Shift Detail Modal */}
      <Modal
        open={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title="Shift Details">
        {selectedRecord && selectedEmp && (
          <div className="space-y-4">
            {/* Employee Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-line">
              <Avatar src={selectedEmp.avatarUrl} name={fullName(selectedEmp)} size="lg" ring />
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-content">{fullName(selectedEmp)}</p>
                <p className="text-sm text-content-muted">{selectedEmp.role}</p>
                <p className="text-xs text-content-faint">{getDepartment(selectedEmp.departmentId)?.name} · {selectedEmp.id}</p>
              </div>
              <Badge tone={attendanceTone[selectedRecord.status]} dot>
                {selectedRecord.status}
              </Badge>
            </div>

            {/* Shift Info Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-line bg-surface-raised p-4">
                <p className="text-xs text-content-faint mb-1">Date</p>
                <p className="text-sm font-semibold text-content">{formatDate(selectedRecord.date)}</p>
              </div>
              <div className="rounded-xl border border-line bg-surface-raised p-4">
                <p className="text-xs text-content-faint mb-1">Hours Worked</p>
                <p className="text-sm font-semibold text-content">
                  {selectedRecord.hours ? `${selectedRecord.hours} hrs` : '—'}
                </p>
              </div>
              <div className="rounded-xl border border-line bg-surface-raised p-4">
                <p className="text-xs text-content-faint mb-1 flex items-center gap-1">
                  <ClockIcon className="h-3 w-3" /> Clock In
                </p>
                <p className="text-sm font-semibold text-content">
                  {selectedRecord.clockIn ?? 'Not recorded'}
                </p>
              </div>
              <div className="rounded-xl border border-line bg-surface-raised p-4">
                <p className="text-xs text-content-faint mb-1 flex items-center gap-1">
                  <ClockIcon className="h-3 w-3" /> Clock Out
                </p>
                <p className="text-sm font-semibold text-content">
                  {selectedRecord.clockOut ?? 'Not yet clocked out'}
                </p>
              </div>
            </div>

            {/* Shift Duration Bar */}
            {selectedRecord.clockIn && (
              <div>
                <div className="flex justify-between text-xs text-content-faint mb-1.5">
                  <span>Shift progress</span>
                  <span>{selectedRecord.hours ? `${selectedRecord.hours}h / 8h` : 'In progress'}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-raised">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{
                      width: `${Math.min(100, ((selectedRecord.hours || 0) / 8) * 100)}%`
                    }}
                  />
                </div>
              </div>
            )}

            {/* Status note */}
            {!selectedRecord.clockIn && (
              <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
                ⚠ No clock-in recorded for this employee on this date.
              </p>
            )}
            {selectedRecord.clockIn && !selectedRecord.clockOut && (
              <p className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-2">
                🕐 Employee is currently clocked in. Shift is in progress.
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>);

}