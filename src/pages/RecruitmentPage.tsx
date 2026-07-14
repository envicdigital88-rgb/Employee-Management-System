import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BriefcaseIcon,
  StarIcon,
  MapPinIcon,
  ClipboardCheckIcon } from
'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { KpiCard } from '../components/dashboard/KpiCard';
import { useHrms } from '../store/HrmsContext';
import { fullName } from '../data/employees';
import { candidateStageTone } from '../components/ui/statusMaps';
import { formatDate } from '../lib/format';
import { CandidateStage } from '../types';
const STAGES: CandidateStage[] = [
'Applied',
'Screening',
'Interview',
'Offer',
'Hired'];

export function RecruitmentPage() {
  const { candidates, moveCandidate, employees, getDepartment, positions, onboardingTasks } = useHrms();
  const [dragId, setDragId] = useState<string | null>(null);
  const openings = positions.
  filter((p) => p.status === 'Open').
  reduce((s, p) => s + p.openings, 0);
  const hired = candidates.filter((c) => c.stage === 'Hired').length;
  const inPipeline = candidates.filter((c) => c.stage !== 'Hired').length;
  const onboardingByEmp = useMemo(() => {
    const map: Record<string, typeof onboardingTasks> = {};
    onboardingTasks.forEach((t) => {
      ;(map[t.employeeId] = map[t.employeeId] || []).push(t);
    });
    return map;
  }, [onboardingTasks]);
  const positionTitle = (id: string) =>
  positions.find((p) => p.id === id)?.title ?? '';
  return (
    <div>
      <PageHeader
        title="Recruitment & onboarding"
        description="Open roles, candidate pipeline, and new-hire checklists." />
      

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Open positions"
          value={String(openings)}
          icon={BriefcaseIcon}
          index={0}
          accent />
        
        <KpiCard
          label="In pipeline"
          value={String(inPipeline)}
          icon={StarIcon}
          index={1} />
        
        <KpiCard
          label="Hired"
          value={String(hired)}
          icon={ClipboardCheckIcon}
          index={2} />
        
        <KpiCard
          label="Active roles"
          value={String(positions.filter((p) => p.status === 'Open').length)}
          icon={BriefcaseIcon}
          index={3} />
        
      </div>

      <h2 className="mb-3 text-sm font-semibold text-content">
        Candidate pipeline
      </h2>
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {STAGES.map((stage) => {
          const cands = candidates.filter((c) => c.stage === stage);
          return (
            <div
              key={stage}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragId) moveCandidate(dragId, stage);
                setDragId(null);
              }}
              className="rounded-2xl border border-line bg-surface/60 p-2">
              
              <div className="flex items-center justify-between px-2 py-2">
                <div className="flex items-center gap-2">
                  <Badge tone={candidateStageTone[stage]} dot>
                    {stage}
                  </Badge>
                </div>
                <span className="text-xs text-content-faint">
                  {cands.length}
                </span>
              </div>
              <div className="space-y-2">
                {cands.map((c) =>
                <motion.div
                  layout
                  key={c.id}
                  draggable
                  onDragStart={() => setDragId(c.id)}
                  className="cursor-grab rounded-xl border border-line bg-surface-raised p-3 active:cursor-grabbing">
                  
                    <div className="flex items-center gap-2">
                      <Avatar src={c.avatarUrl} name={c.name} size="xs" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-content">
                          {c.name}
                        </p>
                        <p className="truncate text-xs text-content-faint">
                          {positionTitle(c.positionId)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="flex items-center gap-0.5 text-xs text-content-muted">
                        <StarIcon className="h-3 w-3 fill-accent text-accent" />{' '}
                        {c.rating}
                      </span>
                      <span className="text-xs text-content-faint">
                        {c.source}
                      </span>
                    </div>
                  </motion.div>
                )}
                {cands.length === 0 &&
                <p className="px-2 py-6 text-center text-xs text-content-faint">
                    Drop here
                  </p>
                }
              </div>
            </div>);

        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Open positions"
            subtitle={`${positions.filter((p) => p.status === 'Open').length} active roles`} />
          
          <ul className="divide-y divide-line">
            {positions.map((p) =>
            <li
              key={p.id}
              className="flex items-center justify-between gap-3 px-5 py-3.5">
              
                <div className="min-w-0">
                  <p className="truncate font-medium text-content">{p.title}</p>
                  <p className="flex items-center gap-2 text-xs text-content-muted">
                    {getDepartment(p.departmentId)?.name}
                    <span className="inline-flex items-center gap-1">
                      <MapPinIcon className="h-3 w-3" />
                      {p.location}
                    </span>
                    · Posted {formatDate(p.postedDate)}
                  </p>
                </div>
                <Badge tone="accent">
                  {p.openings} {p.openings === 1 ? 'opening' : 'openings'}
                </Badge>
              </li>
            )}
          </ul>
        </Card>

        <Card>
          <CardHeader
            title="Onboarding checklists"
            subtitle="New hires in progress" />
          
          <div className="space-y-4 p-5">
            {Object.entries(onboardingByEmp).map(([empId, tasks]) => {
              const emp = employees.find((e) => e.id === empId);
              const done = tasks.filter((t) => t.done).length;
              return (
                <div
                  key={empId}
                  className="rounded-xl border border-line bg-surface-raised p-4">
                  
                  <div className="mb-3 flex items-center gap-3">
                    {emp &&
                    <Avatar
                      src={emp.avatarUrl}
                      name={fullName(emp)}
                      size="sm" />

                    }
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-content">
                        {emp ? fullName(emp) : empId}
                      </p>
                      <p className="text-xs text-content-muted">
                        {done}/{tasks.length} tasks complete
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-accent">
                      {Math.round(done / tasks.length * 100)}%
                    </span>
                  </div>
                  <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-surface">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{
                        width: `${done / tasks.length * 100}%`
                      }} />
                    
                  </div>
                  <ul className="space-y-1.5">
                    {tasks.map((t) =>
                    <li
                      key={t.id}
                      className="flex items-center gap-2 text-sm">
                      
                        <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full border ${t.done ? 'border-accent bg-accent text-canvas' : 'border-line'}`}>
                        
                          {t.done &&
                        <ClipboardCheckIcon className="h-2.5 w-2.5" />
                        }
                        </span>
                        <span
                        className={
                        t.done ?
                        'text-content-faint line-through' :
                        'text-content-muted'
                        }>
                        
                          {t.label}
                        </span>
                      </li>
                    )}
                  </ul>
                </div>);

            })}
          </div>
        </Card>
      </div>
    </div>);

}