import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  RemoveCircleOutline as StableIcon,
  Warning as WarningIcon,
  EmojiEvents as TrophyIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TeacherDashboardProps {
  classId: string;
  teacherId: string;
  academicYear: string;
}

const COLORS = ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0'];

export const TeacherGradeDashboard: React.FC<TeacherDashboardProps> = ({
  classId,
  teacherId,
  academicYear,
}) => {
  const [trimester, setTrimester] = useState('Premier trimestre');
  const [classStats, setClassStats] = useState<any>(null);
  const [ranking, setRanking] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [classId, trimester, academicYear]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Charger les statistiques de classe
      const statsResponse = await fetch(
        `/api/grades/analytics/class/${classId}/statistics?trimester=${encodeURIComponent(
          trimester
        )}&academicYear=${academicYear}`
      );
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setClassStats(stats);
      }

      // Charger le classement
      const rankingResponse = await fetch(
        `/api/grades/analytics/class/${classId}/ranking?trimester=${encodeURIComponent(
          trimester
        )}&academicYear=${academicYear}`
      );
      if (rankingResponse.ok) {
        const rankingData = await rankingResponse.json();
        setRanking(rankingData);
      }

      // Charger les alertes
      const alertsResponse = await fetch(
        `/api/grades/analytics/class/${classId}/alerts?trimester=${encodeURIComponent(
          trimester
        )}&academicYear=${academicYear}`
      );
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon color="success" />;
      case 'down':
        return <TrendingDownIcon color="error" />;
      default:
        return <StableIcon color="action" />;
    }
  };

  const getGradeColor = (average: number) => {
    if (average >= 16) return 'success';
    if (average >= 14) return 'info';
    if (average >= 12) return 'primary';
    if (average >= 10) return 'warning';
    return 'error';
  };

  const getAlertSeverity = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      default:
        return 'info';
    }
  };

  // Préparer les données pour les graphiques
  const distributionData = classStats?.subjectStatistics
    ?.map((subject: any) => ({
      name: subject.subjectName.length > 15
        ? subject.subjectName.substring(0, 15) + '...'
        : subject.subjectName,
      moyenne: subject.average,
      reussite: subject.successRate,
    }))
    .slice(0, 8) || [];

  const gradeRangesData = [
    { name: 'Excellent (≥16)', value: 0, color: '#4caf50' },
    { name: 'Bien (14-16)', value: 0, color: '#2196f3' },
    { name: 'Assez bien (12-14)', value: 0, color: '#ff9800' },
    { name: 'Passable (10-12)', value: 0, color: '#ff5722' },
    { name: 'Insuffisant (<10)', value: 0, color: '#f44336' },
  ];

  if (ranking.length > 0) {
    ranking.forEach((student) => {
      const avg = student.generalAverage;
      if (avg >= 16) gradeRangesData[0].value++;
      else if (avg >= 14) gradeRangesData[1].value++;
      else if (avg >= 12) gradeRangesData[2].value++;
      else if (avg >= 10) gradeRangesData[3].value++;
      else gradeRangesData[4].value++;
    });
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* En-tête avec sélecteur de trimestre */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          📊 Tableau de Bord Pédagogique
        </Typography>

        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel>Trimestre</InputLabel>
          <Select value={trimester} onChange={(e) => setTrimester(e.target.value)}>
            <MenuItem value="Premier trimestre">Premier trimestre</MenuItem>
            <MenuItem value="Deuxième trimestre">Deuxième trimestre</MenuItem>
            <MenuItem value="Troisième trimestre">Troisième trimestre</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Statistiques générales */}
      {classStats && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  📈 Moyenne Générale
                </Typography>
                <Typography variant="h4" component="div" fontWeight="bold">
                  {classStats.averageGeneral.toFixed(2)}/20
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Médiane: {classStats.medianGeneral.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  ✅ Taux de Réussite
                </Typography>
                <Typography variant="h4" component="div" fontWeight="bold" color="success.main">
                  {classStats.successRate}%
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {Math.round((classStats.successRate / 100) * classStats.totalStudents)} élèves ≥ 10
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  🏆 Taux d'Excellence
                </Typography>
                <Typography variant="h4" component="div" fontWeight="bold" color="primary">
                  {classStats.excellenceRate}%
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {Math.round((classStats.excellenceRate / 100) * classStats.totalStudents)} élèves ≥ 14
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  👥 Total Élèves
                </Typography>
                <Typography variant="h4" component="div" fontWeight="bold">
                  {classStats.totalStudents}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Écart-type: {classStats.standardDeviation.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Graphiques */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 Moyennes par Matière
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis domain={[0, 20]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="moyenne" fill="#2196f3" name="Moyenne (/20)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎯 Distribution Notes
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={gradeRangesData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {gradeRangesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alertes élèves */}
      {alerts.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ⚠️ Alertes et Suivis ({alerts.length})
            </Typography>

            <Grid container spacing={2}>
              {alerts.slice(0, 6).map((alert, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Alert
                    severity={getAlertSeverity(alert.severity)}
                    icon={
                      alert.alertType === 'excellence' ? <TrophyIcon /> : <WarningIcon />
                    }
                  >
                    <Typography variant="subtitle2" fontWeight="bold">
                      {alert.studentName}
                    </Typography>
                    <Typography variant="body2">{alert.message}</Typography>
                  </Alert>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Classement de la classe */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🏅 Classement de la Classe
          </Typography>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Rang</TableCell>
                  <TableCell>Élève</TableCell>
                  <TableCell>Moyenne</TableCell>
                  <TableCell>Appréciation</TableCell>
                  <TableCell>Progression</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ranking.slice(0, 15).map((student) => (
                  <TableRow key={student.studentId}>
                    <TableCell>
                      <Chip
                        label={student.rank}
                        color={student.rank <= 3 ? 'warning' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {student.firstName} {student.lastName}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${student.generalAverage.toFixed(2)}/20`}
                        color={getGradeColor(student.generalAverage)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{student.appreciation}</Typography>
                    </TableCell>
                    <TableCell>
                      {student.progressionTrend && getTrendIcon(student.progressionTrend)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TeacherGradeDashboard;
