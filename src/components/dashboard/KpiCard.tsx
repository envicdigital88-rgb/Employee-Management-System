import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUpIcon, TrendingDownIcon, BoxIcon } from 'lucide-react';
export function KpiCard({
  label,
  value,
  icon: Icon,
  delta,
  index = 0,
  accent = false










}: {label: string;value: string;icon: BoxIcon;delta?: {value: string;positive: boolean;};index?: number;accent?: boolean;}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 12
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      transition={{
        duration: 0.3,
        delay: index * 0.05
      }}
      className={`rounded-2xl border p-5 shadow-panel ${accent ? 'border-accent/30 bg-accent/[0.06]' : 'border-line bg-surface'}`}>
      
      <div className="flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent ? 'bg-accent/15 text-accent' : 'bg-surface-raised text-content-muted'}`}>
          
          <Icon className="h-5 w-5" />
        </div>
        {delta &&
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium ${delta.positive ? 'text-emerald-400' : 'text-red-400'}`}>
          
            {delta.positive ?
          <TrendingUpIcon className="h-3.5 w-3.5" /> :

          <TrendingDownIcon className="h-3.5 w-3.5" />
          }
            {delta.value}
          </span>
        }
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight text-content">
        {value}
      </p>
      <p className="mt-1 text-sm text-content-muted">{label}</p>
    </motion.div>);

}