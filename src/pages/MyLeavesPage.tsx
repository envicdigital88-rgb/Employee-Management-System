import React, { useMemo, useState } from 'react';
import { useHrms } from '../store/HrmsContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { KpiCard } from '../components/dashboard/KpiCard';
import { CalendarIcon, PlaneIcon, CheckIcon, XIcon } from 'lucide-react';
import { leaveStatusTone } from '../components/ui/statusMaps';
import { LeaveType } from '../types';

const fieldClass =
  'h-10 w-full rounded-xl border border-line bg-surface px-3 text-sm text-content placeholder:text-content-faint focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30';
const labelClass = 'mb-1.5 block text-xs font-medium text-content-muted';

export function MyLeavesPage() {
  const { currentUser, leaveRequests, getLeaveBalance, applyLeave } = useHrms();

  const [leaveType, setLeaveType] = useState<LeaveType>('Annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const counts = useMemo(() => {
    const pending = myRequests.filter(l => l.status === 'Pending').length;
    const approved = myRequests.filter(l => l.status === 'Approved').length;
    const rejected = myRequests.filter(l => l.status === 'Rejected').length;
    const approvedDays = myRequests
      .filter(l => l.status === 'Approved')
      .reduce((sum, l) => sum + l.days, 0);

    return { pending, approved, rejected, approvedDays };
  }, [myRequests]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      setError('End date cannot be before start date.');
      return;
    }

    // Calculate days (inclusive)
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    try {
      await applyLeave({
        type: leaveType,
        startDate,
        endDate,
        days: diffDays,
        reason
      });
      setSuccess(true);
      setStartDate('');
      setEndDate('');
      setReason('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit leave request.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Management"
        description="Apply for time-off and track your leave balances."
      />

      {/* Leave statistics cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Available Leave Days"
          value={String((balance?.annualTotal ?? 25) - (balance?.annualUsed ?? 0))}
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
              <label className={labelClass} htmlFor="leave_type">
                Leave Type
              </label>
              <select
                id="leave_type"
                className={fieldClass}
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value as LeaveType)}
              >
                <option value="Annual">Annual Leave</option>
                <option value="Sick">Sick Leave</option>
                <option value="Unpaid">Unpaid Leave</option>
                <option value="Parental">Parental Leave</option>
                <option value="Bereavement">Bereavement Leave</option>
              </select>
            </div>

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
              Submit Request
            </Button>
          </form>
        </Card>

        {/* History of requests */}
        <Card className="lg:col-span-2 flex flex-col min-h-[300px]">
          <div className="p-5 border-b border-line">
            <h3 className="text-sm font-bold text-content">Leave History</h3>
            <p className="text-xs text-content-faint mt-0.5">Track your requests and approvals</p>
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
                        {l.startDate} to {l.endDate}
                      </td>
                      <td className="px-5 py-3 text-xs text-content">{l.days} days</td>
                      <td className="px-5 py-3 text-xs text-content-muted truncate max-w-[150px]" title={l.reason}>
                        {l.reason}
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={leaveStatusTone(l.status)}>{l.status}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
