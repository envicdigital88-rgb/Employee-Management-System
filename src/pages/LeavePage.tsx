import React, { useMemo, useState } from 'react';
import { CheckIcon, XIcon, CheckCheckIcon, PlaneIcon } from 'lucide-react';
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
import { leaveStatusTone } from '../components/ui/statusMaps';
import { formatDate } from '../lib/format';
import { LeaveRequest, LeaveStatus } from '../types';
import { showToast } from '../components/ui/Toast';

const TABS: (LeaveStatus | 'All')[] = ['Pending', 'Approved', 'Rejected', 'All'];

export function LeavePage() {
  const { leaveRequests, setLeaveStatus, getEmployee, getDepartment } = useHrms();
  const [tab, setTab] = useState<(typeof TABS)[number]>('Pending');

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

  const filtered = leaveRequests.filter((l) => tab === 'All' || l.status === tab);
  const pendingRequests = leaveRequests.filter((l) => l.status === 'Pending');

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

  return (
    <div>
      <PageHeader
        title="Leave management"
        description="Review, approve, and track time-off across the company."
        actions={
          pendingRequests.length > 0 ?
          <Button variant="primary" onClick={handleApproveAll}>
            <CheckCheckIcon className="h-4 w-4" />
            Approve all pending ({pendingRequests.length})
          </Button> :
          undefined
        } />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Pending" value={String(counts.pending)} icon={PlaneIcon} index={0} accent />
        <KpiCard label="Approved" value={String(counts.approved)} icon={CheckIcon} index={1} />
        <KpiCard label="Rejected" value={String(counts.rejected)} icon={XIcon} index={2} />
        <KpiCard label="Approved days" value={String(counts.days)} icon={CheckCheckIcon} index={3} />
      </div>

      <Card className="overflow-hidden">
        <div className="flex gap-1 border-b border-line px-3">
          {TABS.map((t) =>
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative px-4 py-3 text-sm font-medium transition-colors ${tab === t ? 'text-accent' : 'text-content-muted hover:text-content'}`}>
            {t}
            {t !== 'All' &&
            <span className="ml-1.5 text-xs text-content-faint">
                {t === 'Pending' ? counts.pending : t === 'Approved' ? counts.approved : counts.rejected}
              </span>
            }
            </button>
          )}
        </div>

        {filtered.length === 0 ?
        <EmptyState icon={PlaneIcon} title="Nothing here" description={`No ${tab.toLowerCase()} leave requests.`} /> :

        <ul className="divide-y divide-line">
            {filtered.map((l) => {
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
        }
      </Card>

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