import type { User, UserRole, Page } from '../types';

const permissions: Record<UserRole, Page[]> = {
  fondatrice: [
    'dashboard',
    'student-registration',
    'student-management',
    'teacher-management',
    'finances',
    'inventory',
    'reports',
    'documentation',
    'user-management',
    'school-life',
    'grades-management',
    'class-management',
    'data-management',
    'activity-log',
    'module-management',
  ],
  directrice: [
    'dashboard',
    'student-registration',
    'student-management',
    'teacher-management',
    'finances',
    'inventory',
    'reports',
    'documentation',
    'user-management',
    'school-life',
    'grades-management',
    'class-management',
    'data-management',
    'activity-log',
    'module-management',
  ],
  admin: [
    'dashboard',
    'student-registration',
    'student-management',
    'teacher-management',
    'finances',
    'inventory',
    'reports',
    'documentation',
    'user-management',
    'school-life',
    'grades-management',
    'class-management',
    'data-management',
    'activity-log',
    'module-management',
  ],
  director: [
    'dashboard',
    'student-registration',
    'student-management',
    'teacher-management',
    'finances',
    'inventory',
    'reports',
    'documentation',
    'user-management',
    'school-life',
    'grades-management',
    'class-management',
    'data-management',
    'activity-log',
    'module-management',
  ],
  accountant: [
    'dashboard',
    'finances',
    'reports'
  ],
  manager: [
    'dashboard',
    'inventory'
  ],
  agent_admin: [
    'dashboard',
    'student-registration',
    'student-management',
    'school-life',
    'grades-management',
    'class-management',
    'documentation',
  ],
  agent: [
    'dashboard',
    'student-registration',
    'student-management',
    'school-life',
    'grades-management',
    'class-management',
  ],
  teacher: [
    'dashboard',
    'school-life',
    'student-management',
    'grades-management',
    'class-management',
  ],
  student: [
    'dashboard',
    'school-life',
  ],
  parent: [
    'dashboard',
    'school-life',
  ],
};

export const hasPermission = (user: User | UserRole, page: Page): boolean => {
  // If only role is provided, check default permissions
  if (typeof user === 'string') {
    return permissions[user]?.includes(page) ?? false;
  }

  // Check custom overrides first
  if (user.custom_permissions && user.custom_permissions[page] !== undefined) {
    return user.custom_permissions[page];
  }

  // Fallback to default role permissions
  return permissions[user.role]?.includes(page) ?? false;
};