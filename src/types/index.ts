// Domain types for the ENVIC HRMS.
// Every entity mirrors a MySQL table; cross-references use *Id fields as foreign keys.

export type EmployeeStatus = 'Permanent' | 'Probation' | 'On Leave' | 'Terminated';
export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Intern';

export interface Department {
  id: string; // dept_id (PK)
  name: string;
  headEmployeeId: string | null; // FK -> employees.id
  budget: number; // annual, USD
  location: string;
  colorHex: string; // UI accent for charts/badges
}

export interface Employee {
  id: string; // employee_id (PK)  e.g. "EMP-1042"
  firstName: string;
  lastName: string;
  preferredName?: string | null;
  email: string;
  phone: string;
  avatarUrl: string;
  departmentId: string; // FK -> departments.id
  role: string; // job title
  status: EmployeeStatus;
  employmentType: EmploymentType;
  joinDate: string; // ISO date
  location: string;
  managerId: string | null; // FK -> employees.id (self-ref)
  salary: number; // annual base, USD
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string; // ISO date
  address: string;
  nic?: string;
  isActive?: boolean;
  isAdmin?: boolean;
  shift?: string;
}

export type AttendanceStatus =
'Present' |
'Absent' |
'Late' |
'WFH' |
'On Leave';

export interface AttendanceRecord {
  id: string; // PK
  employeeId: string; // FK -> employees.id
  date: string; // ISO date
  status: AttendanceStatus;
  clockIn: string | null; // "09:04"
  clockOut: string | null; // "18:12"
  hours: number;
}

export type LeaveType =
'Annual' |
'Sick' |
'Unpaid' |
'Parental' |
'Bereavement';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: string; // PK
  employeeId: string; // FK -> employees.id
  type: LeaveType;
  startDate: string; // ISO date
  endDate: string; // ISO date
  days: number;
  reason: string;
  status: LeaveStatus;
  requestedOn: string; // ISO date
}

export interface LeaveBalance {
  employeeId: string; // FK -> employees.id
  annualTotal: number;
  annualUsed: number;
  sickTotal: number;
  sickUsed: number;
}

export type PayrollStatus = 'Paid' | 'Pending' | 'Processing';

export interface PayrollRecord {
  id: string; // PK
  employeeId: string; // FK -> employees.id
  period: string; // "2026-06"
  baseSalary: number; // monthly
  allowances: number;
  bonus: number;
  deductions: number; // tax + benefits
  tax: number;
  netPay: number;
  status: PayrollStatus;
  payDate: string | null; // ISO date
}

export type ReviewStatus = 'Completed' | 'Upcoming' | 'In Progress';

export interface PerformanceGoal {
  label: string;
  progress: number; // 0-100
}

export interface PerformanceReview {
  id: string; // PK
  employeeId: string; // FK -> employees.id
  cycle: string; // "H1 2026"
  reviewerId: string; // FK -> employees.id
  rating: number; // 1-5
  status: ReviewStatus;
  date: string; // ISO date (scheduled or completed)
  summary: string;
  goals: PerformanceGoal[];
}

export type CandidateStage =
'Applied' |
'Screening' |
'Interview' |
'Offer' |
'Hired';

export interface Position {
  id: string; // PK
  title: string;
  departmentId: string; // FK -> departments.id
  location: string;
  employmentType: EmploymentType;
  openings: number;
  postedDate: string; // ISO date
  status: 'Open' | 'Closed';
}

export interface Candidate {
  id: string; // PK
  name: string;
  email: string;
  avatarUrl: string;
  positionId: string; // FK -> positions.id
  stage: CandidateStage;
  appliedDate: string; // ISO date
  rating: number; // 1-5
  source: string;
}

export interface OnboardingTask {
  id: string;
  employeeId: string; // FK -> employees.id
  label: string;
  done: boolean;
}

export interface ActivityItem {
  id: string;
  type: 'hire' | 'leave' | 'review' | 'payroll' | 'attendance';
  message: string;
  timestamp: string; // ISO datetime
}

export interface Notification {
  id: string;
  recipientId: string;
  message: string;
  createdAt: string;
  read: boolean;
  type: 'attendance' | 'leave' | 'info';
}