import { Position, Candidate, OnboardingTask } from '../types';

const avatar = (seed: string) =>
`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(
  seed
)}&backgroundColor=14171c,1a1d23,262a31&radius=50`;

export const positions: Position[] = [
{
  id: 'POS-01',
  title: 'Senior Fullstack Engineer',
  departmentId: 'DEP-ENG',
  location: 'Remote',
  employmentType: 'Full-time',
  openings: 2,
  postedDate: '2026-06-15',
  status: 'Open'
},
{
  id: 'POS-02',
  title: 'Product Designer',
  departmentId: 'DEP-DSN',
  location: 'HQ',
  employmentType: 'Full-time',
  openings: 1,
  postedDate: '2026-06-28',
  status: 'Open'
},
{
  id: 'POS-03',
  title: 'Performance Marketing Manager',
  departmentId: 'DEP-MKT',
  location: 'Remote',
  employmentType: 'Full-time',
  openings: 1,
  postedDate: '2026-07-01',
  status: 'Open'
},
{
  id: 'POS-04',
  title: 'Enterprise Account Executive',
  departmentId: 'DEP-SAL',
  location: 'Remote',
  employmentType: 'Full-time',
  openings: 3,
  postedDate: '2026-05-20',
  status: 'Open'
},
{
  id: 'POS-05',
  title: 'Data Engineer',
  departmentId: 'DEP-ENG',
  location: 'HQ',
  employmentType: 'Full-time',
  openings: 1,
  postedDate: '2026-07-05',
  status: 'Open'
}];


export const candidates: Candidate[] = [
{
  id: 'CAN-01',
  name: 'Aria Blackwood',
  email: 'aria.b@example.com',
  avatarUrl: avatar('Aria Blackwood'),
  positionId: 'POS-01',
  stage: 'Applied',
  appliedDate: '2026-07-10',
  rating: 3,
  source: 'LinkedIn'
},
{
  id: 'CAN-02',
  name: 'Mateo Rivera',
  email: 'mateo.r@example.com',
  avatarUrl: avatar('Mateo Rivera'),
  positionId: 'POS-01',
  stage: 'Screening',
  appliedDate: '2026-07-06',
  rating: 4,
  source: 'Referral'
},
{
  id: 'CAN-03',
  name: 'Leah Goldberg',
  email: 'leah.g@example.com',
  avatarUrl: avatar('Leah Goldberg'),
  positionId: 'POS-01',
  stage: 'Interview',
  appliedDate: '2026-06-30',
  rating: 5,
  source: 'Website'
},
{
  id: 'CAN-04',
  name: 'Simon Wu',
  email: 'simon.w@example.com',
  avatarUrl: avatar('Simon Wu'),
  positionId: 'POS-02',
  stage: 'Interview',
  appliedDate: '2026-07-02',
  rating: 4,
  source: 'Dribbble'
},
{
  id: 'CAN-05',
  name: 'Nora Ahmed',
  email: 'nora.a@example.com',
  avatarUrl: avatar('Nora Ahmed'),
  positionId: 'POS-02',
  stage: 'Offer',
  appliedDate: '2026-06-22',
  rating: 5,
  source: 'Referral'
},
{
  id: 'CAN-06',
  name: 'Felix Berger',
  email: 'felix.b@example.com',
  avatarUrl: avatar('Felix Berger'),
  positionId: 'POS-03',
  stage: 'Applied',
  appliedDate: '2026-07-11',
  rating: 3,
  source: 'Indeed'
},
{
  id: 'CAN-07',
  name: 'Priyanka Rao',
  email: 'priyanka.r@example.com',
  avatarUrl: avatar('Priyanka Rao'),
  positionId: 'POS-03',
  stage: 'Screening',
  appliedDate: '2026-07-08',
  rating: 4,
  source: 'LinkedIn'
},
{
  id: 'CAN-08',
  name: 'Diego Fernandez',
  email: 'diego.f@example.com',
  avatarUrl: avatar('Diego Fernandez'),
  positionId: 'POS-04',
  stage: 'Applied',
  appliedDate: '2026-07-12',
  rating: 3,
  source: 'LinkedIn'
},
{
  id: 'CAN-09',
  name: 'Hana Suzuki',
  email: 'hana.s@example.com',
  avatarUrl: avatar('Hana Suzuki'),
  positionId: 'POS-04',
  stage: 'Interview',
  appliedDate: '2026-06-26',
  rating: 4,
  source: 'Website'
},
{
  id: 'CAN-10',
  name: 'Oscar Lindqvist',
  email: 'oscar.l@example.com',
  avatarUrl: avatar('Oscar Lindqvist'),
  positionId: 'POS-04',
  stage: 'Hired',
  appliedDate: '2026-05-30',
  rating: 5,
  source: 'Referral'
},
{
  id: 'CAN-11',
  name: 'Yasmin Farah',
  email: 'yasmin.f@example.com',
  avatarUrl: avatar('Yasmin Farah'),
  positionId: 'POS-05',
  stage: 'Screening',
  appliedDate: '2026-07-09',
  rating: 4,
  source: 'Website'
},
{
  id: 'CAN-12',
  name: 'Ben Carlson',
  email: 'ben.c@example.com',
  avatarUrl: avatar('Ben Carlson'),
  positionId: 'POS-05',
  stage: 'Offer',
  appliedDate: '2026-06-18',
  rating: 5,
  source: 'Referral'
}];


export const onboardingTasks: OnboardingTask[] = [
{
  id: 'ONB-1',
  employeeId: 'EMP-1007',
  label: 'Sign employment contract',
  done: true
},
{
  id: 'ONB-2',
  employeeId: 'EMP-1007',
  label: 'Set up company email & SSO',
  done: true
},
{
  id: 'ONB-3',
  employeeId: 'EMP-1007',
  label: 'Provision laptop & equipment',
  done: true
},
{
  id: 'ONB-4',
  employeeId: 'EMP-1007',
  label: 'Complete HR onboarding forms',
  done: false
},
{
  id: 'ONB-5',
  employeeId: 'EMP-1007',
  label: 'Meet the team & manager 1:1',
  done: false
},
{
  id: 'ONB-6',
  employeeId: 'EMP-1037',
  label: 'Sign employment contract',
  done: true
},
{
  id: 'ONB-7',
  employeeId: 'EMP-1037',
  label: 'Set up company email & SSO',
  done: true
},
{
  id: 'ONB-8',
  employeeId: 'EMP-1037',
  label: 'Provision laptop & equipment',
  done: false
},
{
  id: 'ONB-9',
  employeeId: 'EMP-1037',
  label: 'Complete HR onboarding forms',
  done: false
},
{
  id: 'ONB-10',
  employeeId: 'EMP-1037',
  label: 'Security & compliance training',
  done: false
}];