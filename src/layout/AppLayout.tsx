import { useState } from 'react';
import { Outlet, useLocation, Link, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { AddEmployeeModal } from '../components/employees/AddEmployeeModal';
import { useHrms } from '../store/HrmsContext';

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  
  const location = useLocation();
  const { isLive, currentUser, isLoading } = useHrms();

  // While we're figuring out auth, show the spinner
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-xs text-content-faint">Initializing HR Workspace...</p>
        </div>
      </div>
    );
  }

  // Auth resolved and no user — send to login, preserve the page they wanted
  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="flex min-h-screen w-full bg-canvas">
      {/* Desktop sidebar */}
      <aside
        className={`hidden shrink-0 border-r border-line transition-[width] duration-300 lg:block ${collapsed ? 'w-[76px]' : 'w-64'}`}>
        
        <div className="sticky top-0 h-screen">
          <Sidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed((v) => !v)} />
          
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileNavOpen &&
        <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
            className="absolute inset-0 bg-black/70"
            onClick={() => setMobileNavOpen(false)} />
          
            <motion.aside
            initial={{
              x: -280
            }}
            animate={{
              x: 0
            }}
            exit={{
              x: -280
            }}
            transition={{
              type: 'spring',
              damping: 28,
              stiffness: 260
            }}
            className="absolute left-0 top-0 h-full w-64 border-r border-line">
            
              <Sidebar
              collapsed={false}
              onToggle={() => setMobileNavOpen(false)}
              onNavigate={() => setMobileNavOpen(false)} />
            
            </motion.aside>
          </div>
        }
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onAddEmployee={() => setAddOpen(true)} />
        
        {!isLive && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-xs text-amber-400">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span><strong>Running in Demo Mode</strong>: Connecting your Supabase database makes this dashboard real-time and persistent.</span>
            </div>
            <Link to="/settings" className="underline hover:text-amber-300 font-semibold">Connect Database →</Link>
          </div>
        )}
        
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{
                  opacity: 0,
                  y: 8
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                exit={{
                  opacity: 0
                }}
                transition={{
                  duration: 0.25
                }}>
                
                <Outlet
                  context={{
                    openAddEmployee: () => setAddOpen(true)
                  }} />
                
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <AddEmployeeModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}