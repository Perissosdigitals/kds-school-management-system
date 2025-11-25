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
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  CompareArrows as CompareIcon,
  FileDownload as ExportIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AdminDashboardProps {
  schoolId: string;
  academicYear: string;
}

export const AdminGradeDashboard: React.FC<AdminDashboardProps> = ({
  schoolId,
  academicYear,
}) => {
  const [trimester, setTrimester] = useState('Premier trimestre');
  const [classes, setClasses] = useState<any[]>([]);
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClasses();
  }, [schoolId]);

  useEffect(() => {
    if (classes.length > 0) {
      loadComparison();
    }
  }, [classes, trimester, academicYear]);

  const loadClasses = async () => {
    try {
      const response = await fetch('/api/classes?isActive=true');
      const data = await response.json();
      setClasses(data.data || []);
    } catch (err: any) {
      setError('Erreur lors du chargement des classes');
    }
  };

  const loadComparison = async () => {
    setLoading(true);
    setError(null);

    try {
      const classIds = classes.map((c) => c.id);
      const response = await fetch('/api/grades/analytics/classes/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classIds,
          trimester,
          academicYear,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setComparison(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    // TODO: Implémenter export Excel/CSV
    alert('Export en cours de développement');
  };

  const getGradeColor = (average: number) => {
    if (average >= 14) return 'success';
    if (average >= 12) return 'info';
    if (average >= 10) return 'warning';
    return 'error';
  };

  // Préparer données pour graphiques
  const chartData = comparison?.classes?.map((cls: any) => ({
    classe: cls.className,
    moyenne: cls.averageGeneral,
    mediane: cls.medianGeneral,
    reussite: cls.successRate,
    excellence: cls.excellenceRate,
  })) || [];

  // Données radar pour comparaison multi-critères
  const radarData = comparison?.classes?.slice(0, 5).map((cls: any) => ({
    subject: cls.className,
    moyenne: cls.averageGeneral,
    reussite: cls.successRate / 5, // Normaliser sur 20
    excellence: cls.excellenceRate / 5, // Normaliser sur 20
  })) || [];

  if (loading && !comparison) {
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

      {/* En-tête */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          🏫 Dashboard Administration - Vue d'Ensemble
        </Typography>

        <Box display="flex" gap={2}>
          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel>Trimestre</InputLabel>
            <Select value={trimester} onChange={(e) => setTrimester(e.target.value)}>
              <MenuItem value="Premier trimestre">Premier trimestre</MenuItem>
              <MenuItem value="Deuxième trimestre">Deuxième trimestre</MenuItem>
              <MenuItem value="Troisième trimestre">Troisième trimestre</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={handleExport}
          >
            Exporter
          </Button>
        </Box>
      </Box>

      {/* Statistiques globales */}
      {comparison && (
        <>
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    📚 Classes Actives
                  </Typography>
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {comparison.classes.length}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Total élèves:{' '}
                    {comparison.classes.reduce(
                      (sum: number, c: any) => sum + c.totalStudents,
                      0
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    📊 Moyenne Générale École
                  </Typography>
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {(
                      comparison.classes.reduce(
                        (sum: number, c: any) => sum + c.averageGeneral,
                        0
                      ) / comparison.classes.length
                    ).toFixed(2)}
                    /20
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Sur {comparison.classes.length} classes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    ✅ Taux Réussite Moyen
                  </Typography>
                  <Typography
                    variant="h4"
                    component="div"
                    fontWeight="bold"
                    color="success.main"
                  >
                    {(
                      comparison.classes.reduce(
                        (sum: number, c: any) => sum + c.successRate,
                        0
                      ) / comparison.classes.length
                    ).toFixed(1)}
                    %
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Élèves avec moyenne ≥ 10
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    🏆 Taux Excellence Moyen
                  </Typography>
                  <Typography
                    variant="h4"
                    component="div"
                    fontWeight="bold"
                    color="primary"
                  >
                    {(
                      comparison.classes.reduce(
                        (sum: number, c: any) => sum + c.excellenceRate,
                        0
                      ) / comparison.classes.length
                    ).toFixed(1)}
                    %
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Élèves avec moyenne ≥ 14
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Graphiques de comparaison */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📊 Comparaison Moyennes par Classe
                  </Typography>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="classe" angle={-45} textAnchor="end" height={100} />
                      <YAxis domain={[0, 20]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="moyenne" fill="#2196f3" name="Moyenne" />
                      <Bar dataKey="mediane" fill="#4caf50" name="Médiane" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    🎯 Taux de Réussite
                  </Typography>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="classe" type="category" width={80} />
                      <Tooltip />
                      <Bar dataKey="reussite" fill="#4caf50" name="Réussite %" />
                      <Bar dataKey="excellence" fill="#ff9800" name="Excellence %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Graphique d'évolution temporelle */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📈 Évolution des Performances
              </Typography>
              <Typography variant="caption" color="textSecondary" gutterBottom display="block">
                Comparaison des moyennes entre les trimestres (à venir)
              </Typography>
              <Box height={300} display="flex" alignItems="center" justifyContent="center">
                <Typography color="textSecondary">
                  Nécessite les données des 3 trimestres pour afficher la progression
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Tableau détaillé */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📋 Tableau Récapitulatif Détaillé
              </Typography>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell><strong>Classe</strong></TableCell>
                      <TableCell align="center"><strong>Effectif</strong></TableCell>
                      <TableCell align="center"><strong>Moyenne</strong></TableCell>
                      <TableCell align="center"><strong>Médiane</strong></TableCell>
                      <TableCell align="center"><strong>Taux Réussite</strong></TableCell>
                      <TableCell align="center"><strong>Taux Excellence</strong></TableCell>
                      <TableCell align="center"><strong>Position</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {comparison.classes
                      .sort((a: any, b: any) => b.averageGeneral - a.averageGeneral)
                      .map((cls: any, index: number) => (
                        <TableRow key={cls.classId}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {cls.className}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">{cls.totalStudents}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={cls.averageGeneral.toFixed(2)}
                              color={getGradeColor(cls.averageGeneral)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            {cls.medianGeneral.toFixed(2)}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${cls.successRate}%`}
                              color={
                                cls.successRate >= 80
                                  ? 'success'
                                  : cls.successRate >= 60
                                  ? 'info'
                                  : 'warning'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${cls.excellenceRate}%`}
                              color={
                                cls.excellenceRate >= 30
                                  ? 'success'
                                  : cls.excellenceRate >= 15
                                  ? 'info'
                                  : 'default'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${index + 1}/${comparison.classes.length}`}
                              color={index < 3 ? 'warning' : 'default'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default AdminGradeDashboard;
