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
  Divider,
  Grid,
  Button,
  CircularProgress,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  EmojiEvents as TrophyIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
} from '@mui/icons-material';

interface ReportCardProps {
  studentId: string;
  trimester: string;
  academicYear: string;
}

// Composant pour afficher une matière avec détails des notes
const SubjectRow: React.FC<{ subject: any; getGradeColor: (avg: number) => string }> = ({ 
  subject, 
  getGradeColor 
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton
            size="small"
            onClick={() => setOpen(!open)}
            disabled={!subject.grades || subject.grades.length === 0}
          >
            {open ? <ArrowUpIcon /> : <ArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Typography variant="body2" fontWeight="medium">
            {subject.name}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {subject.code}
          </Typography>
        </TableCell>
        <TableCell align="center">{subject.coefficient}</TableCell>
        <TableCell align="center">
          <Chip 
            label={subject.gradeCount} 
            size="small" 
            color={subject.gradeCount > 0 ? 'primary' : 'default'}
          />
        </TableCell>
        <TableCell align="center">
          <Typography variant="body2" color="error">
            {subject.minGrade.toFixed(2)}
          </Typography>
        </TableCell>
        <TableCell align="center">
          <Typography variant="body2" color="success.main">
            {subject.maxGrade.toFixed(2)}
          </Typography>
        </TableCell>
        <TableCell align="center">
          <Chip
            label={subject.average.toFixed(2)}
            color={getGradeColor(subject.average) as any}
            size="small"
          />
        </TableCell>
        <TableCell align="center">
          <strong>
            {(subject.average * subject.coefficient).toFixed(2)}
          </strong>
        </TableCell>
      </TableRow>
      
      {/* Détails des notes individuelles */}
      {subject.grades && subject.grades.length > 0 && (
        <TableRow>
          <TableCell colSpan={8} sx={{ py: 0, backgroundColor: '#f9f9f9' }}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ py: 2, px: 4 }}>
                <Typography variant="subtitle2" gutterBottom color="primary">
                  📝 Détail des {subject.gradeCount} note(s) en {subject.name}
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Date</strong></TableCell>
                      <TableCell><strong>Type</strong></TableCell>
                      <TableCell align="center"><strong>Note</strong></TableCell>
                      <TableCell align="center"><strong>Coef.</strong></TableCell>
                      <TableCell align="center"><strong>Note normalisée</strong></TableCell>
                      <TableCell><strong>Appréciation</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {subject.grades.map((grade: any, index: number) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          {new Date(grade.date).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>{grade.type}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${grade.value}/${grade.maxValue}`}
                            size="small"
                            color={getGradeColor(grade.normalizedValue) as any}
                          />
                        </TableCell>
                        <TableCell align="center">{grade.coefficient}</TableCell>
                        <TableCell align="center">
                          <strong>{grade.normalizedValue}/20</strong>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {grade.normalizedValue >= 16 ? '✨ Excellent' :
                             grade.normalizedValue >= 14 ? '👍 Très bien' :
                             grade.normalizedValue >= 12 ? '😊 Bien' :
                             grade.normalizedValue >= 10 ? '🙂 Passable' : '😟 Insuffisant'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export const StudentReportCard: React.FC<ReportCardProps> = ({
  studentId,
  trimester,
  academicYear,
}) => {
  const [reportCard, setReportCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReportCard();
  }, [studentId, trimester, academicYear]);

  const loadReportCard = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/grades/analytics/student/${studentId}/report-card?trimester=${encodeURIComponent(
          trimester
        )}&academicYear=${academicYear}`
      );

      if (!response.ok) {
        throw new Error('Impossible de charger le bulletin');
      }

      const data = await response.json();
      setReportCard(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (average: number) => {
    if (average >= 16) return 'success';
    if (average >= 14) return 'info';
    if (average >= 12) return 'primary';
    if (average >= 10) return 'warning';
    return 'error';
  };

  const getMention = (average: number) => {
    if (average >= 18) return { text: 'Félicitations', color: 'success' };
    if (average >= 16) return { text: 'Très bien', color: 'info' };
    if (average >= 14) return { text: 'Bien', color: 'primary' };
    if (average >= 12) return { text: 'Assez bien', color: 'primary' };
    if (average >= 10) return { text: 'Passable', color: 'warning' };
    return { text: 'Insuffisant', color: 'error' };
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    // TODO: Implémenter export PDF
    alert('Export PDF en cours de développement');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !reportCard) {
    return (
      <Card>
        <CardContent>
          <Typography color="error">
            {error || 'Aucune note disponible pour cette période'}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const mention = getMention(reportCard.generalAverage);

  return (
    <Box className="report-card-container">
      {/* Actions d'impression/export */}
      <Box display="flex" gap={2} mb={2} className="no-print">
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
        >
          Imprimer
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
        >
          Télécharger PDF
        </Button>
      </Box>

      {/* Bulletin */}
      <Card className="report-card">
        <CardContent>
          {/* En-tête */}
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              🎓 BULLETIN SCOLAIRE
            </Typography>
            <Typography variant="h6" color="primary">
              {academicYear} - {trimester}
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Informations élève */}
          <Grid container spacing={2} mb={4}>
            <Grid item xs={6}>
              <Typography variant="body1">
                <strong>Élève:</strong> {reportCard.firstName} {reportCard.lastName}
              </Typography>
              <Typography variant="body1">
                <strong>Classe:</strong> {reportCard.className}
              </Typography>
            </Grid>
            <Grid item xs={6} textAlign="right">
              <Typography variant="body1">
                <strong>Rang:</strong> {reportCard.rank}/{reportCard.totalStudents}
              </Typography>
              <Typography variant="body1">
                <strong>Moyenne générale:</strong>{' '}
                <Chip
                  label={`${reportCard.generalAverage.toFixed(2)}/20`}
                  color={getGradeColor(reportCard.generalAverage)}
                  size="medium"
                />
              </Typography>
            </Grid>
          </Grid>

          {/* Tableau des notes avec détails */}
          <TableContainer component={Paper} elevation={0} sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell width="30px"></TableCell>
                  <TableCell><strong>Matière</strong></TableCell>
                  <TableCell align="center"><strong>Coef.</strong></TableCell>
                  <TableCell align="center"><strong>Notes</strong></TableCell>
                  <TableCell align="center"><strong>Min</strong></TableCell>
                  <TableCell align="center"><strong>Max</strong></TableCell>
                  <TableCell align="center"><strong>Moyenne</strong></TableCell>
                  <TableCell align="center"><strong>Moy. × Coef.</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportCard.subjects.map((subject: any) => (
                  <SubjectRow 
                    key={subject.subjectId} 
                    subject={subject} 
                    getGradeColor={getGradeColor}
                  />
                ))}

                {/* Ligne de total */}
                <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                  <TableCell colSpan={1}>
                    <Typography variant="body1" fontWeight="bold">
                      TOTAL
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <strong>{reportCard.totalCoefficients}</strong>
                  </TableCell>
                  <TableCell colSpan={4} />
                  <TableCell align="center">
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {reportCard.generalAverage.toFixed(2)}/20
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Appréciation générale */}
          <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  <strong>Rang dans la classe:</strong>
                </Typography>
                <Typography variant="h5">
                  {reportCard.rank}
                  <sup>
                    {reportCard.rank === 1 ? 'er' : 'ème'}
                  </sup>{' '}
                  / {reportCard.totalStudents}
                  {reportCard.rank === 1 && (
                    <TrophyIcon sx={{ ml: 1, color: 'gold', verticalAlign: 'middle' }} />
                  )}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  <strong>Mention:</strong>
                </Typography>
                <Chip
                  label={mention.text}
                  color={mention.color as any}
                  size="medium"
                  sx={{ fontSize: '1rem', fontWeight: 'bold', mt: 0.5 }}
                />
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              <strong>APPRÉCIATION GÉNÉRALE:</strong>
            </Typography>
            <Typography variant="body1">
              {reportCard.appreciation}
              {reportCard.generalAverage >= 14 && ' Continuez sur cette voie!'}
              {reportCard.generalAverage >= 10 && reportCard.generalAverage < 14 && ' Bon travail, mais peut mieux faire.'}
              {reportCard.generalAverage < 10 && ' Des efforts soutenus sont nécessaires.'}
            </Typography>
          </Box>

          {/* Signatures */}
          <Grid container spacing={4} mt={4}>
            <Grid item xs={4}>
              <Divider sx={{ mb: 1 }} />
              <Typography variant="caption" textAlign="center" display="block">
                Le Professeur Principal
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Divider sx={{ mb: 1 }} />
              <Typography variant="caption" textAlign="center" display="block">
                Le Directeur
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Divider sx={{ mb: 1 }} />
              <Typography variant="caption" textAlign="center" display="block">
                Signature des Parents
              </Typography>
            </Grid>
          </Grid>

          <Box textAlign="center" mt={4}>
            <Typography variant="caption" color="textSecondary">
              Document généré le {new Date(reportCard.generatedAt).toLocaleString('fr-FR')}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          .report-card {
            box-shadow: none !important;
            page-break-after: always;
          }
          
          .report-card-container {
            margin: 0;
            padding: 20px;
          }
        }
      `}</style>
    </Box>
  );
};

export default StudentReportCard;
