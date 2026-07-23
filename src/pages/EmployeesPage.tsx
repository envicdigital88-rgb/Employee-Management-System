import React, { useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MailIcon,
  UsersIcon,
  Trash2Icon,
  ToggleLeftIcon,
  ToggleRightIcon,
  CalendarIcon } from
'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { EmployeeFilters } from '../components/employees/EmployeeFilters';
import { BulkActionsBar } from '../components/employees/BulkActionsBar';
import { useHrms } from '../store/HrmsContext';
import { fullName } from '../data/employees';
import { employeeStatusTone } from '../components/ui/statusMaps';
import { formatDate } from '../lib/format';
import { showToast } from '../components/ui/Toast';
import { Employee } from '../types';

type SortKey = 'name' | 'department' | 'role' | 'status' | 'joinDate';
const PAGE_SIZE = 10;

export function EmployeesPage() {
  const navigate = useNavigate();
  const { openAddEmployee } = useOutletContext<{
    openAddEmployee: () => void;
  }>();
  const { employees, getDepartment, deleteEmployee, setEmployeeActive, isAdmin } = useHrms();
  const [query, setQuery] = useState('');
  const [dept, setDept] = useState('all');
  const [status, setStatus] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  // Per-row action states
  const [confirmDelete, setConfirmDelete] = useState<Employee | null>(null);
  const [confirmToggleActive, setConfirmToggleActive] = useState<{ emp: Employee; nextActive: boolean } | null>(null);

  const filtered = useMemo(() => {
    let list = employees.filter((e) => {
      const q = query.toLowerCase();
      const matchQ =
      !q ||
      fullName(e).toLowerCase().includes(q) ||
      e.role.toLowerCase().includes(q) ||
      e.id.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q);
      const matchDept = dept === 'all' || e.departmentId === dept;
      const matchStatus = status === 'all' || e.status === status;
      return matchQ && matchDept && matchStatus;
    });
    list = [...list].sort((a, b) => {
      let av = '';
      let bv = '';
      switch (sortKey) {
        case 'name':
          av = fullName(a);
          bv = fullName(b);
          break;
        case 'department':
          av = getDepartment(a.departmentId)?.name ?? '';
          bv = getDepartment(b.departmentId)?.name ?? '';
          break;
        case 'role':
          av = a.role;
          bv = b.role;
          break;
        case 'status':
          av = a.status;
          bv = b.status;
          break;
        case 'joinDate':
          av = a.joinDate;
          bv = b.joinDate;
          break;
      }
      const cmp = av.localeCompare(bv);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [employees, query, dept, status, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const pageIds = paged.map((e) => e.id);
  const allPageSelected =
  pageIds.length > 0 && pageIds.every((id) => selected.includes(id));

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc'); else {
      setSortKey(key);
      setSortDir('asc');
    }
  };
  const toggleAll = () => {
    setSelected((prev) =>
    allPageSelected ?
    prev.filter((id) => !pageIds.includes(id)) :
    [...new Set([...prev, ...pageIds])]
    );
  };
  const toggleOne = (id: string) => {
    setSelected((prev) =>
    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const clearFilters = () => {
    setQuery('');
    setDept('all');
    setStatus('all');
    setPage(1);
  };
  const exportCsv = () => {
    const rows = employees.filter((e) => selected.includes(e.id));
    const header = 'Employee ID,Name,Email,Department,Role,Status,Join Date\n';
    const body = rows.
    map(
      (e) =>
      `${e.id},"${fullName(e)}",${e.email},"${getDepartment(e.departmentId)?.name}","${e.role}",${e.status},${e.joinDate}`
    ).
    join('\n');
    const blob = new Blob([header + body], {
      type: 'text/csv'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'envic-employees.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    if (confirmDelete.isAdmin) {
      showToast('Admin users cannot be deleted.', 'error');
      setConfirmDelete(null);
      return;
    }
    try {
      await deleteEmployee(confirmDelete.id);
      showToast(`${fullName(confirmDelete)} has been deleted.`, 'success');
      setSelected((prev) => prev.filter((id) => id !== confirmDelete.id));
    } catch (err: any) {
      showToast(err.message || 'Failed to delete employee', 'error');
    } finally {
      setConfirmDelete(null);
    }
  };

  const doToggleActive = async () => {
    if (!confirmToggleActive) return;
    try {
      await setEmployeeActive([confirmToggleActive.emp.id], confirmToggleActive.nextActive);
      showToast(
        `${fullName(confirmToggleActive.emp)}'s account is now ${confirmToggleActive.nextActive ? 'Active' : 'Inactive'}.`,
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to update account status', 'error');
    } finally {
      setConfirmToggleActive(null);
    }
  };

  const SortHeader = ({ label, k }: {label: string; k: SortKey;}) =>
  <button
    onClick={() => toggleSort(k)}
    className="inline-flex items-center gap-1 font-medium text-content-muted transition-colors hover:text-content">
    
    {label}
    {sortKey === k && (
    sortDir === 'asc' ?
    <ChevronUpIcon className="h-3.5 w-3.5" /> :
    <ChevronDownIcon className="h-3.5 w-3.5" />)
    }
  </button>;

  return (
    <div>
      <PageHeader
        title="Employees"
        description={`${employees.length} people across ${new Set(employees.map((e) => e.departmentId)).size} departments`}
        actions={
        <Button variant="primary" onClick={openAddEmployee}>
            <PlusIcon className="h-4 w-4" />
            Add employee
          </Button>
        } />
      

      <div className="mb-4">
        <EmployeeFilters
          query={query}
          onQuery={(v) => {
            setQuery(v);
            setPage(1);
          }}
          dept={dept}
          onDept={(v) => {
            setDept(v);
            setPage(1);
          }}
          status={status}
          onStatus={(v) => {
            setStatus(v);
            setPage(1);
          }}
          onClear={clearFilters} />
        
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 cursor-pointer rounded border-line bg-surface-raised text-accent accent-accent focus:ring-accent"
                    aria-label="Select all on page" />
                  
                </th>
                <th className="px-4 py-3">
                  <SortHeader label="Employee" k="name" />
                </th>
                <th className="px-4 py-3">
                  <SortHeader label="Department" k="department" />
                </th>
                <th className="px-4 py-3">
                  <SortHeader label="Role" k="role" />
                </th>
                <th className="px-4 py-3">
                  <SortHeader label="Status" k="status" />
                </th>
                <th className="px-4 py-3 font-medium text-content-muted text-xs">
                  Account
                </th>
                <th className="px-4 py-3">
                  <SortHeader label="Joined" k="joinDate" />
                </th>
                {isAdmin && (
                  <th className="px-4 py-3 text-right font-medium text-content-muted">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {paged.map((e, i) => {
                const dpt = getDepartment(e.departmentId);
                const isSel = selected.includes(e.id);
                const accountActive = e.isActive !== false;

                return (
                  <motion.tr
                    key={e.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => navigate(`/employees/${e.id}`)}
                    className={`group cursor-pointer border-b border-line/60 transition-colors hover:bg-white/[0.02] ${isSel ? 'bg-accent/[0.04]' : ''}`}>
                    
                    <td
                      className="px-4 py-3"
                      onClick={(ev) => ev.stopPropagation()}>
                      
                      <input
                        type="checkbox"
                        checked={isSel}
                        onChange={() => toggleOne(e.id)}
                        className="h-4 w-4 cursor-pointer rounded border-line bg-surface-raised accent-accent focus:ring-accent"
                        aria-label={`Select ${fullName(e)}`} />
                      
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={e.avatarUrl}
                          name={fullName(e)}
                          size="sm" />
                        
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-medium text-content group-hover:text-accent transition-colors">
                              {fullName(e)}
                            </p>
                            {e.isAdmin && (
                              <Badge tone="purple">Admin</Badge>
                            )}
                          </div>
                          <p className="truncate text-xs text-content-faint">
                            {e.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2 text-content-muted">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: dpt?.colorHex }} />
                        
                        {dpt?.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-content-muted">{e.role}</td>
                    <td className="px-4 py-3">
                      <Badge tone={employeeStatusTone[e.status]} dot>
                        {e.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={accountActive ? 'green' : 'red'} dot>
                        {accountActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-content-muted">
                        <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-content-faint" />
                        <span className="text-xs">{formatDate(e.joinDate)}</span>
                      </div>
                    </td>

                    {isAdmin && (
                      <td
                        className="px-4 py-3 text-right"
                        onClick={(ev) => ev.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {/* Email */}
                          <a
                            href={`mailto:${e.email}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-content-muted transition-colors hover:bg-white/5 hover:text-accent"
                            aria-label={`Email ${fullName(e)}`}
                            title={e.email}>
                            <MailIcon className="h-4 w-4" />
                          </a>

                          {/* Toggle Active / Inactive account */}
                          <button
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setConfirmToggleActive({ emp: e, nextActive: !accountActive });
                            }}
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/5 ${accountActive ? 'text-emerald-400 hover:text-red-400' : 'text-content-faint hover:text-emerald-400'}`}
                            title={accountActive ? 'Deactivate account' : 'Activate account'}
                            aria-label={accountActive ? `Deactivate ${fullName(e)} account` : `Activate ${fullName(e)} account`}>
                            {accountActive
                              ? <ToggleRightIcon className="h-4 w-4" />
                              : <ToggleLeftIcon className="h-4 w-4" />
                            }
                          </button>

                          {/* Delete — disabled for admin users */}
                          {e.isAdmin ? (
                            <button
                              disabled
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg cursor-not-allowed opacity-30 text-content-faint"
                              title="Admin users cannot be deleted"
                              aria-label="Admin users cannot be deleted">
                              <Trash2Icon className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={(ev) => {
                                ev.stopPropagation();
                                setConfirmDelete(e);
                              }}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-content-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
                              title="Delete employee"
                              aria-label={`Delete ${fullName(e)}`}>
                              <Trash2Icon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </motion.tr>);

              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 &&
        <EmptyState
          icon={UsersIcon}
          title="No employees found"
          description="Try adjusting your search or filters."
          action={
          <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
          } />

        }

        {filtered.length > 0 &&
        <div className="flex items-center justify-between border-t border-line px-4 py-3">
            <p className="text-xs text-content-muted">
              Showing {(safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, filtered.length)} of{' '}
              {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-content-muted transition-colors hover:bg-white/5 hover:text-content disabled:opacity-40"
              aria-label="Previous page">
              
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <span className="px-2 text-sm text-content">
                {safePage} / {totalPages}
              </span>
              <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-content-muted transition-colors hover:bg-white/5 hover:text-content disabled:opacity-40"
              aria-label="Next page">
              
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        }
      </Card>

      <BulkActionsBar
        selectedIds={selected}
        onClear={() => setSelected([])}
        onExport={exportCsv} />

      {/* Delete Confirmation */}
      <ConfirmationModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={doDelete}
        title="Delete Employee"
        message={confirmDelete
          ? `Are you sure you want to permanently delete ${fullName(confirmDelete)} (${confirmDelete.id})? This will also remove all their attendance, payroll, leave, and performance records. This action cannot be undone.`
          : ''}
        confirmText="Delete Employee"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Account Toggle Confirmation */}
      <ConfirmationModal
        open={!!confirmToggleActive}
        onClose={() => setConfirmToggleActive(null)}
        onConfirm={doToggleActive}
        title={confirmToggleActive?.nextActive ? 'Activate Account' : 'Deactivate Account'}
        message={confirmToggleActive
          ? confirmToggleActive.nextActive
            ? `Are you sure you want to activate ${fullName(confirmToggleActive.emp)}'s account? They will be able to log in to the system.`
            : `Are you sure you want to deactivate ${fullName(confirmToggleActive.emp)}'s account? They will no longer be able to log in to the system.`
          : ''}
        confirmText={confirmToggleActive?.nextActive ? 'Activate Account' : 'Deactivate Account'}
        cancelText="Cancel"
        variant={confirmToggleActive?.nextActive ? 'primary' : 'danger'}
      />
    </div>);

}