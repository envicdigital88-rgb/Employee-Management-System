import React, { lazy } from 'react';
const SIZES: Record<string, string> = {
  xs: 'h-7 w-7 text-[10px]',
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-20 w-20 text-xl'
};
export function Avatar({
  src,
  name,
  size = 'sm',
  ring = false





}: {src?: string;name: string;size?: keyof typeof SIZES;ring?: boolean;}) {
  const initials = name.
  split(' ').
  map((p) => p[0]).
  slice(0, 2).
  join('').
  toUpperCase();
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-surface-raised ${SIZES[size]} ${ring ? 'ring-2 ring-accent/40' : ''}`}>
      
      {src ?
      <img
        src={src}
        alt={name}
        className="h-full w-full object-cover"
        loading="lazy" /> :


      <span className="flex h-full w-full items-center justify-center font-semibold text-content-muted">
          {initials}
        </span>
      }
    </div>);

}