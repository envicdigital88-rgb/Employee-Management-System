import React, { useMemo, useState } from 'react';
import {
  CheckCircle2Icon,
  XCircleIcon,
  ClockIcon,
  HomeIcon,
  EyeIcon,
  SearchIcon,
  WifiIcon
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { KpiCard } from '../components/dashboard/KpiCard';
import { EmptyState } from '../components/ui/EmptyState';
import { useHrms } from '../store/HrmsContext';
import { fullName } from '../data/employees';
import { todayISO } from '../data/attendance';
import { attendanceTone } from '../components/ui/statusMaps';
import { AttendanceRecord } from '../types';
import { formatDate } from '../lib/format';
import { showToast } from '../components/ui/Toast';

function AttendanceBadge({ status, dot }: { status: string; dot?: boolean }) {
  if (status === 'WFH') {
    return <Badge tone="sky" dot={dot}>?? Work From Home</Badge>;
  }
  return (
    <Badge tone={(attendanceTone as any)[status] ?? 'neutral'} dot={dot}>
      {status}
    </Badge>
  );
}

export function AttendancePage() {
  const { employees, departments, getDepartment, getEmployee, attendanceRecords, markAdminWFH } = useHrms();

  const [dateType, setDateType] = useState<'single' | 'range'>('single');
  const [singleDate, setSingleDate] = useState(todayISO);
  const [startDate, setStartDate] = useState(todayISO);
  const [endDate, setEndDate] = useState(todayISO);
  const [dept, setDept] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [markingWFH, setMarkingWFH] = useState(false);

  const records = useMemo(() => {
    const empIds = new Set(employees.map((e) => e.id));
    return attendanceRecords.filter((a) => {
      if (dateType === 'single') {
        if (a.date !== singleDate) return false;
      } else {
        if (a.date < startDate || a.date > endDate) return false;
      }
      if (!empIds.has(a.employeeId)) return false;
      const emp = getEmployee(a.employeeId);
      if (!emp) return false;
      if (dept !== 'all' && emp.departmentId !== dept) return false;
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (shiftFilter !== 'all') {
        const empShift = emp.shift || 'Morning Shift (9:00 AM - 5:00 PM)';
        if (empShift !== shiftFilter) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!fullName(emp).toLowerCase().includes(q) && !emp.id.toLowerCase().includes(q) && !emp.role.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [dateType, singleDate, startDate, endDate, dept, statusFilter, shiftFilter, searchQuery, employees, attendanceRecords, getEmployee]);

  const summary = useMemo(() => ({
    present: records.filter((r) => r.status === 'Present').length,
    wfh: records.filter((r) => r.status === 'WFH').length,
    late: records.filter((r) => r.status === 'Late').length,
    absent: records.filter((r) => r.status === 'Absent').length,
  }), [records]);

  const selectedEmp = selectedRecord ? getEmployee(selectedRecord.employeeId) : null;

  const handleMarkWFH = async (record: AttendanceRecord) => {
    if (record.status === 'WFH') { showToast('Already marked as WFH.', 'info'); return; }
    setMarkingWFH(true);
    try {
      await markAdminWFH(record.employeeId, record.date);
      const emp = getEmployee(record.employeeId);
      showToast(`${emp ? fullName(emp) : 'Employee'} attendance marked as WFH.`, 'success');
      setSelectedRecord(prev => prev ? { ...prev, status: 'WFH' } : null);
    } finally { setMarkingWFH(false); }
  };

  const handleQuickMarkWFH = async (e: React.MouseEvent, employeeId: string, date: string) => {
    e.stopPropagation();
    await markAdminWFH(employeeId, date);
    const emp = getEmployee(employeeId);
    showToast(`${emp ? fullName(emp) : 'Employee'} marked as WFH for ${date}.`, 'success');
  };

  return (
    <div>
      <PageHeader title="Attendance" description="Daily clock-in and clock-out records across the company." />

      <Card className="mb-6 p-4">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-5">
            <div className="relative md:col-span-2">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-faint" />
              <input type="text" className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-4 text-sm text-content placeholder:text-content-faint focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30" placeholder="Search by name, role, or ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div>
              <select className="h-10 w-full rounded-xl border border-line bg-surface px-3 text-sm text-content focus:border-accent/50 focus:outline-none" value={dateType} onChange={(e) => setDateType(e.target.value as 'single' | 'range')}>
                <option value="single">Single Date</option>
                <option value="range">Date Range</option>
              </select>
            </div>
            {dateType === 'single' ? (
              <div className="md:col-span-1 lg:col-span-2">
                <input type="date" className="h-10 w-full rounded-xl border border-line bg-surface px-3 text-sm text-content focus:border-accent/50 focus:outline-none" value={singleDate} onChange={(e) => setSingleDate(e.target.value)} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 md:col-span-1 lg:col-span-2">
                <input type="date" className="h-10 w-full rounded-xl border border-line bg-surface px-2 text-xs text-content focus:border-accent/50 focus:outline-none" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <input type="date" className="h-10 w-full rounded-xl border border-line bg-surface px-2 text-xs text-content focus:border-accent/50 focus:outline-none" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-content-faint mb-1">Department</label>
              <select className="h-10 w-full rounded-xl border border-line bg-surface px-3 text-sm text-content focus:border-accent/50 focus:outline-none" value={dept} onChange={(e) => setDept(e.target.value)}>
                <option value="all">All Departments</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-content-faint mb-1">Attendance Status</label>
              <select className="h-10 w-full rounded-xl border border-line bg-surface px-3 text-sm text-content focus:border-accent/50 focus:outline-none" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="Present">Present</option>
                <option value="WFH">?? Work From Home (WFH)</option>
                <option value="Late">Late</option>
                <option value="Absent">Absent</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-content-faint mb-1">Work Shift</label>
              <select className="h-10 w-full rounded-xl border border-line bg-surface px-3 text-sm text-content focus:border-accent/50 focus:outline-none" value={shiftFilter} onChange={(e) => setShiftFilter(e.target.value)}>
                <option value="all">All Shifts</option>
                {['Morning Shift (9:00 AM - 5:00 PM)', 'Mid Shift (10:30 AM - 6:30 PM)', 'Afternoon Shift (1:30 PM - 10:30 PM)', 'Evening Shift (5:00 PM - 1:00 AM)', 'Night Shift (1:00 AM - 9:00 AM)', 'Flexible Shift'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
      </Card>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Present (Office)" value={String(summary.present)} icon={CheckCircle2Icon} index={0} accent />
        <KpiCard label="Work From Home" value={String(summary.wfh)} icon={HomeIcon} index={1} />
        <KpiCard label="Late Arrivals" value={String(summary.late)} icon={ClockIcon} index={2} />
        <KpiCard label="Absent" value={String(summary.absent)} icon={XCircleIcon} index={3} />
      </div>

      {summary.wfh > 0 && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 text-xs">
          <WifiIcon className="h-5 w-5 text-sky-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sky-400">?? Work From Home Active</p>
            <p className="mt-0.5 text-content-muted">
              <strong>{summary.wfh}</strong> employee(s) are working from home today. Employees can self-clock in as WFH from their Attendance page, or admins can mark WFH using the <strong>WFH</strong> button in the table below.
            </p>
          </div>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-content-muted">
                <th className="px-5 py-3 font-medium">Employee</th>
                {dateType === 'range' && <th className="px-5 py-3 font-medium">Date</th>}
                <th className="px-5 py-3 font-medium">Department</th>
                <th className="px-5 py-3 font-medium">Work Shift</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Clock In</th>
                <th className="px-5 py-3 font-medium">Clock Out</th>
                <th className="px-5 py-3 font-medium">Hours</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const emp = getEmployee(r.employeeId);
                if (!emp) return null;
                return (
                  <tr key={r.id} className="border-b border-line/60 transition-colors hover:bg-white/[0.02] cursor-pointer group" onClick={() => setSelectedRecord(r)}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={emp.avatarUrl} name={fullName(emp)} size="xs" />
                        <span className="font-medium text-content group-hover:text-accent transition-colors">{fullName(emp)}</span>
                      </div>
                    </td>
                    {dateType === 'range' && <td className="px-5 py-3 text-content-muted">{formatDate(r.date)}</td>}
                    <td className="px-5 py-3 text-content-muted">{getDepartment(emp.departmentId)?.name}</td>
                    <td className="px-5 py-3 text-content-muted text-xs">{emp.shift || 'Morning Shift (9:00 AM - 5:00 PM)'}</td>
                    <td className="px-5 py-3"><AttendanceBadge status={r.status} dot /></td>
                    <td className="px-5 py-3 text-content-muted">{r.clockIn ?? '—'}</td>
                    <td className="px-5 py-3 text-content-muted">{r.clockOut ?? '—'}</td>
                    <td className="px-5 py-3 text-content-muted">{r.hours || '—'}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {r.status !== 'WFH' && (
                          <button
                            onClick={(e) => handleQuickMarkWFH(e, r.employeeId, r.date)}
                            title="Mark as Work From Home"
                            className="inline-flex h-7 items-center gap-1 rounded-lg border border-sky-500/25 bg-sky-500/5 px-2 text-[11px] font-semibold text-sky-400 transition-colors hover:bg-sky-500/15"
                          >
                            <HomeIcon className="h-3 w-3" /> WFH
                          </button>
                        )}
                        {r.status === 'WFH' && (
                          <span className="inline-flex h-7 items-center gap-1 rounded-lg bg-sky-500/10 px-2 text-[11px] font-semibold text-sky-400">
                            <HomeIcon className="h-3 w-3" /> WFH
                          </span>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); setSelectedRecord(r); }} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-content-muted transition-colors hover:bg-white/5 hover:text-accent" aria-label={`View shift details for ${fullName(emp)}`}>
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {records.length === 0 && <EmptyState icon={CheckCircle2Icon} title="No records" description="No attendance recorded for this date and filter." />}
      </Card>

      <Modal open={!!selectedRecord} onClose={() => setSelectedRecord(null)} title="Shift Details">
        {selectedRecord && selectedEmp && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-line">
              <Avatar src={selectedEmp.avatarUrl} name={fullName(selectedEmp)} size="lg" ring />
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-content">{fullName(selectedEmp)}</p>
                <p className="text-sm text-content-muted">{selectedEmp.role}</p>
                <p className="text-xs text-content-faint">{getDepartment(selectedEmp.departmentId)?.name} · {selectedEmp.id}</p>
              </div>
              <AttendanceBadge status={selectedRecord.status} dot />
            </div>

            {selectedRecord.status === 'WFH' && (
              <div className="flex items-center gap-3 rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 text-xs">
                <HomeIcon className="h-5 w-5 text-sky-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sky-400">Work From Home Day</p>
                  <p className="text-content-muted mt-0.5">Employee is working remotely. Hours tracked from self-reported clock-in/out.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-line bg-surface-raised p-4">
                <p className="text-xs text-content-faint mb-1">Date</p>
                <p className="text-sm font-semibold text-content">{formatDate(selectedRecord.date)}</p>
              </div>
              <div className="rounded-xl border border-line bg-surface-raised p-4">
                <p className="text-xs text-content-faint mb-1">Hours Worked</p>
                <p className="text-sm font-semibold text-content">{selectedRecord.hours ? `${selectedRecord.hours} hrs` : '—'}</p>
              </div>
              <div className="rounded-xl border border-line bg-surface-raised p-4">
                <p className="text-xs text-content-faint mb-1 flex items-center gap-1"><ClockIcon className="h-3 w-3" /> Clock In</p>
                <p className="text-sm font-semibold text-content">{selectedRecord.clockIn ?? 'Not recorded'}</p>
              </div>
              <div className="rounded-xl border border-line bg-surface-raised p-4">
                <p className="text-xs text-content-faint mb-1 flex items-center gap-1"><ClockIcon className="h-3 w-3" /> Clock Out</p>
                <p className="text-sm font-semibold text-content">{selectedRecord.clockOut ?? 'Not yet clocked out'}</p>
              </div>
            </div>

            {selectedRecord.clockIn && (
              <div>
                <div className="flex justify-between text-xs text-content-faint mb-1.5">
                  <span>Shift progress</span>
                  <span>{selectedRecord.hours ? `${selectedRecord.hours}h / 8h` : 'In progress'}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-raised">
                  <div className={`h-full rounded-full transition-all ${selectedRecord.status === 'WFH' ? 'bg-sky-500' : 'bg-accent'}`} style={{ width: `${Math.min(100, ((selectedRecord.hours || 0) / 8) * 100)}%` }} />
                </div>
              </div>
            )}

            {!selectedRecord.clockIn && <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">? No clock-in recorded for this employee on this date.</p>}
            {selectedRecord.clockIn && !selectedRecord.clockOut && <p className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-2">?? Employee is currently clocked in. Shift is in progress.</p>}

            {selectedRecord.status !== 'WFH' && (
              <div className="pt-3 border-t border-line">
                <p className="text-xs text-content-muted mb-2 font-semibold">Admin Actions</p>
                <Button
                  variant="secondary"
                  onClick={() => handleMarkWFH(selectedRecord)}
                  className="flex items-center gap-2 border-sky-500/30 text-sky-400 bg-sky-500/5 hover:bg-sky-500/10"
                >
                  {markingWFH ? <>? Marking...</> : <><HomeIcon className="h-4 w-4" /> Mark as Work From Home (WFH)</>}
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
