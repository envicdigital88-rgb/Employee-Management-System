import React from 'react';
export function Card({
  children,
  className = '',
  as: As = 'div'




}: {children: React.ReactNode;className?: string;as?: React.ElementType;}) {
  return (
    <As
      className={`rounded-2xl border border-line bg-surface shadow-panel ${className}`}>
      
      {children}
    </As>);

}
export function CardHeader({
  title,
  subtitle,
  action




}: {title: React.ReactNode;subtitle?: React.ReactNode;action?: React.ReactNode;}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
      <div>
        <h3 className="text-sm font-semibold text-content">{title}</h3>
        {subtitle &&
        <p className="mt-0.5 text-xs text-content-muted">{subtitle}</p>
        }
      </div>
      {action}
    </div>);

}