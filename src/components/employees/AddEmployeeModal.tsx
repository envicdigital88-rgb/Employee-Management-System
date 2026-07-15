import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useHrms } from '../../store/HrmsContext';
import { departments } from '../../data/departments';
import { EmployeeStatus, EmploymentType } from '../../types';
const fieldClass =
'h-10 w-full rounded-xl border border-line bg-surface-raised px-3 text-sm text-content placeholder:text-content-faint focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30';
const labelClass = 'mb-1.5 block text-xs font-medium text-content-muted';
export function AddEmployeeModal({
  open,
  onClose



}: {open: boolean;onClose: () => void;}) {
  const { addEmployee } = useHrms();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [departmentId, setDepartmentId] = useState(departments[0].id);
  const [employmentType, setEmploymentType] =
    useState<EmploymentType>('Full-time');
  const [status, setStatus] = useState<EmployeeStatus>('Probation');
  const [salary, setSalary] = useState('');
  const [shift, setShift] = useState('Morning Shift (9:00 AM - 5:00 PM)');
  const [tempPassword, setTempPassword] = useState('Password@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const reset = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setRole('');
    setSalary('');
    setShift('Morning Shift (9:00 AM - 5:00 PM)');
    setTempPassword('Password@123');
    setError('');
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !role.trim() ||
      !tempPassword.trim()
    ) {
      setError('Please complete all required fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await addEmployee({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: '+1 415 555 0000',
        departmentId,
        role: role.trim(),
        status,
        employmentType,
        joinDate: new Date().toISOString().slice(0, 10),
        location: 'HQ',
        managerId: null,
        salary: Number(salary) || 90000,
        gender: 'Other',
        dateOfBirth: '1995-01-01',
        address: '—',
        shift
      }, tempPassword.trim());
      reset();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add employee. Please check logs.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal open={open} onClose={onClose} title="Add employee" size="lg">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="fn">
              First name *
            </label>
            <input
              id="fn"
              className={fieldClass}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Jane" />
            
          </div>
          <div>
            <label className={labelClass} htmlFor="ln">
              Last name *
            </label>
            <input
              id="ln"
              className={fieldClass}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe" />
            
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="em">
              Email *
            </label>
            <input
              id="em"
              type="email"
              className={fieldClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@envicdigital.com" />
            
          </div>
          <div>
            <label className={labelClass} htmlFor="ro">
              Job title *
            </label>
            <input
              id="ro"
              className={fieldClass}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Product Designer" />
            
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="de">
              Department
            </label>
            <select
              id="de"
              className={fieldClass}
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}>
              
              {departments.map((d) =>
              <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              )}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="ty">
              Employment type
            </label>
            <select
              id="ty"
              className={fieldClass}
              value={employmentType}
              onChange={(e) =>
              setEmploymentType(e.target.value as EmploymentType)
              }>
              
              {['Full-time', 'Part-time', 'Contract', 'Intern'].map((t) =>
              <option key={t} value={t}>
                  {t}
                </option>
              )}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="st">
              Status
            </label>
            <select
              id="st"
              className={fieldClass}
              value={status}
              onChange={(e) => setStatus(e.target.value as EmployeeStatus)}>
              
              {['Active', 'Probation', 'On Leave'].map((s) =>
              <option key={s} value={s}>
                  {s}
                </option>
              )}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="sa">
              Annual salary (USD)
            </label>
            <input
              id="sa"
              type="number"
              className={fieldClass}
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="120000" />
            
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="tp">
              Temporary Password for Employee Portal *
            </label>
            <input
              id="tp"
              type="text"
              className={fieldClass}
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              placeholder="Password@123"
              required
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="sh">
              Work Shift *
            </label>
            <select
              id="sh"
              className={fieldClass}
              value={shift}
              onChange={(e) => setShift(e.target.value)}
            >
              {[
                'Morning Shift (9:00 AM - 5:00 PM)',
                'Evening Shift (5:00 PM - 1:00 AM)',
                'Night Shift (1:00 AM - 9:00 AM)',
                'Flexible Shift'
              ].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {error &&
        <p
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400"
          role="alert">
          
            {error}
          </p>
        }

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add employee'}
          </Button>
        </div>
      </form>
    </Modal>);

}