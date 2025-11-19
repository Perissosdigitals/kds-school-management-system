import type { UserRole, Page } from '../types';

const permissions: Record<UserRole, Page[]> = {
  Fondatrice: [
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
  ],
  Directrice: [
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
  ],
  Comptable: [
    'dashboard',
    'finances',
    'reports'
  ],
  Gestionnaire: [
    'dashboard',
    'inventory'
  ],
  'Agent Administratif': [
    'dashboard',
    'student-registration',
    'student-management',
    'school-life',
    'grades-management',
    'class-management',
  ],
  'Enseignant': [
    'dashboard',
    'school-life',
    'student-management',
    'grades-management',
    'class-management',
  ],
};

export const hasPermission = (role: UserRole, page: Page): boolean => {
  return permissions[role]?.includes(page) ?? false;
};