import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StarIcon, TargetIcon, CheckCircle2Icon, ClockIcon } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell } from
'recharts';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { KpiCard } from '../components/dashboard/KpiCard';
import { useHrms } from '../store/HrmsContext';
import { fullName } from '../data/employees';
import { reviewStatusTone } from '../components/ui/statusMaps';
import { formatDate } from '../lib/format';
import {
  chartColors,
  tooltipStyle,
  axisProps } from
'../components/charts/chartTheme';
const FILTERS = ['All', 'Upcoming', 'In Progress', 'Completed'] as const;
export function PerformancePage() {
  const navigate = useNavigate();
  const { employees, getDepartment, getEmployee, performanceReviews } = useHrms();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const reviews = useMemo(() => {
    const ids = new Set(employees.map((e) => e.id));
    return performanceReviews.filter((r) => ids.has(r.employeeId));
  }, [employees]);
  const stats = useMemo(() => {
    const avg =
    reviews.reduce((s, r) => s + r.rating, 0) / (reviews.length || 1);
    const completed = reviews.filter((r) => r.status === 'Completed').length;
    const upcoming = reviews.filter((r) => r.status === 'Upcoming').length;
    return {
      avg,
      completed,
      upcoming,
      total: reviews.length
    };
  }, [reviews]);
  const distribution = useMemo(() => {
    const buckets = [
    {
      name: '1–2',
      min: 0,
      max: 2.5,
      count: 0,
      color: '#f87171'
    },
    {
      name: '2.5–3.5',
      min: 2.5,
      max: 3.5,
      count: 0,
      color: '#fbbf24'
    },
    {
      name: '3.5–4.5',
      min: 3.5,
      max: 4.5,
      count: 0,
      color: '#22d3ee'
    },
    {
      name: '4.5–5',
      min: 4.5,
      max: 5.1,
      count: 0,
      color: '#34d399'
    }];

    reviews.forEach((r) => {
      const b = buckets.find((x) => r.rating >= x.min && r.rating < x.max);
      if (b) b.count += 1;
    });
    return buckets;
  }, [reviews]);
  const filtered = reviews.filter(
    (r) => filter === 'All' || r.status === filter
  );
  return (
    <div>
      <PageHeader
        title="Performance"
        description="H1 2026 review cycle · ratings, goals, and KPIs." />
      

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Avg rating"
          value={`${stats.avg.toFixed(1)}/5`}
          icon={StarIcon}
          index={0}
          accent />
        
        <KpiCard
          label="Reviews total"
          value={String(stats.total)}
          icon={TargetIcon}
          index={1} />
        
        <KpiCard
          label="Completed"
          value={String(stats.completed)}
          icon={CheckCircle2Icon}
          index={2} />
        
        <KpiCard
          label="Upcoming"
          value={String(stats.upcoming)}
          icon={ClockIcon}
          index={3} />
        
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader title="Rating distribution" />
          <div className="h-64 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={distribution}
                margin={{
                  top: 8,
                  right: 8,
                  left: -20,
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
                
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {distribution.map((d) =>
                  <Cell key={d.name} fill={d.color} />
                  )}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-2 overflow-hidden">
          <div className="flex gap-1 border-b border-line px-3">
            {FILTERS.map((f) =>
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-3 text-sm font-medium transition-colors ${filter === f ? 'text-accent' : 'text-content-muted hover:text-content'}`}>
              
                {f}
              </button>
            )}
          </div>
          <ul className="max-h-[420px] divide-y divide-line overflow-y-auto">
            {filtered.map((r) => {
              const emp = getEmployee(r.employeeId);
              if (!emp) return null;
              return (
                <li key={r.id}>
                  <button
                    onClick={() => navigate(`/employees/${emp.id}`)}
                    className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-white/[0.02]">
                    
                    <Avatar
                      src={emp.avatarUrl}
                      name={fullName(emp)}
                      size="sm" />
                    
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-content">
                        {fullName(emp)}
                      </p>
                      <p className="truncate text-xs text-content-muted">
                        {getDepartment(emp.departmentId)?.name} ·{' '}
                        {formatDate(r.date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <StarIcon className="h-4 w-4 fill-accent text-accent" />
                      <span className="text-sm font-semibold text-content">
                        {r.rating.toFixed(1)}
                      </span>
                    </div>
                    <Badge tone={reviewStatusTone[r.status]}>{r.status}</Badge>
                  </button>
                </li>);

            })}
          </ul>
        </Card>
      </div>
    </div>);

}