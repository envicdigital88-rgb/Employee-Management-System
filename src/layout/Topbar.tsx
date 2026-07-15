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
  SettingsIcon,
  ClockIcon,
  PlaneIcon,
  InfoIcon,
  CheckCheckIcon,
  TrashIcon
} from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { useHrms } from '../store/HrmsContext';
import { fullName } from '../data/employees';

const NOTIF_TYPE_ICONS: Record<string, React.ReactNode> = {
  attendance: <ClockIcon className="h-3.5 w-3.5 text-blue-400" />,
  leave: <PlaneIcon className="h-3.5 w-3.5 text-amber-400" />,
  info: <InfoIcon className="h-3.5 w-3.5 text-accent" />,
};

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function Topbar({
  onOpenMobileNav,
  onAddEmployee
}: {
  onOpenMobileNav: () => void;
  onAddEmployee: () => void;
}) {
  const navigate = useNavigate();
  const { employees, currentUser, isAdmin, logout, notifications, markNotificationsAsRead, clearNotifications } = useHrms();
  
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const results =
    query.trim().length > 0 ?
    employees.filter(
      (e) =>
      fullName(e).toLowerCase().includes(query.toLowerCase()) ||
      e.role.toLowerCase().includes(query.toLowerCase()) ||
      e.id.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 6) : [];

  const currentUserFullName = currentUser ? fullName(currentUser) : 'Guest User';
  const currentUserRole = currentUser ? currentUser.role : 'Guest';
  const currentUserAvatar = currentUser?.avatarUrl || '';

  const handleOpenNotif = () => {
    setNotifOpen((v) => !v);
    setMenuOpen(false);
  };

  return (
    <>
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
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
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
        {isAdmin && (
          <Button
            variant="primary"
            size="sm"
            onClick={onAddEmployee}
            className="hidden sm:inline-flex">
            
            <PlusIcon className="h-4 w-4" />
            Add employee
          </Button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={handleOpenNotif}
            className="relative rounded-lg p-2 text-content-muted transition-colors hover:bg-white/5 hover:text-content"
            aria-label="Notifications">
            
            <BellIcon className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-canvas ring-2 ring-canvas">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute right-0 top-12 z-40 w-80 rounded-xl border border-line bg-surface-raised shadow-panel overflow-hidden">
                
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-line">
                  <p className="text-xs font-semibold uppercase tracking-wide text-content-faint">
                    Notifications {unreadCount > 0 && <span className="ml-1 text-accent">({unreadCount} new)</span>}
                  </p>
                  <div className="flex items-center gap-1.5">
                    {unreadCount > 0 && (
                      <button
                        onClick={markNotificationsAsRead}
                        className="text-[10px] text-accent hover:underline flex items-center gap-1"
                        title="Mark all as read">
                        <CheckCheckIcon className="h-3 w-3" />
                        All read
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        className="ml-1 text-[10px] text-content-faint hover:text-red-400 flex items-center gap-1"
                        title="Clear all">
                        <TrashIcon className="h-3 w-3" />
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* List */}
                <div className="max-h-72 overflow-y-auto divide-y divide-line/50">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-xs text-content-faint text-center">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.slice(0, 20).map((n) => (
                      <div
                        key={n.id}
                        className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/5 ${!n.read ? 'bg-accent/5' : ''}`}>
                        <div className="mt-0.5 shrink-0">
                          {NOTIF_TYPE_ICONS[n.type] ?? <InfoIcon className="h-3.5 w-3.5 text-accent" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs leading-snug ${!n.read ? 'text-content font-medium' : 'text-content-muted'}`}>
                            {n.message}
                          </p>
                          <p className="mt-0.5 text-[10px] text-content-faint">
                            {relativeTime(n.createdAt)}
                          </p>
                        </div>
                        {!n.read && (
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => {
              setMenuOpen((v) => !v);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 rounded-xl p-1 pr-2 transition-colors hover:bg-white/5"
            aria-label="Account menu">
            
            <Avatar
              src={currentUserAvatar}
              name={currentUserFullName}
              size="sm" />
            
            <span className="hidden text-sm font-medium text-content md:block">
              {currentUserFullName}
            </span>
          </button>
          <AnimatePresence>
            {menuOpen &&
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="absolute right-0 top-12 z-40 w-52 rounded-xl border border-line bg-surface-raised p-1.5 shadow-panel">
              
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-content truncate">
                    {currentUserFullName}
                  </p>
                  <p className="text-xs text-content-muted truncate">
                    {currentUserRole} · {isAdmin ? 'Admin' : 'Employee'}
                  </p>
                </div>
                <div className="my-1 h-px bg-line" />
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/profile');
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-content-muted transition-colors hover:bg-white/5 hover:text-content"
                >
                  <UserIcon className="h-4 w-4" />
                  My profile
                </button>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/settings');
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-content-muted transition-colors hover:bg-white/5 hover:text-content"
                  >
                    <SettingsIcon className="h-4 w-4" />
                    Settings
                  </button>
                )}
                <div className="my-1 h-px bg-line" />
                <button 
                  onClick={() => {
                    setMenuOpen(false);
                    setConfirmSignOut(true);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                >
                  <LogOutIcon className="h-4 w-4" />
                  Sign out
                </button>
              </motion.div>
            }
          </AnimatePresence>
        </div>
      </div>
    </header>

    <ConfirmationModal
      open={confirmSignOut}
      onClose={() => setConfirmSignOut(false)}
      onConfirm={() => {
        logout();
        navigate('/login');
      }}
      title="Sign Out"
      message="Are you sure you want to sign out? You will need to log in again to access the system."
      confirmText="Sign Out"
      variant="danger"
    />
  </>);
}