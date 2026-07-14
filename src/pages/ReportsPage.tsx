import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend } from
'recharts';
import {
  UsersIcon,
  TrendingDownIcon,
  WalletIcon,
  BriefcaseIcon } from
'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { KpiCard } from '../components/dashboard/KpiCard';
import { useHrms } from '../store/HrmsContext';
import {
  chartColors,
  tooltipStyle,
  axisProps } from
'../components/charts/chartTheme';
import { compactCurrency } from '../lib/format';
export function ReportsPage() {
  const { employees, departments, payrollRecords } = useHrms();
  const headcount = useMemo(
    () =>
    departments.map((d) => ({
      name: d.name.split(' ')[0],
      headcount: employees.filter((e) => e.departmentId === d.id).length,
      color: d.colorHex
    })),
    [employees, departments]
  );
  const payrollByDept = useMemo(
    () =>
    departments.map((d) => {
      const ids = new Set(
        employees.filter((e) => e.departmentId === d.id).map((e) => e.id)
      );
      const cost = payrollRecords.
      filter((p) => ids.has(p.employeeId)).
      reduce((s, p) => s + p.netPay, 0);
      return {
        name: d.name.split(' ')[0],
        cost,
        color: d.colorHex
      };
    }),
    [employees, departments, payrollRecords]
  );
  const attrition = [
  {
    month: 'Jan',
    rate: 2.1
  },
  {
    month: 'Feb',
    rate: 1.8
  },
  {
    month: 'Mar',
    rate: 2.4
  },
  {
    month: 'Apr',
    rate: 1.5
  },
  {
    month: 'May',
    rate: 1.9
  },
  {
    month: 'Jun',
    rate: 1.2
  }];

  const typeSplit = useMemo(() => {
    const map: Record<string, number> = {};
    employees.forEach((e) => {
      map[e.employmentType] = (map[e.employmentType] || 0) + 1;
    });
    const palette = ['#22d3ee', '#a78bfa', '#34d399', '#fbbf24'];
    return Object.entries(map).map(([name, value], i) => ({
      name,
      value,
      color: palette[i % palette.length]
    }));
  }, [employees]);
  const totalPayroll = payrollRecords.reduce((s, p) => s + p.netPay, 0);
  return (
    <div>
      <PageHeader
        title="Reports"
        description="Headcount, attrition, and payroll cost analytics." />
      

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Total headcount"
          value={String(employees.length)}
          icon={UsersIcon}
          index={0}
          accent />
        
        <KpiCard
          label="Attrition (avg)"
          value="1.8%"
          icon={TrendingDownIcon}
          delta={{
            value: '-0.6%',
            positive: true
          }}
          index={1} />
        
        <KpiCard
          label="Monthly payroll"
          value={compactCurrency(totalPayroll)}
          icon={WalletIcon}
          index={2} />
        
        <KpiCard
          label="Departments"
          value={String(departments.length)}
          icon={BriefcaseIcon}
          index={3} />
        
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Headcount by department" />
          <div className="h-64 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={headcount}
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
                
                <Bar dataKey="headcount" radius={[6, 6, 0, 0]} maxBarSize={44}>
                  {headcount.map((d) =>
                  <Cell key={d.name} fill={d.color} />
                  )}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Payroll cost by department" />
          <div className="h-64 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={payrollByDept}
                margin={{
                  top: 8,
                  right: 8,
                  left: 0,
                  bottom: 0
                }}>
                
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={chartColors.grid}
                  vertical={false} />
                
                <XAxis dataKey="name" {...axisProps} />
                <YAxis
                  {...axisProps}
                  tickFormatter={(v) => compactCurrency(v)}
                  width={54} />
                
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: number) => compactCurrency(v)}
                  cursor={{
                    fill: 'rgba(255,255,255,0.03)'
                  }} />
                
                <Bar dataKey="cost" radius={[6, 6, 0, 0]} maxBarSize={44}>
                  {payrollByDept.map((d) =>
                  <Cell key={d.name} fill={d.color} />
                  )}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Attrition trend"
            subtitle="Monthly attrition rate %" />
          
          <div className="h-64 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={attrition}
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
                
                <XAxis dataKey="month" {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v) => [`${v}%`, 'Attrition']}
                  cursor={{
                    stroke: chartColors.grid
                  }} />
                
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke={chartColors.accent}
                  strokeWidth={2}
                  dot={{
                    r: 3,
                    fill: chartColors.accent
                  }} />
                
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Employment type split" />
          <div className="h-64 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeSplit}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={72}
                  paddingAngle={3}
                  stroke="none">
                  
                  {typeSplit.map((d) =>
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
    </div>);

}