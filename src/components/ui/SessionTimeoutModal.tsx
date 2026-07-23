import { AnimatePresence, motion } from 'framer-motion';
import { ShieldAlertIcon, LogOutIcon, RefreshCwIcon } from 'lucide-react';
import { Button } from './Button';

interface SessionTimeoutModalProps {
  open: boolean;
  secondsRemaining: number;
  onExtend: () => void;
  onLogout: () => void;
}

export function SessionTimeoutModal({
  open,
  secondsRemaining,
  onExtend,
  onLogout,
}: SessionTimeoutModalProps) {
  // Animate the countdown ring
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const maxSeconds = 60;
  const progress = Math.max(0, secondsRemaining / maxSeconds);
  const strokeDashoffset = circumference * (1 - progress);

  // Color transitions: green → amber → red
  const ringColor =
    secondsRemaining > 30 ? '#22d3ee' : secondsRemaining > 15 ? '#fbbf24' : '#f87171';

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="session-timeout-title"
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-sm rounded-2xl border border-line bg-surface shadow-panel overflow-hidden"
          >
            {/* Top accent bar */}
            <div
              className="h-1 w-full transition-all duration-1000"
              style={{
                background: `linear-gradient(to right, ${ringColor}, transparent)`,
              }}
            />

            <div className="p-6">
              {/* Icon + countdown ring */}
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="relative flex items-center justify-center">
                  {/* SVG ring */}
                  <svg width="80" height="80" className="-rotate-90">
                    {/* Background track */}
                    <circle
                      cx="40"
                      cy="40"
                      r={radius}
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="5"
                    />
                    {/* Progress arc */}
                    <circle
                      cx="40"
                      cy="40"
                      r={radius}
                      fill="none"
                      stroke={ringColor}
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      style={{ transition: 'stroke-dashoffset 1s linear, stroke 1s ease' }}
                    />
                  </svg>

                  {/* Center icon / number */}
                  <div className="absolute flex flex-col items-center justify-center">
                    <span
                      className="text-xl font-bold tabular-nums"
                      style={{ color: ringColor, transition: 'color 1s ease' }}
                    >
                      {secondsRemaining}
                    </span>
                    <span className="text-[9px] text-content-faint leading-none">sec</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-amber-400">
                  <ShieldAlertIcon className="h-5 w-5 flex-shrink-0" />
                  <h2 id="session-timeout-title" className="text-base font-semibold text-content">
                    Session Expiring
                  </h2>
                </div>
              </div>

              {/* Message */}
              <p className="text-center text-sm text-content-muted mb-6">
                Your session will expire due to inactivity in{' '}
                <span className="font-semibold text-content">{secondsRemaining} seconds</span>.
                Click <em>"Stay Signed In"</em> to continue working, or you will be signed out
                automatically.
              </p>

              {/* Actions */}
              <div className="flex flex-col gap-2.5">
                <Button
                  id="session-extend-btn"
                  variant="primary"
                  className="w-full h-11 gap-2"
                  onClick={onExtend}
                >
                  <RefreshCwIcon className="h-4 w-4" />
                  Stay Signed In
                </Button>
                <Button
                  id="session-logout-btn"
                  variant="ghost"
                  className="w-full h-11 gap-2 text-rose-400 hover:text-rose-300"
                  onClick={onLogout}
                >
                  <LogOutIcon className="h-4 w-4" />
                  Sign Out Now
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
