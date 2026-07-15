import React, { useMemo } from 'react';
import { useHrms } from '../store/HrmsContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ClockIcon, CalendarIcon, PlayIcon, LogOutIcon } from 'lucide-react';
import { attendanceTone } from '../components/ui/statusMaps';
import { todayISO } from '../data/attendance';

export function MyAttendancePage() {
  const { currentUser, attendanceRecords, clockIn, clockOut } = useHrms();

  if (!currentUser) return null;

  // Filter logs for this employee
  const myAttendance = useMemo(() => 
    [...attendanceRecords]
      .filter(a => a.employeeId === currentUser.id)
      .sort((a, b) => b.date.localeCompare(a.date)),
    [attendanceRecords, currentUser.id]
  );

  const todayRecord = useMemo(() => 
    myAttendance.find(a => a.date === todayISO),
    [myAttendance]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Attendance"
        description="Clock in/out and view your daily work logs."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Clock In / Clock Out Control Card */}
        <Card className="p-6 border border-line flex flex-col justify-between items-center text-center min-h-[300px]">
          <div className="space-y-2">
            <div className="mx-auto rounded-full bg-accent/10 p-4 w-16 h-16 flex items-center justify-center text-accent">
              <ClockIcon className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-content mt-4">Work Shift Control</h3>
            <p className="text-xs text-content-muted">
              Clock in when starting your shift and clock out when leaving.
            </p>
          </div>

          <div className="py-4 space-y-1">
            <p className="text-[10px] text-content-faint uppercase tracking-wider font-semibold">Today's Status</p>
            {todayRecord ? (
              <div className="space-y-1">
                <Badge tone={todayRecord.status === 'Late' ? 'amber' : 'green'}>
                  {todayRecord.status}
                </Badge>
                <p className="text-xs text-content font-medium">
                  Shift: {todayRecord.clockIn} to {todayRecord.clockOut || '--:--'}
                </p>
              </div>
            ) : (
              <p className="text-xs text-amber-400 font-semibold animate-pulse">
                Not Clocked In Yet
              </p>
            )}
          </div>

          <div className="w-full flex gap-3">
            {!todayRecord ? (
              <Button variant="primary" className="w-full flex items-center justify-center gap-2 h-11" onClick={clockIn}>
                <PlayIcon className="h-4 w-4 fill-current" />
                Clock In Shift
              </Button>
            ) : !todayRecord.clockOut ? (
              <Button variant="secondary" className="w-full flex items-center justify-center gap-2 h-11 border border-rose-500/20 text-rose-400 bg-rose-500/5 hover:bg-rose-500/10" onClick={clockOut}>
                <LogOutIcon className="h-4 w-4" />
                Clock Out Shift
              </Button>
            ) : (
              <Button variant="secondary" className="w-full h-11" disabled>
                Shift Completed
              </Button>
            )}
          </div>
        </Card>

        {/* History List Card */}
        <Card className="lg:col-span-2 flex flex-col min-h-[300px]">
          <div className="p-5 border-b border-line">
            <h3 className="text-sm font-bold text-content">Shift History</h3>
            <p className="text-xs text-content-faint mt-0.5">Logs of your attendance records</p>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-raised/40 text-xs font-semibold text-content-muted">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Clock In</th>
                  <th className="px-5 py-3">Clock Out</th>
                  <th className="px-5 py-3 text-right">Hours Worked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {myAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-xs text-content-faint">
                      No shift records logged yet.
                    </td>
                  </tr>
                ) : (
                  myAttendance.map((a) => (
                    <tr key={a.id} className="hover:bg-white/[0.01]">
                      <td className="px-5 py-3 text-xs text-content-muted font-medium">
                        {new Date(a.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={attendanceTone[a.status]}>{a.status}</Badge>
                      </td>
                      <td className="px-5 py-3 text-xs text-content font-medium">{a.clockIn || '--:--'}</td>
                      <td className="px-5 py-3 text-xs text-content font-medium">{a.clockOut || '--:--'}</td>
                      <td className="px-5 py-3 text-xs text-content text-right font-bold">
                        {a.hours > 0 ? `${a.hours} hrs` : '--'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
