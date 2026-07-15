import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  WalletIcon,
  TrendingUpIcon,
  ReceiptIcon,
  DownloadIcon,
  XIcon } from
'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { KpiCard } from '../components/dashboard/KpiCard';
import { Modal } from '../components/ui/Modal';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { showToast } from '../components/ui/Toast';
import { useHrms } from '../store/HrmsContext';
import { fullName } from '../data/employees';
import { currentPeriod } from '../data/payroll';
import { payrollStatusTone } from '../components/ui/statusMaps';
import { currency, compactCurrency } from '../lib/format';
import { PayrollRecord } from '../types';
export function PayrollPage() {
  const { employees, getDepartment, getEmployee, payrollRecords } = useHrms();
  const [payslip, setPayslip] = useState<PayrollRecord | null>(null);
  const [confirmRunPayroll, setConfirmRunPayroll] = useState(false);
  const rows = useMemo(() => {
    const ids = new Set(employees.map((e) => e.id));
    return payrollRecords.filter((p) => ids.has(p.employeeId));
  }, [employees]);
  const totals = useMemo(() => {
    const gross = rows.reduce(
      (s, p) => s + p.baseSalary + p.allowances + p.bonus,
      0
    );
    const net = rows.reduce((s, p) => s + p.netPay, 0);
    const deductions = rows.reduce((s, p) => s + p.deductions, 0);
    const paid = rows.filter((p) => p.status === 'Paid').length;
    return {
      gross,
      net,
      deductions,
      paid
    };
  }, [rows]);
  const payslipEmp = payslip ? getEmployee(payslip.employeeId) : null;
  return (
    <div>
      <PageHeader
        title="Payroll"
        description={`Payroll run for ${currentPeriod} · ${rows.length} employees`}
        actions={
        <Button variant="primary" onClick={() => setConfirmRunPayroll(true)}>
            <ReceiptIcon className="h-4 w-4" />
            Run payroll
          </Button>
        } />
      

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Net payroll"
          value={compactCurrency(totals.net)}
          icon={WalletIcon}
          index={0}
          accent />
        
        <KpiCard
          label="Gross payroll"
          value={compactCurrency(totals.gross)}
          icon={TrendingUpIcon}
          index={1} />
        
        <KpiCard
          label="Total deductions"
          value={compactCurrency(totals.deductions)}
          icon={ReceiptIcon}
          index={2} />
        
        <KpiCard
          label="Paid"
          value={`${totals.paid}/${rows.length}`}
          icon={WalletIcon}
          index={3} />
        
      </div>

      <Card className="overflow-hidden">
        <CardHeader
          title="Salary overview"
          subtitle={`Period ${currentPeriod}`} />
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-content-muted">
                <th className="px-5 py-3 font-medium">Employee</th>
                <th className="px-5 py-3 font-medium">Base</th>
                <th className="px-5 py-3 font-medium">Allowances</th>
                <th className="px-5 py-3 font-medium">Deductions</th>
                <th className="px-5 py-3 font-medium">Net pay</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Payslip</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const emp = getEmployee(p.employeeId);
                if (!emp) return null;
                return (
                  <tr
                    key={p.id}
                    className="border-b border-line/60 transition-colors hover:bg-white/[0.02]">
                    
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={emp.avatarUrl}
                          name={fullName(emp)}
                          size="xs" />
                        
                        <div>
                          <p className="font-medium text-content">
                            {fullName(emp)}
                          </p>
                          <p className="text-xs text-content-faint">
                            {getDepartment(emp.departmentId)?.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-content-muted">
                      {currency(p.baseSalary)}
                    </td>
                    <td className="px-5 py-3 text-emerald-400">
                      +{currency(p.allowances + p.bonus)}
                    </td>
                    <td className="px-5 py-3 text-red-400">
                      -{currency(p.deductions)}
                    </td>
                    <td className="px-5 py-3 font-semibold text-content">
                      {currency(p.netPay)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={payrollStatusTone[p.status]} dot>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setPayslip(p)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-content-muted transition-colors hover:bg-white/5 hover:text-accent"
                        aria-label={`View payslip for ${fullName(emp)}`}>
                        
                        <ReceiptIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>);

              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={!!payslip} onClose={() => setPayslip(null)} title="Payslip">
        {payslip && payslipEmp &&
        <div>
            <div className="flex items-center gap-3 border-b border-line pb-4">
              <Avatar
              src={payslipEmp.avatarUrl}
              name={fullName(payslipEmp)}
              size="md" />
            
              <div>
                <p className="font-semibold text-content">
                  {fullName(payslipEmp)}
                </p>
                <p className="text-xs text-content-muted">
                  {payslipEmp.role} · Period {payslip.period}
                </p>
              </div>
              <div className="ml-auto">
                <Badge tone={payrollStatusTone[payslip.status]}>
                  {payslip.status}
                </Badge>
              </div>
            </div>
            <dl className="mt-4 space-y-2.5 text-sm">
              {[
            ['Base salary', currency(payslip.baseSalary), 'text-content'],
            [
            'Allowances',
            `+${currency(payslip.allowances)}`,
            'text-emerald-400'],

            ['Bonus', `+${currency(payslip.bonus)}`, 'text-emerald-400'],
            ['Tax', `-${currency(payslip.tax)}`, 'text-red-400'],
            [
            'Benefits & other',
            `-${currency(payslip.deductions - payslip.tax)}`,
            'text-red-400']].

            map(([label, val, cls]) =>
            <div key={label} className="flex justify-between">
                  <dt className="text-content-muted">{label}</dt>
                  <dd className={cls}>{val}</dd>
                </div>
            )}
              <div className="mt-2 flex justify-between border-t border-line pt-3">
                <dt className="font-semibold text-content">Net pay</dt>
                <dd className="text-lg font-bold text-accent">
                  {currency(payslip.netPay)}
                </dd>
              </div>
            </dl>
            <div className="mt-5 flex justify-end">
              <Button variant="secondary" onClick={() => setPayslip(null)}>
                <DownloadIcon className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        }
      </Modal>

      <ConfirmationModal
        open={confirmRunPayroll}
        onClose={() => setConfirmRunPayroll(false)}
        onConfirm={() => {
          showToast(`Payroll run for ${currentPeriod} has been initiated successfully!`, 'success');
        }}
        title="Run Payroll"
        message={`Are you sure you want to run payroll for ${currentPeriod}? This will process ${rows.length} employee salary records. This action cannot be undone.`}
        confirmText="Run Payroll"
        variant="primary"
      />
    </div>);

}