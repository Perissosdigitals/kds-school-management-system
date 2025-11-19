// Définition des permissions par rôle
export const ROLE_PERMISSIONS = {
  fondatrice: {
    students: ['read', 'create', 'update', 'delete'],
    teachers: ['read', 'create', 'update', 'delete'],
    classes: ['read', 'create', 'update', 'delete'],
    grades: ['read', 'create', 'update', 'delete'],
    attendance: ['read', 'create', 'update', 'delete'],
    finance: ['read', 'create', 'update', 'delete'],
    inventory: ['read', 'create', 'update', 'delete'],
    timetable: ['read', 'create', 'update', 'delete'],
    users: ['read', 'create', 'update', 'delete'],
    documents: ['read', 'create', 'update', 'delete'],
  },
  admin: {
    students: ['read', 'create', 'update', 'delete'],
    teachers: ['read', 'create', 'update', 'delete'],
    classes: ['read', 'create', 'update', 'delete'],
    grades: ['read', 'create', 'update', 'delete'],
    attendance: ['read', 'create', 'update', 'delete'],
    finance: ['read', 'create', 'update', 'delete'],
    inventory: ['read', 'create', 'update', 'delete'],
    timetable: ['read', 'create', 'update', 'delete'],
    users: ['read', 'create', 'update', 'delete'],
    documents: ['read', 'create', 'update', 'delete'],
  },
  directrice: {
    students: ['read', 'create', 'update'],
    teachers: ['read', 'create', 'update'],
    classes: ['read', 'create', 'update'],
    grades: ['read', 'create', 'update'],
    attendance: ['read', 'create', 'update'],
    finance: ['read'],
    inventory: ['read'],
    timetable: ['read', 'create', 'update'],
    users: ['read'],
    documents: ['read', 'create', 'update'],
  },
  comptable: {
    students: ['read'],
    teachers: ['read'],
    classes: ['read'],
    grades: [],
    attendance: [],
    finance: ['read', 'create', 'update'],
    inventory: ['read'],
    timetable: [],
    users: [],
    documents: ['read'],
  },
  enseignant: {
    students: ['read'],
    teachers: ['read'],
    classes: ['read'],
    grades: ['read', 'create', 'update'],
    attendance: ['read', 'create', 'update'],
    finance: [],
    inventory: [],
    timetable: ['read'],
    users: [],
    documents: ['read'],
  },
  agent: {
    students: ['read'],
    teachers: ['read'],
    classes: ['read'],
    grades: [],
    attendance: ['read'],
    finance: [],
    inventory: ['read', 'create', 'update'],
    timetable: ['read'],
    users: [],
    documents: ['read', 'create'],
  },
};

export type UserRole = keyof typeof ROLE_PERMISSIONS;
export type Resource = keyof typeof ROLE_PERMISSIONS['admin'];
export type Action = 'read' | 'create' | 'update' | 'delete';

export function canAccess(role: UserRole, resource: Resource, action: Action): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  
  const resourcePermissions = permissions[resource];
  if (!resourcePermissions) return false;
  
  return resourcePermissions.includes(action);
}
