import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useHrms } from '../../store/HrmsContext';
import { fullName } from '../../data/employees';

const fieldClass =
  'h-10 w-full rounded-xl border border-line bg-surface-raised px-3 text-sm text-content placeholder:text-content-faint focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30';
const labelClass = 'mb-1.5 block text-xs font-medium text-content-muted';

function suggestDepartmentId(name: string, existingIds: string[]): string {
  const slug = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const base = slug ? `DEP-${slug.slice(0, 8)}` : 'DEP-NEW';
  let id = base;
  let n = 2;
  while (existingIds.some((existing) => existing.toLowerCase() === id.toLowerCase())) {
    id = `${base}-${n++}`;
  }
  return id;
}

export function AddDepartmentModal({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { addDepartment, departments, employees } = useHrms();
  const [deptId, setDeptId] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('HQ');
  const [budget, setBudget] = useState('');
  const [headEmployeeId, setHeadEmployeeId] = useState('');
  const [idTouched, setIdTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const existingIds = useMemo(() => departments.map((d) => d.id), [departments]);

  useEffect(() => {
    if (!open || idTouched || !name.trim()) return;
    setDeptId(suggestDepartmentId(name, existingIds));
  }, [open, name, idTouched, existingIds]);

  const reset = () => {
    setDeptId('');
    setName('');
    setLocation('HQ');
    setBudget('');
    setHeadEmployeeId('');
    setIdTouched(false);
    setError('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Department name is required.');
      return;
    }

    const finalId = (deptId.trim() || suggestDepartmentId(name, existingIds)).toUpperCase();

    setLoading(true);
    setError('');
    try {
      await addDepartment({
        id: finalId,
        name: name.trim(),
        location: location.trim() || 'HQ',
        budget: Number(budget) || 0,
        headEmployeeId: headEmployeeId || null
      });
      reset();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add department.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add department" size="lg">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="deptName">
              Department name *
            </label>
            <input
              id="deptName"
              className={fieldClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Finance"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="deptId">
              Department ID
            </label>
            <input
              id="deptId"
              className={fieldClass}
              value={deptId}
              onChange={(e) => {
                setIdTouched(true);
                setDeptId(e.target.value.toUpperCase());
              }}
              placeholder="Auto-generated from name"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="deptLocation">
              Location
            </label>
            <input
              id="deptLocation"
              className={fieldClass}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="HQ"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="deptBudget">
              Annual budget (USD)
            </label>
            <input
              id="deptBudget"
              type="number"
              min="0"
              className={fieldClass}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="500000"
            />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="deptHead">
            Department head (optional)
          </label>
          <select
            id="deptHead"
            className={fieldClass}
            value={headEmployeeId}
            onChange={(e) => setHeadEmployeeId(e.target.value)}
          >
            <option value="">No head assigned yet</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {fullName(emp)} · {emp.role}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add department'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
