import {
  useCallback,
  useMemo,
  useState,
  useEffect,
  createContext,
  useContext
} from 'react';
import { ReactNode } from 'react';
import {
  Employee,
  LeaveRequest,
  LeaveStatus,
  Candidate,
  CandidateStage,
  EmployeeStatus,
  Department,
  AttendanceRecord,
  PayrollRecord,
  PerformanceReview,
  Position,
  OnboardingTask,
  ActivityItem,
  LeaveBalance
} from '../types';

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

// Seed Fallbacks
import { employees as seedEmployees } from '../data/employees';
import { departments as seedDepartments } from '../data/departments';
import { leaveRequests as seedLeave, leaveBalances as seedLeaveBalances } from '../data/leave';
import { candidates as seedCandidates, positions as seedPositions, onboardingTasks as seedOnboarding } from '../data/recruitment';
import { attendanceRecords as seedAttendance } from '../data/attendance';
import { payrollRecords as seedPayroll } from '../data/payroll';
import { performanceReviews as seedPerformance } from '../data/performance';
import { activityFeed as seedActivity } from '../data/activity';

// Mapping Helpers to translate DB snake_case to UI camelCase
const mapDepartmentFromDb = (d: any): Department => ({
  id: d.id,
  name: d.name,
  headEmployeeId: d.head_employee_id,
  budget: Number(d.budget),
  location: d.location,
  colorHex: d.color_hex,
});

const mapEmployeeFromDb = (e: any): Employee => ({
  id: e.id,
  firstName: e.first_name,
  lastName: e.last_name,
  email: e.email,
  phone: e.phone,
  avatarUrl: e.avatar_url,
  departmentId: e.department_id,
  role: e.role,
  status: e.status as EmployeeStatus,
  employmentType: e.employment_type,
  joinDate: e.join_date,
  location: e.location,
  managerId: e.manager_id,
  salary: Number(e.salary),
  gender: e.gender,
  dateOfBirth: e.date_of_birth,
  address: e.address,
});

const mapEmployeeToDb = (e: Partial<Employee>): any => {
  const res: any = {};
  if (e.id !== undefined) res.id = e.id;
  if (e.firstName !== undefined) res.first_name = e.firstName;
  if (e.lastName !== undefined) res.last_name = e.lastName;
  if (e.email !== undefined) res.email = e.email;
  if (e.phone !== undefined) res.phone = e.phone;
  if (e.avatarUrl !== undefined) res.avatar_url = e.avatarUrl;
  if (e.departmentId !== undefined) res.department_id = e.departmentId;
  if (e.role !== undefined) res.role = e.role;
  if (e.status !== undefined) res.status = e.status;
  if (e.employmentType !== undefined) res.employment_type = e.employmentType;
  if (e.joinDate !== undefined) res.join_date = e.joinDate;
  if (e.location !== undefined) res.location = e.location;
  if (e.managerId !== undefined) res.manager_id = e.managerId;
  if (e.salary !== undefined) res.salary = e.salary;
  if (e.gender !== undefined) res.gender = e.gender;
  if (e.dateOfBirth !== undefined) res.date_of_birth = e.dateOfBirth;
  if (e.address !== undefined) res.address = e.address;
  return res;
};

const mapPositionFromDb = (p: any): Position => ({
  id: p.id,
  title: p.title,
  departmentId: p.department_id,
  location: p.location,
  employmentType: p.employment_type,
  openings: p.openings,
  postedDate: p.posted_date,
  status: p.status,
});

const mapCandidateFromDb = (c: any): Candidate => ({
  id: c.id,
  name: c.name,
  email: c.email,
  avatarUrl: c.avatar_url,
  positionId: c.position_id,
  stage: c.stage as CandidateStage,
  appliedDate: c.applied_date,
  rating: Number(c.rating),
  source: c.source,
});

const mapLeaveFromDb = (l: any): LeaveRequest => ({
  id: l.id,
  employeeId: l.employee_id,
  type: l.type,
  startDate: l.start_date,
  endDate: l.end_date,
  days: Number(l.days),
  reason: l.reason,
  status: l.status as LeaveStatus,
  requestedOn: l.requested_on,
});

const mapAttendanceFromDb = (a: any): AttendanceRecord => ({
  id: a.id,
  employeeId: a.employee_id,
  date: a.date,
  status: a.status,
  clockIn: a.clock_in,
  clockOut: a.clock_out,
  hours: Number(a.hours),
});

const mapPayrollFromDb = (p: any): PayrollRecord => ({
  id: p.id,
  employeeId: p.employee_id,
  period: p.period,
  baseSalary: Number(p.base_salary),
  allowances: Number(p.allowances),
  bonus: Number(p.bonus),
  deductions: Number(p.deductions),
  tax: Number(p.tax),
  netPay: Number(p.net_pay),
  status: p.status,
  payDate: p.pay_date,
});

const mapPerformanceFromDb = (p: any): PerformanceReview => ({
  id: p.id,
  employeeId: p.employee_id,
  cycle: p.cycle,
  reviewerId: p.reviewer_id,
  rating: Number(p.rating),
  status: p.status,
  date: p.date,
  summary: p.summary,
  goals: p.goals,
});

const mapOnboardingFromDb = (o: any): OnboardingTask => ({
  id: o.id,
  employeeId: o.employee_id,
  label: o.label,
  done: o.done,
});

const mapActivityFromDb = (a: any): ActivityItem => ({
  id: a.id,
  type: a.type,
  message: a.message,
  timestamp: a.timestamp,
});

interface HrmsState {
  employees: Employee[];
  leaveRequests: LeaveRequest[];
  candidates: Candidate[];
  departments: Department[];
  attendanceRecords: AttendanceRecord[];
  payrollRecords: PayrollRecord[];
  performanceReviews: PerformanceReview[];
  positions: Position[];
  onboardingTasks: OnboardingTask[];
  activityFeed: ActivityItem[];
  isLoading: boolean;
  isLive: boolean;
  connectionError: string | null;
  
  // Mutations
  addEmployee: (e: Omit<Employee, 'id' | 'avatarUrl'>) => void;
  updateEmployeeStatus: (ids: string[], status: EmployeeStatus) => void;
  assignDepartment: (ids: string[], departmentId: string) => void;
  setLeaveStatus: (ids: string[], status: LeaveStatus) => void;
  moveCandidate: (id: string, stage: CandidateStage) => void;

  // Utility Lookups
  getEmployee: (id: string | null) => Employee | undefined;
  getDepartment: (id: string) => Department | undefined;
  getPayrollForEmployee: (employeeId: string) => PayrollRecord[];
  getReviewsForEmployee: (employeeId: string) => PerformanceReview[];
  getLeaveBalance: (employeeId: string) => LeaveBalance | undefined;
}

const HrmsCtx = createContext<HrmsState | null>(null);

const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=14171c,1a1d23,262a31&radius=50`;

export function HrmsProvider({ children }: { children: ReactNode }) {
  // Local state initialized with fallback seeds
  const [employees, setEmployees] = useState<Employee[]>(seedEmployees);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(seedLeave);
  const [candidates, setCandidates] = useState<Candidate[]>(seedCandidates);
  const [departments, setDepartments] = useState<Department[]>(seedDepartments);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(seedAttendance);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(seedPayroll);
  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>(seedPerformance);
  const [positions, setPositions] = useState<Position[]>(seedPositions);
  const [onboardingTasks, setOnboardingTasks] = useState<OnboardingTask[]>(seedOnboarding);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>(seedActivity);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Initial Fetch Effect
  useEffect(() => {
    async function loadData() {
      if (!isSupabaseConfigured() || !supabase) {
        console.log('Supabase not configured. Running in Demo Mode.');
        setIsLive(false);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('Connecting to live Supabase database...');

        const [
          { data: dbDepts, error: errDepts },
          { data: dbEmps, error: errEmps },
          { data: dbLeaves, error: errLeaves },
          { data: dbCands, error: errCands },
          { data: dbAtt, error: errAtt },
          { data: dbPay, error: errPay },
          { data: dbPerf, error: errPerf },
          { data: dbPos, error: errPos },
          { data: dbOnb, error: errOnb },
          { data: dbAct, error: errAct }
        ] = await Promise.all([
          supabase.from('departments').select('*'),
          supabase.from('employees').select('*'),
          supabase.from('leave_requests').select('*'),
          supabase.from('candidates').select('*'),
          supabase.from('attendance_records').select('*'),
          supabase.from('payroll_records').select('*'),
          supabase.from('performance_reviews').select('*'),
          supabase.from('positions').select('*'),
          supabase.from('onboarding_tasks').select('*'),
          supabase.from('activity_feed').select('*')
        ]);

        if (
          errDepts || errEmps || errLeaves || errCands || 
          errAtt || errPay || errPerf || errPos || errOnb || errAct
        ) {
          const errors = [
            errDepts, errEmps, errLeaves, errCands, 
            errAtt, errPay, errPerf, errPos, errOnb, errAct
          ].filter(Boolean).map(e => e?.message).join(', ');
          throw new Error(errors || 'Error querying database tables.');
        }

        if (dbDepts && dbEmps) {
          setDepartments(dbDepts.map(mapDepartmentFromDb));
          setEmployees(dbEmps.map(mapEmployeeFromDb));
          if (dbLeaves) setLeaveRequests(dbLeaves.map(mapLeaveFromDb));
          if (dbCands) setCandidates(dbCands.map(mapCandidateFromDb));
          if (dbAtt) setAttendanceRecords(dbAtt.map(mapAttendanceFromDb));
          if (dbPay) setPayrollRecords(dbPay.map(mapPayrollFromDb));
          if (dbPerf) setPerformanceReviews(dbPerf.map(mapPerformanceFromDb));
          if (dbPos) setPositions(dbPos.map(mapPositionFromDb));
          if (dbOnb) setOnboardingTasks(dbOnb.map(mapOnboardingFromDb));
          if (dbAct) setActivityFeed(dbAct.map(mapActivityFromDb));

          setIsLive(true);
          setConnectionError(null);
          console.log('Successfully loaded all tables from Supabase PostgreSQL!');
        }
      } catch (err: any) {
        console.error('Failed to query Supabase tables, falling back to Demo Mode:', err);
        setConnectionError(err.message || 'Failed to connect to database');
        setIsLive(false);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Mutations
  const addEmployee = useCallback(
    async (data: Omit<Employee, 'id' | 'avatarUrl'>) => {
      const nextNum = 1000 + employees.length + 1;
      const id = `EMP-${nextNum}`;
      const name = `${data.firstName} ${data.lastName}`;
      const avatarUrl = avatar(name);

      const newEmp: Employee = {
        ...data,
        id,
        avatarUrl
      };

      // Optimistically update local React state
      setEmployees((prev) => [newEmp, ...prev]);

      if (isLive && supabase) {
        try {
          const dbRow = mapEmployeeToDb(newEmp);
          const { error } = await supabase.from('employees').insert(dbRow);
          if (error) {
            console.error('Failed to insert employee in database:', error);
          } else {
            console.log(`Successfully added employee ${id} to database.`);
          }
        } catch (err) {
          console.error('Network error inserting employee:', err);
        }
      }
    },
    [employees.length, isLive]
  );

  const updateEmployeeStatus = useCallback(
    async (ids: string[], status: EmployeeStatus) => {
      // Optimistically update local React state
      setEmployees((prev) =>
        prev.map((e) => (ids.includes(e.id) ? { ...e, status } : e))
      );

      if (isLive && supabase) {
        try {
          const { error } = await supabase
            .from('employees')
            .update({ status })
            .in('id', ids);
          if (error) {
            console.error('Failed to update employee status in database:', error);
          }
        } catch (err) {
          console.error('Network error updating employee status:', err);
        }
      }
    },
    [isLive]
  );

  const assignDepartment = useCallback(
    async (ids: string[], departmentId: string) => {
      // Optimistically update local React state
      setEmployees((prev) =>
        prev.map((e) => (ids.includes(e.id) ? { ...e, departmentId } : e))
      );

      if (isLive && supabase) {
        try {
          const { error } = await supabase
            .from('employees')
            .update({ department_id: departmentId })
            .in('id', ids);
          if (error) {
            console.error('Failed to assign department in database:', error);
          }
        } catch (err) {
          console.error('Network error assigning department:', err);
        }
      }
    },
    [isLive]
  );

  const setLeaveStatus = useCallback(
    async (ids: string[], status: LeaveStatus) => {
      // Optimistically update local React state
      setLeaveRequests((prev) =>
        prev.map((l) => (ids.includes(l.id) ? { ...l, status } : l))
      );

      if (isLive && supabase) {
        try {
          const { error } = await supabase
            .from('leave_requests')
            .update({ status })
            .in('id', ids);
          if (error) {
            console.error('Failed to update leave status in database:', error);
          }
        } catch (err) {
          console.error('Network error updating leave status:', err);
        }
      }
    },
    [isLive]
  );

  const moveCandidate = useCallback(
    async (id: string, stage: CandidateStage) => {
      // Optimistically update local React state
      setCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, stage } : c))
      );

      if (isLive && supabase) {
        try {
          const { error } = await supabase
            .from('candidates')
            .update({ stage })
            .eq('id', id);
          if (error) {
            console.error('Failed to update candidate stage in database:', error);
          }
        } catch (err) {
          console.error('Network error updating candidate stage:', err);
        }
      }
    },
    [isLive]
  );

  // Lookups
  const getEmployee = useCallback(
    (id: string | null): Employee | undefined => {
      return employees.find((e) => e.id === id);
    },
    [employees]
  );

  const getDepartment = useCallback(
    (id: string): Department | undefined => {
      return departments.find((d) => d.id === id);
    },
    [departments]
  );

  const getPayrollForEmployee = useCallback(
    (employeeId: string): PayrollRecord[] => {
      return payrollRecords.filter((p) => p.employeeId === employeeId);
    },
    [payrollRecords]
  );

  const getReviewsForEmployee = useCallback(
    (employeeId: string): PerformanceReview[] => {
      return performanceReviews.filter((r) => r.employeeId === employeeId);
    },
    [performanceReviews]
  );

  const getLeaveBalance = useCallback(
    (employeeId: string): LeaveBalance | undefined => {
      // If live and have leave requests, calculate dynamically or fallback to seed balances structure
      const seedBal = seedLeaveBalances.find((b) => b.employeeId === employeeId);
      const approvedLeaves = leaveRequests.filter(
        (l) => l.employeeId === employeeId && l.status === 'Approved'
      );

      const annualUsed = approvedLeaves
        .filter((l) => l.type === 'Annual')
        .reduce((sum, l) => sum + l.days, 0);

      const sickUsed = approvedLeaves
        .filter((l) => l.type === 'Sick')
        .reduce((sum, l) => sum + l.days, 0);

      return {
        employeeId,
        annualTotal: seedBal?.annualTotal ?? 25,
        annualUsed: Math.max(annualUsed, seedBal?.annualUsed ?? 0),
        sickTotal: seedBal?.sickTotal ?? 12,
        sickUsed: Math.max(sickUsed, seedBal?.sickUsed ?? 0)
      };
    },
    [leaveRequests]
  );

  const value = useMemo(
    () => ({
      employees,
      leaveRequests,
      candidates,
      departments,
      attendanceRecords,
      payrollRecords,
      performanceReviews,
      positions,
      onboardingTasks,
      activityFeed,
      isLoading,
      isLive,
      connectionError,
      addEmployee,
      updateEmployeeStatus,
      assignDepartment,
      setLeaveStatus,
      moveCandidate,
      getEmployee,
      getDepartment,
      getPayrollForEmployee,
      getReviewsForEmployee,
      getLeaveBalance
    }),
    [
      employees,
      leaveRequests,
      candidates,
      departments,
      attendanceRecords,
      payrollRecords,
      performanceReviews,
      positions,
      onboardingTasks,
      activityFeed,
      isLoading,
      isLive,
      connectionError,
      addEmployee,
      updateEmployeeStatus,
      assignDepartment,
      setLeaveStatus,
      moveCandidate,
      getEmployee,
      getDepartment,
      getPayrollForEmployee,
      getReviewsForEmployee,
      getLeaveBalance
    ]
  );

  return <HrmsCtx.Provider value={value}>{children}</HrmsCtx.Provider>;
}

export function useHrms(): HrmsState {
  const ctx = useContext(HrmsCtx);
  if (!ctx) throw new Error('useHrms must be used within HrmsProvider');
  return ctx;
}