import React, { useMemo, useState } from 'react';
import {
  CheckCircle2Icon,
  XCircleIcon,
  ClockIcon,
  HomeIcon } from
'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { KpiCard } from '../components/dashboard/KpiCard';
import { EmptyState } from '../components/ui/EmptyState';
import { useHrms } from '../store/HrmsContext';
import { fullName } from '../data/employees';
import { todayISO } from '../data/attendance';
import { attendanceTone } from '../components/ui/statusMaps';
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
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const emp = getEmployee(r.employeeId);
                if (!emp) return null;
                return (
                  <tr
                    key={r.id}
                    className="border-b border-line/60 transition-colors hover:bg-white/[0.02]">
                    
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={emp.avatarUrl}
                          name={fullName(emp)}
                          size="xs" />
                        
                        <span className="font-medium text-content">
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
    </div>);

}