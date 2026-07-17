import {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
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
  LeaveBalance,
  Notification
} from '../types';

import { supabase, isSupabaseConfigured, supabaseUrl, supabaseAnonKey } from '../lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';

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
  isAdmin: !!e.is_admin,
  shift: e.shift || 'Morning Shift (9:00 AM - 5:00 PM)',
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
  if (e.isAdmin !== undefined) res.is_admin = e.isAdmin;
  if (e.shift !== undefined) res.shift = e.shift;
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
  
  // Auth State
  currentUser: Employee | null;
  isAdmin: boolean;
  
  // Mutations
  addEmployee: (e: Omit<Employee, 'avatarUrl'>, tempPassword?: string) => Promise<void>;
  updateEmployee: (id: string, data: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  updateEmployeeStatus: (ids: string[], status: EmployeeStatus) => void;
  assignDepartment: (ids: string[], departmentId: string) => void;
  setLeaveStatus: (ids: string[], status: LeaveStatus, affectedRequests?: LeaveRequest[]) => void;
  moveCandidate: (id: string, stage: CandidateStage) => void;
  
  // Auth Operations
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateProfile: (data: Partial<Employee>) => Promise<void>;
  
  // Attendance Clock-in Operations
  clockIn: () => Promise<void>;
  clockOut: () => Promise<void>;
  applyLeave: (l: Omit<LeaveRequest, 'id' | 'status' | 'requestedOn' | 'employeeId'>) => Promise<void>;

  // Utility Lookups
  getEmployee: (id: string | null) => Employee | undefined;
  getDepartment: (id: string) => Department | undefined;
  getPayrollForEmployee: (employeeId: string) => PayrollRecord[];
  getReviewsForEmployee: (employeeId: string) => PerformanceReview[];
  getLeaveBalance: (employeeId: string) => LeaveBalance | undefined;

  // Notifications
  notifications: Notification[];
  addNotification: (recipientId: string, message: string, type: 'attendance' | 'leave' | 'info') => void;
  markNotificationsAsRead: () => void;
  clearNotifications: () => void;
}

const HrmsCtx = createContext<HrmsState | null>(null);

const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=14171c,1a1d23,262a31&radius=50`;

export function HrmsProvider({ children }: { children: ReactNode }) {
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

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('HRMS_NOTIFICATIONS');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'notif-1',
        recipientId: 'admin',
        message: 'Noah Kim submitted a new leave request (Annual Leave, 3 days)',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        read: false,
        type: 'leave'
      },
      {
        id: 'notif-2',
        recipientId: 'admin',
        message: 'Liam O\'Connor clocked in at 08:58 AM',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        read: false,
        type: 'attendance'
      },
      {
        id: 'notif-3',
        recipientId: 'EMP-1001',
        message: 'Your leave request for Annual Leave has been Approved.',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        read: true,
        type: 'leave'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('HRMS_NOTIFICATIONS', JSON.stringify(notifications));
  }, [notifications]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Authentication states
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  // Stores the auth email while employees list is still loading (fixes refresh → login redirect)
  const pendingAuthEmailRef = useRef<string | null>(null);

  const isAdmin = useMemo(() => {
    if (!currentUser) return false;
    return !!currentUser.isAdmin || currentUser.email === 'nadia.karim@envicdigital.com';
  }, [currentUser]);

  // ─── Initial load: fetch all data + restore auth session ────────────────────
  useEffect(() => {
    async function initialize() {
      // ── DEMO MODE (no Supabase credentials) ──────────────────────────────────
      if (!isSupabaseConfigured() || !supabase) {
        console.log('Supabase not configured. Running in Demo Mode.');
        setIsLive(false);

        const demoEmail = window.localStorage.getItem('DEMO_USER_EMAIL');
        if (demoEmail) {
          // seedEmployees are already in initial state — resolve immediately
          const found = employees.find(e => e.email.toLowerCase() === demoEmail.toLowerCase());
          if (found) setCurrentUser(found);
          else window.localStorage.removeItem('DEMO_USER_EMAIL'); // stale key
        }

        setIsLoading(false);
        setAuthLoading(false);
        return;
      }

      // ── LIVE MODE (Supabase configured) ──────────────────────────────────────
      try {
        setIsLoading(true);
        console.log('Connecting to live Supabase database...');

        // Fetch DB tables AND active session in parallel (kept separate to preserve TS types)
        const [
          sessionResult,
          { data: dbDepts, error: errDepts },
          { data: dbEmps,  error: errEmps  },
          { data: dbLeaves, error: errLeaves },
          { data: dbCands, error: errCands },
          { data: dbAtt,  error: errAtt  },
          { data: dbPay,  error: errPay  },
          { data: dbPerf, error: errPerf },
          { data: dbPos,  error: errPos  },
          { data: dbOnb,  error: errOnb  },
          { data: dbAct,  error: errAct  }
        ] = await Promise.all([
          supabase.auth.getSession(),          // index 0 — typed as AuthResponse
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
        ] as const);

        if (errDepts || errEmps || errLeaves || errCands ||
            errAtt   || errPay  || errPerf   || errPos  || errOnb || errAct) {
          const msg = [errDepts, errEmps, errLeaves, errCands,
                       errAtt, errPay, errPerf, errPos, errOnb, errAct]
            .filter(Boolean).map(e => e?.message).join(', ');
          throw new Error(msg || 'Error querying database tables.');
        }

        if (dbDepts && dbEmps) {
          const loadedDepts = dbDepts.map(mapDepartmentFromDb);
          const loadedEmps  = dbEmps.map(mapEmployeeFromDb);

          setDepartments(loadedDepts);
          setEmployees(loadedEmps);
          if (dbLeaves) setLeaveRequests(dbLeaves.map(mapLeaveFromDb));
          if (dbCands)  setCandidates(dbCands.map(mapCandidateFromDb));
          if (dbAtt)    setAttendanceRecords(dbAtt.map(mapAttendanceFromDb));
          if (dbPay)    setPayrollRecords(dbPay.map(mapPayrollFromDb));
          if (dbPerf)   setPerformanceReviews(dbPerf.map(mapPerformanceFromDb));
          if (dbPos)    setPositions(dbPos.map(mapPositionFromDb));
          if (dbOnb)    setOnboardingTasks(dbOnb.map(mapOnboardingFromDb));
          if (dbAct)    setActivityFeed(dbAct.map(mapActivityFromDb));

          // ── Restore session ── now we have employees in `loadedEmps`
          const session = sessionResult.data?.session;
          if (session?.user?.email) {
            const email = session.user.email.toLowerCase();
            const found = loadedEmps.find(e => e.email.toLowerCase() === email);
            if (found) {
              setCurrentUser(found);
              console.log('Session restored for:', email);
            }
          }

          setIsLive(true);
          setConnectionError(null);
          console.log('Successfully loaded all tables from Supabase!');
        }
      } catch (err: any) {
        console.error('Failed to load from Supabase, falling back to Demo Mode:', err);
        setConnectionError(err.message || 'Failed to connect to database');
        setIsLive(false);

        // Try to restore demo session even after a DB error
        const demoEmail = window.localStorage.getItem('DEMO_USER_EMAIL');
        if (demoEmail) {
          const found = employees.find(e => e.email.toLowerCase() === demoEmail.toLowerCase());
          if (found) setCurrentUser(found);
        }
      } finally {
        setIsLoading(false);
        setAuthLoading(false);
      }
    }

    initialize();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Subscribe to live auth state changes (sign-in / sign-out events) ────────
  useEffect(() => {
    if (!isLive || !supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        const email = session.user.email.toLowerCase();
        const found = employees.find(e => e.email.toLowerCase() === email);
        if (found) {
          setCurrentUser(found);
          pendingAuthEmailRef.current = null;
        } else {
          pendingAuthEmailRef.current = email;
        }
      } else {
        pendingAuthEmailRef.current = null;
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [isLive, employees]);

  // ─── Resolve pending auth once employees array is populated ──────────────────
  useEffect(() => {
    if (!pendingAuthEmailRef.current || employees.length === 0) return;
    const found = employees.find(e => e.email.toLowerCase() === pendingAuthEmailRef.current!);
    if (found) {
      setCurrentUser(found);
      pendingAuthEmailRef.current = null;
    }
  }, [employees]);


  // Auth Operations
  const login = useCallback(async (email: string, password: string) => {
    const searchEmail = email.trim().toLowerCase();
    
    // Check if employee exists first in the local cache
    const foundEmployee = employees.find(e => e.email.toLowerCase() === searchEmail);
    if (!foundEmployee) {
      throw new Error('This email is not registered in our employee database.');
    }

    if (isLive && supabase) {
      const { error } = await supabase.auth.signInWithPassword({
        email: searchEmail,
        password
      });
      if (error) throw error;
    } else {
      // Demo Mode login
      setCurrentUser(foundEmployee);
      window.localStorage.setItem('DEMO_USER_EMAIL', foundEmployee.email);
    }
  }, [employees, isLive]);

  const signup = useCallback(async (email: string, password: string) => {
    const searchEmail = email.trim().toLowerCase();

    // Verify employee matches
    const foundEmployee = employees.find(e => e.email.toLowerCase() === searchEmail);
    if (!foundEmployee) {
      throw new Error('Your email must match an existing employee profile. Please contact HR.');
    }

    if (isLive && supabase) {
      const { error } = await supabase.auth.signUp({
        email: searchEmail,
        password
      });
      if (error) throw error;
    } else {
      // Demo Mode signup
      setCurrentUser(foundEmployee);
      window.localStorage.setItem('DEMO_USER_EMAIL', foundEmployee.email);
    }
  }, [employees, isLive]);

  const logout = useCallback(async () => {
    if (isLive && supabase) {
      await supabase.auth.signOut();
    } else {
      window.localStorage.removeItem('DEMO_USER_EMAIL');
    }
    setCurrentUser(null);
  }, [isLive]);

  const resetPassword = useCallback(async (email: string) => {
    if (isLive && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    } else {
      console.log(`Demo Mode: Reset password email simulated for ${email}`);
    }
  }, [isLive]);

  const updatePassword = useCallback(async (password: string) => {
    if (isLive && supabase) {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    } else {
      console.log('Demo Mode: Password updated simulation');
    }
  }, [isLive]);

  const updateProfile = useCallback(async (data: Partial<Employee>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };

    setCurrentUser(updated);
    setEmployees(prev => prev.map(e => e.id === currentUser.id ? updated : e));

    if (isLive && supabase) {
      try {
        const dbRow = mapEmployeeToDb(data);
        const { error } = await supabase.from('employees').update(dbRow).eq('id', currentUser.id);
        if (error) console.error('Failed to save profile in database:', error);
      } catch (err) {
        console.error('Network error updating profile:', err);
      }
    }
  }, [currentUser, isLive]);

  // Clock-in attendance
  const clockIn = useCallback(async () => {
    if (!currentUser) return;

    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const isoDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    const timeStr = `${pad(today.getHours())}:${pad(today.getMinutes())}`;

    // Prevent duplicate clock-in for the same day
    const alreadyClockedIn = attendanceRecords.some(
      r => r.employeeId === currentUser.id && r.date === isoDate
    );
    if (alreadyClockedIn) return;

    const newRecord: AttendanceRecord = {
      id: `ATT-${Date.now()}`,
      employeeId: currentUser.id,
      date: isoDate,
      status: 'Present',
      clockIn: timeStr,
      clockOut: null,
      hours: 0
    };

    setAttendanceRecords(prev => [newRecord, ...prev]);

    // Notify admin of clock-in
    setNotifications(prev => [{
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2,9)}`,
      recipientId: 'admin',
      message: `${currentUser.firstName} ${currentUser.lastName} clocked in at ${timeStr}`,
      createdAt: new Date().toISOString(),
      read: false,
      type: 'attendance'
    }, ...prev]);

    if (isLive && supabase) {
      try {
        const { error } = await supabase.from('attendance_records').insert({
          id: newRecord.id,
          employee_id: currentUser.id,
          date: isoDate,
          status: 'Present',
          clock_in: timeStr,
          clock_out: null,
          hours: 0
        });
        if (error) console.error('Failed to save clock-in in database:', error);
      } catch (err) {
        console.error('Network error clocking in:', err);
      }
    }
  }, [currentUser, attendanceRecords, isLive]);

  const clockOut = useCallback(async () => {
    if (!currentUser) return;

    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const isoDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    const timeStr = `${pad(today.getHours())}:${pad(today.getMinutes())}`;

    const todayRecord = attendanceRecords.find(r => r.employeeId === currentUser.id && r.date === isoDate);
    if (!todayRecord) return;

    let hours = 8;
    if (todayRecord.clockIn) {
      const [inH, inM] = todayRecord.clockIn.split(':').map(Number);
      const outH = today.getHours();
      const outM = today.getMinutes();
      hours = Math.max(0.1, Number((((outH * 60 + outM) - (inH * 60 + inM)) / 60).toFixed(2)));
    }

    const updatedRecord = {
      ...todayRecord,
      clockOut: timeStr,
      hours
    };

    setAttendanceRecords(prev => prev.map(r => r.id === todayRecord.id ? updatedRecord : r));

    if (isLive && supabase) {
      try {
        const { error } = await supabase.from('attendance_records').update({
          clock_out: timeStr,
          hours
        }).eq('id', todayRecord.id);
        if (error) console.error('Failed to save clock-out in database:', error);
      } catch (err) {
        console.error('Network error clocking out:', err);
      }
    }

    // Notify admin of clock-out
    setNotifications(prev => [{
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2,9)}`,
      recipientId: 'admin',
      message: `${currentUser.firstName} ${currentUser.lastName} clocked out at ${timeStr} (${hours} hrs)`,
      createdAt: new Date().toISOString(),
      read: false,
      type: 'attendance'
    }, ...prev]);
  }, [currentUser, attendanceRecords, isLive]);

  const applyLeave = useCallback(async (data: Omit<LeaveRequest, 'id' | 'status' | 'requestedOn' | 'employeeId'>) => {
    if (!currentUser) return;

    const pad = (n: number) => String(n).padStart(2, '0');
    const today = new Date();
    const requestedOn = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    const id = `LV-${Date.now()}`;

    const newLeave: LeaveRequest = {
      ...data,
      id,
      employeeId: currentUser.id,
      status: 'Pending',
      requestedOn
    };

    setLeaveRequests(prev => [newLeave, ...prev]);

    // Notify admin of leave application
    setNotifications(prev => [{
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2,9)}`,
      recipientId: 'admin',
      message: `${currentUser.firstName} ${currentUser.lastName} submitted a ${data.type} leave request for ${data.days} day(s) (${data.startDate} to ${data.endDate})`,
      createdAt: new Date().toISOString(),
      read: false,
      type: 'leave'
    }, ...prev]);

    if (isLive && supabase) {
      try {
        const { error } = await supabase.from('leave_requests').insert({
          id: newLeave.id,
          employee_id: currentUser.id,
          type: newLeave.type,
          start_date: newLeave.startDate,
          end_date: newLeave.endDate,
          days: newLeave.days,
          reason: newLeave.reason,
          status: 'Pending',
          requested_on: requestedOn
        });
        if (error) console.error('Failed to insert leave request in database:', error);
      } catch (err) {
        console.error('Network error saving leave request:', err);
      }
    }
  }, [currentUser, isLive]);

  // Mutations
  const addEmployee = useCallback(
    async (data: Omit<Employee, 'avatarUrl'>, tempPassword?: string) => {
      const id = data.id.trim();
      if (!id) {
        throw new Error('Employee ID cannot be empty.');
      }

      // Check uniqueness of the Employee ID (case-insensitive check)
      const exists = employees.some(e => e.id.trim().toLowerCase() === id.toLowerCase());
      if (exists) {
        throw new Error(`Employee ID "${id}" is already in use by another employee.`);
      }

      const name = `${data.firstName} ${data.lastName}`;
      const avatarUrl = avatar(name);

      const newEmp: Employee = {
        ...data,
        id,
        avatarUrl
      };

      setEmployees((prev) => [newEmp, ...prev]);

      if (isLive && supabase) {
        try {
          const dbRow = mapEmployeeToDb(newEmp);
          const { error: dbError } = await supabase.from('employees').insert(dbRow);
          if (dbError) {
            console.error('Failed to insert employee in database:', dbError);
            throw new Error(`Database error: ${dbError.message}`);
          }

          if (tempPassword) {
            const tempClient = createClient(supabaseUrl!, supabaseAnonKey!, {
              auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false
              }
            });
            const { error: authError } = await tempClient.auth.signUp({
              email: newEmp.email,
              password: tempPassword
            });
            if (authError) {
              console.error('Failed to register employee in Auth:', authError);
              throw new Error(`Auth registration error: ${authError.message}`);
            }
          }
        } catch (err: any) {
          setEmployees((prev) => prev.filter((e) => e.id !== id));
          throw err;
        }
      }
    },
    [employees, isLive]
  );

  const updateEmployee = useCallback(
    async (id: string, data: Partial<Employee>) => {
      setEmployees((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...data } : e))
      );

      // If this is the currently logged-in user, update currentUser too
      setCurrentUser((prev) => {
        if (prev && prev.id === id) return { ...prev, ...data };
        return prev;
      });

      if (isLive && supabase) {
        try {
          const dbRow = mapEmployeeToDb(data);
          const { error } = await supabase.from('employees').update(dbRow).eq('id', id);
          if (error) {
            console.error('Failed to update employee in database:', error);
          }
        } catch (err) {
          console.error('Network error updating employee:', err);
        }
      }
    },
    [isLive]
  );

  const deleteEmployee = useCallback(
    async (id: string) => {
      setEmployees((prev) => prev.filter((e) => e.id !== id));

      // Also clean up related records in local state
      setAttendanceRecords((prev) => prev.filter((a) => a.employeeId !== id));
      setLeaveRequests((prev) => prev.filter((l) => l.employeeId !== id));
      setPayrollRecords((prev) => prev.filter((p) => p.employeeId !== id));
      setPerformanceReviews((prev) => prev.filter((r) => r.employeeId !== id));
      setOnboardingTasks((prev) => prev.filter((o) => o.employeeId !== id));

      if (isLive && supabase) {
        try {
          const { error } = await supabase.from('employees').delete().eq('id', id);
          if (error) {
            console.error('Failed to delete employee from database:', error);
          }
        } catch (err) {
          console.error('Network error deleting employee:', err);
        }
      }
    },
    [isLive]
  );

  const updateEmployeeStatus = useCallback(
    async (ids: string[], status: EmployeeStatus) => {
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
    async (ids: string[], status: LeaveStatus, affectedRequests?: import('../types').LeaveRequest[]) => {
      setLeaveRequests((prev) =>
        prev.map((l) => (ids.includes(l.id) ? { ...l, status } : l))
      );

      // Notify each affected employee
      if (affectedRequests && affectedRequests.length > 0) {
        const now = new Date().toISOString();
        const newNotifs: Notification[] = affectedRequests.map(l => ({
          id: `notif-${Date.now()}-${Math.random().toString(36).substring(2,9)}`,
          recipientId: l.employeeId,
          message: `Your ${l.type} leave request (${l.startDate} to ${l.endDate}) has been ${status}.`,
          createdAt: now,
          read: false,
          type: 'leave' as const
        }));
        setNotifications(prev => [...newNotifs, ...prev]);
      }

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

  const addNotification = useCallback((recipientId: string, message: string, type: 'attendance' | 'leave' | 'info') => {
    const newNotif: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      recipientId,
      message,
      createdAt: new Date().toISOString(),
      read: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const markNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const myNotifications = useMemo(() => {
    if (!currentUser) return [];
    return notifications.filter(n => {
      if (isAdmin && n.recipientId === 'admin') return true;
      return n.recipientId === currentUser.id || n.recipientId === 'all';
    });
  }, [notifications, currentUser, isAdmin]);

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
      isLoading: isLoading || authLoading,
      isLive,
      connectionError,
      currentUser,
      isAdmin,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      updateEmployeeStatus,
      assignDepartment,
      setLeaveStatus,
      moveCandidate,
      login,
      signup,
      logout,
      resetPassword,
      updatePassword,
      updateProfile,
      clockIn,
      clockOut,
      applyLeave,
      getEmployee,
      getDepartment,
      getPayrollForEmployee,
      getReviewsForEmployee,
      getLeaveBalance,
      notifications: myNotifications,
      addNotification,
      markNotificationsAsRead,
      clearNotifications
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
      authLoading,
      isLive,
      connectionError,
      currentUser,
      isAdmin,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      updateEmployeeStatus,
      assignDepartment,
      setLeaveStatus,
      moveCandidate,
      login,
      signup,
      logout,
      resetPassword,
      updatePassword,
      updateProfile,
      clockIn,
      clockOut,
      applyLeave,
      getEmployee,
      getDepartment,
      getPayrollForEmployee,
      getReviewsForEmployee,
      getLeaveBalance,
      myNotifications,
      addNotification,
      markNotificationsAsRead,
      clearNotifications
    ]
  );

  return <HrmsCtx.Provider value={value}>{children}</HrmsCtx.Provider>;
}

export function useHrms(): HrmsState {
  const ctx = useContext(HrmsCtx);
  if (!ctx) throw new Error('useHrms must be used within HrmsProvider');
  return ctx;
}