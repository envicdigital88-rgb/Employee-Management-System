import React from 'react';
export function Logo({ collapsed = false }: {collapsed?: boolean;}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-accent/40 bg-accent/10">
        <span
          className="absolute inset-0 rounded-xl bg-accent/10 blur-md"
          aria-hidden />
        
        <svg
          viewBox="0 0 24 24"
          className="relative h-5 w-5 text-accent"
          fill="none"
          aria-hidden>
          
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.4" />
          
          <circle
            cx="12"
            cy="12"
            r="4.5"
            stroke="currentColor"
            strokeWidth="1.8" />
          
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      </div>
      {!collapsed &&
      <div className="leading-none">
          <div className="text-sm font-extrabold tracking-tight text-content">
            ENVIC<span className="text-accent"> HR</span>
          </div>
          <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-content-faint">
            Digital
          </div>
        </div>
      }
    </div>);

}