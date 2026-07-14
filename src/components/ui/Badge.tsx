import React from 'react';
type Tone = 'accent' | 'green' | 'amber' | 'red' | 'purple' | 'blue' | 'neutral';
const TONES: Record<Tone, string> = {
  accent: 'bg-accent/10 text-accent border-accent/30',
  green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  red: 'bg-red-500/10 text-red-400 border-red-500/30',
  purple: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  neutral: 'bg-white/5 text-content-muted border-white/10'
};
export function Badge({
  children,
  tone = 'neutral',
  dot = false




}: {children: React.ReactNode;tone?: Tone;dot?: boolean;}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONES[tone]}`}>
      
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>);

}