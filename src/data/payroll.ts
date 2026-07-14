import { PayrollRecord, PayrollStatus } from '../types';
import { employees } from './employees';

const PERIOD = '2026-06';

export const payrollRecords: PayrollRecord[] = employees.map((e, i) => {
  const monthly = Math.round(e.salary / 12);
  const allowances = Math.round(monthly * 0.08);
  const bonus = i % 5 === 0 ? Math.round(monthly * 0.15) : 0;
  const tax = Math.round(monthly * 0.22);
  const benefits = Math.round(monthly * 0.05);
  const deductions = tax + benefits;
  const netPay = monthly + allowances + bonus - deductions;
  const status: PayrollStatus =
  i % 7 === 0 ? 'Pending' : i % 11 === 0 ? 'Processing' : 'Paid';
  return {
    id: `PAY-${e.id}-${PERIOD}`,
    employeeId: e.id,
    period: PERIOD,
    baseSalary: monthly,
    allowances,
    bonus,
    deductions,
    tax,
    netPay,
    status,
    payDate: status === 'Paid' ? '2026-06-30' : null
  };
});

export const currentPeriod = PERIOD;

export const getPayrollForEmployee = (employeeId: string): PayrollRecord[] =>
payrollRecords.filter((p) => p.employeeId === employeeId);