import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CompassIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-surface-raised">
        <CompassIcon className="h-6 w-6 text-content-muted" />
      </div>
      <h1 className="text-3xl font-bold text-content">Page not found</h1>
      <p className="mt-2 text-sm text-content-muted">
        The page you’re looking for doesn’t exist.
      </p>
      <Button variant="primary" className="mt-6" onClick={() => navigate('/')}>
        Back to dashboard
      </Button>
    </div>);

}