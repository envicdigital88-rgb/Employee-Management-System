import { Department } from '../types';

export const departments: Department[] = [
{
  id: 'DEP-ENG',
  name: 'Engineering',
  headEmployeeId: 'EMP-1001',
  budget: 2400000,
  location: 'Remote / HQ',
  colorHex: '#22d3ee'
},
{
  id: 'DEP-DSN',
  name: 'Design',
  headEmployeeId: 'EMP-1010',
  budget: 820000,
  location: 'HQ',
  colorHex: '#a78bfa'
},
{
  id: 'DEP-MKT',
  name: 'Marketing',
  headEmployeeId: 'EMP-1016',
  budget: 1100000,
  location: 'HQ',
  colorHex: '#f472b6'
},
{
  id: 'DEP-SAL',
  name: 'Sales',
  headEmployeeId: 'EMP-1022',
  budget: 1500000,
  location: 'Remote',
  colorHex: '#34d399'
},
{
  id: 'DEP-HR',
  name: 'Human Resources',
  headEmployeeId: 'EMP-1030',
  budget: 560000,
  location: 'HQ',
  colorHex: '#fbbf24'
},
{
  id: 'DEP-OPS',
  name: 'Operations',
  headEmployeeId: 'EMP-1034',
  budget: 940000,
  location: 'HQ',
  colorHex: '#60a5fa'
}];


export const getDepartment = (id: string): Department | undefined =>
departments.find((d) => d.id === id);