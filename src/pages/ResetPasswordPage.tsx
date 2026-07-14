import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockIcon, KeyIcon } from 'lucide-react';
import { useHrms } from '../store/HrmsContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';

const inputWrapperClass = 'relative flex items-center';
const iconClass = 'absolute left-3.5 h-4 w-4 text-content-faint';
const inputClass =
  'h-11 w-full rounded-xl border border-line bg-surface-raised pl-10 pr-4 text-sm text-content placeholder:text-content-faint focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30';
const labelClass = 'mb-1.5 block text-xs font-medium text-content-muted';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { updatePassword } = useHrms();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await updatePassword(password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to reset password.');
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
            Enter new password
          </h2>
          <p className="mt-1.5 text-center text-xs text-content-muted">
            Choose a strong password for your account
          </p>
        </div>

        <Card className="p-6 border border-line">
          {error && (
            <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-400">
              Password updated successfully! Redirecting to login...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="new-password" className={labelClass}>
                New Password
              </label>
              <div className={inputWrapperClass}>
                <LockIcon className={iconClass} />
                <input
                  id="new-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className={inputClass}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className={labelClass}>
                Confirm Password
              </label>
              <div className={inputWrapperClass}>
                <KeyIcon className={iconClass} />
                <input
                  id="confirm-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className={inputClass}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full h-11" disabled={loading || success}>
              {loading ? 'Updating...' : 'Set Password'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
