import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  PencilIcon,
  UserIcon,
  BriefcaseIcon,
  StarIcon,
  SaveIcon,
  ClockIcon,
  Trash2Icon,
  ShieldCheckIcon } from
'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { showToast } from '../components/ui/Toast';
import { useHrms } from '../store/HrmsContext';
import { fullName } from '../data/employees';
import {
  employeeStatusTone,
  attendanceTone,
  payrollStatusTone } from
 '../components/ui/statusMaps';
import { currency, formatDate } from '../lib/format';
import { EmployeeStatus } from '../types';
const TABS = [
  'Overview',
  'Attendance',
  'Leave',
  'Payroll',
  'Performance'] as
const;
type Tab = (typeof TABS)[number];
export function EmployeeProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    employees, 
    leaveRequests, 
    attendanceRecords, 
    getEmployee, 
    getDepartment, 
    getPayrollForEmployee, 
    getReviewsForEmployee, 
    getLeaveBalance,
    updateEmployee,
    deleteEmployee,
    isAdmin,
    departments
  } = useHrms();
  const [tab, setTab] = useState<Tab>('Overview');
  const [editOpen, setEditOpen] = useState(false);
  const [confirmEdit, setConfirmEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Edit form state
  const [editRole, setEditRole] = useState('');
  const [editStatus, setEditStatus] = useState<EmployeeStatus>('Permanent');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editDept, setEditDept] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editSalary, setEditSalary] = useState('');
  const [editShift, setEditShift] = useState('');
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [editJoinDate, setEditJoinDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const emp = employees.find((e) => e.id === id) ?? getEmployee(id ?? '');

  const openEdit = () => {
    if (!emp) return;
    setEditRole(emp.role);
    setEditStatus(emp.status);
    setEditIsActive(emp.isActive !== false);
    setEditDept(emp.departmentId);
    setEditLocation(emp.location);
    setEditPhone(emp.phone);
    setEditSalary(String(emp.salary));
    setEditShift(emp.shift || 'Morning Shift (9:00 AM - 5:00 PM)');
    setEditIsAdmin(!!emp.isAdmin);
    setEditJoinDate(emp.joinDate || '');
    setEditEndDate(emp.endDate || '');
    setEditOpen(true);
  };

  const handleEditSave = () => {
    setConfirmEdit(true);
  };

  const doEditSave = async () => {
    if (!emp) return;
    try {
      await updateEmployee(emp.id, {
        role: editRole,
        status: editStatus,
        isActive: editIsActive,
        departmentId: editDept,
        location: editLocation,
        phone: editPhone,
        salary: Number(editSalary) || 0,
        shift: editShift,
        isAdmin: editIsAdmin,
        joinDate: editJoinDate,
        endDate: editEndDate || null
      });
      showToast(`${fullName(emp)}'s profile has been updated successfully.`, 'success');
      setEditOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    }
  };

  const doDelete = async () => {
    if (!emp) return;
    try {
      await deleteEmployee(emp.id);
      showToast(`${fullName(emp)} has been deleted.`, 'success');
      navigate('/employees');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete employee', 'error');
    }
  };
  if (!emp) {
    return (
      <div className="py-20 text-center">
        <p className="text-content-muted">Employee not found.</p>
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => navigate('/employees')}>
          
          Back to employees
        </Button>
      </div>);

  }
  const dept = getDepartment(emp.departmentId);
  const manager = getEmployee(emp.managerId);
  const attendance = attendanceRecords.
  filter((a) => a.employeeId === emp.id).
  slice(0, 10);
  const payslips = getPayrollForEmployee(emp.id);
  const reviews = getReviewsForEmployee(emp.id);
  const empLeaves = leaveRequests.filter((l) => l.employeeId === emp.id);
  const balance = getLeaveBalance(emp.id);
  const InfoRow = ({
    icon: Icon,
    label,
    value




  }: {icon: React.ElementType;label: string;value: string;}) =>
  <div className="flex items-start gap-3 py-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-content-faint" />
      <div className="min-w-0">
        <p className="text-xs text-content-faint">{label}</p>
        <p className="text-sm text-content">{value}</p>
      </div>
    </div>;

  return (
    <div>
      <button
        onClick={() => navigate('/employees')}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-content-muted transition-colors hover:text-content">
        
        <ArrowLeftIcon className="h-4 w-4" />
        Back to employees
      </button>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
          <Avatar src={emp.avatarUrl} name={fullName(emp)} size="xl" ring />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-content">
                {fullName(emp)}
              </h1>
              <Badge tone={employeeStatusTone[emp.status]} dot>
                {emp.status}
              </Badge>
              {emp.isAdmin && (
                <Badge tone="purple" dot>
                  Admin
                </Badge>
              )}
              <Badge tone={emp.isActive !== false ? 'green' : 'red'} dot>
                <ShieldCheckIcon className="h-3 w-3 mr-1 inline-block" />
                {emp.isActive !== false ? 'Account Active' : 'Account Inactive'}
              </Badge>
            </div>
            <p className="mt-1 text-content-muted">
              {emp.role} · {dept?.name}
            </p>
            <p className="mt-0.5 text-xs text-content-faint">
              {emp.id} · {emp.employmentType}
            </p>
          </div>
          <div className="flex gap-2">
            <a href={`mailto:${emp.email}`}>
              <Button variant="secondary" size="md">
                <MailIcon className="h-4 w-4" />
                Message
              </Button>
            </a>
            {isAdmin && (
              <>
                <Button 
                  variant="secondary" 
                  size="md" 
                  onClick={() => {
                    const nextActive = emp.isActive === false ? true : false;
                    updateEmployee(emp.id, { isActive: nextActive });
                    showToast(`${fullName(emp)}'s account has been ${nextActive ? 'activated' : 'deactivated'}.`, 'success');
                  }}
                >
                  {emp.isActive !== false ? 'Deactivate Account' : 'Activate Account'}
                </Button>
                <Button variant="primary" size="md" onClick={openEdit}>
                  <PencilIcon className="h-4 w-4" />
                  Edit
                </Button>
                <Button variant="danger" size="md" onClick={() => setConfirmDelete(true)}>
                  <Trash2Icon className="h-4 w-4" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto border-t border-line px-3">
          {TABS.map((t) =>
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative shrink-0 px-4 py-3 text-sm font-medium transition-colors ${tab === t ? 'text-accent' : 'text-content-muted hover:text-content'}`}>
            
              {t}
              {tab === t &&
            <motion.span
              layoutId="profile-tab"
              className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-accent" />

            }
            </button>
          )}
        </div>
      </Card>

      <div className="mt-4">
        <motion.div
          key={tab}
          initial={{
            opacity: 0,
            y: 8
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            duration: 0.2
          }}>
          
          {tab === 'Overview' &&
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader title="Personal information" />
                <div className="divide-y divide-line px-5 py-1">
                  <InfoRow icon={MailIcon} label="Email" value={emp.email} />
                  <InfoRow icon={PhoneIcon} label="Phone" value={emp.phone} />
                  <InfoRow
                  icon={MapPinIcon}
                  label="Address"
                  value={emp.address} />
                
                  <InfoRow icon={UserIcon} label="Gender" value={emp.gender} />
                  <InfoRow
                  icon={CalendarIcon}
                  label="Date of birth"
                  value={formatDate(emp.dateOfBirth)} />
                
                </div>
              </Card>
              <Card>
                <CardHeader title="Job information" />
                <div className="divide-y divide-line px-5 py-1">
                  <InfoRow icon={BriefcaseIcon} label="Role" value={emp.role} />
                  <InfoRow
                  icon={BriefcaseIcon}
                  label="Department"
                  value={dept?.name ?? '—'} />
                
                  <InfoRow
                  icon={UserIcon}
                  label="Manager"
                  value={manager ? fullName(manager) : 'None'} />
                
                  <InfoRow
                  icon={CalendarIcon}
                  label="Join date"
                  value={formatDate(emp.joinDate)} />
                
                  <InfoRow
                  icon={CalendarIcon}
                  label="End date"
                  value={emp.endDate ? formatDate(emp.endDate) : '—'} />
                
                  <InfoRow
                  icon={MapPinIcon}
                  label="Location"
                  value={emp.location} />
                
                  <InfoRow
                  icon={ClockIcon}
                  label="Work Shift"
                  value={emp.shift || 'Morning Shift (9:00 AM - 5:00 PM)'} />

                  <InfoRow
                  icon={StarIcon}
                  label="Annual salary"
                  value={currency(emp.salary)} />
                
                </div>
              </Card>
            </div>
          }

          {tab === 'Attendance' &&
          <Card className="overflow-hidden">
              <CardHeader
              title="Attendance history"
              subtitle="Last 10 records" />
            
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-xs text-content-muted">
                      <th className="px-5 py-3 font-medium">Date</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Clock in</th>
                      <th className="px-5 py-3 font-medium">Clock out</th>
                      <th className="px-5 py-3 font-medium">Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((a) =>
                  <tr key={a.id} className="border-b border-line/60">
                        <td className="px-5 py-3 text-content">
                          {formatDate(a.date)}
                        </td>
                        <td className="px-5 py-3">
                          <Badge tone={attendanceTone[a.status]}>
                            {a.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3 text-content-muted">
                          {a.clockIn ?? '—'}
                        </td>
                        <td className="px-5 py-3 text-content-muted">
                          {a.clockOut ?? '—'}
                        </td>
                        <td className="px-5 py-3 text-content-muted">
                          {a.hours || '—'}
                        </td>
                      </tr>
                  )}
                  </tbody>
                </table>
              </div>
            </Card>
          }

          {tab === 'Leave' &&
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Card className="p-5">
                <p className="text-xs text-content-muted">Annual leave</p>
                <p className="mt-1 text-2xl font-bold text-content">
                  {balance ? balance.annualTotal - balance.annualUsed : 0}
                  <span className="text-base font-normal text-content-faint">
                    {' '}
                    / {balance?.annualTotal} days
                  </span>
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-raised">
                  <div
                  className="h-full rounded-full bg-accent"
                  style={{
                    width: `${balance ? balance.annualUsed / balance.annualTotal * 100 : 0}%`
                  }} />
                
                </div>
                <p className="mt-2 text-xs text-content-faint">
                  {balance?.annualUsed} used
                </p>
              </Card>
              <Card className="p-5">
                <p className="text-xs text-content-muted">Sick leave</p>
                <p className="mt-1 text-2xl font-bold text-content">
                  {balance ? balance.sickTotal - balance.sickUsed : 0}
                  <span className="text-base font-normal text-content-faint">
                    {' '}
                    / {balance?.sickTotal} days
                  </span>
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-raised">
                  <div
                  className="h-full rounded-full bg-violet-400"
                  style={{
                    width: `${balance ? balance.sickUsed / balance.sickTotal * 100 : 0}%`
                  }} />
                
                </div>
                <p className="mt-2 text-xs text-content-faint">
                  {balance?.sickUsed} used
                </p>
              </Card>
              <Card className="lg:col-span-3 overflow-hidden">
                <CardHeader title="Leave requests" />
                {empLeaves.length === 0 ?
              <p className="px-5 py-8 text-center text-sm text-content-muted">
                    No leave requests on record.
                  </p> :

              <ul className="divide-y divide-line">
                    {empLeaves.map((l) =>
                <li
                  key={l.id}
                  className="flex items-center justify-between gap-3 px-5 py-3">
                  
                        <div>
                          <p className="text-sm font-medium text-content">
                            {l.type} · {l.days} days
                          </p>
                          <p className="text-xs text-content-muted">
                            {formatDate(l.startDate)} – {formatDate(l.endDate)}
                          </p>
                        </div>
                        <Badge
                    tone={
                    l.status === 'Approved' ?
                    'green' :
                    l.status === 'Pending' ?
                    'amber' :
                    'red'
                    }>
                    
                          {l.status}
                        </Badge>
                      </li>
                )}
                  </ul>
              }
              </Card>
            </div>
          }

          {tab === 'Payroll' &&
          <Card className="overflow-hidden">
              <CardHeader title="Payslips" subtitle="Monthly compensation" />
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-xs text-content-muted">
                      <th className="px-5 py-3 font-medium">Period</th>
                      <th className="px-5 py-3 font-medium">Base</th>
                      <th className="px-5 py-3 font-medium">Allowances</th>
                      <th className="px-5 py-3 font-medium">Deductions</th>
                      <th className="px-5 py-3 font-medium">Net pay</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payslips.map((p) =>
                  <tr key={p.id} className="border-b border-line/60">
                        <td className="px-5 py-3 text-content">{p.period}</td>
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
                          <Badge tone={payrollStatusTone[p.status]}>
                            {p.status}
                          </Badge>
                        </td>
                      </tr>
                  )}
                  </tbody>
                </table>
              </div>
            </Card>
          }

          {tab === 'Performance' &&
          <div className="space-y-4">
              {reviews.map((r) =>
            <Card key={r.id} className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-content">
                        {r.cycle} Review
                      </p>
                      <p className="text-xs text-content-muted">
                        Reviewer:{' '}
                        {getEmployee(r.reviewerId) ?
                    fullName(getEmployee(r.reviewerId)!) :
                    '—'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) =>
                    <StarIcon
                      key={n}
                      className={`h-4 w-4 ${n <= Math.round(r.rating) ? 'fill-accent text-accent' : 'text-content-faint'}`} />

                    )}
                      </div>
                      <span className="text-sm font-semibold text-content">
                        {r.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-content-muted">{r.summary}</p>
                  <div className="mt-4 space-y-3">
                    {r.goals.map((g) =>
                <div key={g.label}>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="text-content-muted">{g.label}</span>
                          <span className="text-content">{g.progress}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-surface-raised">
                          <div
                      className="h-full rounded-full bg-accent"
                      style={{
                        width: `${g.progress}%`
                      }} />
                    
                        </div>
                      </div>
                )}
                  </div>
                </Card>
            )}
            </div>
          }
        </motion.div>
      </div>

      {/* Edit Employee Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={`Edit ${fullName(emp)}`}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-content-muted">Role / Title</label>
              <input
                className="h-10 w-full rounded-xl border border-line bg-surface-raised px-3 text-sm text-content focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
                value={editRole}
                onChange={e => setEditRole(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-content-muted">Status</label>
              <select
                className="h-10 w-full rounded-xl border border-line bg-surface-raised px-3 text-sm text-content focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
                value={editStatus}
                onChange={e => setEditStatus(e.target.value as EmployeeStatus)}
              >
                {(['Permanent', 'Probation', 'On Leave', 'Terminated'] as EmployeeStatus[]).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-content-muted">Department</label>
              <select
                className="h-10 w-full rounded-xl border border-line bg-surface-raised px-3 text-sm text-content focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
                value={editDept}
                onChange={e => setEditDept(e.target.value)}
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-content-muted">Location</label>
              <input
                className="h-10 w-full rounded-xl border border-line bg-surface-raised px-3 text-sm text-content focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
                value={editLocation}
                onChange={e => setEditLocation(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-content-muted">Phone</label>
              <input
                className="h-10 w-full rounded-xl border border-line bg-surface-raised px-3 text-sm text-content focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
                value={editPhone}
                onChange={e => setEditPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-content-muted">Annual Salary</label>
              <input
                type="number"
                className="h-10 w-full rounded-xl border border-line bg-surface-raised px-3 text-sm text-content focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
                value={editSalary}
                onChange={e => setEditSalary(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-content-muted">Work Shift</label>
              <select
                className="h-10 w-full rounded-xl border border-line bg-surface-raised px-3 text-sm text-content focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
                value={editShift}
                onChange={e => setEditShift(e.target.value)}
              >
                {[
                  'Morning Shift (9:00 AM - 5:00 PM)',
                  'Mid Shift (10:30 AM - 6:30 PM)',
                  'Afternoon Shift (1:30 PM - 10:30 PM)',
                  'Evening Shift (5:00 PM - 1:00 AM)',
                  'Night Shift (1:00 AM - 9:00 AM)',
                  'Flexible Shift'
                ].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-content-muted">Account Type / Permissions</label>
              <select
                className="h-10 w-full rounded-xl border border-line bg-surface-raised px-3 text-sm text-content focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
                value={editIsAdmin ? 'admin' : 'employee'}
                onChange={e => setEditIsAdmin(e.target.value === 'admin')}
              >
                <option value="employee">Employee (Standard Access)</option>
                <option value="admin">Administrator (Full Access)</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-content-muted">Join Date</label>
              <input
                type="date"
                className="h-10 w-full rounded-xl border border-line bg-surface-raised px-3 text-sm text-content focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
                value={editJoinDate}
                onChange={e => setEditJoinDate(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-content-muted">End Date (Leaving Date)</label>
              <input
                type="date"
                className="h-10 w-full rounded-xl border border-line bg-surface-raised px-3 text-sm text-content focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
                value={editEndDate}
                onChange={e => setEditEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Account Active toggle */}
          <div className="flex items-center justify-between rounded-xl border border-line bg-surface-raised px-4 py-3">
            <div>
              <p className="text-sm font-medium text-content">Account Active</p>
              <p className="text-xs text-content-faint mt-0.5">
                {editIsActive ? 'Employee can log in to the portal' : 'Employee cannot log in to the portal'}
              </p>
            </div>
            <button
              type="button"
              id="edit-account-active-toggle"
              onClick={() => setEditIsActive(prev => !prev)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                editIsActive ? 'bg-emerald-500' : 'bg-surface'
              }`}
              aria-label="Toggle account active"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  editIsActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleEditSave}>
              <SaveIcon className="h-4 w-4" />
              Save changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Confirmation */}
      <ConfirmationModal
        open={confirmEdit}
        onClose={() => setConfirmEdit(false)}
        onConfirm={doEditSave}
        title="Save Employee Changes"
        message={`Are you sure you want to update the profile for ${fullName(emp)}? The new details will be saved and reflected across the system.`}
        confirmText="Save Changes"
        variant="primary"
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={doDelete}
        title="Delete Employee Profile"
        message={`Are you sure you want to permanently delete the profile for ${fullName(emp)}? This action is irreversible and will delete all related attendance, payroll, performance, and leave records.`}
        confirmText="Delete Profile"
        cancelText="Cancel"
        variant="danger"
      />
    </div>);

}