import React, { useMemo, useState } from 'react';
import { useHrms } from '../store/HrmsContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { KpiCard } from '../components/dashboard/KpiCard';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { CalendarIcon, PlaneIcon, CheckIcon, XIcon, ClockIcon, InfoIcon, ShieldCheckIcon } from 'lucide-react';
import { leaveStatusTone } from '../components/ui/statusMaps';
import { LeaveType } from '../types';
import { showToast } from '../components/ui/Toast';

const fieldClass =
  'h-10 w-full rounded-xl border border-line bg-surface px-3 text-sm text-content placeholder:text-content-faint focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30';
const labelClass = 'mb-1.5 block text-xs font-medium text-content-muted';

export function MyLeavesPage() {
  const { currentUser, leaveRequests, getLeaveBalance, applyLeave } = useHrms();

  const [leaveType, setLeaveType] = useState<LeaveType>('Annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [halfDaySession, setHalfDaySession] = useState<'Morning' | 'Afternoon'>('Morning');
  const [reason, setReason] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<{ type: LeaveType; startDate: string; endDate: string; days: number; reason: string } | null>(null);

  if (!currentUser) return null;

  // Filter requests
  const myRequests = useMemo(() => 
    [...leaveRequests]
      .filter(l => l.employeeId === currentUser.id)
      .sort((a, b) => b.requestedOn.localeCompare(a.requestedOn)),
    [leaveRequests, currentUser.id]
  );

  const balance = useMemo(() => 
    getLeaveBalance(currentUser.id),
    [getLeaveBalance, currentUser.id]
  );

  const allocs = balance?.allocations;

  // Selected leave type remaining balance
  const selectedTypeRemaining = useMemo(() => {
    if (!allocs) return 0;
    const key = leaveType === 'Sick' ? 'Medical' : leaveType;
    return allocs[key]?.remaining ?? 0;
  }, [allocs, leaveType]);

  const counts = useMemo(() => {
    const pending = myRequests.filter(l => l.status === 'Pending').length;
    const approved = myRequests.filter(l => l.status === 'Approved').length;
    const rejected = myRequests.filter(l => l.status === 'Rejected').length;
    const approvedDays = myRequests
      .filter(l => l.status === 'Approved')
      .reduce((sum, l) => sum + l.days, 0);

    const totalRemainingAll = allocs
      ? Object.values(allocs).reduce((sum, a) => sum + (a.remaining || 0), 0)
      : 0;

    return { pending, approved, rejected, approvedDays, totalRemainingAll };
  }, [myRequests, allocs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (leaveType === 'Half Day') {
      if (!startDate) {
        setError('Please select a date for your half day leave.');
        return;
      }
    } else {
      if (!startDate || !endDate) {
        setError('Please select both start and end dates.');
        return;
      }
    }

    const start = new Date(startDate);
    const end = leaveType === 'Half Day' ? start : new Date(endDate);

    if (end < start) {
      setError('End date cannot be before start date.');
      return;
    }

    let calculatedDays = 1;
    if (leaveType === 'Half Day') {
      calculatedDays = 0.5;
    } else {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      calculatedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    // Quota check validation
    if (calculatedDays > selectedTypeRemaining) {
      setError(`Insufficient leave balance! You requested ${calculatedDays} day(s) but only have ${selectedTypeRemaining} day(s) remaining for ${leaveType} Leave.`);
      return;
    }

    const formattedReason = leaveType === 'Half Day' 
      ? `[${halfDaySession} Half Day] ${reason}`.trim()
      : reason;

    const formattedEndDate = leaveType === 'Half Day' ? startDate : endDate;

    setPendingPayload({ 
      type: leaveType, 
      startDate, 
      endDate: formattedEndDate, 
      days: calculatedDays, 
      reason: formattedReason 
    });
    setConfirmOpen(true);
  };

  const confirmSubmit = async () => {
    if (!pendingPayload) return;
    try {
      await applyLeave(pendingPayload);
      setSuccess(true);
      setStartDate('');
      setEndDate('');
      setReason('');
      showToast('Leave request submitted successfully!', 'success');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit leave request.');
      showToast('Failed to submit leave request.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Leave Accounts & Requests"
        description="View your allocated leave balances, remaining days, and request time off."
      />

      {/* Sri Lanka Labour Law Notice for Probation Employees */}
      {currentUser.status === 'Probation' ? (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-300 flex items-start gap-3">
          <ShieldCheckIcon className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-200">Probationary Status — Half Day Leave Entitlement</p>
            <p className="mt-0.5 text-amber-300/90 leading-relaxed">
              Under Sri Lanka Labour Standards, employees on probation receive <strong>1 Half Day (0.5 Days)</strong> casual leave per month. Full annual (14d), casual (7d), and medical (14d) leave allocations will be <strong>automatically unlocked</strong> as soon as your status transitions to Permanent.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs text-emerald-300 flex items-start gap-3">
          <ShieldCheckIcon className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-200">Permanent Employment Status — Full Quotas Unlocked</p>
            <p className="mt-0.5 text-emerald-300/90 leading-relaxed">
              Your employment status is <strong>Permanent</strong>. Your full annual, casual, and medical leave accounts are active and ready for use.
            </p>
          </div>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Total Available Days"
          value={String(counts.totalRemainingAll.toFixed(1))}
          icon={PlaneIcon}
          index={0}
          accent
        />
        <KpiCard
          label="Approved Off-days"
          value={String(counts.approvedDays)}
          icon={CheckIcon}
          index={1}
        />
        <KpiCard
          label="Pending Requests"
          value={String(counts.pending)}
          icon={CalendarIcon}
          index={2}
        />
        <KpiCard
          label="Rejected Requests"
          value={String(counts.rejected)}
          icon={XIcon}
          index={3}
        />
      </div>

      {/* Detailed Leave Accounts & Breakdown */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-content">Leave Account Balances (Allocated vs Remaining)</h3>
          <span className="text-xs text-content-faint">Status: {currentUser.status}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { type: 'Annual', label: 'Annual Leave', tone: 'accent' },
            { type: 'Casual', label: 'Casual Leave', tone: 'emerald' },
            { type: 'Medical', label: 'Medical / Sick Leave', tone: 'sky' },
            { type: 'Half Day', label: 'Half Day Leave', tone: 'amber' },
          ].map(({ type, label }) => {
            const data = allocs?.[type] || { allocated: 0, used: 0, remaining: 0 };
            const pct = data.allocated > 0 ? Math.min(100, Math.round((data.used / data.allocated) * 100)) : 0;

            return (
              <Card key={type} className="p-4 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-content-muted">{label}</span>
                  <Badge tone={data.remaining > 0 ? 'success' : 'neutral'}>
                    {data.remaining}d left
                  </Badge>
                </div>

                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-bold text-content">{data.remaining}</span>
                    <span className="text-xs text-content-faint ml-1">/ {data.allocated} days</span>
                  </div>
                  <span className="text-xs text-content-muted">{data.used} used</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-surface-raised overflow-hidden">
                  <div 
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Leave application form */}
        <Card className="flex flex-col h-fit">
          <CardHeader
            title="Request Time Off"
            subtitle="Submit a new leave application"
          />

          <form onSubmit={handleSubmit} className="space-y-4 p-5">
            {error && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-400">
                Leave request submitted successfully!
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelClass} htmlFor="leave_type">
                  Leave Type
                </label>
                <span className="text-[11px] text-accent font-medium">
                  Available: {selectedTypeRemaining} days
                </span>
              </div>
              <select
                id="leave_type"
                className={fieldClass}
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value as LeaveType)}
              >
                <option value="Casual">Casual Leave</option>
                <option value="Half Day">Half Day Leave (0.5 Day)</option>
                <option value="Annual">Annual Leave</option>
                <option value="Medical">Medical / Sick Leave</option>
                <option value="Sick">Sick Leave</option>
                <option value="Unpaid">Unpaid Leave</option>
                <option value="Parental">Parental Leave</option>
                <option value="Bereavement">Bereavement Leave</option>
              </select>
            </div>

            {leaveType === 'Half Day' ? (
              <>
                <div>
                  <label className={labelClass} htmlFor="half_day_date">
                    Leave Date (Half Day)
                  </label>
                  <input
                    id="half_day_date"
                    type="date"
                    className={fieldClass}
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setEndDate(e.target.value);
                    }}
                  />
                </div>

                <div>
                  <label className={labelClass}>Half Day Session</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setHalfDaySession('Morning')}
                      className={`h-9 rounded-xl border text-xs font-semibold transition-colors ${
                        halfDaySession === 'Morning'
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-line bg-surface text-content-muted hover:text-content'
                      }`}
                    >
                      Morning Session
                    </button>
                    <button
                      type="button"
                      onClick={() => setHalfDaySession('Afternoon')}
                      className={`h-9 rounded-xl border text-xs font-semibold transition-colors ${
                        halfDaySession === 'Afternoon'
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-line bg-surface text-content-muted hover:text-content'
                      }`}
                    >
                      Afternoon Session
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass} htmlFor="start_date">
                    Start Date
                  </label>
                  <input
                    id="start_date"
                    type="date"
                    className={fieldClass}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="end_date">
                    End Date
                  </label>
                  <input
                    id="end_date"
                    type="date"
                    className={fieldClass}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label className={labelClass} htmlFor="reason">
                Reason for Leave
              </label>
              <textarea
                id="reason"
                className="w-full rounded-xl border border-line bg-surface p-3 text-sm text-content placeholder:text-content-faint focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30 min-h-[80px]"
                placeholder="Brief reason for your leave request..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <Button type="submit" variant="primary" className="w-full h-10">
              Submit Request {leaveType === 'Half Day' ? '(0.5 Day)' : ''}
            </Button>
          </form>
        </Card>

        {/* History of requests */}
        <Card className="lg:col-span-2 flex flex-col min-h-[300px]">
          <div className="p-5 border-b border-line">
            <h3 className="text-sm font-bold text-content">Leave History</h3>
            <p className="text-xs text-content-faint mt-0.5">Track your submitted requests and approvals</p>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-raised/40 text-xs font-semibold text-content-muted">
                  <th className="px-5 py-3">Leave Type</th>
                  <th className="px-5 py-3">Duration</th>
                  <th className="px-5 py-3">Days</th>
                  <th className="px-5 py-3">Reason</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {myRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-xs text-content-faint">
                      No leave requests submitted yet.
                    </td>
                  </tr>
                ) : (
                  myRequests.map((l) => (
                    <tr key={l.id} className="hover:bg-white/[0.01]">
                      <td className="px-5 py-3 text-xs text-content font-semibold">
                        {l.type} Leave
                      </td>
                      <td className="px-5 py-3 text-xs text-content-muted">
                        {l.startDate} {l.startDate !== l.endDate ? `to ${l.endDate}` : ''}
                      </td>
                      <td className="px-5 py-3 text-xs text-content">{l.days} day{l.days !== 1 ? 's' : ''}</td>
                      <td className="px-5 py-3 text-xs text-content-muted truncate max-w-[150px]" title={l.reason}>
                        {l.reason}
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={leaveStatusTone[l.status]}>{l.status}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <ConfirmationModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmSubmit}
        title="Submit Leave Request"
        message={pendingPayload ? `You are about to submit a ${pendingPayload.type} leave request for ${pendingPayload.startDate} ${pendingPayload.startDate !== pendingPayload.endDate ? `to ${pendingPayload.endDate}` : ''} (${pendingPayload.days} day${pendingPayload.days !== 1 ? 's' : ''}). This request will be sent to your HR admin for review.` : ''}
        confirmText="Submit Request"
        variant="primary"
      />
    </div>
  );
}
