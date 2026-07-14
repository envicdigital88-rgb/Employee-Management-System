import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MenuIcon,
  SearchIcon,
  BellIcon,
  PlusIcon,
  LogOutIcon,
  UserIcon,
  SettingsIcon } from
'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { useHrms } from '../store/HrmsContext';
import { fullName } from '../data/employees';
export function Topbar({
  onOpenMobileNav,
  onAddEmployee



}: {onOpenMobileNav: () => void;onAddEmployee: () => void;}) {
  const navigate = useNavigate();
  const { employees } = useHrms();
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const results =
  query.trim().length > 0 ?
  employees.
  filter(
    (e) =>
    fullName(e).toLowerCase().includes(query.toLowerCase()) ||
    e.role.toLowerCase().includes(query.toLowerCase()) ||
    e.id.toLowerCase().includes(query.toLowerCase())
  ).
  slice(0, 6) :
  [];
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-canvas/80 px-4 backdrop-blur-md sm:px-6">
      <button
        onClick={onOpenMobileNav}
        className="rounded-lg p-2 text-content-muted transition-colors hover:bg-white/5 hover:text-content lg:hidden"
        aria-label="Open navigation">
        
        <MenuIcon className="h-5 w-5" />
      </button>

      <div className="relative flex-1 max-w-md">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-faint" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 150)}
          placeholder="Search employees, roles, IDs…"
          className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-4 text-sm text-content placeholder:text-content-faint focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
          aria-label="Global search" />
        
        <AnimatePresence>
          {showResults && results.length > 0 &&
          <motion.ul
            initial={{
              opacity: 0,
              y: 6
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              y: 6
            }}
            className="absolute left-0 right-0 top-12 z-40 overflow-hidden rounded-xl border border-line bg-surface-raised shadow-panel">
            
              {results.map((e) =>
            <li key={e.id}>
                  <button
                onMouseDown={() => {
                  navigate(`/employees/${e.id}`);
                  setQuery('');
                }}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/5">
                
                    <Avatar src={e.avatarUrl} name={fullName(e)} size="xs" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-content">
                        {fullName(e)}
                      </p>
                      <p className="truncate text-xs text-content-muted">
                        {e.role}
                      </p>
                    </div>
                  </button>
                </li>
            )}
            </motion.ul>
          }
        </AnimatePresence>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={onAddEmployee}
          className="hidden sm:inline-flex">
          
          <PlusIcon className="h-4 w-4" />
          Add employee
        </Button>

        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen((v) => !v);
              setMenuOpen(false);
            }}
            className="relative rounded-lg p-2 text-content-muted transition-colors hover:bg-white/5 hover:text-content"
            aria-label="Notifications">
            
            <BellIcon className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent ring-2 ring-canvas" />
          </button>
          <AnimatePresence>
            {notifOpen &&
            <motion.div
              initial={{
                opacity: 0,
                y: 6
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                y: 6
              }}
              className="absolute right-0 top-12 z-40 w-72 rounded-xl border border-line bg-surface-raised p-2 shadow-panel">
              
                <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-content-faint">
                  Notifications
                </p>
                {[
              '3 leave requests await approval',
              'June payroll run is ready to finalize',
              '2 reviews due this week'].
              map((n, i) =>
              <div
                key={i}
                className="rounded-lg px-2 py-2 text-sm text-content-muted hover:bg-white/5">
                
                    {n}
                  </div>
              )}
              </motion.div>
            }
          </AnimatePresence>
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setMenuOpen((v) => !v);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 rounded-xl p-1 pr-2 transition-colors hover:bg-white/5"
            aria-label="Account menu">
            
            <Avatar
              src="https://api.dicebear.com/7.x/notionists/svg?seed=Hannah%20Lee&backgroundColor=14171c&radius=50"
              name="Hannah Lee"
              size="sm" />
            
            <span className="hidden text-sm font-medium text-content md:block">
              Hannah Lee
            </span>
          </button>
          <AnimatePresence>
            {menuOpen &&
            <motion.div
              initial={{
                opacity: 0,
                y: 6
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                y: 6
              }}
              className="absolute right-0 top-12 z-40 w-52 rounded-xl border border-line bg-surface-raised p-1.5 shadow-panel">
              
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-content">
                    Hannah Lee
                  </p>
                  <p className="text-xs text-content-muted">
                    Head of People · Admin
                  </p>
                </div>
                <div className="my-1 h-px bg-line" />
                {[
              {
                label: 'My profile',
                icon: UserIcon
              },
              {
                label: 'Settings',
                icon: SettingsIcon
              }].
              map((m) =>
              <button
                key={m.label}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-content-muted transition-colors hover:bg-white/5 hover:text-content">
                
                    <m.icon className="h-4 w-4" />
                    {m.label}
                  </button>
              )}
                <div className="my-1 h-px bg-line" />
                <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10">
                  <LogOutIcon className="h-4 w-4" />
                  Sign out
                </button>
              </motion.div>
            }
          </AnimatePresence>
        </div>
      </div>
    </header>);

}