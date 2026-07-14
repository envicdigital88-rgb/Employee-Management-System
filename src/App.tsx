import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HrmsProvider, useHrms } from './store/HrmsContext';
import { AppLayout } from './layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { EmployeeProfilePage } from './pages/EmployeeProfilePage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { AttendancePage } from './pages/AttendancePage';
import { LeavePage } from './pages/LeavePage';
import { PayrollPage } from './pages/PayrollPage';
import { PerformancePage } from './pages/PerformancePage';
import { RecruitmentPage } from './pages/RecruitmentPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Auth & Personal Portal Pages
import { LoginPage } from './pages/LoginPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ProfilePage } from './pages/ProfilePage';
import { MyAttendancePage } from './pages/MyAttendancePage';
import { MyLeavesPage } from './pages/MyLeavesPage';

// Role-based routing wrappers
function AttendanceRoute() {
  const { isAdmin } = useHrms();
  return isAdmin ? <AttendancePage /> : <MyAttendancePage />;
}

function LeaveRoute() {
  const { isAdmin } = useHrms();
  return isAdmin ? <LeavePage /> : <MyLeavesPage />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useHrms();
  return isAdmin ? <>{children}</> : <Navigate to="/profile" replace />;
}

export function App() {
  return (
    <HrmsProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected Application Routes */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            
            {/* Dynamic personal/admin routes */}
            <Route path="/attendance" element={<AttendanceRoute />} />
            <Route path="/leave" element={<LeaveRoute />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* Admin-only routes */}
            <Route path="/employees" element={<AdminRoute><EmployeesPage /></AdminRoute>} />
            <Route path="/employees/:id" element={<AdminRoute><EmployeeProfilePage /></AdminRoute>} />
            <Route path="/departments" element={<AdminRoute><DepartmentsPage /></AdminRoute>} />
            <Route path="/payroll" element={<AdminRoute><PayrollPage /></AdminRoute>} />
            <Route path="/performance" element={<AdminRoute><PerformancePage /></AdminRoute>} />
            <Route path="/recruitment" element={<AdminRoute><RecruitmentPage /></AdminRoute>} />
            <Route path="/reports" element={<AdminRoute><ReportsPage /></AdminRoute>} />
            <Route path="/settings" element={<AdminRoute><SettingsPage /></AdminRoute>} />

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HrmsProvider>
  );
}