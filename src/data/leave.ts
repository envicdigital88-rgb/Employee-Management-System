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


// Deterministic balance per employee.
export const leaveBalances: LeaveBalance[] = employees.map((e, i) => ({
  employeeId: e.id,
  annualTotal: 25,
  annualUsed: i * 3 % 18,
  sickTotal: 12,
  sickUsed: i * 2 % 9
}));

export const getLeaveBalance = (employeeId: string): LeaveBalance | undefined =>
leaveBalances.find((b) => b.employeeId === employeeId);