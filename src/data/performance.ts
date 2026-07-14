import { PerformanceReview, ReviewStatus } from '../types';
import { employees } from './employees';

const RATINGS = [4.5, 4.2, 3.8, 4.8, 3.5, 4.0, 4.6, 3.9, 4.3, 5.0];
const SUMMARIES = [
'Consistently exceeds expectations and mentors peers effectively.',
'Strong contributor; delivered key projects on schedule.',
'Solid performer with room to grow in cross-team collaboration.',
'Outstanding impact this cycle; a role model for the team.',
'Meeting expectations; focus areas identified for next quarter.'];


export const performanceReviews: PerformanceReview[] = employees.map((e, i) => {
  const status: ReviewStatus =
  i % 4 === 0 ? 'Upcoming' : i % 9 === 0 ? 'In Progress' : 'Completed';
  const reviewer = e.managerId ?? 'EMP-1030';
  return {
    id: `REV-${e.id}-H1`,
    employeeId: e.id,
    cycle: 'H1 2026',
    reviewerId: reviewer,
    rating: RATINGS[i % RATINGS.length],
    status,
    date: status === 'Upcoming' ? '2026-07-25' : '2026-06-20',
    summary: SUMMARIES[i % SUMMARIES.length],
    goals: [
    { label: 'Deliver core roadmap items', progress: 60 + i * 7 % 40 },
    {
      label: 'Improve documentation coverage',
      progress: 40 + i * 11 % 55
    },
    {
      label: 'Mentorship & knowledge sharing',
      progress: 30 + i * 13 % 65
    }]

  };
});

export const getReviewsForEmployee = (
employeeId: string)
: PerformanceReview[] =>
performanceReviews.filter((r) => r.employeeId === employeeId);