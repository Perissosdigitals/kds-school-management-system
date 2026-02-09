import React, { useState, useEffect, Suspense, lazy, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import type { Page, User, UserRole } from './types';
import { hasPermission } from './utils/permissions';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/ui/Toast';

const StudentRegistration = lazy(() => import('./components/StudentRegistration'));
const StudentManagement = lazy(() => import('./components/StudentManagement'));
const StudentPedagogicalFile = lazy(() => import('./components/StudentPedagogicalFile'));
const TeacherManagement = lazy(() => import('./components/TeacherManagement'));
const SchoolLife = lazy(() => import('./components/SchoolLife'));
const GradesManagement = lazy(() => import('./components/GradesManagement'));
const ClassManagement = lazy(() => import('./components/ClassManagement'));
const Finances = lazy(() => import('./components/Finances'));
const Inventory = lazy(() => import('./components/Inventory'));
const Reports = lazy(() => import('./components/Reports').then(m => ({ default: m.Reports })));
const Documentation = lazy(() => import('./components/Documentation').then(m => ({ default: m.Documentation })));
const UserManagement = lazy(() => import('./components/UserManagement'));
const ModuleManagement = lazy(() => import('./components/ModuleManagement'));
const DataManagement = lazy(() => import('./components/DataManagement'));
const ActivityLog = lazy(() => import('./components/ActivityLog').then(m => ({ default: m.ActivityLog })));
const UserProfileSettings = lazy(() => import('./components/UserProfileSettings').then(m => ({ default: m.UserProfileSettings })));
const SecurePortal = lazy(() => import('./components/SecurePortal').then(m => ({ default: m.SecurePortal })));

// ProtectedRoute Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; isAuthenticated: boolean }> = ({
  children,
  isAuthenticated,
}) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AppContent: React.FC<{
  currentUser: User;
  activePage: Page;
  handleSetPage: (page: Page) => void;
  onUserUpdate: (updatedUser: User) => void;
}> = ({ currentUser, activePage, handleSetPage, onUserUpdate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderContent = () => {
    if (!hasPermission(currentUser, activePage)) {
      return (
        <div className="text-center p-10">
          <i className='bx bxs-lock-alt text-6xl text-red-400 mb-4'></i>
          <h2 className="text-3xl font-bold text-slate-800">Accès Refusé</h2>
          <p className="text-gray-500 mt-2">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        </div>
      );
    }

    switch (activePage) {
      case 'dashboard':
        return <Dashboard setActivePage={handleSetPage} currentUser={currentUser} />;
      case 'student-registration':
        return <StudentRegistration />;
      case 'student-management':
        return <StudentManagement currentUser={currentUser} />;
      case 'teacher-management':
        return <TeacherManagement />;
      case 'school-life':
        return <SchoolLife currentUser={currentUser} />;
      case 'grades-management':
        return <GradesManagement currentUser={currentUser} />;
      case 'class-management':
        return <ClassManagement currentUser={currentUser} setActivePage={handleSetPage} />;
      case 'finances':
        return <Finances />;
      case 'inventory':
        return <Inventory />;
      case 'reports':
        return <Reports />;
      case 'documentation':
        return <Documentation currentUser={currentUser} />;
      case 'user-management':
        return <UserManagement />;
      case 'module-management':
        return <ModuleManagement />;
      case 'data-management':
        return <DataManagement currentUser={currentUser} />;
      case 'activity-log':
        return <ActivityLog />;
      case 'user-profile':
        return <UserProfileSettings user={currentUser} onUpdate={(updatedUser) => {
          onUserUpdate(updatedUser);
          const storedUser = localStorage.getItem('ksp_user');
          if (storedUser) {
            const backendUser = JSON.parse(storedUser);
            backendUser.avatar_url = updatedUser.avatar_url;
            localStorage.setItem('ksp_user', JSON.stringify(backendUser));
          }
        }} />;
      default:
        return <Dashboard setActivePage={handleSetPage} currentUser={currentUser} />;
    }
  };

  return (
    <div className="flex min-h-screen font-sans relative overflow-hidden bg-slate-50">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/30 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 flex w-full">
        <Sidebar
          activePage={activePage}
          setActivePage={handleSetPage}
          user={currentUser}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <Header
            currentUser={currentUser}
            onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            onProfileClick={() => handleSetPage('user-profile')}
            onLogout={() => {
              localStorage.removeItem('ksp_token');
              localStorage.removeItem('ksp_user');
              window.location.href = '/login';
            }}
          />
          <main className="flex-1 p-3 sm:p-4 md:p-5 lg:p-6 overflow-y-auto">
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                {renderContent()}
              </Suspense>
            </ErrorBoundary>
          </main>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in (from localStorage or API)
  useEffect(() => {
    const storedUser = localStorage.getItem('ksp_user');
    const storedToken = localStorage.getItem('ksp_token');

    console.log('[App] Checking authentication...', { hasUser: !!storedUser, hasToken: !!storedToken });

    if (storedUser && storedToken) {
      try {
        const backendUser = JSON.parse(storedUser);
        console.log('[App] Backend user:', backendUser);

        // Map backend user to app user format
        const roleMap: { [key: string]: UserRole } = {
          'founder': 'fondatrice',
          'fondatrice': 'fondatrice',
          'admin': 'admin',
          'director': 'directrice',
          'directrice': 'directrice',
          'comptable': 'accountant',
          'accountant': 'accountant',
          'gestionnaire': 'manager',
          'manager': 'manager',
          'agent': 'agent',
          'agent_admin': 'agent_admin',
          'teacher': 'teacher',
          'enseignant': 'teacher',
          'student': 'student',
          'parent': 'parent'
        };

        let mappedRole = roleMap[backendUser.role?.toLowerCase()] || 'agent';

        // DEV MODE FIX: If role mapping fails or defaults to agent in development, 
        // force upgrade to admin to ensure local testing works
        if (import.meta.env.DEV && mappedRole === 'agent' && backendUser.role?.toLowerCase() !== 'agent') {
          console.warn(`[App] Dev mode: Role '${backendUser.role}' mapped to 'agent'. Upgrading to 'admin' for testing.`);
          mappedRole = 'admin';
        }

        const mappedUser: User = {
          id: backendUser.id,
          email: backendUser.email || '',
          name: `${backendUser.firstName} ${backendUser.lastName}`,
          first_name: backendUser.firstName,
          last_name: backendUser.lastName,
          role: mappedRole,
          avatar_url: backendUser.avatar_url || null,
          phone: backendUser.phone || null,
          is_active: backendUser.is_active ?? true,
          last_login_at: backendUser.last_login_at || null,
          created_at: backendUser.created_at || new Date().toISOString(),
          custom_permissions: backendUser.custom_permissions || {}
        };

        setCurrentUser(mappedUser);
        console.log('[App] User authenticated:', mappedUser);
      } catch (err) {
        console.error('[App] Error parsing stored user:', err);
        localStorage.removeItem('ksp_user');
        localStorage.removeItem('ksp_token');
      }
    } else {
      console.log('[App] No stored credentials found');
    }
    setIsLoading(false);
    console.log('[App] Loading complete');
  }, []);

  // 1. URL -> State Sync (Initial Load & Back/Forward Navigation)
  // Runs once on mount, and on popstate events
  useEffect(() => {
    if (!currentUser) return;

    const handleUrlChange = () => {
      const pathToPage: Record<string, Page> = {
        '/': 'dashboard',
        '/dashboard': 'dashboard',
        '/students': 'student-management',
        '/students/register': 'student-registration',
        '/teachers': 'teacher-management',
        '/classes': 'class-management',
        '/grades': 'grades-management',
        '/school-life': 'school-life', // Maps /school-life URL to school-life page
        '/attendance': 'school-life',  // Maps /attendance URL to school-life page (alias)
        '/finances': 'finances',
        '/inventory': 'inventory',
        '/reports': 'reports',
        '/documentation': 'documentation',
        '/users': 'user-management',
        '/modules': 'module-management',
        '/data': 'data-management',
        '/activity': 'activity-log',
        '/profile': 'user-profile',
      };

      const currentPath = window.location.pathname;
      // Handle trailing slashes or sub-paths if necessary
      const targetPage = pathToPage[currentPath];

      if (targetPage && hasPermission(currentUser, targetPage)) {
        console.log(`[App] URL Sync: ${currentPath} -> ${targetPage}`);
        setActivePage(targetPage);
      } else if (targetPage) {
        console.warn(`[App] Unauthorized access to ${targetPage}, Redirecting to dashboard`);
        setActivePage('dashboard');
        window.history.replaceState({}, '', '/dashboard');
      }
    };

    // Run on initial load
    handleUrlChange();

    // Listen for back/forward navigation
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [currentUser]);

  // 2. State -> URL Sync (When user clicks in app)
  // Runs when activePage changes
  useEffect(() => {
    if (!currentUser) return;

    // Define the primary URL for each page
    const pageToPath: Partial<Record<Page, string>> = {
      'dashboard': '/dashboard',
      'student-management': '/students',
      'student-registration': '/students/register',
      'teacher-management': '/teachers',
      'class-management': '/classes',
      'grades-management': '/grades',
      'school-life': '/attendance', // Default URL for school-life page
      'finances': '/finances',
      'inventory': '/inventory',
      'reports': '/reports',
      'documentation': '/documentation',
      'user-management': '/users',
      'module-management': '/modules',
      'data-management': '/data',
      'activity-log': '/activity',
      'user-profile': '/profile',
    };

    const targetPath = pageToPath[activePage];
    // Only push state if the URL is different to avoid duplicate history entries
    if (targetPath && window.location.pathname !== targetPath) {
      console.log(`[App] State Sync: ${activePage} -> ${targetPath}`);
      window.history.pushState({}, '', targetPath);
    }
  }, [activePage, currentUser]);

  useEffect(() => {
    // When user changes, check if they can access the current page.
    // If not, redirect to their default page (dashboard).
    if (currentUser && !hasPermission(currentUser, activePage)) {
      setActivePage('dashboard');
    }
  }, [currentUser, activePage]);

  const handleSetPage = useCallback((page: Page) => {
    if (currentUser && hasPermission(currentUser, page)) {
      setActivePage(page);
    } else {
      alert("Accès non autorisé.");
    }
  }, [currentUser]);



  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Vérification de l'authentification basée sur le localStorage ET currentUser
  const hasToken = !!localStorage.getItem('ksp_token');
  const hasStoredUser = !!localStorage.getItem('ksp_user');
  const isAuthenticated = !!currentUser && hasToken;

  console.log('[App] Render state:', {
    hasToken,
    hasStoredUser,
    hasCurrentUser: !!currentUser,
    isAuthenticated,
    currentUser: currentUser?.name
  });

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={
            (hasToken && hasStoredUser) ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Suspense fallback={<div className="flex h-screen items-center justify-center bg-slate-50"><LoadingSpinner size="lg" /></div>}>
                <SecurePortal />
              </Suspense>
            )
          } />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                {currentUser && (
                  <AppContent
                    currentUser={currentUser}
                    activePage={activePage}
                    handleSetPage={handleSetPage}
                    onUserUpdate={setCurrentUser}
                  />
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="/*"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                {currentUser && (
                  <AppContent
                    currentUser={currentUser}
                    activePage={activePage}
                    handleSetPage={handleSetPage}
                    onUserUpdate={setCurrentUser}
                  />
                )}
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
};

export default App;