import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DownloadIcon, UserCogIcon, Building2Icon, XIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { useHrms } from '../../store/HrmsContext';
import { departments } from '../../data/departments';
import { EmployeeStatus } from '../../types';
import { showToast } from '../ui/Toast';

export function BulkActionsBar({
  selectedIds,
  onClear,
  onExport
}: {selectedIds: string[]; onClear: () => void; onExport: () => void;}) {
  const { updateEmployeeStatus, assignDepartment } = useHrms();
  const [statusVal, setStatusVal] = useState<EmployeeStatus | ''>('');
  const [deptVal, setDeptVal] = useState('');

  // Confirmation states
  const [confirmStatus, setConfirmStatus] = useState<{ status: EmployeeStatus } | null>(null);
  const [confirmDept, setConfirmDept] = useState<{ deptId: string; deptName: string } | null>(null);

  const count = selectedIds.length;

  const handleStatusChange = (v: EmployeeStatus) => {
    setStatusVal(v);
    setConfirmStatus({ status: v });
  };

  const handleDeptChange = (deptId: string, deptName: string) => {
    setDeptVal(deptId);
    setConfirmDept({ deptId, deptName });
  };

  return (
    <>
      <AnimatePresence>
        {count > 0 &&
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="fixed bottom-6 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 flex-wrap items-center gap-3 rounded-2xl border border-accent/30 bg-surface-raised px-4 py-3 shadow-glow">
          
          <span className="text-sm font-semibold text-content">
            {count} selected
          </span>
          <div className="h-5 w-px bg-line" />

          <Button variant="ghost" size="sm" onClick={onExport}>
            <DownloadIcon className="h-4 w-4" />
            Export CSV
          </Button>

          <label className="inline-flex items-center gap-1.5 text-xs text-content-muted">
            <UserCogIcon className="h-4 w-4" />
            <select
            value={statusVal}
            onChange={(e) => {
              const v = e.target.value as EmployeeStatus;
              if (v) handleStatusChange(v);
            }}
            className="rounded-lg border border-line bg-surface px-2 py-1.5 text-content focus:outline-none focus:ring-2 focus:ring-accent/30"
            aria-label="Change status for selected">
            
              <option value="">Set status…</option>
              {(['Active', 'On Leave', 'Probation', 'Terminated'] as EmployeeStatus[]).map((s) =>
              <option key={s} value={s}>{s}</option>
              )}
            </select>
          </label>

          <label className="inline-flex items-center gap-1.5 text-xs text-content-muted">
            <Building2Icon className="h-4 w-4" />
            <select
            value={deptVal}
            onChange={(e) => {
              const id = e.target.value;
              if (id) {
                const dept = departments.find(d => d.id === id);
                if (dept) handleDeptChange(id, dept.name);
              }
            }}
            className="rounded-lg border border-line bg-surface px-2 py-1.5 text-content focus:outline-none focus:ring-2 focus:ring-accent/30"
            aria-label="Assign department for selected">
            
              <option value="">Assign dept…</option>
              {departments.map((d) =>
              <option key={d.id} value={d.id}>{d.name}</option>
              )}
            </select>
          </label>

          <button
          onClick={onClear}
          className="ml-auto rounded-lg p-1.5 text-content-muted transition-colors hover:bg-white/5 hover:text-content"
          aria-label="Clear selection">
          
            <XIcon className="h-4 w-4" />
          </button>
        </motion.div>
        }
      </AnimatePresence>

      {/* Status change confirmation */}
      <ConfirmationModal
        open={!!confirmStatus}
        onClose={() => { setConfirmStatus(null); setStatusVal(''); }}
        onConfirm={() => {
          if (!confirmStatus) return;
          updateEmployeeStatus(selectedIds, confirmStatus.status);
          showToast(`Status updated to "${confirmStatus.status}" for ${count} employee(s).`, 'success');
          setStatusVal('');
          onClear();
        }}
        title="Change Employee Status"
        message={`You are about to change the status of ${count} selected employee${count !== 1 ? 's' : ''} to "${confirmStatus?.status}". This will take effect immediately.`}
        confirmText={`Set to ${confirmStatus?.status}`}
        variant={confirmStatus?.status === 'Terminated' ? 'danger' : 'primary'}
      />

      {/* Department assignment confirmation */}
      <ConfirmationModal
        open={!!confirmDept}
        onClose={() => { setConfirmDept(null); setDeptVal(''); }}
        onConfirm={() => {
          if (!confirmDept) return;
          assignDepartment(selectedIds, confirmDept.deptId);
          showToast(`${count} employee${count !== 1 ? 's' : ''} assigned to "${confirmDept.deptName}".`, 'success');
          setDeptVal('');
          onClear();
        }}
        title="Assign Department"
        message={`You are about to move ${count} selected employee${count !== 1 ? 's' : ''} to the "${confirmDept?.deptName}" department. This will update their records immediately.`}
        confirmText="Assign Department"
        variant="primary"
      />
    </>
  );
}