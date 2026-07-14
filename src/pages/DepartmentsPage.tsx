import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  WalletIcon,
  MapPinIcon,
  ChevronRightIcon } from
'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { useHrms } from '../store/HrmsContext';
import { fullName } from '../data/employees';
import { compactCurrency } from '../lib/format';
export function DepartmentsPage() {
  const navigate = useNavigate();
  const { employees, departments, getEmployee } = useHrms();
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <div>
      <PageHeader
        title="Departments"
        description={`${departments.length} departments · ${employees.length} total members`} />
      

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {departments.map((d, i) => {
          const members = employees.filter((e) => e.departmentId === d.id);
          const head = getEmployee(d.headEmployeeId);
          const isOpen = expanded === d.id;
          return (
            <motion.div
              key={d.id}
              initial={{
                opacity: 0,
                y: 12
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                delay: i * 0.05
              }}>
              
              <Card className="overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor: d.colorHex
                        }} />
                      
                      <h3 className="text-base font-semibold text-content">
                        {d.name}
                      </h3>
                    </div>
                    <Badge tone="neutral">{d.id}</Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div>
                      <p className="flex items-center gap-1 text-xs text-content-faint">
                        <UsersIcon className="h-3.5 w-3.5" /> Members
                      </p>
                      <p className="mt-0.5 text-lg font-bold text-content">
                        {members.length}
                      </p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1 text-xs text-content-faint">
                        <WalletIcon className="h-3.5 w-3.5" /> Budget
                      </p>
                      <p className="mt-0.5 text-lg font-bold text-content">
                        {compactCurrency(d.budget)}
                      </p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1 text-xs text-content-faint">
                        <MapPinIcon className="h-3.5 w-3.5" /> Location
                      </p>
                      <p className="mt-0.5 truncate text-sm font-medium text-content">
                        {d.location}
                      </p>
                    </div>
                  </div>

                  {head &&
                  <button
                    onClick={() => navigate(`/employees/${head.id}`)}
                    className="mt-4 flex w-full items-center gap-3 rounded-xl border border-line bg-surface-raised p-3 text-left transition-colors hover:border-accent/30">
                    
                      <Avatar
                      src={head.avatarUrl}
                      name={fullName(head)}
                      size="sm" />
                    
                      <div className="min-w-0">
                        <p className="text-xs text-content-faint">
                          Department head
                        </p>
                        <p className="truncate text-sm font-medium text-content">
                          {fullName(head)}
                        </p>
                      </div>
                    </button>
                  }

                  <button
                    onClick={() => setExpanded(isOpen ? null : d.id)}
                    className="mt-3 flex w-full items-center justify-between rounded-lg px-1 py-1.5 text-sm font-medium text-accent">
                    
                    {isOpen ? 'Hide members' : `View ${members.length} members`}
                    <ChevronRightIcon
                      className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                    
                  </button>
                </div>

                {isOpen &&
                <motion.ul
                  initial={{
                    opacity: 0,
                    height: 0
                  }}
                  animate={{
                    opacity: 1,
                    height: 'auto'
                  }}
                  className="divide-y divide-line border-t border-line">
                  
                    {members.map((m) =>
                  <li key={m.id}>
                        <button
                      onClick={() => navigate(`/employees/${m.id}`)}
                      className="flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors hover:bg-white/[0.02]">
                      
                          <Avatar
                        src={m.avatarUrl}
                        name={fullName(m)}
                        size="xs" />
                      
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm text-content">
                              {fullName(m)}
                            </p>
                            <p className="truncate text-xs text-content-faint">
                              {m.role}
                            </p>
                          </div>
                        </button>
                      </li>
                  )}
                  </motion.ul>
                }
              </Card>
            </motion.div>);

        })}
      </div>
    </div>);

}