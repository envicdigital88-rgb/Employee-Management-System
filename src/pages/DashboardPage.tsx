import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  UserCheckIcon,
  PlaneIcon,
  BriefcaseIcon,
  WalletIcon,
  StarIcon,
  ArrowRightIcon,
  CheckIcon,
  XIcon,
  UserPlusIcon,
  CalendarIcon } from
'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend } from
'recharts';
import { PageHeader } from '../components/ui/PageHeader';
import { KpiCard } from '../components/dashboard/KpiCard';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { useHrms } from '../store/HrmsContext';
import { EmployeeDashboard } from '../components/dashboard/EmployeeDashboard';
import { fullName } from '../data/employees';
import { todayISO } from '../data/attendance';
import {
  chartColors,
  tooltipStyle,
  axisProps } from
'../components/charts/chartTheme';
import {
  compactCurrency,
  relativeTime,
  formatDate } from
'../lib/format';
const activityIcon = {
  hire: UserPlusIcon,
  leave: PlaneIcon,
  review: StarIcon,
  payroll: WalletIcon,
  attendance: CalendarIcon
};
export function DashboardPage() {
  const navigate = useNavigate();
  const { 
    employees, 
    leaveRequests, 
    setLeaveStatus,
    departments,
    getDepartment,
    getEmployee,
    payrollRecords,
    performanceReviews,
    positions,
    activityFeed,
    attendanceRecords,
    isAdmin
  } = useHrms();
  if (!isAdmin) {
    return <EmployeeDashboard />;
  }
  const stats = useMemo(() => {
    const total = employees.length;
    const onLeave = employees.filter((e) => e.status === 'On Leave').length;
    const todays = attendanceRecords.filter((a) => a.date === todayISO);
    const present = todays.filter(
      (a) =>
      a.status === 'Present' || a.status === 'WFH' || a.status === 'Late'
    ).length;
    const openPositions = positions.
    filter((p) => p.status === 'Open').
    reduce((s, p) => s + p.openings, 0);
    const monthlyPayroll = payrollRecords.reduce((s, p) => s + p.netPay, 0);
    const avgPerf =
    performanceReviews.reduce((s, r) => s + r.rating, 0) /
    performanceReviews.length;
    return {
      total,
      onLeave,
      present: present || Math.round(total * 0.8),
      openPositions,
      monthlyPayroll,
      avgPerf
    };
  }, [employees, attendanceRecords, positions, payrollRecords, performanceReviews]);
  const headcountByDept = useMemo(
    () =>
    departments.map((d) => ({
      name: d.name.split(' ')[0],
      count: employees.filter((e) => e.departmentId === d.id).length,
      color: d.colorHex
    })),
    [employees, departments]
  );
  const attendanceTrend = useMemo(() => {
    const byDate: Record<
      string,
      {
        present: number;
        total: number;
      }> =
    {};
    attendanceRecords.forEach((a) => {
      byDate[a.date] = byDate[a.date] || {
        present: 0,
        total: 0
      };
      byDate[a.date].total += 1;
      if (a.status !== 'Absent' && a.status !== 'On Leave')
      byDate[a.date].present += 1;
    });
    return Object.entries(byDate).
    sort(([a], [b]) => a.localeCompare(b)).
    slice(-10).
    map(([date, v]) => ({
      date: new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      rate: Math.round(v.present / v.total * 100)
    }));
  }, [attendanceRecords]);
  const leaveDistribution = useMemo(() => {
    const byType: Record<string, number> = {};
    leaveRequests.forEach((l) => {
      byType[l.type] = (byType[l.type] || 0) + 1;
    });
    const palette = ['#22d3ee', '#a78bfa', '#f472b6', '#34d399', '#fbbf24'];
    return Object.entries(byType).map(([name, value], i) => ({
      name,
      value,
      color: palette[i % palette.length]
    }));
  }, [leaveRequests]);
  const pendingLeaves = leaveRequests.
  filter((l) => l.status === 'Pending').
  slice(0, 4);
  const upcomingReviews = performanceReviews.
  filter((r) => r.status === 'Upcoming').
  slice(0, 4);
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Company-wide people overview for ENVIC Digital."
        actions={
        <Button
          variant="secondary"
          size="md"
          onClick={() => navigate('/reports')}>
          
            View reports
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        } />
      

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          label="Total employees"
          value={String(stats.total)}
          icon={UsersIcon}
          delta={{
            value: '+4',
            positive: true
          }}
          index={0}
          accent />
        
        <KpiCard
          label="Present today"
          value={String(stats.present)}
          icon={UserCheckIcon}
          delta={{
            value: '92%',
            positive: true
          }}
          index={1} />
        
        <KpiCard
          label="On leave"
          value={String(stats.onLeave)}
          icon={PlaneIcon}
          index={2} />
        
        <KpiCard
          label="Open positions"
          value={String(stats.openPositions)}
          icon={BriefcaseIcon}
          delta={{
            value: '+2',
            positive: true
          }}
          index={3} />
        
        <KpiCard
          label="Monthly payroll"
          value={compactCurrency(stats.monthlyPayroll)}
          icon={WalletIcon}
          index={4} />
        
        <KpiCard
          label="Avg performance"
          value={`${stats.avgPerf.toFixed(1)}/5`}
          icon={StarIcon}
          delta={{
            value: '+0.2',
            positive: true
          }}
          index={5} />
        
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Attendance trend"
            subtitle="Present rate over the last 10 working days" />
          
          <div className="h-64 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={attendanceTrend}
                margin={{
                  top: 8,
                  right: 8,
                  left: -18,
                  bottom: 0
                }}>
                
                <defs>
                  <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={chartColors.accent}
                      stopOpacity={0.35} />
                    
                    <stop
                      offset="100%"
                      stopColor={chartColors.accent}
                      stopOpacity={0} />
                    
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={chartColors.grid}
                  vertical={false} />
                
                <XAxis dataKey="date" {...axisProps} />
                <YAxis domain={[0, 100]} {...axisProps} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v) => [`${v}%`, 'Present']}
                  cursor={{
                    stroke: chartColors.grid
                  }} />
                
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke={chartColors.accent}
                  strokeWidth={2}
                  fill="url(#attGrad)" />
                
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Leave distribution" subtitle="Requests by type" />
          <div className="h-64 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leaveDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={72}
                  paddingAngle={3}
                  stroke="none">
                  
                  {leaveDistribution.map((d) =>
                  <Cell key={d.name} fill={d.color} />
                  )}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: 11,
                    color: chartColors.axis
                  }} />
                
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Headcount by department" />
          <div className="h-64 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={headcountByDept}
                margin={{
                  top: 8,
                  right: 8,
                  left: -18,
                  bottom: 0
                }}>
                
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={chartColors.grid}
                  vertical={false} />
                
                <XAxis dataKey="name" {...axisProps} />
                <YAxis {...axisProps} allowDecimals={false} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{
                    fill: 'rgba(255,255,255,0.03)'
                  }} />
                
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={44}>
                  {headcountByDept.map((d) =>
                  <Cell key={d.name} fill={d.color} />
                  )}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Recent activity"
            action={<span className="text-xs text-content-faint">Live</span>} />
          
          <ul className="divide-y divide-line">
            {activityFeed.slice(0, 6).map((a) => {
              const Icon = activityIcon[a.type];
              return (
                <li key={a.id} className="flex gap-3 px-5 py-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-raised text-content-muted">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-content">{a.message}</p>
                    <p className="mt-0.5 text-xs text-content-faint">
                      {relativeTime(a.timestamp)}
                    </p>
                  </div>
                </li>);

            })}
          </ul>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Pending leave approvals"
            subtitle={`${leaveRequests.filter((l) => l.status === 'Pending').length} awaiting review`}
            action={
            <Link
              to="/leave"
              className="text-xs font-medium text-accent hover:underline">
              
                View all
              </Link>
            } />
          
          {pendingLeaves.length === 0 ?
          <p className="px-5 py-8 text-center text-sm text-content-muted">
              All caught up 🎉
            </p> :

          <ul className="divide-y divide-line">
              {pendingLeaves.map((l) => {
              const emp = getEmployee(l.employeeId);
              if (!emp) return null;
              return (
                <li key={l.id} className="flex items-center gap-3 px-5 py-3">
                    <Avatar
                    src={emp.avatarUrl}
                    name={fullName(emp)}
                    size="sm" />
                  
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-content">
                        {fullName(emp)}
                      </p>
                      <p className="truncate text-xs text-content-muted">
                        {l.type} · {l.days} {l.days === 1 ? 'day' : 'days'} ·{' '}
                        {formatDate(l.startDate)}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                      onClick={() => setLeaveStatus([l.id], 'Approved')}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 transition-colors hover:bg-emerald-500/20"
                      aria-label={`Approve leave for ${fullName(emp)}`}>
                      
                        <CheckIcon className="h-4 w-4" />
                      </button>
                      <button
                      onClick={() => setLeaveStatus([l.id], 'Rejected')}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20"
                      aria-label={`Reject leave for ${fullName(emp)}`}>
                      
                        <XIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </li>);

            })}
            </ul>
          }
        </Card>

        <Card>
          <CardHeader
            title="Upcoming reviews"
            subtitle="Performance cycles due soon"
            action={
            <Link
              to="/performance"
              className="text-xs font-medium text-accent hover:underline">
              
                View all
              </Link>
            } />
          
          <ul className="divide-y divide-line">
            {upcomingReviews.map((r) => {
              const emp = getEmployee(r.employeeId);
              if (!emp) return null;
              return (
                <li key={r.id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar src={emp.avatarUrl} name={fullName(emp)} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-content">
                      {fullName(emp)}
                    </p>
                    <p className="truncate text-xs text-content-muted">
                      {getDepartment(emp.departmentId)?.name} · {r.cycle}
                    </p>
                  </div>
                  <Badge tone="blue">{formatDate(r.date)}</Badge>
                </li>);

            })}
          </ul>
        </Card>
      </div>
    </div>);

}