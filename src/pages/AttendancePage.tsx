import React, { useMemo, useState } from 'react';
import {
  CheckCircle2Icon,
  XCircleIcon,
  ClockIcon,
  HomeIcon,
  EyeIcon,
  SearchIcon,
  WifiIcon,
  CoffeeIcon
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
  const tone = attendanceTone[status as keyof typeof attendanceTone] || 'neutral';
  return (
    <Badge tone={tone} dot={dot}>
      {status === 'WFH' ? '🏠 WFH' : status}
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
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [markingWFH, setMarkingWFH] = useState(false);

  const records = useMemo(() => {
    return attendanceRecords.filter((a) => {
      if (dateType === 'single') {
        if (a.date !== singleDate) return false;
      } else {
        if (a.date < startDate || a.date > endDate) return false;
      }

      const emp = getEmployee(a.employeeId);
      if (!emp) return false;

      if (dept !== 'all' && emp.departmentId !== dept) return false;
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nameMatch = `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(query);
        const empIdMatch = emp.id.toLowerCase().includes(query);
        if (!nameMatch && !empIdMatch) return false;
      }

      return true;
    });
  }, [dateType, singleDate, startDate, endDate, dept, statusFilter, shiftFilter, searchQuery, employees, attendanceRecords, getEmployee]);

  const summary = useMemo(() => {
    let present = 0;
    let wfh = 0;
    let late = 0;
    let absent = 0;

    records.forEach((r) => {
      if (r.status === 'Present') present++;
      else if (r.status === 'WFH') wfh++;
      else if (r.status === 'Late') late++;
      else if (r.status === 'Absent') absent++;
    });

    return { present, wfh, late, absent };
  }, [records]);

  const selectedEmp = selectedRecord ? getEmployee(selectedRecord.employeeId) : null;

  const handleMarkWFH = async () => {
    if (!selectedRecord) return;
    setMarkingWFH(true);
    try {
      await markAdminWFH(selectedRecord.employeeId, selectedRecord.date);
      showToast(`Updated attendance for ${selectedEmp ? fullName(selectedEmp) : 'employee'} to WFH.`, 'success');
      setSelectedRecord((prev) => prev ? { ...prev, status: 'WFH' } : null);
    } catch (err) {
      showToast('Failed to update attendance to WFH.', 'error');
    } finally {
      setMarkingWFH(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance & Shift Logs"
        description="Monitor daily attendance, track remote WFH status, shift breaks, and view employee clock-in/out records."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Present (Office)" value={String(summary.present)} icon={CheckCircle2Icon} index={0} accent />
        <KpiCard label="Work From Home" value={String(summary.wfh)} icon={HomeIcon} index={1} />
        <KpiCard label="Late Arrivals" value={String(summary.late)} icon={ClockIcon} index={2} />
        <KpiCard label="Absent" value={String(summary.absent)} icon={XCircleIcon} index={3} />
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-40">
              <label className="mb-1 block text-xs font-semibold text-content-muted">Date View</label>
              <select className="h-10 w-full rounded-xl border border-line bg-surface px-3 text-sm text-content focus:border-accent/50 focus:outline-none" value={dateType} onChange={(e) => setDateType(e.target.value as 'single' | 'range')}>
                <option value="single">Single Date</option>
                <option value="range">Date Range</option>
              </select>
            </div>

            {dateType === 'single' ? (
              <div className="w-40">
                <label className="mb-1 block text-xs font-semibold text-content-muted">Date</label>
                <input type="date" className="h-10 w-full rounded-xl border border-line bg-surface px-2 text-xs text-content focus:border-accent/50 focus:outline-none" value={singleDate} onChange={(e) => setSingleDate(e.target.value)} />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-36">
                  <label className="mb-1 block text-xs font-semibold text-content-muted">From</label>
                  <input type="date" className="h-10 w-full rounded-xl border border-line bg-surface px-2 text-xs text-content focus:border-accent/50 focus:outline-none" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="w-36">
                  <label className="mb-1 block text-xs font-semibold text-content-muted">To</label>
                  <input type="date" className="h-10 w-full rounded-xl border border-line bg-surface px-2 text-xs text-content focus:border-accent/50 focus:outline-none" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
            )}

            <div className="w-44">
              <label className="mb-1 block text-xs font-semibold text-content-muted">Department</label>
              <select className="h-10 w-full rounded-xl border border-line bg-surface px-3 text-sm text-content focus:border-accent/50 focus:outline-none" value={dept} onChange={(e) => setDept(e.target.value)}>
                <option value="all">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-36">
              <label className="mb-1 block text-xs font-semibold text-content-muted">Status</label>
              <select className="h-10 w-full rounded-xl border border-line bg-surface px-3 text-sm text-content focus:border-accent/50 focus:outline-none" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="Present">Present</option>
                <option value="WFH">WFH</option>
                <option value="Late">Late</option>
                <option value="Absent">Absent</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-faint" />
            <input
              type="text"
              placeholder="Search employee or ID..."
              className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-3 text-xs text-content placeholder:text-content-faint focus:border-accent/50 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {summary.wfh > 0 && (
        <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-3.5 text-xs text-sky-300 flex items-start gap-2.5">
          <WifiIcon className="h-5 w-5 text-sky-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sky-200">Work From Home (WFH) Active</p>
            <p className="mt-0.5 text-content-muted">
              <strong>{summary.wfh}</strong> employee(s) are working remotely. Employees can self-clock in as WFH, or admins can mark WFH using the <strong>WFH</strong> button.
            </p>
          </div>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-raised/40 text-left text-xs font-semibold text-content-muted">
                <th className="px-5 py-3 font-medium">Employee</th>
                {dateType === 'range' && <th className="px-5 py-3 font-medium">Date</th>}
                <th className="px-5 py-3 font-medium">Department</th>
                <th className="px-5 py-3 font-medium">Work Shift</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Clock In</th>
                <th className="px-5 py-3 font-medium">Clock Out</th>
                <th className="px-5 py-3 font-medium">Breaks Log</th>
                <th className="px-5 py-3 font-medium">Hours</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {records.map((r) => {
                const emp = getEmployee(r.employeeId);
                if (!emp) return null;

                const breakCount = r.breaks?.length || 0;

                return (
                  <tr key={r.id} className="hover:bg-white/[0.01]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={emp.avatarUrl} name={fullName(emp)} size="sm" />
                        <div>
                          <p className="font-semibold text-content text-xs">{fullName(emp)}</p>
                          <p className="text-[11px] text-content-faint">{emp.id}</p>
                        </div>
                      </div>
                    </td>
                    {dateType === 'range' && <td className="px-5 py-3 text-content-muted">{formatDate(r.date)}</td>}
                    <td className="px-5 py-3 text-content-muted">{getDepartment(emp.departmentId)?.name}</td>
                    <td className="px-5 py-3 text-content-muted text-xs">{emp.shift || 'Morning Shift (9:00 AM - 5:00 PM)'}</td>
                    <td className="px-5 py-3"><AttendanceBadge status={r.status} dot /></td>
                    <td className="px-5 py-3 text-content-muted">{r.clockIn ?? '—'}</td>
                    <td className="px-5 py-3 text-content-muted">{r.clockOut ?? '—'}</td>
                    <td className="px-5 py-3 text-content-muted text-xs">
                      {breakCount > 0 ? (
                        <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded font-medium">
                          ☕ {breakCount} break{breakCount > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-content-faint">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-content-muted">{r.hours || '—'}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {r.status !== 'WFH' && r.status !== 'On Leave' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={async () => {
                              await markAdminWFH(emp.id, r.date);
                              showToast(`Marked ${fullName(emp)} as WFH for ${formatDate(r.date)}.`, 'success');
                            }}
                            className="h-7 text-xs border-sky-500/20 text-sky-400 bg-sky-500/5 hover:bg-sky-500/10"
                          >
                            <HomeIcon className="h-3 w-3" /> WFH
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedRecord(r)}
                          className="h-7 text-xs"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
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

      {/* Record details modal */}
      {selectedRecord && selectedEmp && (
        <Modal
          open={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          title="Attendance Record Details"
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-surface-raised p-3.5 rounded-xl border border-line">
              <Avatar src={selectedEmp.avatarUrl} name={fullName(selectedEmp)} size="md" />
              <div>
                <h4 className="font-bold text-content text-sm">{fullName(selectedEmp)}</h4>
                <p className="text-xs text-content-faint">{getDepartment(selectedEmp.departmentId)?.name} · {selectedEmp.id}</p>
              </div>
            </div>

            {selectedRecord.status === 'WFH' && (
              <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-3 text-xs text-sky-300 flex items-center gap-2">
                <HomeIcon className="h-5 w-5 text-sky-400 flex-shrink-0" />
                <span>Employee is logged as <strong>Work From Home (WFH)</strong> for this date.</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-surface p-3 rounded-xl border border-line">
                <p className="text-xs text-content-faint mb-1">Date</p>
                <p className="text-sm font-semibold text-content">{formatDate(selectedRecord.date)}</p>
              </div>
              <div className="bg-surface p-3 rounded-xl border border-line">
                <p className="text-xs text-content-faint mb-1">Status</p>
                <AttendanceBadge status={selectedRecord.status} dot />
              </div>
              <div className="bg-surface p-3 rounded-xl border border-line">
                <p className="text-xs text-content-faint mb-1 flex items-center gap-1"><ClockIcon className="h-3 w-3" /> Clock In</p>
                <p className="text-sm font-semibold text-content">{selectedRecord.clockIn ?? 'Not clocked in'}</p>
              </div>
              <div className="bg-surface p-3 rounded-xl border border-line">
                <p className="text-xs text-content-faint mb-1 flex items-center gap-1"><ClockIcon className="h-3 w-3" /> Clock Out</p>
                <p className="text-sm font-semibold text-content">{selectedRecord.clockOut ?? 'Not yet clocked out'}</p>
              </div>
            </div>

            {/* Break History Section */}
            {selectedRecord.breaks && selectedRecord.breaks.length > 0 ? (
              <div className="pt-2">
                <p className="text-xs font-bold text-content mb-2 flex items-center gap-1.5">
                  <CoffeeIcon className="h-4 w-4 text-amber-400" />
                  Shift Breaks Log ({selectedRecord.breaks.length})
                </p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {selectedRecord.breaks.map((b, idx) => (
                    <div key={b.id || idx} className="flex items-center justify-between text-xs bg-surface-raised p-2.5 rounded-xl border border-line">
                      <span className="font-mono text-content font-medium">Break {idx + 1}: {b.startTime} – {b.endTime || 'Ongoing'}</span>
                      <span className="text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {b.durationMinutes ? `${b.durationMinutes} mins` : 'Active'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="pt-1">
                <p className="text-xs text-content-faint flex items-center gap-1">
                  <CoffeeIcon className="h-3.5 w-3.5 text-content-faint" />
                  No shift breaks taken for this date.
                </p>
              </div>
            )}

            <div className="pt-3 flex justify-end gap-2 border-t border-line">
              {selectedRecord.status !== 'WFH' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleMarkWFH}
                  disabled={markingWFH}
                  className="text-xs border-sky-500/20 text-sky-400 bg-sky-500/5 hover:bg-sky-500/10"
                >
                  {markingWFH ? 'Marking...' : <><HomeIcon className="h-4 w-4" /> Mark as Work From Home (WFH)</>}
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={() => setSelectedRecord(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}