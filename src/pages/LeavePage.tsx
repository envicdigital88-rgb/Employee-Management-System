import React, { useMemo, useState } from 'react';
import { 
  CheckIcon, 
  XIcon, 
  CheckCheckIcon, 
  PlaneIcon, 
  SlidersIcon, 
  Edit3Icon, 
  SearchIcon, 
  RefreshCwIcon,
  InfoIcon,
  UserCheckIcon
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { KpiCard } from '../components/dashboard/KpiCard';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { useHrms } from '../store/HrmsContext';
import { fullName } from '../data/employees';
import { getDefaultLeaveQuota } from '../data/leave';
import { leaveStatusTone } from '../components/ui/statusMaps';
import { formatDate } from '../lib/format';
import { LeaveRequest, LeaveStatus, LeaveType, Employee } from '../types';
import { showToast } from '../components/ui/Toast';

const REQUEST_TABS: (LeaveStatus | 'All')[] = ['Pending', 'Approved', 'Rejected', 'All'];

export function LeavePage() {
  const { 
    employees, 
    leaveRequests, 
    setLeaveStatus, 
    getEmployee, 
    getDepartment, 
    getLeaveBalance, 
    updateLeaveAllocation,
    updateEmployeeStatus
  } = useHrms();

  const [activeView, setActiveView] = useState<'requests' | 'allocations'>('requests');
  const [requestTab, setRequestTab] = useState<(typeof REQUEST_TABS)[number]>('Pending');
  
  // Search & Filters for Allocations view
  const [allocationSearch, setAllocationSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Allocation Modal State
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [allocationForm, setAllocationForm] = useState<Record<string, number>>({});

  // Confirmation states
  const [confirmSingle, setConfirmSingle] = useState<{ leave: LeaveRequest; action: 'Approved' | 'Rejected' } | null>(null);
  const [confirmApproveAll, setConfirmApproveAll] = useState(false);

  const counts = useMemo(
    () => ({
      pending: leaveRequests.filter((l) => l.status === 'Pending').length,
      approved: leaveRequests.filter((l) => l.status === 'Approved').length,
      rejected: leaveRequests.filter((l) => l.status === 'Rejected').length,
      days: leaveRequests.filter((l) => l.status === 'Approved').reduce((s, l) => s + l.days, 0)
    }),
    [leaveRequests]
  );

  const filteredRequests = leaveRequests.filter((l) => requestTab === 'All' || l.status === requestTab);
  const pendingRequests = leaveRequests.filter((l) => l.status === 'Pending');

  const filteredEmployeesForAllocations = useMemo(() => {
    return employees.filter(e => {
      const matchesSearch = fullName(e).toLowerCase().includes(allocationSearch.toLowerCase()) || 
                            e.id.toLowerCase().includes(allocationSearch.toLowerCase()) ||
                            e.email.toLowerCase().includes(allocationSearch.toLowerCase());
      const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [employees, allocationSearch, statusFilter]);

  const handleSingleAction = (leave: LeaveRequest, action: 'Approved' | 'Rejected') => {
    setConfirmSingle({ leave, action });
  };

  const confirmSingleAction = () => {
    if (!confirmSingle) return;
    setLeaveStatus([confirmSingle.leave.id], confirmSingle.action, [confirmSingle.leave]);
    showToast(
      `Leave request ${confirmSingle.action.toLowerCase()} for ${getEmployee(confirmSingle.leave.employeeId) ? fullName(getEmployee(confirmSingle.leave.employeeId)!) : 'employee'}.`,
      confirmSingle.action === 'Approved' ? 'success' : 'info'
    );
  };

  const handleApproveAll = () => {
    setConfirmApproveAll(true);
  };

  const confirmApproveAllAction = () => {
    setLeaveStatus(pendingRequests.map((l) => l.id), 'Approved', pendingRequests);
    showToast(`All ${pendingRequests.length} pending leave requests approved.`, 'success');
  };

  const handleConfirmPermanent = (empId: string) => {
    const emp = getEmployee(empId);
    updateEmployeeStatus([empId], 'Permanent');
    showToast(`Status for ${emp ? fullName(emp) : 'Employee'} updated to Permanent. Full leave allocations (Annual, Casual, Medical) are now unlocked!`, 'success');
  };

  // Open allocation editing modal
  const handleOpenAllocationModal = (emp: Employee) => {
    setEditingEmployee(emp);
    const balance = getLeaveBalance(emp.id);
    const currentAllocations: Record<string, number> = {};
    
    if (balance?.allocations) {
      Object.keys(balance.allocations).forEach((type) => {
        currentAllocations[type] = balance.allocations[type as LeaveType]?.allocated ?? 0;
      });
    } else {
      const defaultQuota = getDefaultLeaveQuota(emp.status);
      Object.assign(currentAllocations, defaultQuota);
    }
    
    setAllocationForm(currentAllocations);
  };

  const handleSaveAllocations = () => {
    if (!editingEmployee) return;
    updateLeaveAllocation(editingEmployee.id, allocationForm);
    showToast(`Leave allocation updated for ${fullName(editingEmployee)}`, 'success');
    setEditingEmployee(null);
  };

  const handleApplyPreset = (presetType: 'permanent' | 'probation') => {
    const quota = getDefaultLeaveQuota(presetType === 'probation' ? 'Probation' : 'Permanent');
    setAllocationForm(quota);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Management"
        description="Review leave requests, manage approvals, and allocate employee leave accounts."
        actions={
          pendingRequests.length > 0 && activeView === 'requests' ? (
            <Button variant="primary" onClick={handleApproveAll}>
              <CheckCheckIcon className="h-4 w-4" />
              Approve all pending ({pendingRequests.length})
            </Button>
          ) : undefined
        }
      />

      {/* Primary Navigation Tabs (Requests vs Allocations) */}
      <div className="flex border-b border-line">
        <button
          onClick={() => setActiveView('requests')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            activeView === 'requests'
              ? 'border-accent text-accent'
              : 'border-transparent text-content-muted hover:text-content'
          }`}
        >
          <PlaneIcon className="h-4 w-4" />
          Leave Requests ({counts.pending} Pending)
        </button>
        <button
          onClick={() => setActiveView('allocations')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            activeView === 'allocations'
              ? 'border-accent text-accent'
              : 'border-transparent text-content-muted hover:text-content'
          }`}
        >
          <SlidersIcon className="h-4 w-4" />
          Allocate Employee Leave Accounts
        </button>
      </div>

      {activeView === 'requests' ? (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard label="Pending" value={String(counts.pending)} icon={PlaneIcon} index={0} accent />
            <KpiCard label="Approved" value={String(counts.approved)} icon={CheckIcon} index={1} />
            <KpiCard label="Rejected" value={String(counts.rejected)} icon={XIcon} index={2} />
            <KpiCard label="Approved days" value={String(counts.days)} icon={CheckCheckIcon} index={3} />
          </div>

          <Card className="overflow-hidden">
            <div className="flex gap-1 border-b border-line px-3">
              {REQUEST_TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setRequestTab(t)}
                  className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                    requestTab === t ? 'text-accent' : 'text-content-muted hover:text-content'
                  }`}
                >
                  {t}
                  {t !== 'All' && (
                    <span className="ml-1.5 text-xs text-content-faint">
                      {t === 'Pending' ? counts.pending : t === 'Approved' ? counts.approved : counts.rejected}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {filteredRequests.length === 0 ? (
              <EmptyState icon={PlaneIcon} title="Nothing here" description={`No ${requestTab.toLowerCase()} leave requests.`} />
            ) : (
              <ul className="divide-y divide-line">
                {filteredRequests.map((l) => {
                  const emp = getEmployee(l.employeeId);
                  if (!emp) return null;
                  return (
                    <li key={l.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                      <div className="flex flex-1 items-center gap-3">
                        <Avatar src={emp.avatarUrl} name={fullName(emp)} size="md" />
                        <div className="min-w-0">
                          <p className="font-medium text-content">{fullName(emp)}</p>
                          <p className="text-xs text-content-muted">
                            {getDepartment(emp.departmentId)?.name} · Requested {formatDate(l.requestedOn)}
                          </p>
                          <p className="mt-1 text-sm text-content-muted">{l.reason}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                        <div className="text-right">
                          <Badge tone="neutral">{l.type}</Badge>
                          <p className="mt-1 text-xs text-content-muted">
                            {formatDate(l.startDate)} – {formatDate(l.endDate)} · {l.days}d
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {l.status === 'Pending' ? (
                          <>
                            <Button variant="secondary" size="sm" onClick={() => handleSingleAction(l, 'Rejected')}>
                              <XIcon className="h-4 w-4" /> Reject
                            </Button>
                            <Button variant="primary" size="sm" onClick={() => handleSingleAction(l, 'Approved')}>
                              <CheckIcon className="h-4 w-4" /> Approve
                            </Button>
                          </>
                        ) : (
                          <Badge tone={leaveStatusTone[l.status]} dot>{l.status}</Badge>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </>
      ) : (
        /* Leave Allocations View */
        <div className="space-y-4">
          <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 text-xs text-content flex items-start gap-3">
            <InfoIcon className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-accent">Employee Leave Allocation Rules</p>
              <p className="mt-0.5 text-content-muted">
                Admin can configure leave quotas per employee for Annual, Casual, Medical, Half Day, Parental, etc.
                Under <strong>Sri Lanka Labour Standards</strong>, probationary employees are allocated <strong>0.5 (Half Day)</strong> casual leave entitlement per month.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-faint" />
              <input
                type="text"
                placeholder="Search employee name or ID..."
                className="w-full h-10 rounded-xl border border-line bg-surface pl-9 pr-3 text-sm text-content placeholder:text-content-faint focus:border-accent/50 focus:outline-none"
                value={allocationSearch}
                onChange={(e) => setAllocationSearch(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-xs text-content-muted font-medium">Status Filter:</label>
              <select
                className="h-10 rounded-xl border border-line bg-surface px-3 text-xs text-content focus:border-accent/50 focus:outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Permanent">Permanent</option>
                <option value="Probation">Probation</option>
              </select>
            </div>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-surface-raised/40 text-xs font-semibold text-content-muted">
                    <th className="px-5 py-3.5">Employee</th>
                    <th className="px-5 py-3.5">Employment Status</th>
                    <th className="px-5 py-3.5">Annual</th>
                    <th className="px-5 py-3.5">Casual</th>
                    <th className="px-5 py-3.5">Medical / Sick</th>
                    <th className="px-5 py-3.5">Half Day</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredEmployeesForAllocations.map((emp) => {
                    const balance = getLeaveBalance(emp.id);
                    const allocs = balance?.allocations;

                    return (
                      <tr key={emp.id} className="hover:bg-white/[0.01]">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar src={emp.avatarUrl} name={fullName(emp)} size="sm" />
                            <div>
                              <p className="font-semibold text-content text-xs">{fullName(emp)}</p>
                              <p className="text-[11px] text-content-faint">{emp.id} · {emp.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <Badge tone={emp.status === 'Permanent' ? 'success' : emp.status === 'Probation' ? 'warning' : 'neutral'}>
                            {emp.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-xs">
                          <span className="font-semibold text-content">{allocs?.Annual?.allocated ?? 14}d</span>
                          <span className="text-content-faint ml-1">({allocs?.Annual?.used ?? 0} used)</span>
                        </td>
                        <td className="px-5 py-4 text-xs">
                          <span className="font-semibold text-content">{allocs?.Casual?.allocated ?? 7}d</span>
                          <span className="text-content-faint ml-1">({allocs?.Casual?.used ?? 0} used)</span>
                        </td>
                        <td className="px-5 py-4 text-xs">
                          <span className="font-semibold text-content">{allocs?.Medical?.allocated ?? 14}d</span>
                          <span className="text-content-faint ml-1">({allocs?.Medical?.used ?? 0} used)</span>
                        </td>
                        <td className="px-5 py-4 text-xs">
                          <span className="font-semibold text-content">{allocs?.['Half Day']?.allocated ?? (emp.status === 'Probation' ? 0.5 : 4)}d</span>
                          <span className="text-content-faint ml-1">({allocs?.['Half Day']?.used ?? 0} used)</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {emp.status === 'Probation' && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleConfirmPermanent(emp.id)}
                                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                                title="Change status to Permanent and unlock full leave allocations (14 Annual, 7 Casual, 14 Medical)"
                              >
                                <UserCheckIcon className="h-3.5 w-3.5" /> Make Permanent
                              </Button>
                            )}
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              onClick={() => handleOpenAllocationModal(emp)}
                              className="h-8 text-xs"
                            >
                              <Edit3Icon className="h-3.5 w-3.5" /> Allocate
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Allocation Edit Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-line bg-surface p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-3">
                <Avatar src={editingEmployee.avatarUrl} name={fullName(editingEmployee)} size="md" />
                <div>
                  <h3 className="text-base font-bold text-content">Allocate Leave Accounts</h3>
                  <p className="text-xs text-content-muted">
                    {fullName(editingEmployee)} ({editingEmployee.status})
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setEditingEmployee(null)}
                className="text-content-muted hover:text-content p-1 rounded-lg hover:bg-surface-raised"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Presets */}
            <div className="flex items-center justify-between bg-surface-raised/40 p-3 rounded-xl">
              <span className="text-xs font-medium text-content-muted">Apply Standard Preset:</span>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleApplyPreset('probation')}
                  className="h-7 text-xs"
                >
                  Probation (0.5 Half Day)
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleApplyPreset('permanent')}
                  className="h-7 text-xs"
                >
                  Permanent Quota
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-1">
              {[
                { type: 'Annual', label: 'Annual Leave (Days)' },
                { type: 'Casual', label: 'Casual Leave (Days)' },
                { type: 'Medical', label: 'Medical / Sick Leave (Days)' },
                { type: 'Half Day', label: 'Half Day Leave (Days / 0.5)' },
                { type: 'Parental', label: 'Parental Leave (Days)' },
                { type: 'Bereavement', label: 'Bereavement Leave (Days)' },
                { type: 'Unpaid', label: 'Unpaid Leave (Max Days)' },
              ].map(({ type, label }) => (
                <div key={type}>
                  <label className="mb-1 block text-xs font-medium text-content-muted">
                    {label}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="365"
                    className="h-9 w-full rounded-xl border border-line bg-surface px-3 text-sm text-content focus:border-accent/50 focus:outline-none"
                    value={allocationForm[type] ?? 0}
                    onChange={(e) => setAllocationForm({
                      ...allocationForm,
                      [type]: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
              <Button variant="secondary" onClick={() => setEditingEmployee(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveAllocations}>
                Save Allocation
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Single leave confirmation */}
      <ConfirmationModal
        open={!!confirmSingle}
        onClose={() => setConfirmSingle(null)}
        onConfirm={confirmSingleAction}
        title={confirmSingle?.action === 'Approved' ? 'Approve Leave Request' : 'Reject Leave Request'}
        message={
          confirmSingle
            ? `Are you sure you want to ${confirmSingle.action === 'Approved' ? 'approve' : 'reject'} the ${confirmSingle.leave.type} leave request from ${getEmployee(confirmSingle.leave.employeeId) ? fullName(getEmployee(confirmSingle.leave.employeeId)!) : 'this employee'} (${confirmSingle.leave.startDate} to ${confirmSingle.leave.endDate}, ${confirmSingle.leave.days} days)?`
            : ''
        }
        confirmText={confirmSingle?.action === 'Approved' ? 'Approve' : 'Reject'}
        variant={confirmSingle?.action === 'Rejected' ? 'danger' : 'primary'}
      />

      {/* Approve all pending confirmation */}
      <ConfirmationModal
        open={confirmApproveAll}
        onClose={() => setConfirmApproveAll(false)}
        onConfirm={confirmApproveAllAction}
        title="Approve All Pending Requests"
        message={`This will approve all ${pendingRequests.length} pending leave request(s). Each employee will be notified. This action cannot be undone.`}
        confirmText="Approve All"
        variant="primary"
      />
    </div>
  );
}