import React from 'react';
import { SearchXIcon, BoxIcon } from 'lucide-react';
export function EmptyState({
  icon: Icon = SearchXIcon,
  title,
  description,
  action





}: {icon?: React.ComponentType<any>;title: string;description?: string;action?: React.ReactNode;}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-surface-raised">
        <Icon className="h-5 w-5 text-content-muted" />
      </div>
      <h4 className="text-sm font-semibold text-content">{title}</h4>
      {description &&
      <p className="mt-1 max-w-sm text-xs text-content-muted">
          {description}
        </p>
      }
      {action && <div className="mt-4">{action}</div>}
    </div>);

}