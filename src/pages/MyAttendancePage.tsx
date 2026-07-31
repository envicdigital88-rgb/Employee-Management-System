import React, { useMemo, useState } from 'react';
import { useHrms } from '../store/HrmsContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { ClockIcon, PlayIcon, LogOutIcon, HomeIcon, Building2Icon, CoffeeIcon } from 'lucide-react';
import { attendanceTone } from '../components/ui/statusMaps';
import { todayISO } from '../data/attendance';
import { showToast } from '../components/ui/Toast';

export function MyAttendancePage() {
  const { currentUser, attendanceRecords, clockIn, clockOut, startBreak, endBreak, getDepartment } = useHrms();
  const [workLocation, setWorkLocation] = useState<'office' | 'wfh'>('office');
  const [confirmClockIn, setConfirmClockIn] = useState(false);
  const [confirmClockOut, setConfirmClockOut] = useState(false);
  
  const [dateType, setDateType] = useState<'all' | 'single' | 'range'>('all');
  const [singleDate, setSingleDate] = useState(todayISO);
  const [startDate, setStartDate] = useState(todayISO);
  const [endDate, setEndDate] = useState(todayISO);

  if (!currentUser) return null;

  const userDept = getDepartment(currentUser.departmentId);
  const isBDDepartment = currentUser.departmentId === 'DEP-BD' || userDept?.name.toLowerCase() === 'business development';

  // Filter logs for this employee
  const myAttendance = useMemo(() => 
    [...attendanceRecords]
      .filter(a => {
        if (a.employeeId !== currentUser.id) return false;
        
        if (dateType === 'single') {
          if (a.date !== singleDate) return false;
        } else if (dateType === 'range') {
          if (a.date < startDate || a.date > endDate) return false;
        }
        
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date)),
    [attendanceRecords, currentUser.id, dateType, singleDate, startDate, endDate]
  );

  const todayRecord = useMemo(() => 
    attendanceRecords.find(a => a.employeeId === currentUser.id && a.date === todayISO),
    [attendanceRecords, currentUser.id]
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
              {todayRecord?.status === 'WFH' ? <HomeIcon className="h-8 w-8 text-sky-400" /> : <ClockIcon className="h-8 w-8" />}
            </div>
            <h3 className="text-lg font-bold text-content mt-4">Work Shift Control</h3>
            <p className="text-xs text-content-muted">
              {todayRecord?.status === 'WFH'
                ? 'You are working from home today. Clock out when done.'
                : 'Select your work mode and clock in to start your shift.'}
            </p>
          </div>

          <div className="py-2 w-full space-y-2">
            {!todayRecord && (
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-content-muted">Select Work Location / Mode:</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWorkLocation('office')}
                    className={`flex items-center justify-center gap-1.5 h-9 rounded-xl border text-xs font-semibold transition-colors ${
                      workLocation === 'office'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-line bg-surface text-content-muted hover:text-content'
                    }`}
                  >
                    <Building2Icon className="h-3.5 w-3.5" /> Office
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkLocation('wfh')}
                    className={`flex items-center justify-center gap-1.5 h-9 rounded-xl border text-xs font-semibold transition-colors ${
                      workLocation === 'wfh'
                        ? 'border-sky-500 bg-sky-500/10 text-sky-400'
                        : 'border-line bg-surface text-content-muted hover:text-content'
                    }`}
                  >
                    <HomeIcon className="h-3.5 w-3.5" /> Work From Home
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2 space-y-1">
              <p className="text-[10px] text-content-faint uppercase tracking-wider font-semibold">Today's Status</p>
              {todayRecord ? (
                <div className="space-y-1">
                  {todayRecord.status === 'WFH' ? (
                    <Badge tone="sky">🏠 Work From Home (WFH)</Badge>
                  ) : (
                    <Badge tone={todayRecord.status === 'Late' ? 'amber' : 'green'}>{todayRecord.status}</Badge>
                  )}
                  <p className="text-xs text-content font-medium">
                    Shift: {todayRecord.clockIn} to {todayRecord.clockOut || '--:--'}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-amber-400 font-semibold animate-pulse">
                  Not Clocked In Yet ({workLocation === 'wfh' ? '🏠 WFH Mode' : '🏢 Office'})
                </p>
              )}
            </div>
          </div>

          <div className="w-full flex gap-2">
            {!todayRecord ? (
              <Button variant="primary" className="w-full flex items-center justify-center gap-2 h-11" onClick={() => setConfirmClockIn(true)}>
                <PlayIcon className="h-4 w-4 fill-current" />
                Clock In ({workLocation === 'wfh' ? 'Work From Home' : 'Office Shift'})
              </Button>
            ) : !todayRecord.clockOut ? (
              <>
                {isBDDepartment && (
                  todayRecord.breaks?.some((b) => !b.endTime) ? (
                    <Button variant="secondary" className="flex-1 flex items-center justify-center gap-1.5 h-11 border border-amber-500/30 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20" onClick={endBreak}>
                      <CoffeeIcon className="h-4 w-4" /> End Break
                    </Button>
                  ) : (
                    <Button variant="secondary" className="flex-1 flex items-center justify-center gap-1.5 h-11 border border-amber-500/20 text-amber-300 bg-amber-500/5 hover:bg-amber-500/15" onClick={startBreak}>
                      <CoffeeIcon className="h-4 w-4" /> Start Break
                    </Button>
                  )
                )}
                <Button variant="secondary" className="flex-1 flex items-center justify-center gap-2 h-11 border border-rose-500/20 text-rose-400 bg-rose-500/5 hover:bg-rose-500/10" onClick={() => setConfirmClockOut(true)}>
                  <LogOutIcon className="h-4 w-4" /> Clock Out
                </Button>
              </>
            ) : (
              <Button variant="secondary" className="w-full h-11" disabled>
                Shift Completed
              </Button>
            )}
          </div>
        </Card>

        {/* History List Card */}
        <Card className="lg:col-span-2 flex flex-col min-h-[300px]">
          <div className="p-5 border-b border-line flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-content">Shift History</h3>
              <p className="text-xs text-content-faint mt-0.5">Logs of your attendance records</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-32">
                <select className="h-9 w-full rounded-xl border border-line bg-surface px-3 text-xs text-content focus:border-accent/50 focus:outline-none" value={dateType} onChange={(e) => setDateType(e.target.value as 'all' | 'single' | 'range')}>
                  <option value="all">All Time</option>
                  <option value="single">Single Date</option>
                  <option value="range">Date Range</option>
                </select>
              </div>

              {dateType === 'single' && (
                <div className="w-36">
                  <input type="date" className="h-9 w-full rounded-xl border border-line bg-surface px-2 text-xs text-content focus:border-accent/50 focus:outline-none" value={singleDate} onChange={(e) => setSingleDate(e.target.value)} />
                </div>
              )}
              
              {dateType === 'range' && (
                <div className="flex items-center gap-2">
                  <div className="w-32">
                    <input type="date" className="h-9 w-full rounded-xl border border-line bg-surface px-2 text-xs text-content focus:border-accent/50 focus:outline-none" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <span className="text-content-faint text-xs">to</span>
                  <div className="w-32">
                    <input type="date" className="h-9 w-full rounded-xl border border-line bg-surface px-2 text-xs text-content focus:border-accent/50 focus:outline-none" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-raised/40 text-xs font-semibold text-content-muted">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Status / Mode</th>
                  <th className="px-5 py-3">Clock In</th>
                  <th className="px-5 py-3">Clock Out</th>
                  {isBDDepartment && <th className="px-5 py-3">Breaks Log</th>}
                  <th className="px-5 py-3 text-right">Hours Worked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {myAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={isBDDepartment ? 6 : 5} className="px-5 py-8 text-center text-xs text-content-faint">
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
                        <Badge tone={a.status === 'WFH' ? 'sky' : attendanceTone[a.status]}>
                          {a.status === 'WFH' ? '🏠 WFH' : a.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-xs text-content font-medium">{a.clockIn || '--:--'}</td>
                      <td className="px-5 py-3 text-xs text-content font-medium">{a.clockOut || '--:--'}</td>
                      {isBDDepartment && (
                        <td className="px-5 py-3 text-xs text-content-muted font-medium">
                          {a.breaks && a.breaks.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {a.breaks.map((b, idx) => (
                                <span key={b.id || idx} className="bg-surface-raised px-2 py-0.5 rounded border border-line text-[11px] text-amber-300 font-mono">
                                  ☕ {b.startTime} - {b.endTime || 'Ongoing'} {b.durationMinutes ? `(${b.durationMinutes}m)` : ''}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-content-faint">—</span>
                          )}
                        </td>
                      )}
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

      <ConfirmationModal
        open={confirmClockIn}
        onClose={() => setConfirmClockIn(false)}
        onConfirm={async () => {
          await clockIn(workLocation === 'wfh');
          showToast(`You have clocked in for ${workLocation === 'wfh' ? 'Work From Home (WFH)' : 'Office Shift'}!`, 'success');
        }}
        title={`Clock In (${workLocation === 'wfh' ? 'Work From Home' : 'Office Shift'})`}
        message={`Confirm that you are starting your work shift right now as ${workLocation === 'wfh' ? 'Work From Home (WFH)' : 'Office Shift'}. Your clock-in time will be recorded.`}
        confirmText="Clock In"
        variant="primary"
      />

      <ConfirmationModal
        open={confirmClockOut}
        onClose={() => setConfirmClockOut(false)}
        onConfirm={async () => {
          await clockOut();
          showToast('You have clocked out. Have a great rest of your day!', 'success');
        }}
        title="Clock Out Shift"
        message="Confirm that you are ending your work shift now. Your total hours will be calculated and recorded."
        confirmText="Clock Out"
        variant="primary"
      />
    </div>
  );
}
