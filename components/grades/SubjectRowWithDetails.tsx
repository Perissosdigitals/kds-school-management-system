import React, { useState } from 'react';
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
  IconButton,
  Collapse,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

interface GradeDetailRow {
  type: string;
  value: number;
  maxValue: number;
  coefficient: number;
  date: string;
}

interface SubjectRowProps {
  subject: {
    subjectId: string;
    name: string;
    code: string;
    coefficient: number;
    average: number;
    gradeCount: number;
    minGrade: number;
    maxGrade: number;
    grades?: GradeDetailRow[];
  };
}

export const SubjectRowWithDetails: React.FC<SubjectRowProps> = ({ subject }) => {
  const [expanded, setExpanded] = useState(false);

  const getGradeColor = (average: number) => {
    if (average >= 16) return 'success';
    if (average >= 14) return 'info';
    if (average >= 12) return 'primary';
    if (average >= 10) return 'warning';
    return 'error';
  };

  const calculateTotalCoefficients = () => {
    if (!subject.grades) return 0;
    return subject.grades.reduce((sum, g) => sum + g.coefficient, 0);
  };

  const calculateTotalContribution = () => {
    if (!subject.grades) return 0;
    return subject.grades.reduce(
      (sum, g) => sum + ((g.value / g.maxValue) * 20 * g.coefficient),
      0
    );
  };

  return (
    <>
      <TableRow
        hover
        sx={{ cursor: subject.grades ? 'pointer' : 'default' }}
        onClick={() => subject.grades && setExpanded(!expanded)}
      >
        <TableCell>
          <Box display="flex" alignItems="center" gap={1}>
            {subject.grades && (
              <IconButton size="small">
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {subject.name}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {subject.code}
              </Typography>
            </Box>
          </Box>
        </TableCell>
        <TableCell align="center">{subject.coefficient}</TableCell>
        <TableCell align="center">
          <Tooltip title={`${subject.gradeCount} note${subject.gradeCount > 1 ? 's' : ''}`}>
            <Chip
              label={subject.gradeCount}
              size="small"
              color={subject.gradeCount >= 3 ? 'success' : 'warning'}
              variant="outlined"
            />
          </Tooltip>
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
            color={getGradeColor(subject.average)}
            size="small"
          />
        </TableCell>
        <TableCell align="center">
          <strong>{(subject.average * subject.coefficient).toFixed(2)}</strong>
        </TableCell>
      </TableRow>

      {/* Ligne détaillée des notes (accordion) */}
      {subject.grades && (
        <TableRow>
          <TableCell colSpan={7} sx={{ py: 0, backgroundColor: '#fafafa' }}>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom color="primary" fontWeight="bold">
                  📋 Détail des {subject.gradeCount} note{subject.gradeCount > 1 ? 's' : ''} en{' '}
                  {subject.name}
                </Typography>

                <Table size="small" sx={{ mb: 1 }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                      <TableCell><strong>Type</strong></TableCell>
                      <TableCell><strong>Date</strong></TableCell>
                      <TableCell align="center"><strong>Note brute</strong></TableCell>
                      <TableCell align="center"><strong>Note /20</strong></TableCell>
                      <TableCell align="center"><strong>Coefficient</strong></TableCell>
                      <TableCell align="center"><strong>Contribution</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {subject.grades
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((grade, index) => {
                        const normalized = (grade.value / grade.maxValue) * 20;
                        const contribution = normalized * grade.coefficient;

                        return (
                          <TableRow key={index}>
                            <TableCell>
                              <Chip label={grade.type} size="small" variant="outlined" />
                            </TableCell>
                            <TableCell>
                              {new Date(grade.date).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                              })}
                            </TableCell>
                            <TableCell align="center">
                              {grade.value.toFixed(2)}/{grade.maxValue}
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={normalized.toFixed(2)}
                                size="small"
                                color={
                                  normalized >= 14
                                    ? 'success'
                                    : normalized >= 10
                                    ? 'primary'
                                    : 'error'
                                }
                              />
                            </TableCell>
                            <TableCell align="center">×{grade.coefficient}</TableCell>
                            <TableCell align="center">
                              <Typography variant="body2" fontWeight="medium">
                                {contribution.toFixed(2)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}

                    {/* Ligne de calcul */}
                    <TableRow sx={{ backgroundColor: '#fff9c4' }}>
                      <TableCell colSpan={4} align="right">
                        <Typography variant="body2" fontWeight="bold">
                          SOMME DES CONTRIBUTIONS:
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`Σ = ${calculateTotalCoefficients()}`}
                          size="small"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {calculateTotalContribution().toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>

                    <TableRow sx={{ backgroundColor: '#e8f5e9' }}>
                      <TableCell colSpan={5} align="right">
                        <Typography variant="body2" fontWeight="bold">
                          MOYENNE MATIÈRE (Σ contributions ÷ Σ coefficients):
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body1" fontWeight="bold" color="success.main">
                          {subject.average.toFixed(2)}/20
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <Box
                  sx={{
                    p: 1.5,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 1,
                    borderLeft: '4px solid #2196f3',
                  }}
                >
                  <Typography variant="caption" color="textSecondary">
                    <strong>💡 Explication du calcul:</strong>
                    <br />
                    Moyenne = ({calculateTotalContribution().toFixed(2)}) ÷ (
                    {calculateTotalCoefficients()}) = <strong>{subject.average.toFixed(2)}/20</strong>
                    <br />
                    Cette moyenne compte pour <strong>×{subject.coefficient}</strong> dans la
                    moyenne générale
                  </Typography>
                </Box>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default SubjectRowWithDetails;
