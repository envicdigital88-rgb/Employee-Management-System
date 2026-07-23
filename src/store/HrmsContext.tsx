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
import { showToast } from '../components/ui/Toast';
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

const mapDepartmentToDb = (d: Partial<Department>): Record<string, unknown> => {
  const res: Record<string, unknown> = {};
  if (d.id !== undefined) res.id = d.id;
  if (d.name !== undefined) res.name = d.name;
  if (d.headEmployeeId !== undefined) res.head_employee_id = d.headEmployeeId;
  if (d.budget !== undefined) res.budget = d.budget;
  if (d.location !== undefined) res.location = d.location;
  if (d.colorHex !== undefined) res.color_hex = d.colorHex;
  return res;
};

const DEPARTMENT_COLORS = [
  '#22d3ee', '#a78bfa', '#f472b6', '#34d399', '#fbbf24',
  '#60a5fa', '#f87171', '#38bdf8', '#fb923c', '#4ade80'
];

const mapEmployeeFromDb = (e: any): Employee => ({
  id: e.id,
  firstName: e.first_name,
  lastName: e.last_name,
  preferredName: e.preferred_name || null,
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
  nic: e.nic || '',
  isActive: e.is_active !== false,
  isAdmin: !!e.is_admin,
  shift: e.shift || 'Morning Shift (9:00 AM - 5:00 PM)',
  endDate: e.end_date || null,
});

const mapEmployeeToDb = (e: Partial<Employee>): any => {
  const res: any = {};
  if (e.id !== undefined) res.id = e.id;
  if (e.firstName !== undefined) res.first_name = e.firstName;
  if (e.lastName !== undefined) res.last_name = e.lastName;
  if (e.preferredName !== undefined) res.preferred_name = e.preferredName;
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
  if (e.nic !== undefined) res.nic = e.nic;
  if (e.isActive !== undefined) res.is_active = e.isActive;
  if (e.isAdmin !== undefined) res.is_admin = e.isAdmin;
  if (e.shift !== undefined) res.shift = e.shift;
  if (e.endDate) res.end_date = e.endDate;
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

  // Session Warning
  showSessionWarning: boolean;
  sessionCountdown: number;
  extendSession: () => void;
  
  // Mutations
  addDepartment: (data: Omit<Department, 'colorHex'> & { colorHex?: string }) => Promise<void>;
  updateDepartment: (id: string, data: Partial<Omit<Department, 'id'>>) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
  addEmployee: (e: Omit<Employee, 'avatarUrl'> & { avatarUrl?: string }, tempPassword?: string) => Promise<void>;
  updateEmployee: (id: string, data: Partial<Employee>) => Promise<void>;
  changeEmployeeEmail: (id: string, newEmail: string, tempPassword: string, otherData?: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  updateEmployeeStatus: (ids: string[], status: EmployeeStatus) => Promise<void>;
  setEmployeeActive: (ids: string[], isActive: boolean) => Promise<void>;
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

const isAccountActive = (employee: Employee) => employee.isActive !== false;

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

  const [tempPasswords, setTempPasswords] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('HRMS_TEMP_PASSWORDS');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem('HRMS_TEMP_PASSWORDS', JSON.stringify(tempPasswords));
  }, [tempPasswords]);

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
    return !!currentUser.isAdmin || currentUser.email === 'nadia.karim@envicdigital.com' || currentUser.email === 'damien@envicglobal.com';
  }, [currentUser]);

  // ─── Initial load: fetch all data + restore auth session ────────────────────
  useEffect(() => {
    async function initialize() {
      // ── DEMO MODE (no Supabase credentials) ──────────────────────────────────
      if (!isSupabaseConfigured() || !supabase) {
        console.log('Supabase not configured. Running in Demo Mode.');
        setIsLive(false);

        const demoEmail = window.sessionStorage.getItem('DEMO_USER_EMAIL');
        if (demoEmail) {
          // seedEmployees are already in initial state — resolve immediately
          const found = employees.find(e => e.email.toLowerCase() === demoEmail.toLowerCase());
          if (found && isAccountActive(found)) setCurrentUser(found);
          else window.sessionStorage.removeItem('DEMO_USER_EMAIL'); // stale key
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
            if (found && isAccountActive(found)) {
              setCurrentUser(found);
              console.log('Session restored for:', email);
            } else if (found && !isAccountActive(found)) {
              await supabase.auth.signOut();
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
        const demoEmail = window.sessionStorage.getItem('DEMO_USER_EMAIL');
        if (demoEmail) {
          const found = employees.find(e => e.email.toLowerCase() === demoEmail.toLowerCase());
          if (found && isAccountActive(found)) setCurrentUser(found);
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
        if (found && isAccountActive(found)) {
          setCurrentUser(found);
          pendingAuthEmailRef.current = null;
        } else if (found && !isAccountActive(found)) {
          pendingAuthEmailRef.current = null;
          setCurrentUser(null);
          supabase?.auth.signOut();
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

  // ─── Session Warning + Inactivity Timeout ────────────────────────────────
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [sessionCountdown, setSessionCountdown] = useState(60);

  const sessionWarningTimerRef = useRef<any>(null);
  const sessionExpireTimerRef  = useRef<any>(null);
  const sessionCountdownRef    = useRef<any>(null);

  // Use a ref so startSessionTimers can call logout without a forward-reference issue
  const logoutRef = useRef<(() => Promise<void>) | null>(null);

  const clearSessionTimers = useCallback(() => {
    if (sessionWarningTimerRef.current)  clearTimeout(sessionWarningTimerRef.current);
    if (sessionExpireTimerRef.current)   clearTimeout(sessionExpireTimerRef.current);
    if (sessionCountdownRef.current)     clearInterval(sessionCountdownRef.current);
    sessionWarningTimerRef.current = null;
    sessionExpireTimerRef.current  = null;
    sessionCountdownRef.current    = null;
  }, []);

  const startSessionTimers = useCallback(() => {
    clearSessionTimers();
    setShowSessionWarning(false);
    setSessionCountdown(60);

    const WARNING_BEFORE_EXPIRE = 60 * 1000;        // show warning 60 s before
    const TOTAL_INACTIVE        = 15 * 60 * 1000;   // 15 minutes total
    const WARN_DELAY = TOTAL_INACTIVE - WARNING_BEFORE_EXPIRE;

    // Fire warning modal 14 minutes in
    sessionWarningTimerRef.current = setTimeout(() => {
      setShowSessionWarning(true);
      setSessionCountdown(60);

      // Tick countdown every second
      sessionCountdownRef.current = setInterval(() => {
        setSessionCountdown(prev => {
          if (prev <= 1) {
            clearInterval(sessionCountdownRef.current);
            sessionCountdownRef.current = null;
          }
          return Math.max(0, prev - 1);
        });
      }, 1000);

      // Hard-logout 60 s after warning appears
      sessionExpireTimerRef.current = setTimeout(async () => {
        setShowSessionWarning(false);
        if (logoutRef.current) await logoutRef.current();
        showToast('Your session has expired due to inactivity. Please sign in again.', 'info');
      }, WARNING_BEFORE_EXPIRE);
    }, WARN_DELAY);
  }, [clearSessionTimers]);

  // Reset timers on any user activity
  useEffect(() => {
    if (!currentUser) {
      clearSessionTimers();
      setShowSessionWarning(false);
      return;
    }

    const handleActivity = () => startSessionTimers();
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(ev => window.addEventListener(ev, handleActivity, { passive: true }));

    startSessionTimers(); // start immediately on login

    return () => {
      clearSessionTimers();
      events.forEach(ev => window.removeEventListener(ev, handleActivity));
    };
  }, [currentUser, startSessionTimers, clearSessionTimers]);

  // "Stay Signed In" — reset the whole inactivity clock
  const extendSession = useCallback(() => {
    setShowSessionWarning(false);
    setSessionCountdown(60);
    clearSessionTimers();
    startSessionTimers();
  }, [clearSessionTimers, startSessionTimers]);


  // Auth Operations
  const login = useCallback(async (email: string, password: string) => {
    const searchEmail = email.trim().toLowerCase();
    
    // Check if employee exists first in the local cache
    const foundEmployee = employees.find(e => e.email.toLowerCase() === searchEmail);
    if (!foundEmployee) {
      throw new Error('This email is not registered in our employee database.');
    }
    if (!isAccountActive(foundEmployee)) {
      throw new Error('Your account has been deactivated. Please contact HR for assistance.');
    }

    const tempPw = tempPasswords[searchEmail];

    if (tempPw) {
      if (password !== tempPw) {
        throw new Error('Invalid email or password. Please check your login credentials.');
      }
      // Temporary password matched!
      setCurrentUser(foundEmployee);
      window.sessionStorage.setItem('DEMO_USER_EMAIL', foundEmployee.email);
      if (isLive && supabase) {
        try {
          await supabase.auth.signInWithPassword({
            email: searchEmail,
            password
          });
        } catch (e) {
          // Supabase auth fallback if email confirmation is enabled
        }
      }
      return;
    }

    if (isLive && supabase) {
      const { error } = await supabase.auth.signInWithPassword({
        email: searchEmail,
        password
      });
      if (error) throw error;
      setCurrentUser(foundEmployee);
      window.sessionStorage.setItem('DEMO_USER_EMAIL', foundEmployee.email);
    } else {
      // Demo Mode login
      setCurrentUser(foundEmployee);
      window.sessionStorage.setItem('DEMO_USER_EMAIL', foundEmployee.email);
    }
  }, [employees, isLive, tempPasswords]);

  const signup = useCallback(async (email: string, password: string) => {
    const searchEmail = email.trim().toLowerCase();

    // Verify employee matches
    const foundEmployee = employees.find(e => e.email.toLowerCase() === searchEmail);
    if (!foundEmployee) {
      throw new Error('Your email must match an existing employee profile. Please contact HR.');
    }
    if (!isAccountActive(foundEmployee)) {
      throw new Error('Your account has been deactivated. Please contact HR for assistance.');
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
      window.sessionStorage.setItem('DEMO_USER_EMAIL', foundEmployee.email);
    }
  }, [employees, isLive]);

  const logout = useCallback(async () => {
    if (isLive && supabase) {
      await supabase.auth.signOut();
    } else {
      window.sessionStorage.removeItem('DEMO_USER_EMAIL');
    }
    setCurrentUser(null);
  }, [isLive]);

  // Keep the ref in sync so the session timer can always call the latest logout
  logoutRef.current = logout;

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
    if (currentUser?.email) {
      const userEmail = currentUser.email.toLowerCase();
      setTempPasswords(prev => {
        const copy = { ...prev };
        delete copy[userEmail];
        return copy;
      });
    }
    if (isLive && supabase) {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    } else {
      console.log('Demo Mode: Password updated simulation');
    }
  }, [currentUser, isLive]);

  const updateProfile = useCallback(async (data: Partial<Employee>) => {
    if (!currentUser) return;
    
    // Security check: restrict standard employees from modifying administrative fields
    const allowedKeys: (keyof Employee)[] = [
      'firstName',
      'lastName',
      'preferredName',
      'email',
      'phone',
      'address',
      'dateOfBirth',
      'gender',
      'avatarUrl'
    ];
    
    const filteredData: Partial<Employee> = {};
    for (const key of allowedKeys) {
      if (data[key] !== undefined) {
        (filteredData as any)[key] = data[key];
      }
    }

    const updated = { ...currentUser, ...filteredData };

    setCurrentUser(updated);
    setEmployees(prev => prev.map(e => e.id === currentUser.id ? updated : e));

    if (isLive && supabase) {
      try {
        const dbRow = mapEmployeeToDb(filteredData);
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

    // Notify admin AND employee of clock-in
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}-adm-${Math.random().toString(36).substring(2,9)}`,
        recipientId: 'admin',
        message: `${currentUser.firstName} ${currentUser.lastName} clocked in at ${timeStr}`,
        createdAt: new Date().toISOString(),
        read: false,
        type: 'attendance'
      },
      {
        id: `notif-${Date.now()}-emp-${Math.random().toString(36).substring(2,9)}`,
        recipientId: currentUser.id,
        message: `You clocked in successfully at ${timeStr}. Have a productive day!`,
        createdAt: new Date().toISOString(),
        read: false,
        type: 'attendance'
      },
      ...prev
    ]);

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

    // Notify admin AND employee of clock-out
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}-adm-${Math.random().toString(36).substring(2,9)}`,
        recipientId: 'admin',
        message: `${currentUser.firstName} ${currentUser.lastName} clocked out at ${timeStr} (${hours} hrs)`,
        createdAt: new Date().toISOString(),
        read: false,
        type: 'attendance'
      },
      {
        id: `notif-${Date.now()}-emp-${Math.random().toString(36).substring(2,9)}`,
        recipientId: currentUser.id,
        message: `You clocked out at ${timeStr} (${hours} hrs worked).`,
        createdAt: new Date().toISOString(),
        read: false,
        type: 'attendance'
      },
      ...prev
    ]);
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

    // Notify admin AND employee of leave application
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}-adm-${Math.random().toString(36).substring(2,9)}`,
        recipientId: 'admin',
        message: `${currentUser.firstName} ${currentUser.lastName} submitted a ${data.type} leave request for ${data.days} day(s) (${data.startDate} to ${data.endDate})`,
        createdAt: new Date().toISOString(),
        read: false,
        type: 'leave'
      },
      {
        id: `notif-${Date.now()}-emp-${Math.random().toString(36).substring(2,9)}`,
        recipientId: currentUser.id,
        message: `Your ${data.type} leave request for ${data.days} day(s) (${data.startDate} to ${data.endDate}) was submitted successfully for review.`,
        createdAt: new Date().toISOString(),
        read: false,
        type: 'leave'
      },
      ...prev
    ]);

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
  const addDepartment = useCallback(
    async (data: Omit<Department, 'colorHex'> & { colorHex?: string }) => {
      const id = data.id.trim();
      if (!id) {
        throw new Error('Department ID cannot be empty.');
      }
      if (!data.name.trim()) {
        throw new Error('Department name is required.');
      }

      const exists = departments.some(
        (d) => d.id.trim().toLowerCase() === id.toLowerCase()
      );
      if (exists) {
        throw new Error(`Department ID "${id}" is already in use.`);
      }

      const newDept: Department = {
        id,
        name: data.name.trim(),
        headEmployeeId: data.headEmployeeId ?? null,
        budget: Number(data.budget) || 0,
        location: data.location.trim() || 'HQ',
        colorHex: data.colorHex ?? DEPARTMENT_COLORS[departments.length % DEPARTMENT_COLORS.length]
      };

      setDepartments((prev) => [...prev, newDept]);

      if (isLive && supabase) {
        try {
          const { error } = await supabase
            .from('departments')
            .insert(mapDepartmentToDb(newDept));
          if (error) {
            setDepartments((prev) => prev.filter((d) => d.id !== id));
            throw new Error(`Database error: ${error.message}`);
          }
        } catch (err: unknown) {
          setDepartments((prev) => prev.filter((d) => d.id !== id));
          throw err;
        }
      }
    },
    [departments, isLive]
  );

  const updateDepartment = useCallback(
    async (id: string, data: Partial<Omit<Department, 'id'>>) => {
      const existing = departments.find((d) => d.id === id);
      if (!existing) {
        throw new Error('Department not found.');
      }
      if (data.name !== undefined && !data.name.trim()) {
        throw new Error('Department name is required.');
      }

      const updated: Department = {
        ...existing,
        ...data,
        name: data.name !== undefined ? data.name.trim() : existing.name,
        location: data.location !== undefined ? data.location.trim() || 'HQ' : existing.location,
        budget: data.budget !== undefined ? Number(data.budget) || 0 : existing.budget,
      };

      setDepartments((prev) => prev.map((d) => (d.id === id ? updated : d)));

      if (isLive && supabase) {
        try {
          const { error } = await supabase
            .from('departments')
            .update(mapDepartmentToDb(data))
            .eq('id', id);
          if (error) {
            setDepartments((prev) => prev.map((d) => (d.id === id ? existing : d)));
            throw new Error(`Database error: ${error.message}`);
          }
        } catch (err: unknown) {
          setDepartments((prev) => prev.map((d) => (d.id === id ? existing : d)));
          throw err;
        }
      }
    },
    [departments, isLive]
  );

  const deleteDepartment = useCallback(
    async (id: string) => {
      const existing = departments.find((d) => d.id === id);
      if (!existing) {
        throw new Error('Department not found.');
      }

      const assignedEmployees = employees.filter((e) => e.departmentId === id);
      if (assignedEmployees.length > 0) {
        throw new Error(
          `Cannot delete "${existing.name}" — ${assignedEmployees.length} employee(s) are still assigned. Reassign them first.`
        );
      }

      setDepartments((prev) => prev.filter((d) => d.id !== id));
      setDepartments((prev) =>
        prev.map((d) => (d.headEmployeeId && employees.find((e) => e.id === d.headEmployeeId && e.departmentId === id)
          ? { ...d, headEmployeeId: null }
          : d))
      );

      if (isLive && supabase) {
        try {
          await supabase
            .from('departments')
            .update({ head_employee_id: null })
            .eq('head_employee_id', id);
          const { error } = await supabase.from('departments').delete().eq('id', id);
          if (error) {
            setDepartments((prev) => [...prev, existing]);
            throw new Error(`Database error: ${error.message}`);
          }
        } catch (err: unknown) {
          setDepartments((prev) => [...prev, existing]);
          throw err;
        }
      }
    },
    [departments, employees, isLive]
  );

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
      const avatarUrl = (data as any).avatarUrl || avatar(name);

      const newEmp: Employee = {
        ...data,
        id,
        avatarUrl,
        nic: data.nic ?? '',
        isActive: data.isActive !== false,
      };

      setEmployees((prev) => [newEmp, ...prev]);

      if (tempPassword) {
        setTempPasswords((prev) => ({
          ...prev,
          [newEmp.email.trim().toLowerCase()]: tempPassword
        }));
      }

      if (isLive && supabase) {
        try {
          const dbRow = mapEmployeeToDb(newEmp);
          let { error: dbError } = await supabase.from('employees').insert(dbRow);
          if (dbError && dbError.message?.toLowerCase().includes('end_date')) {
            delete dbRow.end_date;
            const retry = await supabase.from('employees').insert(dbRow);
            dbError = retry.error;
          }
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
          let { error } = await supabase.from('employees').update(dbRow).eq('id', id);
          if (error && error.message?.toLowerCase().includes('end_date')) {
            delete dbRow.end_date;
            const retry = await supabase.from('employees').update(dbRow).eq('id', id);
            error = retry.error;
          }
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

  const changeEmployeeEmail = useCallback(
    async (id: string, newEmail: string, tempPassword: string, otherData?: Partial<Employee>) => {
      const normalizedEmail = newEmail.trim().toLowerCase();

      // Validate: new email must not be used by another employee
      const conflict = employees.find(
        (e) => e.id !== id && e.email.toLowerCase() === normalizedEmail
      );
      if (conflict) {
        throw new Error(`The email "${normalizedEmail}" is already assigned to another employee.`);
      }

      if (!tempPassword || tempPassword.length < 6) {
        throw new Error('Temporary password must be at least 6 characters.');
      }

      const merged: Partial<Employee> = { ...otherData, email: normalizedEmail };

      if (tempPassword) {
        setTempPasswords((prev) => ({
          ...prev,
          [normalizedEmail]: tempPassword
        }));
      }

      // Update local employees state
      setEmployees((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...merged } : e))
      );

      // Update currentUser if this is the logged-in employee
      setCurrentUser((prev) => {
        if (prev && prev.id === id) {
          window.sessionStorage.setItem('DEMO_USER_EMAIL', normalizedEmail);
          return { ...prev, ...merged };
        }
        return prev;
      });

      // In-app notification for the employee
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}-email-${Math.random().toString(36).substring(2, 9)}`,
          recipientId: id,
          message: `Your login email has been updated to "${normalizedEmail}". Please use the temporary password provided by your admin to log in and then reset it.`,
          createdAt: new Date().toISOString(),
          read: false,
          type: 'info' as const,
        },
        ...prev,
      ]);

      if (isLive && supabase) {
        try {
          // 1. Update email (and any other changed fields) in the employees table
          const dbRow = mapEmployeeToDb(merged);
          let { error: dbError } = await supabase.from('employees').update(dbRow).eq('id', id);
          if (dbError && dbError.message?.toLowerCase().includes('end_date')) {
            delete dbRow.end_date;
            const retry = await supabase.from('employees').update(dbRow).eq('id', id);
            dbError = retry.error;
          }
          if (dbError) {
            console.error('Failed to update employee email in database:', dbError);
            throw new Error(`Database error: ${dbError.message}`);
          }

          // 2. Create a new Supabase Auth account with the new email + temp password
          //    (same isolated-client pattern as addEmployee to avoid overwriting admin session)
          const tempClient = createClient(supabaseUrl!, supabaseAnonKey!, {
            auth: {
              persistSession: false,
              autoRefreshToken: false,
              detectSessionInUrl: false,
            },
          });
          const { error: authError } = await tempClient.auth.signUp({
            email: normalizedEmail,
            password: tempPassword,
          });
          if (authError) {
            // If auth already exists for this email, attempt a password-reset link instead
            console.warn('Auth signUp for new email returned:', authError.message);
          }
        } catch (err: any) {
          // Roll back local state on hard failure
          setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, email: e.email } : e)));
          throw err;
        }
      }
    },
    [employees, isLive]
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

  const setEmployeeActive = useCallback(
    async (ids: string[], isActive: boolean) => {
      setEmployees((prev) =>
        prev.map((e) => (ids.includes(e.id) ? { ...e, isActive } : e))
      );

      if (currentUser && ids.includes(currentUser.id) && !isActive) {
        if (isLive && supabase) {
          await supabase.auth.signOut();
        } else {
          window.sessionStorage.removeItem('DEMO_USER_EMAIL');
        }
        setCurrentUser(null);
      }

      if (isLive && supabase) {
        try {
          const { error } = await supabase
            .from('employees')
            .update({ is_active: isActive })
            .in('id', ids);
          if (error) {
            console.error('Failed to update employee account status in database:', error);
          }
        } catch (err) {
          console.error('Network error updating employee account status:', err);
        }
      }
    },
    [currentUser, isLive]
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

      // Notify each affected employee AND admin
      if (affectedRequests && affectedRequests.length > 0) {
        const now = new Date().toISOString();
        const newNotifs: Notification[] = [];
        
        affectedRequests.forEach(l => {
          const emp = employees.find(e => e.id === l.employeeId);
          const empName = emp ? `${emp.firstName} ${emp.lastName}` : l.employeeId;

          // Notification for Employee
          newNotifs.push({
            id: `notif-${Date.now()}-emp-${Math.random().toString(36).substring(2,9)}`,
            recipientId: l.employeeId,
            message: `Your ${l.type} leave request (${l.startDate} to ${l.endDate}) has been ${status}.`,
            createdAt: now,
            read: false,
            type: 'leave' as const
          });

          // Notification for Admin
          newNotifs.push({
            id: `notif-${Date.now()}-adm-${Math.random().toString(36).substring(2,9)}`,
            recipientId: 'admin',
            message: `Leave request for ${empName} (${l.type}, ${l.days} day(s)) was marked as ${status}.`,
            createdAt: now,
            read: false,
            type: 'leave' as const
          });
        });

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
    [employees, isLive]
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
      showSessionWarning,
      sessionCountdown,
      extendSession,
      addDepartment,
      updateDepartment,
      deleteDepartment,
      addEmployee,
      updateEmployee,
      changeEmployeeEmail,
      deleteEmployee,
      updateEmployeeStatus,
      setEmployeeActive,
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
      showSessionWarning,
      sessionCountdown,
      extendSession,
      currentUser,
      isAdmin,
      addDepartment,
      updateDepartment,
      deleteDepartment,
      addEmployee,
      updateEmployee,
      changeEmployeeEmail,
      deleteEmployee,
      updateEmployeeStatus,
      setEmployeeActive,
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