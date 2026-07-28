import { useMemo, useState, useEffect } from 'react';
import { useHrms } from '../store/HrmsContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { KpiCard } from '../components/dashboard/KpiCard';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { CalendarIcon, PlaneIcon, CheckIcon, XIcon, ShieldCheckIcon, AlertTriangleIcon, InfoIcon } from 'lucide-react';
import { leaveStatusTone } from '../components/ui/statusMaps';
import { LeaveType } from '../types';
import { showToast } from '../components/ui/Toast';

const fieldClass =
  'h-10 w-full rounded-xl border border-line bg-surface px-3 text-sm text-content placeholder:text-content-faint focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30';
const labelClass = 'mb-1.5 block text-xs font-medium text-content-muted';

// Leave type label map for display
const LEAVE_TYPE_LABELS: Record<string, string> = {
  'Annual': 'Annual Leave',
  'Casual': 'Casual Leave',
  'Medical': 'Medical / Sick Leave',
  'Sick': 'Sick Leave',
  'Half Day': 'Half Day Leave (0.5 Day)',
  'Unpaid': 'Unpaid Leave',
  'No-Pay Sick': 'No-Pay Sick Leave (Probation)',
  'Parental': 'Parental Leave',
  'Bereavement': 'Bereavement Leave',
};

export function MyLeavesPage() {
  const { currentUser, leaveRequests, getLeaveBalance, applyLeave } = useHrms();

  const isProbation = currentUser?.status === 'Probation';

  const [leaveType, setLeaveType] = useState<LeaveType>(isProbation ? 'Half Day' : 'Annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [halfDaySession, setHalfDaySession] = useState<'Morning' | 'Afternoon'>('Morning');
  const [durationMode, setDurationMode] = useState<'Full Day' | 'Half Day'>('Full Day');
  const [reason, setReason] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<{
    type: LeaveType;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    isSplit?: boolean;
    paidDays?: number;
    unpaidDays?: number;
    originalType?: LeaveType;
  } | null>(null);

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

  // Half Day remaining balance for probation
  const halfDayRemaining = useMemo(() => {
    if (!allocs) return 0;
    return allocs['Half Day']?.remaining ?? 0;
  }, [allocs]);

  // Auto-switch leaveType to No-Pay Sick when half day is used up (probation)
  useEffect(() => {
    if (isProbation && halfDayRemaining <= 0 && leaveType === 'Half Day') {
      setLeaveType('No-Pay Sick');
    }
  }, [isProbation, halfDayRemaining, leaveType]);

  // Auto-switch leaveType away from Half Day when employee becomes Permanent
  useEffect(() => {
    if (!isProbation && leaveType === 'Half Day') {
      setLeaveType('Annual');
    }
    // Also remove No-Pay Sick option for permanent employees
    if (!isProbation && leaveType === 'No-Pay Sick') {
      setLeaveType('Annual');
    }
  }, [isProbation, leaveType]);

  // Selected leave type remaining balance
  const selectedTypeRemaining = useMemo(() => {
    if (!allocs) return 0;
    // No-Pay Sick is always available for probation (no quota limit)
    if (leaveType === 'No-Pay Sick') return 999;
    const key = leaveType === 'Sick' ? 'Medical' : leaveType;
    return allocs[key]?.remaining ?? 0;
  }, [allocs, leaveType]);

  const isHalfDay = leaveType === 'Half Day' || durationMode === 'Half Day';

  const calculatedDays = useMemo(() => {
    if (isHalfDay) return 0.5;
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [isHalfDay, startDate, endDate]);

  const isAllocatedExceeded = useMemo(() => {
    if (isProbation || leaveType === 'No-Pay Sick' || leaveType === 'Unpaid') return false;
    return calculatedDays > selectedTypeRemaining;
  }, [isProbation, leaveType, calculatedDays, selectedTypeRemaining]);

  const counts = useMemo(() => {
    const pending = myRequests.filter(l => l.status === 'Pending').length;
    const approved = myRequests.filter(l => l.status === 'Approved').length;
    const rejected = myRequests.filter(l => l.status === 'Rejected').length;
    const approvedDays = myRequests
      .filter(l => l.status === 'Approved')
      .reduce((sum, l) => sum + l.days, 0);

    const totalRemainingAll = allocs
      ? Object.entries(allocs)
          .filter(([type]) => type !== 'No-Pay Sick') // exclude unlimited from total
          .reduce((sum, [, a]) => sum + (a.remaining || 0), 0)
      : 0;

    return { pending, approved, rejected, approvedDays, totalRemainingAll };
  }, [myRequests, allocs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (isHalfDay) {
      if (!startDate) {
        setError('Please select a date for your leave.');
        return;
      }
    } else {
      if (!startDate || !endDate) {
        setError('Please select both start and end dates.');
        return;
      }
    }

    const start = new Date(startDate);
    const end = isHalfDay ? start : new Date(endDate);

    if (end < start) {
      setError('End date cannot be before start date.');
      return;
    }

    let formattedReason = reason.trim();
    if (isHalfDay) {
      formattedReason = `[${halfDaySession} Half Day] ${reason}`.trim();
    }

    const formattedEndDate = isHalfDay ? startDate : endDate;

    // For probation: if they exceed quota, they are blocked
    if (isProbation && leaveType !== 'No-Pay Sick' && calculatedDays > selectedTypeRemaining) {
      setError(`Insufficient leave balance! You requested ${calculatedDays} day(s) but only have ${selectedTypeRemaining} day(s) remaining for ${leaveType} Leave.`);
      return;
    }

    // For permanent: if they exceed quota, handle split or conversion
    if (!isProbation && isAllocatedExceeded) {
      if (selectedTypeRemaining <= 0) {
        // Full Unpaid
        setPendingPayload({
          type: 'Unpaid',
          startDate,
          endDate: formattedEndDate,
          days: calculatedDays,
          reason: `${formattedReason} [Quota Exhausted - Auto-converted to Unpaid]`.trim()
        });
      } else {
        // Split
        setPendingPayload({
          type: leaveType,
          startDate,
          endDate: formattedEndDate,
          days: calculatedDays,
          reason: formattedReason,
          isSplit: true,
          paidDays: selectedTypeRemaining,
          unpaidDays: calculatedDays - selectedTypeRemaining,
          originalType: leaveType
        });
      }
    } else {
      setPendingPayload({
        type: leaveType,
        startDate,
        endDate: formattedEndDate,
        days: calculatedDays,
        reason: formattedReason
      });
    }
    setConfirmOpen(true);
  };

  const confirmSubmit = async () => {
    if (!pendingPayload) return;
    try {
      if (pendingPayload.isSplit && pendingPayload.paidDays && pendingPayload.unpaidDays && pendingPayload.originalType) {
        const pDays = pendingPayload.paidDays;
        const uDays = pendingPayload.unpaidDays;
        const origType = pendingPayload.originalType;

        const addDays = (dateStr: string, days: number): string => {
          const date = new Date(dateStr);
          date.setDate(date.getDate() + days);
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, '0');
          const d = String(date.getDate()).padStart(2, '0');
          return `${y}-${m}-${d}`;
        };

        // Paid Request
        const paidEndDate = pDays === 0.5 ? pendingPayload.startDate : addDays(pendingPayload.startDate, Math.floor(pDays) - 1);
        await applyLeave({
          type: origType,
          startDate: pendingPayload.startDate,
          endDate: paidEndDate,
          days: pDays,
          reason: `${pendingPayload.reason} [Paid Portion]`.trim()
        });

        // Unpaid Request
        const unpaidStartDate = pDays === 0.5 ? pendingPayload.startDate : addDays(pendingPayload.startDate, Math.floor(pDays));
        await applyLeave({
          type: 'Unpaid',
          startDate: unpaidStartDate,
          endDate: pendingPayload.endDate,
          days: uDays,
          reason: `${pendingPayload.reason} [Unpaid - No-Pay Portion]`.trim()
        });
      } else {
        await applyLeave(pendingPayload);
      }
      setSuccess(true);
      setStartDate('');
      setEndDate('');
      setReason('');
      setPendingPayload(null);
      setConfirmOpen(false);
      showToast('Leave request submitted successfully!', 'success');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit leave request.');
      showToast('Failed to submit leave request.', 'error');
      setPendingPayload(null);
      setConfirmOpen(false);
    }
  };

  // Leave type options depending on employment status
  // Probation: Half Day (if balance > 0) + No-Pay Sick
  // Permanent: Standard leave types only — Half Day was probation-only entitlement
  const leaveOptions: { value: LeaveType; label: string }[] = isProbation
    ? [
        ...(halfDayRemaining > 0
          ? [{ value: 'Half Day' as LeaveType, label: `Half Day Leave (0.5 Day) — ${halfDayRemaining} day available` }]
          : []
        ),
        { value: 'No-Pay Sick', label: 'No-Pay Sick Leave — Unpaid (Probation)' },
      ]
    : [
        { value: 'Annual', label: 'Annual Leave' },
        { value: 'Casual', label: 'Casual Leave' },
        { value: 'Medical', label: 'Medical / Sick Leave' },
        { value: 'Unpaid', label: 'Unpaid Leave' },
        { value: 'Parental', label: 'Parental Leave' },
        { value: 'Bereavement', label: 'Bereavement Leave' },
      ];

  // Leave balance cards
  // Probation: shows only Half Day balance card
  // Permanent: shows Annual, Casual, Medical — no Half Day (was probation-only)
  const balanceCards = isProbation
    ? [
        { type: 'Half Day', label: 'Half Day Leave', tone: 'amber' },
      ]
    : [
        { type: 'Annual', label: 'Annual Leave', tone: 'accent' },
        { type: 'Casual', label: 'Casual Leave', tone: 'emerald' },
        { type: 'Medical', label: 'Medical / Sick Leave', tone: 'sky' },
      ];

  const showDurationToggle =
    leaveType === 'No-Pay Sick' ||
    (!isProbation && (leaveType === 'Annual' || leaveType === 'Casual' || leaveType === 'Medical'));

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Leave Accounts & Requests"
        description="View your allocated leave balances, remaining days, and request time off."
      />

      {/* Status banner */}
      {isProbation ? (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-300 flex items-start gap-3">
          <ShieldCheckIcon className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-200">Probationary Status — Leave Entitlement</p>
            <p className="mt-0.5 text-amber-300/90 leading-relaxed">
              Under Sri Lanka Labour Standards, you earn <strong>1 Half Day (0.5 Days)</strong> leave per month on probation. Unused leave rolls over and accumulates. If you need more time off for sickness, you can apply for <strong>No-Pay Sick Leave</strong> — this is unpaid but always available. Full annual (14d), casual (7d), and medical (14d) leave accounts unlock automatically when your status changes to <strong>Permanent</strong>.
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

      {/* Leave Balances */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-content">Leave Account Balances</h3>
          <span className="text-xs text-content-faint">Status: {currentUser.status}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {balanceCards.map(({ type, label }) => {
            const data = (allocs as Record<string, any>)?.[type] || { allocated: 0, used: 0, remaining: 0 };
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
                <div className="w-full h-1.5 rounded-full bg-surface-raised overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </Card>
            );
          })}

          {/* No-Pay Sick info card for probation */}
          {isProbation && (
            <Card className="p-4 space-y-3 relative overflow-hidden border-rose-500/20 bg-rose-500/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-400">No-Pay Sick Leave</span>
                <Badge tone="warning">No Pay</Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <AlertTriangleIcon className="h-5 w-5 text-rose-400 flex-shrink-0" />
                <p className="text-xs text-content-muted leading-relaxed">
                  Available when sick — salary deducted for taken days.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-rose-400/80">
                <InfoIcon className="h-3 w-3 flex-shrink-0" />
                Unlimitied · No quota
              </div>
            </Card>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Leave application form */}
        <Card className="flex flex-col h-fit">
          <CardHeader
            title="Request Time Off"
            subtitle={
              isProbation
                ? halfDayRemaining > 0
                  ? `Probation: ${halfDayRemaining} Half Day available — or apply No-Pay Sick Leave`
                  : 'Probation: Half Day used for this cycle — No-Pay Sick Leave available'
                : 'Submit a new leave application'
            }
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
                  {leaveType === 'No-Pay Sick'
                    ? 'No quota — always available'
                    : `Available: ${selectedTypeRemaining} days`}
                </span>
              </div>
              <select
                id="leave_type"
                className={fieldClass}
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value as LeaveType)}
              >
                {leaveOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {/* Banner: half day used up this cycle */}
              {isProbation && halfDayRemaining <= 0 && (
                <div className="mt-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5 text-[11px] text-amber-300 flex items-start gap-1.5">
                  <InfoIcon className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Half Day leave used for this cycle.</strong> Your monthly 0.5-day entitlement has been taken. It will be available again next month. For sick days, use <strong>No-Pay Sick Leave</strong> below.
                  </span>
                </div>
              )}
            </div>

            {/* No-Pay Sick warning banner for probation */}
            {leaveType === 'No-Pay Sick' && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-start gap-2">
                <AlertTriangleIcon className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-rose-200 mb-0.5">No-Pay Leave Warning</p>
                  <p className="text-rose-300/80 leading-relaxed">
                    This sick leave will be <strong>unpaid</strong>. Your salary will be proportionally deducted for the number of days taken. HR admin will be notified.
                  </p>
                </div>
              </div>
            )}

            {/* Warning banner for auto-converting/splitting allocated leaves for permanent employees */}
            {!isProbation && isAllocatedExceeded && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-300 flex items-start gap-2">
                <AlertTriangleIcon className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-200 mb-0.5">Leave Balance Exceeded</p>
                  <p className="text-amber-300/80 leading-relaxed">
                    {selectedTypeRemaining <= 0
                      ? `You have 0 days remaining for ${leaveType} Leave. This request will be automatically processed as Unpaid Leave (No-Pay).`
                      : `You only have ${selectedTypeRemaining} day(s) of ${leaveType} Leave remaining. The excess ${calculatedDays - selectedTypeRemaining} day(s) will be automatically processed as Unpaid Leave (No-Pay).`}
                  </p>
                </div>
              </div>
            )}

            {/* Unified Duration Mode Toggle */}
            {showDurationToggle && (
              <div>
                <label className={labelClass}>Duration</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setDurationMode('Full Day'); setEndDate(''); }}
                    className={`h-9 rounded-xl border text-xs font-semibold transition-colors ${
                      durationMode === 'Full Day'
                        ? leaveType === 'No-Pay Sick'
                          ? 'border-rose-500/60 bg-rose-500/15 text-rose-300'
                          : 'border-accent bg-accent/10 text-accent'
                        : 'border-line bg-surface text-content-muted hover:text-content'
                    }`}
                  >
                    Full Day(s)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDurationMode('Half Day'); setEndDate(''); }}
                    className={`h-9 rounded-xl border text-xs font-semibold transition-colors ${
                      durationMode === 'Half Day'
                        ? leaveType === 'No-Pay Sick'
                          ? 'border-rose-500/60 bg-rose-500/15 text-rose-300'
                          : 'border-accent bg-accent/10 text-accent'
                        : 'border-line bg-surface text-content-muted hover:text-content'
                    }`}
                  >
                    Half Day (0.5)
                  </button>
                </div>
              </div>
            )}

            {/* Date Pickers */}
            {isHalfDay ? (
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
                          ? leaveType === 'No-Pay Sick'
                            ? 'border-rose-500/60 bg-rose-500/15 text-rose-300'
                            : 'border-accent bg-accent/10 text-accent'
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
                          ? leaveType === 'No-Pay Sick'
                            ? 'border-rose-500/60 bg-rose-500/15 text-rose-300'
                            : 'border-accent bg-accent/10 text-accent'
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
                placeholder={leaveType === 'No-Pay Sick' ? 'Describe your illness or medical condition...' : 'Brief reason for your leave request...'}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className={`w-full h-10 ${leaveType === 'No-Pay Sick' || leaveType === 'Unpaid' || (!isProbation && isAllocatedExceeded && selectedTypeRemaining <= 0) ? 'bg-rose-600 hover:bg-rose-500' : ''}`}
            >
              {isHalfDay
                ? `Submit Half Day Request (0.5 Day)`
                : leaveType === 'No-Pay Sick' || leaveType === 'Unpaid' || (!isProbation && isAllocatedExceeded && selectedTypeRemaining <= 0)
                  ? `Submit Unpaid Leave (${calculatedDays} Day${calculatedDays !== 1 ? 's' : ''} — Unpaid)`
                  : `Submit Leave Request (${calculatedDays} Day${calculatedDays !== 1 ? 's' : ''})`}
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
                        <div className="flex items-center gap-1.5">
                          {(l.type === 'No-Pay Sick' || l.type === 'Unpaid') && (
                            <span className="inline-flex items-center rounded-full bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-rose-400">
                              NO PAY
                            </span>
                          )}
                          {LEAVE_TYPE_LABELS[l.type] || `${l.type} Leave`}
                        </div>
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
        title={
          pendingPayload?.isSplit
            ? 'Submit Split Leave Request'
            : pendingPayload?.type === 'No-Pay Sick' || pendingPayload?.type === 'Unpaid'
            ? 'Submit Unpaid Leave'
            : 'Submit Leave Request'
        }
        message={pendingPayload
          ? pendingPayload.isSplit
            ? `You only have ${pendingPayload.paidDays} day(s) of ${pendingPayload.originalType} leave remaining. Therefore, this request will be automatically split:
               • ${pendingPayload.paidDays} day(s) will be submitted as paid ${pendingPayload.originalType} leave.
               • ${pendingPayload.unpaidDays} day(s) will be submitted as Unpaid Leave (No-Pay).
               Do you wish to submit this request?`
            : pendingPayload.type === 'No-Pay Sick'
            ? `You are about to submit a No-Pay Sick Leave request for ${pendingPayload.startDate}${pendingPayload.startDate !== pendingPayload.endDate ? ` to ${pendingPayload.endDate}` : ''} (${pendingPayload.days} day${pendingPayload.days !== 1 ? 's' : ''}). ⚠️ This leave is UNPAID — your salary will be deducted proportionally for ${pendingPayload.days === 0.5 ? 'half a day' : `${pendingPayload.days} day(s)`}. HR admin will review your request.`
            : pendingPayload.type === 'Unpaid'
            ? `You are about to submit an Unpaid Leave request for ${pendingPayload.startDate}${pendingPayload.startDate !== pendingPayload.endDate ? ` to ${pendingPayload.endDate}` : ''} (${pendingPayload.days} day${pendingPayload.days !== 1 ? 's' : ''}). ⚠️ This leave is UNPAID — your salary will be deducted proportionally for ${pendingPayload.days === 0.5 ? 'half a day' : `${pendingPayload.days} day(s)`}. HR admin will review your request.`
            : `You are about to submit a ${pendingPayload.type} leave request for ${pendingPayload.startDate} ${pendingPayload.startDate !== pendingPayload.endDate ? `to ${pendingPayload.endDate}` : ''} (${pendingPayload.days} day${pendingPayload.days !== 1 ? 's' : ''}). This request will be sent to your HR admin for review.`
          : ''}
        confirmText={
          pendingPayload?.isSplit
            ? 'Submit Split Request'
            : pendingPayload?.type === 'No-Pay Sick' || pendingPayload?.type === 'Unpaid'
            ? 'Submit (Unpaid)'
            : 'Submit Request'
        }
        variant="primary"
      />
    </div>
  );
}
