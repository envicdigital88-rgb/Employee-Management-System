import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronsLeftIcon, LogOutIcon } from 'lucide-react';
import { adminNavGroups, employeeNavGroups } from './navConfig';
import { Logo } from '../components/ui/Logo';
import { useHrms } from '../store/HrmsContext';

export function Sidebar({
  collapsed,
  onToggle,
  onNavigate
}: {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  const { isAdmin, logout } = useHrms();
  const groups = isAdmin ? adminNavGroups : employeeNavGroups;

  return (
    <div className="flex h-full flex-col bg-surface">
      <div
        className={`flex h-16 items-center border-b border-line px-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        
        <Logo collapsed={collapsed} />
        <button
          onClick={onToggle}
          className="hidden rounded-lg p-1.5 text-content-muted transition-colors hover:bg-white/5 hover:text-content lg:block"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          <ChevronsLeftIcon
            className="h-4 w-4 transition-transform duration-300"
            style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </button>
      </div>

      <nav
        className="flex-1 space-y-6 overflow-y-auto px-3 py-5"
        aria-label="Main navigation">
        
        {groups.map((group) =>
        <div key={group.label}>
            {!collapsed &&
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-content-faint">
                {group.label}
              </p>
          }
            <ul className="space-y-1">
              {group.items.map((item) =>
            <li key={item.to}>
                  <NavLink
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${collapsed ? 'justify-center' : ''} ${isActive ? 'bg-accent/10 text-accent' : 'text-content-muted hover:bg-white/5 hover:text-content'}`
                }>
                
                    {({ isActive }) =>
                <>
                        {isActive &&
                  <motion.span
                    layoutId="nav-active"
                    className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-accent" />

                  }
                        <item.icon className="h-[18px] w-[18px] shrink-0" />
                        {!collapsed && <span>{item.label}</span>}
                      </>
                }
                  </NavLink>
                </li>
            )}
            </ul>
          </div>
        )}
      </nav>

      <div className="border-t border-line p-3 space-y-2">
        <button
          onClick={logout}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-500/5 transition-colors ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOutIcon className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        {!collapsed &&
          <div className="rounded-xl border border-line bg-surface-raised p-3">
            <p className="text-xs font-semibold text-content">ENVIC Global</p>
            <p className="mt-0.5 text-[11px] text-content-muted">
              HR workspace portal
            </p>
          </div>
        }
      </div>
    </div>
  );
}