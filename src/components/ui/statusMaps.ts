import {
  EmployeeStatus,
  AttendanceStatus,
  LeaveStatus,
  PayrollStatus,
  ReviewStatus,
  CandidateStage } from
'../../types';

type Tone = 'accent' | 'green' | 'amber' | 'red' | 'purple' | 'blue' | 'neutral';

export const employeeStatusTone: Record<EmployeeStatus, Tone> = {
  Permanent: 'green',
  Probation: 'amber',
  'On Leave': 'blue',
  Terminated: 'red'
};

export const attendanceTone: Record<AttendanceStatus, Tone> = {
  Present: 'green',
  Absent: 'red',
  Late: 'amber',
  WFH: 'blue',
  'On Leave': 'purple'
};

export const leaveStatusTone: Record<LeaveStatus, Tone> = {
  Pending: 'amber',
  Approved: 'green',
  Rejected: 'red'
};

export const payrollStatusTone: Record<PayrollStatus, Tone> = {
  Paid: 'green',
  Pending: 'amber',
  Processing: 'blue'
};

export const reviewStatusTone: Record<ReviewStatus, Tone> = {
  Completed: 'green',
  Upcoming: 'blue',
  'In Progress': 'amber'
};

export const candidateStageTone: Record<CandidateStage, Tone> = {
  Applied: 'neutral',
  Screening: 'blue',
  Interview: 'purple',
  Offer: 'amber',
  Hired: 'green'
};