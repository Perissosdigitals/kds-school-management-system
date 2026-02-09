import React, { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'teacher' | 'parent' | 'student' | 'agent_admin';
  firstName: string;
  lastName: string;
}

interface RoleBasedLayoutProps {
  children: React.ReactNode;
}

export const RoleBasedLayout: React.FC<RoleBasedLayoutProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);

  useEffect(() => {
    // Load user from localStorage
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const parsedUser = JSON.parse(userJson);
        setUser(parsedUser);
      } catch (err) {
        console.error('Failed to parse user:', err);
        handleLogout();
      }
    } else {
      // No user logged in, redirect to login
      window.location.href = '/login';
    }

    // Update current path on navigation
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  };

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    setMobileMenuOpen(false);
  };

  // Menu items configuration with RBAC
  const getMenuItems = () => {
    if (!user) return [];

    const allMenuItems = [
      {
        id: 'dashboard',
        label: 'Tableau de Bord',
        icon: '📊',
        path: '/',
        roles: ['admin', 'teacher', 'parent', 'student', 'agent_admin'],
      },
      {
        id: 'grades',
        label: 'Notes',
        icon: '📝',
        path: '/grades',
        roles: ['admin', 'teacher', 'agent_admin'],
        children: [
          { label: 'Saisie notes', path: '/grades/entry', roles: ['teacher'] },
          { label: 'Bulletins', path: '/grades/reports', roles: ['admin', 'teacher', 'agent_admin'] },
          { label: 'Dashboard professeur', path: '/grades/teacher', roles: ['teacher'] },
          { label: 'Dashboard admin', path: '/grades/admin', roles: ['admin', 'agent_admin'] },
        ],
      },
      {
        id: 'grades-view',
        label: 'Mes Notes',
        icon: '📝',
        path: '/grades/my-report',
        roles: ['student', 'parent'],
      },
      {
        id: 'attendance',
        label: 'Présences',
        icon: '📅',
        path: '/attendance',
        roles: ['admin', 'teacher', 'agent_admin'],
        children: [
          { label: 'Appel journalier', path: '/attendance/daily', roles: ['teacher'] },
          { label: 'Vue classe', path: '/attendance/class', roles: ['admin', 'teacher', 'agent_admin'] },
          { label: 'Statistiques', path: '/attendance/stats', roles: ['admin', 'agent_admin'] },
        ],
      },
      {
        id: 'attendance-view',
        label: 'Mes Présences',
        icon: '📅',
        path: '/attendance/student',
        roles: ['student', 'parent'],
      },
      {
        id: 'justifications',
        label: 'Justifier Absences',
        icon: '📝',
        path: '/attendance/justify',
        roles: ['parent'],
      },
      {
        id: 'classes',
        label: 'Classes',
        icon: '🏫',
        path: '/classes',
        roles: ['admin', 'teacher', 'agent_admin'],
      },
      {
        id: 'students',
        label: 'Élèves',
        icon: '👨‍🎓',
        path: '/students',
        roles: ['admin', 'teacher', 'agent_admin'],
      },
      {
        id: 'teachers',
        label: 'Professeurs',
        icon: '👨‍🏫',
        path: '/teachers',
        roles: ['admin', 'agent_admin'],
      },
      {
        id: 'data-management',
        label: 'Gestion Données',
        icon: '🗄️',
        path: '/data',
        roles: ['admin'],
        children: [
          { label: 'Export', path: '/data/export', roles: ['admin'] },
          { label: 'Import', path: '/data/import', roles: ['admin'] },
          { label: 'Sauvegardes', path: '/data/backups', roles: ['admin'] },
          { label: 'Validation', path: '/data/validate', roles: ['admin'] },
          { label: 'Migration', path: '/data/migrate', roles: ['admin'] },
        ],
      },
      {
        id: 'reports',
        label: 'Rapports',
        icon: '📊',
        path: '/reports',
        roles: ['admin'],
      },
      {
        id: 'settings',
        label: 'Paramètres',
        icon: '⚙️',
        path: '/settings',
        roles: ['admin'],
      },
    ];

    // Filter menu items based on user role
    return allMenuItems
      .filter((item) => item.roles.includes(user.role))
      .map((item) => {
        if (item.children) {
          return {
            ...item,
            children: item.children.filter((child) => child.roles.includes(user.role)),
          };
        }
        return item;
      });
  };

  const menuItems = getMenuItems();

  // RBAC enforcement: check if user has access to current path
  useEffect(() => {
    if (!user || currentPath === '/login') return;

    const hasAccess = menuItems.some((item) => {
      if (item.path === currentPath) return true;
      if (item.children) {
        return item.children.some((child) => child.path === currentPath);
      }
      return false;
    });

    // If user doesn't have access to current path, redirect to 403 or dashboard
    if (!hasAccess && currentPath !== '/') {
      console.warn(`Access denied to ${currentPath} for role ${user.role}`);
      // In production, redirect to 403 page or dashboard
      // For now, just log warning
    }
  }, [currentPath, user, menuItems]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="role-based-layout min-h-screen bg-gray-100">
      {/* Top Navbar */}
      <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden mr-2 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center">
                <span className="text-2xl mr-2">🎓</span>
                <span className="text-xl font-bold text-gray-800">KSP School</span>
              </div>
            </div>

            {/* User Info & Logout */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-xs text-gray-500 capitalize">
                  {user.role === 'admin' ? 'Administrateur' :
                    user.role === 'teacher' ? 'Professeur' :
                      user.role === 'parent' ? 'Parent' :
                        user.role === 'agent_admin' ? 'Agent Administratif' :
                          'Élève'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* Sidebar Desktop */}
        <aside className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 bg-white shadow-lg h-screen fixed overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {menuItems.map((item) => (
                <div key={item.id}>
                  <button
                    onClick={() => navigateTo(item.path)}
                    className={`w-full group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${currentPath === item.path
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                  >
                    <span className="mr-3 text-xl">{item.icon}</span>
                    {item.label}
                  </button>

                  {/* Submenu */}
                  {item.children && item.children.length > 0 && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children.map((child, idx) => (
                        <button
                          key={idx}
                          onClick={() => navigateTo(child.path)}
                          className={`w-full group flex items-center px-4 py-2 text-xs font-medium rounded-md transition-colors ${currentPath === child.path
                            ? 'bg-blue-50 text-blue-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                          • {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Footer */}
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center w-full">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-gray-800 bg-opacity-75" onClick={() => setMobileMenuOpen(false)}>
            <div
              className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">🎓</span>
                  <span className="text-xl font-bold text-gray-800">KSP School</span>
                </div>
              </div>

              <nav className="px-2 py-4 space-y-1">
                {menuItems.map((item) => (
                  <div key={item.id}>
                    <button
                      onClick={() => navigateTo(item.path)}
                      className={`w-full group flex items-center px-4 py-3 text-sm font-medium rounded-md ${currentPath === item.path
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                    >
                      <span className="mr-3 text-xl">{item.icon}</span>
                      {item.label}
                    </button>

                    {item.children && item.children.length > 0 && (
                      <div className="ml-8 mt-1 space-y-1">
                        {item.children.map((child, idx) => (
                          <button
                            key={idx}
                            onClick={() => navigateTo(child.path)}
                            className={`w-full group flex items-center px-4 py-2 text-xs font-medium rounded-md ${currentPath === child.path
                              ? 'bg-blue-50 text-blue-900'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                          >
                            • {child.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>

              <div className="border-t border-gray-200 p-4">
                <p className="text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
                <p className="text-xs text-gray-500 capitalize mt-1">
                  {user.role === 'admin' ? 'Administrateur' :
                    user.role === 'teacher' ? 'Professeur' :
                      user.role === 'parent' ? 'Parent' :
                        user.role === 'agent_admin' ? 'Agent Administratif' :
                          'Élève'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 md:ml-64">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {/* Breadcrumbs */}
              <div className="mb-4">
                <nav className="flex" aria-label="Breadcrumb">
                  <ol className="flex items-center space-x-2 text-sm text-gray-500">
                    <li>
                      <button onClick={() => navigateTo('/')} className="hover:text-gray-700">
                        Accueil
                      </button>
                    </li>
                    {currentPath !== '/' && (
                      <>
                        <li>
                          <span className="mx-2">/</span>
                        </li>
                        <li className="text-gray-900 font-medium">
                          {menuItems.find((item) =>
                            item.path === currentPath ||
                            item.children?.some((child) => child.path === currentPath)
                          )?.label || 'Page'}
                        </li>
                      </>
                    )}
                  </ol>
                </nav>
              </div>

              {/* Page Content */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                {children}
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 mt-8">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 md:px-8">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  © 2024 KSP School Management System. Tous droits réservés.
                </p>
                <div className="flex space-x-4 text-sm text-gray-500">
                  <button onClick={() => navigateTo('/help')} className="hover:text-gray-700">
                    Aide
                  </button>
                  <button onClick={() => navigateTo('/contact')} className="hover:text-gray-700">
                    Contact
                  </button>
                  <button onClick={() => navigateTo('/privacy')} className="hover:text-gray-700">
                    Confidentialité
                  </button>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* RBAC Enforcement Notice (Dev Mode) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg text-xs">
          <p className="font-semibold">RBAC Active</p>
          <p>Role: {user.role}</p>
          <p>Access: {menuItems.length} modules</p>
        </div>
      )}
    </div>
  );
};
