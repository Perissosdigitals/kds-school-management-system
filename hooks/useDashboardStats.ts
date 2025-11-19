/**
 * Hook personnalisé pour charger et gérer les statistiques du Dashboard
 * Connecte l'interface aux données réelles de la base de données
 */

import { useState, useEffect, useCallback } from 'react';
import { httpClient } from '../services/httpClient';

export interface DashboardStats {
  students: {
    total: number;
    active: number;
    byGrade: Record<string, number>;
    byStatus: Record<string, number>;
  };
  teachers: {
    total: number;
    active: number;
    bySubject: Record<string, number>;
  };
  classes: {
    total: number;
    active: number;
    byLevel: Record<string, number>;
    occupancyRate: number;
  };
  finances: {
    totalRevenue: number;
    totalExpenses: number;
    balance: number;
    pendingPayments: number;
    overduePayments: number;
  };
  attendance: {
    absenceRate: number;
    unjustifiedAbsences: number;
  };
  documents: {
    total: number;
    expired: number;
    expiringSoon: number;
  };
}

interface UseDashboardStatsResult {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDashboardStats(): UseDashboardStatsResult {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Chargement des statistiques du dashboard...');

      // Charger toutes les statistiques en parallèle
      const [
        studentsCount,
        studentsByGrade,
        studentsByStatus,
        teachersCount,
        teachersBySubject,
        classesCount,
        classesByLevel,
        financeCount,
        financeRevenue,
        financeExpenses,
        financeBalance,
        attendanceRate,
        documentsCount,
        documentsExpired,
        documentsExpiring,
      ] = await Promise.all([
        httpClient.get('/students/stats/count').catch(() => ({ data: { total: 0, active: 0 } })),
        httpClient.get('/students/stats/by-grade').catch(() => ({ data: {} })),
        httpClient.get('/students/stats/by-status').catch(() => ({ data: {} })),
        httpClient.get('/teachers/stats/count').catch(() => ({ data: { total: 0, active: 0 } })),
        httpClient.get('/teachers/stats/by-subject').catch(() => ({ data: {} })),
        httpClient.get('/classes/stats/count').catch(() => ({ data: { total: 0, active: 0 } })),
        httpClient.get('/classes/stats/by-level').catch(() => ({ data: {} })),
        httpClient.get('/finance/stats/count').catch(() => ({ data: { pending: 0, overdue: 0 } })),
        httpClient.get('/finance/stats/revenue').catch(() => ({ data: { total: 0 } })),
        httpClient.get('/finance/stats/expenses').catch(() => ({ data: { total: 0 } })),
        httpClient.get('/finance/stats/balance').catch(() => ({ data: { balance: 0 } })),
        httpClient.get('/attendance/stats/absence-rate').catch(() => ({ data: { rate: 0 } })),
        httpClient.get('/documents/stats/count').catch(() => ({ data: { total: 0 } })),
        httpClient.get('/documents/expired').catch(() => ({ data: [] })),
        httpClient.get('/documents/expiring').catch(() => ({ data: [] })),
      ]);

      // Calculer le taux d'occupation des classes
      const totalCapacity = classesCount.data.totalCapacity || 0;
      const totalStudents = studentsCount.data.total || 0;
      const occupancyRate = totalCapacity > 0 ? (totalStudents / totalCapacity) * 100 : 0;

      const dashboardStats: DashboardStats = {
        students: {
          total: studentsCount.data.total || 0,
          active: studentsCount.data.active || 0,
          byGrade: studentsByGrade.data || {},
          byStatus: studentsByStatus.data || {},
        },
        teachers: {
          total: teachersCount.data.total || 0,
          active: teachersCount.data.active || 0,
          bySubject: teachersBySubject.data || {},
        },
        classes: {
          total: classesCount.data.total || 0,
          active: classesCount.data.active || 0,
          byLevel: classesByLevel.data || {},
          occupancyRate: Math.round(occupancyRate * 10) / 10,
        },
        finances: {
          totalRevenue: financeRevenue.data.total || 0,
          totalExpenses: financeExpenses.data.total || 0,
          balance: financeBalance.data.balance || 0,
          pendingPayments: financeCount.data.pending || 0,
          overduePayments: financeCount.data.overdue || 0,
        },
        attendance: {
          absenceRate: attendanceRate.data.rate || 0,
          unjustifiedAbsences: attendanceRate.data.unjustified || 0,
        },
        documents: {
          total: documentsCount.data.total || 0,
          expired: Array.isArray(documentsExpired.data) ? documentsExpired.data.length : 0,
          expiringSoon: Array.isArray(documentsExpiring.data) ? documentsExpiring.data.length : 0,
        },
      };

      setStats(dashboardStats);
      console.log('✅ Statistiques chargées avec succès:', dashboardStats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('❌ Erreur lors du chargement des statistiques:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}

/**
 * Formate un montant en FCFA
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
}

/**
 * Formate un pourcentage
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value * 10) / 10}%`;
}

/**
 * Obtient la couleur selon le taux
 */
export function getOccupancyColor(rate: number): string {
  if (rate < 50) return 'text-yellow-600';
  if (rate < 80) return 'text-green-600';
  if (rate < 95) return 'text-blue-600';
  return 'text-red-600';
}
