import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Grid,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  School as SchoolIcon,
} from '@mui/icons-material';

interface GradeDetail {
  id: string;
  value: number;
  maxValue: number;
  coefficient: number;
  evaluationType: string;
  evaluationDate: string;
  title?: string;
  comments?: string;
}

interface SubjectGradesDetailProps {
  studentId: string;
  subjectId: string;
  trimester: string;
  academicYear: string;
}

export const SubjectGradesDetail: React.FC<SubjectGradesDetailProps> = ({
  studentId,
  subjectId,
  trimester,
  academicYear,
}) => {
  const [grades, setGrades] = useState<GradeDetail[]>([]);
  const [subjectInfo, setSubjectInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGrades();
  }, [studentId, subjectId, trimester, academicYear]);

  const loadGrades = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/grades?studentId=${studentId}&subjectId=${subjectId}&trimester=${encodeURIComponent(
          trimester
        )}&academicYear=${academicYear}`
      );
      const data = await response.json();
      setGrades(data.data || []);
      
      if (data.data && data.data.length > 0) {
        setSubjectInfo(data.data[0].subject);
      }
    } catch (err) {
      console.error('Erreur chargement notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateWeightedAverage = () => {
    if (grades.length === 0) return 0;

    let totalWeighted = 0;
    let totalCoefficients = 0;

    grades.forEach((grade) => {
      const normalizedValue = (grade.value / grade.maxValue) * 20;
      const coef = grade.coefficient || 1;
      totalWeighted += normalizedValue * coef;
      totalCoefficients += coef;
    });

    return totalCoefficients > 0 ? totalWeighted / totalCoefficients : 0;
  };

  const getGradeColor = (value: number, maxValue: number) => {
    const normalized = (value / maxValue) * 20;
    if (normalized >= 16) return 'success';
    if (normalized >= 14) return 'info';
    if (normalized >= 12) return 'primary';
    if (normalized >= 10) return 'warning';
    return 'error';
  };

  const getTrendIcon = () => {
    if (grades.length < 2) return null;

    const sortedGrades = [...grades].sort(
      (a, b) => new Date(a.evaluationDate).getTime() - new Date(b.evaluationDate).getTime()
    );

    const firstHalf = sortedGrades.slice(0, Math.ceil(sortedGrades.length / 2));
    const secondHalf = sortedGrades.slice(Math.ceil(sortedGrades.length / 2));

    const avgFirst =
      firstHalf.reduce((sum, g) => sum + (g.value / g.maxValue) * 20, 0) / firstHalf.length;
    const avgSecond =
      secondHalf.reduce((sum, g) => sum + (g.value / g.maxValue) * 20, 0) / secondHalf.length;

    const diff = avgSecond - avgFirst;

    if (Math.abs(diff) < 1) return null;
    return diff > 0 ? (
      <TrendingUpIcon color="success" fontSize="small" />
    ) : (
      <TrendingDownIcon color="error" fontSize="small" />
    );
  };

  if (loading) {
    return <LinearProgress />;
  }

  const average = calculateWeightedAverage();
  const minGrade = grades.length > 0
    ? Math.min(...grades.map((g) => (g.value / g.maxValue) * 20))
    : 0;
  const maxGrade = grades.length > 0
    ? Math.max(...grades.map((g) => (g.value / g.maxValue) * 20))
    : 0;

  return (
    <Card>
      <CardContent>
        {/* En-tête avec résumé */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {subjectInfo?.name || 'Matière'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {grades.length} note{grades.length > 1 ? 's' : ''} • Coefficient matière:{' '}
              {subjectInfo?.coefficient || 1}
            </Typography>
          </Box>
          <Box textAlign="right">
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h5" fontWeight="bold" color="primary">
                {average.toFixed(2)}/20
              </Typography>
              {getTrendIcon()}
            </Box>
            <Typography variant="caption" color="textSecondary">
              Moyenne pondérée
            </Typography>
          </Box>
        </Box>

        {/* Statistiques rapides */}
        <Grid container spacing={2} mb={2}>
          <Grid item xs={4}>
            <Paper elevation={0} sx={{ p: 1, bgcolor: '#f5f5f5', textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary">
                Minimum
              </Typography>
              <Typography variant="h6" color="error.main">
                {minGrade.toFixed(2)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper elevation={0} sx={{ p: 1, bgcolor: '#f5f5f5', textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary">
                Maximum
              </Typography>
              <Typography variant="h6" color="success.main">
                {maxGrade.toFixed(2)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper elevation={0} sx={{ p: 1, bgcolor: '#f5f5f5', textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary">
                Écart
              </Typography>
              <Typography variant="h6">
                {(maxGrade - minGrade).toFixed(2)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Tableau détaillé des notes */}
        <TableContainer component={Paper} elevation={0}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Titre</strong></TableCell>
                <TableCell align="center"><strong>Note</strong></TableCell>
                <TableCell align="center"><strong>Note /20</strong></TableCell>
                <TableCell align="center"><strong>Coef.</strong></TableCell>
                <TableCell align="center"><strong>Contribution</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {grades
                .sort(
                  (a, b) =>
                    new Date(b.evaluationDate).getTime() - new Date(a.evaluationDate).getTime()
                )
                .map((grade) => {
                  const normalized = (grade.value / grade.maxValue) * 20;
                  const contribution = normalized * (grade.coefficient || 1);
                  
                  return (
                    <TableRow key={grade.id}>
                      <TableCell>
                        {new Date(grade.evaluationDate).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={grade.evaluationType}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title={grade.comments || ''}>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {grade.title || '-'}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="medium">
                          {grade.value.toFixed(2)}/{grade.maxValue}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={normalized.toFixed(2)}
                          color={getGradeColor(grade.value, grade.maxValue)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`×${grade.coefficient || 1}`}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="bold">
                          {contribution.toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              
              {/* Ligne de total */}
              <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                <TableCell colSpan={5} align="right">
                  <Typography variant="body2" fontWeight="bold">
                    TOTAL DES COEFFICIENTS:
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={grades.reduce((sum, g) => sum + (g.coefficient || 1), 0)}
                    color="primary"
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" fontWeight="bold" color="primary">
                    {grades
                      .reduce(
                        (sum, g) =>
                          sum + ((g.value / g.maxValue) * 20 * (g.coefficient || 1)),
                        0
                      )
                      .toFixed(2)}
                  </Typography>
                </TableCell>
              </TableRow>
              
              {/* Ligne de moyenne */}
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell colSpan={6} align="right">
                  <Typography variant="body1" fontWeight="bold">
                    MOYENNE PONDÉRÉE:
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {average.toFixed(2)}/20
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Explication du calcul */}
        <Box mt={2} p={2} sx={{ backgroundColor: '#f9f9f9', borderRadius: 1 }}>
          <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
            <strong>💡 Calcul de la moyenne pondérée:</strong>
          </Typography>
          <Typography variant="caption" color="textSecondary" component="div">
            1. Chaque note est normalisée sur /20
            <br />
            2. Chaque note normalisée est multipliée par son coefficient
            <br />
            3. On fait la somme de toutes les contributions
            <br />
            4. On divise par la somme des coefficients
            <br />
            <br />
            <strong>Formule:</strong> Moyenne = Σ(Note×Coef) ÷ Σ(Coef) ={' '}
            {grades
              .reduce(
                (sum, g) => sum + ((g.value / g.maxValue) * 20 * (g.coefficient || 1)),
                0
              )
              .toFixed(2)}{' '}
            ÷ {grades.reduce((sum, g) => sum + (g.coefficient || 1), 0)} ={' '}
            <strong>{average.toFixed(2)}/20</strong>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SubjectGradesDetail;
