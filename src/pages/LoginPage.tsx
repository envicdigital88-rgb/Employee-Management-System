import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { LockIcon, MailIcon, ShieldCheckIcon, ArrowRightIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { useHrms } from '../store/HrmsContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';

const inputWrapperClass = 'relative flex items-center';
const iconClass = 'absolute left-3.5 h-4 w-4 text-content-faint';
const inputClass =
  'h-11 w-full rounded-xl border border-line bg-surface-raised pl-10 pr-12 text-sm text-content placeholder:text-content-faint focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30';
const labelClass = 'mb-1.5 block text-xs font-medium text-content-muted';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, resetPassword, isLive, currentUser, isLoading } = useHrms();

  // All hooks must be declared before any conditional returns
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Where to go after login (the page that sent us here, or dashboard)
  const from: string = (location.state as any)?.from ?? '/';

  // If already authenticated, skip login page entirely
  if (!isLoading && currentUser) {
    return <Navigate to={from === '/login' ? '/' : from} replace />;
  }

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (isForgot) {
        await resetPassword(email);
        setMessage('Password reset email sent! Check your inbox.');
        setIsForgot(false);
      } else {
        await login(email, password);
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (selectedEmail: string) => {
    setError(null);
    setLoading(true);
    try {
      await login(selectedEmail, 'password');
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center">
          <Logo />
          <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-content">
            {isForgot ? 'Reset your password' : 'Sign in to workspace'}
          </h2>
          <p className="mt-1.5 text-center text-xs text-content-muted">
            ENVIC HRMS — Modern people management
          </p>
        </div>

        <Card className="p-6 relative overflow-hidden border border-line">
          {error && (
            <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-400">
              {message}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label htmlFor="email-address" className={labelClass}>
                Work Email Address
              </label>
              <div className={inputWrapperClass}>
                <MailIcon className={iconClass} />
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {!isForgot && (
              <div>
                <label htmlFor="password" className={labelClass}>
                  Password
                </label>
                <div className={inputWrapperClass}>
                  <LockIcon className={iconClass} />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    className={inputClass}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute right-3.5 h-6 w-6 text-content-faint"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOffIcon className="h-6 w-6" /> : <EyeIcon className="h-6 w-6" />}
                  </button>
                </div>
              </div>
            )}

            {!isForgot && (
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setIsForgot(true)}
                  className="text-xs font-medium text-accent hover:underline"
                >
                  Forgot your password?
                </button>
              </div>
            )}

            <Button type="submit" variant="primary" className="w-full h-11" disabled={loading}>
              {loading
                ? 'Processing...'
                : isForgot
                ? 'Send reset link'
                : 'Sign In'}
            </Button>
          </form>

          {/* Toggle Tab Footer */}
          <div className="mt-5 border-t border-line pt-4 text-center text-xs">
            {isForgot ? (
              <button
                type="button"
                onClick={() => setIsForgot(false)}
                className="font-medium text-accent hover:underline"
              >
                Back to Login
              </button>
            ) : (
              <p className="text-content-muted">
                Your account is created by your HR admin.{' '}
                <button
                  type="button"
                  onClick={() => setIsForgot(true)}
                  className="font-medium text-accent hover:underline"
                >
                  Forgot password?
                </button>
              </p>
            )}
          </div>
        </Card>

        {/* Demo Fast Login Helper Panel (Only when not connected or in development) */}
        {!isLive && (
          <div className="rounded-xl border border-line bg-surface-raised/40 p-4">
            <div className="flex items-center gap-1.5 mb-2.5 text-amber-400 font-semibold text-xs">
              <ShieldCheckIcon className="h-4 w-4" />
              <span>Demo Quick Login (Skip Password)</span>
            </div>
            <p className="text-[10px] text-content-faint leading-relaxed mb-3">
              You are running in Demo Mode. Use these shortcuts to immediately toggle between the custom Employee view and full Admin Dashboard.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickLogin('nadia.karim@envicdigital.com')}
                className="flex items-center justify-between rounded-lg bg-surface px-3 py-2 text-xs font-medium text-content hover:bg-white/5 border border-line transition-colors"
              >
                <span>Admin View</span>
                <ArrowRightIcon className="h-3 w-3 text-content-faint" />
              </button>
              <button
                onClick={() => handleQuickLogin('marcus.reyes@envicdigital.com')}
                className="flex items-center justify-between rounded-lg bg-surface px-3 py-2 text-xs font-medium text-content hover:bg-white/5 border border-line transition-colors"
              >
                <span>Employee View</span>
                <ArrowRightIcon className="h-3 w-3 text-content-faint" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
