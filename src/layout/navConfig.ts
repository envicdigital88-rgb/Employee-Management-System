import {
  LayoutDashboardIcon,
  UsersIcon,
  Building2Icon,
  CalendarCheckIcon,
  PlaneIcon,
  WalletIcon,
  TargetIcon,
  BriefcaseIcon,
  BarChart3Icon,
  SettingsIcon,
  UserIcon,
  LucideIcon 
} from 'lucide-react';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const adminNavGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', to: '/', icon: LayoutDashboardIcon, end: true }
    ]
  },
  {
    label: 'People',
    items: [
      { label: 'Employees', to: '/employees', icon: UsersIcon },
      { label: 'Departments', to: '/departments', icon: Building2Icon },
      { label: 'Attendance', to: '/attendance', icon: CalendarCheckIcon },
      { label: 'Leave', to: '/leave', icon: PlaneIcon }
    ]
  },
  {
    label: 'Operations',
    items: [
      { label: 'Payroll', to: '/payroll', icon: WalletIcon },
      { label: 'Performance', to: '/performance', icon: TargetIcon },
      { label: 'Recruitment', to: '/recruitment', icon: BriefcaseIcon },
      { label: 'Reports', to: '/reports', icon: BarChart3Icon }
    ]
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', to: '/settings', icon: SettingsIcon }
    ]
  }
];

export const employeeNavGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', to: '/', icon: LayoutDashboardIcon, end: true }
    ]
  },
  {
    label: 'Workspace',
    items: [
      { label: 'My Attendance', to: '/attendance', icon: CalendarCheckIcon },
      { label: 'My Leaves', to: '/leave', icon: PlaneIcon },
      { label: 'My Profile', to: '/profile', icon: UserIcon }
    ]
  }
];