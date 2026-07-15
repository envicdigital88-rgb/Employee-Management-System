import React, { useMemo } from 'react';
import { 
  ClockIcon, 
  CalendarIcon, 
  WalletIcon, 
  TargetIcon, 
  CheckCircle2Icon, 
  PlayIcon, 
  ArrowRightIcon 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useHrms } from '../../store/HrmsContext';
import { Card, CardHeader } from '../ui/Card';
import { KpiCard } from './KpiCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell 
} from 'recharts';
import { 
  chartColors, 
  tooltipStyle, 
  axisProps 
} from '../charts/chartTheme';
import { currency, compactCurrency } from '../../lib/format';
import { todayISO } from '../../data/attendance';

export function EmployeeDashboard() {
  const { 
    currentUser, 
    attendanceRecords, 
    getLeaveBalance, 
    getPayrollForEmployee, 
    getReviewsForEmployee, 
    leaveRequests,
    clockIn,
    clockOut
  } = useHrms();

  if (!currentUser) return null;

  // Filter logs for this employee
  const myAttendance = useMemo(() => 
    attendanceRecords.filter(a => a.employeeId === currentUser.id),
    [attendanceRecords, currentUser.id]
  );

  const todayRecord = useMemo(() => 
    myAttendance.find(a => a.date === todayISO),
    [myAttendance]
  );

  const myLeaves = useMemo(() => 
    leaveRequests.filter(l => l.employeeId === currentUser.id),
    [leaveRequests, currentUser.id]
  );

  const myPayroll = useMemo(() => 
    getPayrollForEmployee(currentUser.id),
    [getPayrollForEmployee, currentUser.id]
  );

  const myReviews = useMemo(() => 
    getReviewsForEmployee(currentUser.id),
    [getReviewsForEmployee, currentUser.id]
  );

  // Calculations
  const attendanceRate = useMemo(() => {
    if (myAttendance.length === 0) return 100;
    const present = myAttendance.filter(a => a.status === 'Present' || a.status === 'WFH' || a.status === 'Late').length;
    return Math.round((present / myAttendance.length) * 100);
  }, [myAttendance]);

  const leaveBalance = useMemo(() => 
    getLeaveBalance(currentUser.id),
    [getLeaveBalance, currentUser.id]
  );

  const latestPay = useMemo(() => {
    if (myPayroll.length === 0) return 0;
    // Sort by period descending
    const sorted = [...myPayroll].sort((a, b) => b.period.localeCompare(a.period));
    return sorted[0].netPay;
  }, [myPayroll]);

  const activeGoals = useMemo(() => {
    if (myReviews.length === 0) return [];
    const sorted = [...myReviews].sort((a, b) => b.date.localeCompare(a.date));
    return sorted[0].goals || [];
  }, [myReviews]);

  // Chart data: Attendance history formatted
  const chartData = useMemo(() => {
    const sorted = [...myAttendance]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-10);
    
    return sorted.map(a => ({
      date: new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      hours: a.hours,
      status: a.status
    }));
  }, [myAttendance]);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-2xl border border-line bg-surface p-6 relative overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <h2 className="text-xl font-bold text-content">Welcome back, {currentUser.firstName}!</h2>
          <p className="mt-1 text-sm text-content-muted leading-relaxed">
            Check your clock-in status, review leave balances, and view your upcoming schedule.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-accent/5 to-transparent pointer-events-none" />
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Attendance Rate"
          value={`${attendanceRate}%`}
          icon={CheckCircle2Icon}
          index={0}
        />
        <KpiCard
          label="Available Leave Days"
          value={String((leaveBalance?.annualTotal ?? 25) - (leaveBalance?.annualUsed ?? 0))}
          icon={CalendarIcon}
          index={1}
          accent
        />
        <KpiCard
          label="Latest Net Pay"
          value={currency(latestPay)}
          icon={WalletIcon}
          index={2}
        />
        <KpiCard
          label="Active Goals"
          value={String(activeGoals.length)}
          icon={TargetIcon}
          index={3}
        />
      </div>

      {/* Main dashboard content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: Clock-in widget & Attendance chart */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Clock widget */}
          <Card className="p-5 flex items-center justify-between flex-wrap gap-4 border border-line">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-surface-raised border border-line p-3 text-accent">
                <ClockIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-content-faint">Today's Attendance Status</p>
                {todayRecord ? (
                  <p className="text-sm font-semibold text-content mt-0.5">
                    Clocked In: <span className="text-accent">{todayRecord.clockIn}</span>
                    {todayRecord.clockOut && (
                      <> · Clocked Out: <span className="text-content-muted">{todayRecord.clockOut}</span></>
                    )}
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-amber-400 mt-0.5 animate-pulse">
                    You have not clocked in today.
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2.5">
              {!todayRecord ? (
                <Button variant="primary" onClick={clockIn} className="flex items-center gap-2">
                  <PlayIcon className="h-4 w-4 fill-current" />
                  Clock In
                </Button>
              ) : !todayRecord.clockOut ? (
                <Button variant="secondary" onClick={clockOut} className="flex items-center gap-2 border border-rose-500/20 text-rose-400 bg-rose-500/5 hover:bg-rose-500/10">
                  <ClockIcon className="h-4 w-4" />
                  Clock Out
                </Button>
              ) : (
                <Badge tone="green">Completed Shift ✓</Badge>
              )}
            </div>
          </Card>

          {/* Attendance Chart */}
          <Card>
            <CardHeader
              title="My Clocked Hours"
              subtitle="Hours recorded over the last 10 work days"
            />
            <div className="h-72 p-5 pt-0">
              {chartData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-xs text-content-faint">
                  No attendance history logged.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262a31" />
                    <XAxis dataKey="date" {...axisProps} />
                    <YAxis {...axisProps} label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { fill: '#8892b0', fontSize: 10 } }} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={tooltipStyle} />
                    <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, idx) => {
                        const isLate = entry.status === 'Late';
                        return <Cell key={idx} fill={isLate ? '#fbbf24' : '#22d3ee'} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

        </div>

        {/* Right column: Leaves & Goals */}
        <div className="space-y-6">
          
          {/* Leaves list */}
          <Card className="flex flex-col h-[280px]">
            <CardHeader
              title="Recent Leave Requests"
              action={
                <Link to="/leave" className="text-xs text-accent hover:underline flex items-center gap-1 font-semibold">
                  Manage <ArrowRightIcon className="h-3 w-3" />
                </Link>
              }
            />
            <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-3">
              {myLeaves.length === 0 ? (
                <p className="text-xs text-content-faint text-center py-8">No leave requests submitted.</p>
              ) : (
                myLeaves.slice(0, 4).map((l) => (
                  <div key={l.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-raised border border-line">
                    <div>
                      <p className="text-xs font-semibold text-content">{l.type} Leave</p>
                      <p className="text-[10px] text-content-faint mt-0.5">
                        {l.startDate} to {l.endDate} ({l.days} days)
                      </p>
                    </div>
                    <Badge tone={l.status === 'Approved' ? 'green' : l.status === 'Pending' ? 'amber' : 'red'}>
                      {l.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Goals progress */}
          <Card className="flex flex-col h-[280px]">
            <CardHeader title="My Performance Goals" />
            <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">
              {activeGoals.length === 0 ? (
                <p className="text-xs text-content-faint text-center py-8">No performance goals set for this cycle.</p>
              ) : (
                activeGoals.map((g, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-content truncate max-w-[80%]">{g.label}</span>
                      <span className="text-accent font-semibold">{g.progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-surface-raised overflow-hidden">
                      <div 
                        className="h-full bg-accent rounded-full transition-all duration-300"
                        style={{ width: `${g.progress}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
