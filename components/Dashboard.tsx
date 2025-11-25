import React, { useState, useEffect, useMemo } from 'react';
import type { User, Page } from '../types';
import { StatCard } from './ui/StatCard';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { getTeacherDashboardData, getAdminDashboardData, TeacherDashboardData, AdminDashboardData } from '../services/api/dashboard.service';

const getDayName = () => {
  const day = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(new Date());
  return day.charAt(0).toUpperCase() + day.slice(1);
};

const QuickActionCard = React.memo<{ title: string; subtitle: string; icon: string; color: string; onClick: () => void }>(({ title, subtitle, icon, color, onClick }) => (
  <a href="#" onClick={(e) => { e.preventDefault(); onClick(); }} className="bg-white p-6 rounded-xl shadow-md text-center transition-transform transform hover:-translate-y-1 hover:shadow-lg flex flex-col justify-center items-center">
    <i className={`bx ${icon} text-4xl mb-3 inline-block ${color}`}></i>
    <div className="font-semibold text-slate-800">{title}</div>
    <small className="text-gray-500">{subtitle}</small>
  </a>
));

// --- TEACHER DASHBOARD ---
const TeacherDashboard: React.FC<{ currentUser: User, setActivePage: (page: Page) => void }> = ({ currentUser, setActivePage }) => {
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const result = await getTeacherDashboardData(currentUser.id);
      setData(result);
      setIsLoading(false);
    };
    fetchData();
  }, [currentUser.id]);

  if (isLoading) return <LoadingSpinner />;
  if (!data) return <p>Impossible de charger les données du tableau de bord.</p>;

  const { todaySchedule, pendingEvaluationsCount, recentClassAverages } = data;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Bonjour, {currentUser.name.split(' ')[0]} ! 👋</h2>
        <p className="text-sm sm:text-base text-gray-500">Voici votre tableau de bord d'enseignant.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-xl shadow-md">
           <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <i className='bx bxs-calendar'></i> 
            <span className="truncate">Mon Programme du Jour ({getDayName()})</span>
          </h3>
          {todaySchedule.length > 0 ? (
            <div className="space-y-3">
              {todaySchedule.map(session => (
                <div key={session.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                  <div className="font-mono bg-blue-100 text-blue-700 font-bold p-2 rounded-lg text-sm">{session.startTime}</div>
                  <div>
                    <p className="font-semibold text-slate-800">{session.subject}</p>
                    <p className="text-sm text-gray-500">{session.className} - {session.room}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-8 text-gray-500">
              <i className='bx bx-coffee text-4xl mb-2'></i>
              <p>Aucun cours prévu pour aujourd'hui. Profitez de votre journée !</p>
            </div>
          )}
        </div>
        <div className="space-y-6">
          <StatCard title="Évaluations à Noter" value={pendingEvaluationsCount} icon="bxs-pen" color="border-amber-500" />
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Dernières Moyennes</h3>
            {recentClassAverages.map(avg => (
              <div key={avg.className} className="flex justify-between items-center text-sm py-1">
                <span className="text-gray-600">{avg.className}</span>
                <span className="font-bold text-slate-800">{avg.average}</span>
              </div>
            ))}
             {recentClassAverages.length === 0 && <p className="text-sm text-gray-500">Aucune note récente.</p>}
          </div>
        </div>
      </div>
      
       <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        <QuickActionCard title="Faire l'Appel" subtitle="Accès rapide à la feuille" icon="bxs-calendar-check" color="text-green-600" onClick={() => setActivePage('school-life')} />
        <QuickActionCard title="Saisir les Notes" subtitle="Gérer les évaluations" icon="bxs-pen" color="text-blue-700" onClick={() => setActivePage('grades-management')} />
        <QuickActionCard title="Voir mes Classes" subtitle="Gérer les classes" icon="bxs-chalkboard" color="text-cyan-600" onClick={() => setActivePage('class-management')} />
        <QuickActionCard title="Documentation" subtitle="Guides et manuels" icon="bxs-file-doc" color="text-indigo-600" onClick={() => setActivePage('documentation')} />
      </div>
    </div>
  );
};


// --- ADMIN DASHBOARD ---
const AdminDashboard: React.FC<{ setActivePage: (page: Page) => void }> = ({ setActivePage }) => {
    const [data, setData] = useState<AdminDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [realTimeStats, setRealTimeStats] = useState({
        students: 0,
        teachers: 0,
        classes: 0,
        pendingDocs: 0,
        revenue: 0,
        expenses: 0,
        balance: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Charger les données principales du dashboard
                const result = await getAdminDashboardData();
                setData(result);

                // Charger les statistiques en temps réel en parallèle
                const [studentsRes, teachersRes, classesRes, docsRes, revenueRes, expensesRes, balanceRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'}/students/stats/count`).catch(() => null),
                    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'}/teachers/stats/count`).catch(() => null),
                    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'}/classes/stats/count`).catch(() => null),
                    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'}/documents/expired`).catch(() => null),
                    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'}/finance/stats/revenue`).catch(() => null),
                    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'}/finance/stats/expenses`).catch(() => null),
                    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'}/finance/stats/balance`).catch(() => null),
                ]);

                const students = studentsRes ? await studentsRes.json().catch(() => ({ count: 0 })) : { count: 0 };
                const teachers = teachersRes ? await teachersRes.json().catch(() => ({ count: 0 })) : { count: 0 };
                const classes = classesRes ? await classesRes.json().catch(() => ({ count: 0 })) : { count: 0 };
                const docs = docsRes ? await docsRes.json().catch(() => []) : [];
                const revenue = revenueRes ? await revenueRes.json().catch(() => ({ total: 0 })) : { total: 0 };
                const expenses = expensesRes ? await expensesRes.json().catch(() => ({ total: 0 })) : { total: 0 };
                const balance = balanceRes ? await balanceRes.json().catch(() => ({ balance: 0 })) : { balance: 0 };

                setRealTimeStats({
                    students: students.count || 0,
                    teachers: teachers.count || 0,
                    classes: classes.count || 0,
                    pendingDocs: Array.isArray(docs) ? docs.length : 0,
                    revenue: revenue.total || 0,
                    expenses: expenses.total || 0,
                    balance: balance.balance || 0,
                });

                console.log('✅ Statistiques en temps réel chargées:', {
                    étudiants: students.count,
                    enseignants: teachers.count,
                    classes: classes.count,
                    revenus: revenue.total,
                });
            } catch (error) {
                console.error('❌ Erreur chargement dashboard:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) return <LoadingSpinner />;
    if (!data) return <p>Impossible de charger les données du tableau de bord.</p>;

    const { totalStudents, totalStaff, schoolOverallAverage, totalEvaluations, classPerformances } = data;
    
    // Utiliser les stats en temps réel si disponibles, sinon les données mockées
    const displayStudents = realTimeStats.students > 0 ? realTimeStats.students : totalStudents;
    const displayTeachers = realTimeStats.teachers > 0 ? realTimeStats.teachers : totalStaff;
    const displayClasses = realTimeStats.classes > 0 ? realTimeStats.classes : totalEvaluations;

    // Formater les montants
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount) + ' FCFA';
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Bienvenue à l'École KSP ! 👋</h2>
                    <p className="text-gray-500">Tableau de Bord Administratif - Données en Temps Réel</p>
                    {realTimeStats.students > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                            <i className='bx bx-check-circle'></i> Connecté à la base de données locale
                        </p>
                    )}
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title="Actualiser les statistiques"
                >
                    <i className='bx bx-refresh'></i>
                    <span className="hidden sm:inline">Actualiser</span>
                </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Élèves Inscrits" value={displayStudents} icon="bxs-graduation" color="border-blue-700" />
                <StatCard title="Personnel" value={displayTeachers} icon="bxs-user-badge" color="border-purple-600" />
                <StatCard title="Classes Actives" value={displayClasses} icon="bxs-chalkboard" color="border-green-600" />
                <StatCard title="Docs en Attente" value={realTimeStats.pendingDocs} icon="bxs-file" color="border-amber-500" />
            </div>

            {/* Statistiques Financières */}
            {(realTimeStats.revenue > 0 || realTimeStats.expenses > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Revenus Totaux</p>
                                <p className="text-2xl font-bold text-green-600">{formatCurrency(realTimeStats.revenue)}</p>
                            </div>
                            <i className='bx bxs-wallet text-4xl text-green-500 opacity-20'></i>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Dépenses Totales</p>
                                <p className="text-2xl font-bold text-red-600">{formatCurrency(realTimeStats.expenses)}</p>
                            </div>
                            <i className='bx bxs-receipt text-4xl text-red-500 opacity-20'></i>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Solde</p>
                                <p className={`text-2xl font-bold ${realTimeStats.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                    {formatCurrency(realTimeStats.balance)}
                                </p>
                            </div>
                            <i className='bx bxs-bank text-4xl text-blue-500 opacity-20'></i>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <i className='bx bxs-medal'></i> Performance Académique par Classe
                </h3>
                <div className="space-y-4">
                    {classPerformances.map(cls => (
                         <div key={cls.id}>
                            <div className="flex justify-between items-center mb-1 text-sm">
                                <span className="font-semibold text-slate-700">{cls.name}</span>
                                <span className="font-bold text-slate-800">{cls.average > 0 ? `${cls.average.toFixed(1)}%` : 'N/A'}</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2.5">
                                <div 
                                    className={`h-2.5 rounded-full ${cls.average > 75 ? 'bg-green-600' : cls.average > 50 ? 'bg-amber-500' : 'bg-red-600'}`}
                                    style={{ width: `${cls.average}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                <QuickActionCard title="Nouvel Élève" subtitle="Inscrire un élève" icon="bxs-user-plus" color="text-blue-700" onClick={() => setActivePage('student-registration')} />
                <QuickActionCard title="Gestion Élèves" subtitle="Gérer les données" icon="bxs-group" color="text-green-600" onClick={() => setActivePage('student-management')} />
                <QuickActionCard title="Emploi du Temps" subtitle="Gérer les horaires" icon="bxs-time-five" color="text-sky-600" onClick={() => setActivePage('school-life')} />
                <QuickActionCard title="Finances" subtitle="Suivi des paiements" icon="bxs-dollar-circle" color="text-amber-500" onClick={() => setActivePage('finances')} />
                <QuickActionCard title="Gestion Notes" subtitle="Suivi académique" icon="bxs-pen" color="text-indigo-600" onClick={() => setActivePage('grades-management')} />
            </div>
        </div>
    );
};


export const Dashboard: React.FC<{ setActivePage: (page: Page) => void, currentUser: User }> = ({ setActivePage, currentUser }) => {
    if (currentUser.role === 'Enseignant') {
        return <TeacherDashboard currentUser={currentUser} setActivePage={setActivePage} />;
    }
    
    // For Fondatrice, Directrice, and other admin roles
    return <AdminDashboard setActivePage={setActivePage} />;
};
