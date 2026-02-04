import React, { useState, useEffect, useMemo } from 'react';
import type { User, Page } from '../types';
import { StatCard } from './ui/StatCard';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { Card, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { getTeacherDashboardData, getAdminDashboardData, TeacherDashboardData, AdminDashboardData } from '../services/api/dashboard.service';
import { httpClient } from '../services/httpClient';

const getDayName = () => {
    const day = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(new Date());
    return day.charAt(0).toUpperCase() + day.slice(1);
};

const QuickActionCard = React.memo<{ title: string; subtitle: string; icon: string; color: string; onClick: () => void }>(({ title, subtitle, icon, color, onClick }) => {
    // Robust color mapping for v4
    const colorClasses: Record<string, { text: string, bg: string, ring: string }> = {
        'text-green-600': { text: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'group-hover:ring-emerald-200' },
        'text-blue-700': { text: 'text-indigo-600', bg: 'bg-indigo-50', ring: 'group-hover:ring-indigo-200' },
        'text-cyan-600': { text: 'text-sky-600', bg: 'bg-sky-50', ring: 'group-hover:ring-sky-200' },
        'text-indigo-600': { text: 'text-violet-600', bg: 'bg-violet-50', ring: 'group-hover:ring-violet-200' },
        'text-amber-500': { text: 'text-amber-600', bg: 'bg-amber-50', ring: 'group-hover:ring-amber-200' },
        'text-sky-600': { text: 'text-blue-600', bg: 'bg-blue-50', ring: 'group-hover:ring-blue-200' },
    };

    const styles = colorClasses[color] || { text: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'group-hover:ring-emerald-200' };

    return (
        <Card
            className={`text-center transition-all transform hover:-translate-y-2 hover:shadow-2xl flex flex-col justify-center items-center group cursor-pointer border-b-4 border-transparent hover:border-emerald-500`}
            onClick={onClick}
        >
            <div className={`w-16 h-16 rounded-2xl ${styles.bg} flex items-center justify-center mb-4 ring-0 ${styles.ring} transition-all duration-300 group-hover:scale-110`}>
                <i className={`bx ${icon} text-4xl ${styles.text}`}></i>
            </div>
            <div className="font-bold text-slate-800 mb-1">{title}</div>
            <small className="text-slate-400 font-medium">{subtitle}</small>
        </Card>
    );
});

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
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Bonjour, {currentUser.first_name} ! 👋</h2>
                <p className="text-sm sm:text-base text-gray-500">Voici votre tableau de bord d'enseignant.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <Card className="lg:col-span-2" variant="glass">
                    <CardHeader
                        title={`Mon Programme du Jour (${getDayName()})`}
                        icon="bxs-calendar"
                    />
                    {todaySchedule.length > 0 ? (
                        <div className="space-y-3">
                            {todaySchedule.map(session => (
                                <div key={session.id} className="flex items-center gap-4 p-3 bg-emerald-50/50 rounded-lg border border-emerald-100/50">
                                    <div className="font-mono bg-emerald-600 text-white font-bold p-2 rounded-lg text-sm">{session.startTime}</div>
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
                </Card>
                <div className="space-y-6">
                    <StatCard title="Évaluations à Noter" value={pendingEvaluationsCount} icon="bxs-pen" color="border-amber-500" />
                    <Card>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Dernières Moyennes</h3>
                        {recentClassAverages.map(avg => (
                            <div key={avg.className} className="flex justify-between items-center text-sm py-1">
                                <span className="text-gray-600">{avg.className}</span>
                                <span className="font-bold text-slate-800">{avg.average}</span>
                            </div>
                        ))}
                        {recentClassAverages.length === 0 && <p className="text-sm text-gray-500">Aucune note récente.</p>}
                    </Card>
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
    const [realTimeStats, setRealTimeStats] = useState<AdminDashboardData | null>(null);

    const [syncing, setSyncing] = useState(false);

    const fetchDashboardData = async (forceSync: boolean = false) => {
        if (forceSync) setSyncing(true);
        else setIsLoading(true);

        try {
            const result = await getAdminDashboardData(forceSync);
            setData(result);
            setRealTimeStats(result);
        } catch (err) {
            console.error('Data fetch error:', err);
        } finally {
            setIsLoading(false);
            setSyncing(false);
        }
    };

    useEffect(() => {
        const fetchRealTimeStats = async () => {
            try {
                const result = await getAdminDashboardData();
                setRealTimeStats(result);
            } catch (err) {
                console.error('Failed to fetch consolidated stats:', err);
            }
        };

        fetchDashboardData();
        // Refresh every 60 seconds as per strategic plan
        const interval = setInterval(fetchRealTimeStats, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleSync = () => fetchDashboardData(true);

    if (isLoading || !realTimeStats) return <LoadingSpinner />;

    const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');

    // Safety destructuring with fallbacks for legacy or incomplete data
    const {
        students = { total: 0, male: 0, female: 0 },
        teachers = { total: 0 },
        classes = [],
        documents = { total_docs: 0, pending_docs: 0, approved_docs: 0, rejected_docs: 0, missing_docs: 0 },
        classPerformances = [],
        totalRevenue: revenue = 0
    } = (realTimeStats as any) || {};

    // Map legacy fields if the backend hasn't been fully updated or returned the old shape
    const studentsTotal = students?.total ?? (realTimeStats as any)?.studentsCount ?? 0;
    const teachersTotal = teachers?.total ?? (realTimeStats as any)?.teachersCount ?? 0;
    const classesCount = Array.isArray(classes) ? classes.length : ((realTimeStats as any)?.classesCount ?? 0);
    // Unified mapping for robust metrics (v5)
    const pendingDocs = documents?.pending_students ?? documents?.pending_docs ?? 0;
    const missingDocs = documents?.incomplete_folders ?? documents?.missing_docs ?? 0; // Students with incomplete folders (e.g. 97)
    const missingFiles = documents?.total_missing ?? 0; // Absolute file count (e.g. 388)
    const approvedDocs = documents?.approved_docs ?? 0;
    const rejectedDocs = documents?.rejected_docs ?? 0;

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
                    {students.total > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                            <i className='bx bx-check-circle'></i> {isProduction ? 'Connecté au Backend Stratégique Cloudflare' : 'Connecté à la base de données locale'}
                        </p>
                    )}
                </div>
                <Button
                    onClick={handleSync}
                    loading={syncing}
                    icon={syncing ? "bx-sync bx-spin" : "bx-refresh"}
                >
                    <span className="hidden sm:inline">{syncing ? 'Synchronisation...' : 'Actualiser'}</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Élèves Inscrits" value={studentsTotal} icon="bxs-graduation" color="border-emerald-500" />
                <StatCard title="Personnel" value={teachersTotal} icon="bxs-user-badge" color="border-purple-600" />
                <StatCard title="Classes Actives" value={classesCount} icon="bxs-chalkboard" color="border-sky-500" />
                <StatCard title="Dossiers en Attente" value={pendingDocs} icon="bxs-file" color="border-amber-500" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-l-4 border-red-500" padding="sm" variant="white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Dossiers Manquants</p>
                            <p className="text-3xl font-extrabold text-red-600">{missingDocs}</p>
                            <div className="text-[10px] text-red-400 font-bold uppercase mt-1 flex items-center gap-1">
                                <i className='bx bx-file'></i> {missingFiles} fichiers au total
                            </div>
                        </div>
                        <i className='bx bxs-folder-open text-5xl text-red-500 opacity-20'></i>
                    </div>
                </Card>
                <Card className="border-l-4 border-emerald-500" padding="sm" variant="white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Dossiers Complets</p>
                            <p className="text-3xl font-extrabold text-emerald-600">{approvedDocs}</p>
                        </div>
                        <i className='bx bxs-check-shield text-5xl text-emerald-500 opacity-20'></i>
                    </div>
                </Card>
                <Card className="border-l-4 border-orange-500" padding="sm" variant="white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Docs Rejetés</p>
                            <p className="text-3xl font-extrabold text-orange-600">{rejectedDocs}</p>
                        </div>
                        <i className='bx bxs-error-circle text-5xl text-orange-500 opacity-20'></i>
                    </div>
                </Card>
            </div>

            {/* Statistiques Financières */}
            {(revenue > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <Card className="border-l-4 border-emerald-500" padding="sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Revenus Totaux</p>
                                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(revenue)}</p>
                            </div>
                            <i className='bx bxs-wallet text-4xl text-emerald-500 opacity-20'></i>
                        </div>
                    </Card>
                </div>
            )}

            {/* Class Breakdown with Student Counts */}
            <Card variant="glass">
                <CardHeader
                    title="Répartition par Classe"
                    icon="bxs-chalkboard"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classes.length > 0 ? (
                        classes.map(cls => {
                            const occupancyRate = Math.round((cls.student_count / cls.capacity) * 100);
                            const availableSpots = cls.capacity - cls.student_count;
                            const isNearCapacity = occupancyRate >= 80;
                            const isFull = occupancyRate >= 100;

                            return (
                                <Card key={cls.id} variant="white" padding="sm" className="hover:shadow-2xl transition-all border-b-4 border-blue-500 group">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-lg font-bold text-slate-800 uppercase tracking-tight">{cls.class_name}</p>
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full shadow-sm ${isFull ? 'bg-red-500 text-white' :
                                            isNearCapacity ? 'bg-amber-500 text-white' :
                                                'bg-emerald-500 text-white'
                                            }`}>
                                            {occupancyRate}%
                                        </span>
                                    </div>

                                    <div className="flex items-baseline gap-1 mb-4">
                                        <p className="text-4xl font-extrabold text-blue-600">{cls.student_count}</p>
                                        <p className="text-sm text-slate-400 font-bold">/ {cls.capacity} Élèves</p>
                                    </div>

                                    <div className="mb-4">
                                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden shadow-inner font-bold">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ease-out ${isFull ? 'bg-red-500' :
                                                    isNearCapacity ? 'bg-amber-500' :
                                                        'bg-emerald-500'
                                                    }`}
                                                style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                        <p className={`text-xs font-bold uppercase tracking-wider ${isFull ? 'text-red-500' : 'text-emerald-600'}`}>
                                            {isFull ? 'Classe Pleine' : `${availableSpots} places disponibles`}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-medium truncate max-w-[100px]">{cls.teacher_name}</p>
                                    </div>
                                </Card>
                            );
                        })
                    ) : (
                        <p className="text-gray-500 col-span-full text-center py-4">Aucune classe avec des élèves</p>
                    )}
                </div>
            </Card>

            <Card variant="glass">
                <CardHeader
                    title="Performance Académique par Classe"
                    icon="bxs-medal"
                />
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
            </Card>

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
    if (currentUser.role === 'teacher') {
        return <TeacherDashboard currentUser={currentUser} setActivePage={setActivePage} />;
    }

    // For Fondatrice, Directrice, and other admin roles
    return <AdminDashboard setActivePage={setActivePage} />;
};
