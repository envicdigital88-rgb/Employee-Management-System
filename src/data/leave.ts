import { LeaveRequest, LeaveBalance } from '../types';
import { employees } from './employees';

export const leaveRequests: LeaveRequest[] = [
{
  id: 'LV-2001',
  employeeId: 'EMP-1005',
  type: 'Sick',
  startDate: '2026-07-12',
  endDate: '2026-07-16',
  days: 5,
  reason: 'Medical recovery after minor surgery.',
  status: 'Approved',
  requestedOn: '2026-07-10'
},
{
  id: 'LV-2002',
  employeeId: 'EMP-1019',
  type: 'Annual',
  startDate: '2026-07-13',
  endDate: '2026-07-20',
  days: 6,
  reason: 'Family holiday abroad.',
  status: 'Approved',
  requestedOn: '2026-06-28'
},
{
  id: 'LV-2003',
  employeeId: 'EMP-1003',
  type: 'Annual',
  startDate: '2026-07-21',
  endDate: '2026-07-25',
  days: 5,
  reason: 'Personal time off.',
  status: 'Pending',
  requestedOn: '2026-07-11'
},
{
  id: 'LV-2004',
  employeeId: 'EMP-1023',
  type: 'Sick',
  startDate: '2026-07-15',
  endDate: '2026-07-15',
  days: 1,
  reason: 'Doctor appointment.',
  status: 'Pending',
  requestedOn: '2026-07-13'
},
{
  id: 'LV-2005',
  employeeId: 'EMP-1013',
  type: 'Unpaid',
  startDate: '2026-08-01',
  endDate: '2026-08-14',
  days: 10,
  reason: 'Extended personal travel.',
  status: 'Pending',
  requestedOn: '2026-07-09'
},
{
  id: 'LV-2006',
  employeeId: 'EMP-1017',
  type: 'Parental',
  startDate: '2026-09-01',
  endDate: '2026-11-24',
  days: 60,
  reason: 'Paternity leave — new baby.',
  status: 'Pending',
  requestedOn: '2026-07-08'
},
{
  id: 'LV-2007',
  employeeId: 'EMP-1035',
  type: 'Annual',
  startDate: '2026-07-28',
  endDate: '2026-07-30',
  days: 3,
  reason: 'Long weekend break.',
  status: 'Pending',
  requestedOn: '2026-07-12'
},
{
  id: 'LV-2008',
  employeeId: 'EMP-1011',
  type: 'Sick',
  startDate: '2026-07-02',
  endDate: '2026-07-03',
  days: 2,
  reason: 'Flu.',
  status: 'Approved',
  requestedOn: '2026-07-01'
},
{
  id: 'LV-2009',
  employeeId: 'EMP-1024',
  type: 'Annual',
  startDate: '2026-06-10',
  endDate: '2026-06-14',
  days: 5,
  reason: 'Vacation.',
  status: 'Rejected',
  requestedOn: '2026-06-01'
},
{
  id: 'LV-2010',
  employeeId: 'EMP-1032',
  type: 'Bereavement',
  startDate: '2026-07-16',
  endDate: '2026-07-18',
  days: 3,
  reason: 'Family bereavement.',
  status: 'Pending',
  requestedOn: '2026-07-14'
}];


// Default statutory leave quota allocation rules (e.g. Sri Lanka Labour Law standards)
export const getDefaultLeaveQuota = (status?: string): Record<string, number> => {
  if (status === 'Probation') {
    // Under Sri Lanka labour standards, probation employees are entitled to 0.5 (half day) casual leave per month
    return {
      'Half Day': 0.5,
      'Casual': 0.5,
      'Medical': 0,
      'Sick': 0,
      'Annual': 0,
      'Parental': 0,
      'Bereavement': 0,
      'Unpaid': 30,
    };
  }
  
  // Permanent employees standard quota allocation
  return {
    'Annual': 14,
    'Casual': 7,
    'Medical': 14,
    'Sick': 14,
    'Half Day': 4,
    'Parental': 60,
    'Bereavement': 3,
    'Unpaid': 30,
  };
};

// Deterministic balance per employee.
export const leaveBalances: LeaveBalance[] = employees.map((e, i) => {
  const defaultAlloc = getDefaultLeaveQuota(e.status);
  const annualTotal = defaultAlloc['Annual'];
  const sickTotal = defaultAlloc['Medical'];
  const annualUsed = i * 3 % 14;
  const sickUsed = i * 2 % 7;

  return {
    employeeId: e.id,
    allocations: {
      'Annual': { allocated: annualTotal, used: annualUsed, remaining: Math.max(0, annualTotal - annualUsed) },
      'Casual': { allocated: defaultAlloc['Casual'], used: 1, remaining: Math.max(0, defaultAlloc['Casual'] - 1) },
      'Medical': { allocated: sickTotal, used: sickUsed, remaining: Math.max(0, sickTotal - sickUsed) },
      'Sick': { allocated: sickTotal, used: sickUsed, remaining: Math.max(0, sickTotal - sickUsed) },
      'Half Day': { allocated: defaultAlloc['Half Day'], used: 0, remaining: defaultAlloc['Half Day'] },
      'Parental': { allocated: defaultAlloc['Parental'], used: 0, remaining: defaultAlloc['Parental'] },
      'Bereavement': { allocated: defaultAlloc['Bereavement'], used: 0, remaining: defaultAlloc['Bereavement'] },
      'Unpaid': { allocated: defaultAlloc['Unpaid'], used: 0, remaining: defaultAlloc['Unpaid'] },
    },
    annualTotal,
    annualUsed,
    sickTotal,
    sickUsed,
  };
});

export const getLeaveBalance = (employeeId: string): LeaveBalance | undefined =>
  leaveBalances.find((b) => b.employeeId === employeeId);