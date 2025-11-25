import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
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
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  RemoveCircleOutline as StableIcon,
} from '@mui/icons-material';

interface Grade {
  id?: string;
  studentId: string;
  studentName?: string;
  subjectId: string;
  subjectName?: string;
  teacherId: string;
  evaluationType: string;
  value: number;
  maxValue: number;
  coefficient: number;
  trimester: string;
  academicYear: string;
  evaluationDate: string;
  title?: string;
  comments?: string;
  visibleToParents: boolean;
}

interface GradeEntryProps {
  classId: string;
  subjectId?: string;
  teacherId: string;
  academicYear: string;
  onGradeSaved?: () => void;
}

const evaluationTypes = [
  'Devoir',
  'Interrogation',
  'Examen',
  'Contrôle continu',
  'Projet',
  'Oral',
];

const trimesters = [
  'Premier trimestre',
  'Deuxième trimestre',
  'Troisième trimestre',
];

export const GradeEntryForm: React.FC<GradeEntryProps> = ({
  classId,
  subjectId,
  teacherId,
  academicYear,
  onGradeSaved,
}) => {
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [newGrade, setNewGrade] = useState<Partial<Grade>>({
    evaluationType: 'Devoir',
    maxValue: 20,
    coefficient: 1,
    trimester: 'Premier trimestre',
    academicYear,
    teacherId,
    visibleToParents: true,
    evaluationDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadStudents();
    loadSubjects();
    if (subjectId) {
      setNewGrade((prev) => ({ ...prev, subjectId }));
      loadGrades();
    }
  }, [classId, subjectId]);

  const loadStudents = async () => {
    try {
      const response = await fetch(`/api/students?classId=${classId}&isActive=true`);
      const data = await response.json();
      setStudents(data.data || []);
    } catch (err) {
      setError('Erreur lors du chargement des élèves');
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await fetch('/api/subjects?isActive=true');
      const data = await response.json();
      setSubjects(data.data || []);
    } catch (err) {
      setError('Erreur lors du chargement des matières');
    }
  };

  const loadGrades = async () => {
    if (!subjectId) return;
    try {
      setLoading(true);
      const response = await fetch(
        `/api/grades?subjectId=${subjectId}&academicYear=${academicYear}`
      );
      const data = await response.json();
      setGrades(data.data || []);
    } catch (err) {
      setError('Erreur lors du chargement des notes');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGrade = async () => {
    if (!newGrade.studentId || !newGrade.subjectId || newGrade.value === undefined) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGrade),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'enregistrement');
      }

      setSuccess('Note enregistrée avec succès!');
      loadGrades();
      
      // Reset form
      setNewGrade({
        evaluationType: 'Devoir',
        maxValue: 20,
        coefficient: 1,
        trimester: newGrade.trimester,
        academicYear,
        teacherId,
        visibleToParents: true,
        evaluationDate: new Date().toISOString().split('T')[0],
        subjectId: newGrade.subjectId,
      });

      if (onGradeSaved) onGradeSaved();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkEntry = async () => {
    // Permettre la saisie rapide pour toute une classe
    const bulkGrades = students.map((student) => ({
      studentId: student.id,
      subjectId: newGrade.subjectId,
      teacherId: newGrade.teacherId,
      evaluationType: newGrade.evaluationType,
      value: 0, // À saisir individuellement
      maxValue: newGrade.maxValue || 20,
      coefficient: newGrade.coefficient || 1,
      trimester: newGrade.trimester,
      academicYear: newGrade.academicYear,
      evaluationDate: newGrade.evaluationDate,
      title: newGrade.title,
      visibleToParents: true,
    }));

    // TODO: Implémenter interface de saisie rapide
    console.log('Saisie en masse:', bulkGrades);
  };

  const getGradeColor = (value: number, maxValue: number = 20) => {
    const normalized = (value / maxValue) * 20;
    if (normalized >= 16) return 'success';
    if (normalized >= 14) return 'info';
    if (normalized >= 12) return 'primary';
    if (normalized >= 10) return 'warning';
    return 'error';
  };

  const getAppreciation = (value: number, maxValue: number = 20) => {
    const normalized = (value / maxValue) * 20;
    if (normalized >= 18) return 'Excellent';
    if (normalized >= 16) return 'Très bien';
    if (normalized >= 14) return 'Bien';
    if (normalized >= 12) return 'Assez bien';
    if (normalized >= 10) return 'Passable';
    if (normalized >= 8) return 'Insuffisant';
    return 'Très insuffisant';
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📝 Saisie de Note
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Élève</InputLabel>
                <Select
                  value={newGrade.studentId || ''}
                  onChange={(e) =>
                    setNewGrade({ ...newGrade, studentId: e.target.value })
                  }
                >
                  {students.map((student) => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.first_name} {student.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Matière</InputLabel>
                <Select
                  value={newGrade.subjectId || ''}
                  onChange={(e) =>
                    setNewGrade({ ...newGrade, subjectId: e.target.value })
                  }
                  disabled={!!subjectId}
                >
                  {subjects.map((subject) => (
                    <MenuItem key={subject.id} value={subject.id}>
                      {subject.name} (Coef. {subject.coefficient})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Type d'évaluation</InputLabel>
                <Select
                  value={newGrade.evaluationType || 'Devoir'}
                  onChange={(e) =>
                    setNewGrade({ ...newGrade, evaluationType: e.target.value })
                  }
                >
                  {evaluationTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Trimestre</InputLabel>
                <Select
                  value={newGrade.trimester || ''}
                  onChange={(e) =>
                    setNewGrade({ ...newGrade, trimester: e.target.value })
                  }
                >
                  {trimesters.map((trim) => (
                    <MenuItem key={trim} value={trim}>
                      {trim}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Date d'évaluation"
                type="date"
                value={newGrade.evaluationDate || ''}
                onChange={(e) =>
                  setNewGrade({ ...newGrade, evaluationDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Note"
                type="number"
                value={newGrade.value || ''}
                onChange={(e) =>
                  setNewGrade({ ...newGrade, value: parseFloat(e.target.value) })
                }
                inputProps={{ min: 0, max: 20, step: 0.25 }}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Note maximale"
                type="number"
                value={newGrade.maxValue || 20}
                onChange={(e) =>
                  setNewGrade({ ...newGrade, maxValue: parseFloat(e.target.value) })
                }
                inputProps={{ min: 1, max: 100 }}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Coefficient"
                type="number"
                value={newGrade.coefficient || 1}
                onChange={(e) =>
                  setNewGrade({ ...newGrade, coefficient: parseFloat(e.target.value) })
                }
                inputProps={{ min: 0.5, max: 5, step: 0.5 }}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              {newGrade.value !== undefined && (
                <Box textAlign="center" pt={1}>
                  <Chip
                    label={`${getAppreciation(newGrade.value, newGrade.maxValue || 20)}`}
                    color={getGradeColor(newGrade.value, newGrade.maxValue || 20)}
                    size="medium"
                  />
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Titre de l'évaluation (optionnel)"
                value={newGrade.title || ''}
                onChange={(e) =>
                  setNewGrade({ ...newGrade, title: e.target.value })
                }
                placeholder="Ex: Devoir de Mathématiques - Chapitre 3"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Commentaires (optionnel)"
                value={newGrade.comments || ''}
                onChange={(e) =>
                  setNewGrade({ ...newGrade, comments: e.target.value })
                }
                placeholder="Appréciation pédagogique..."
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveGrade}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Enregistrer'}
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleBulkEntry}
                  disabled={!newGrade.subjectId}
                >
                  Saisie rapide classe
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Liste des notes récentes */}
      {grades.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 Notes Récentes
            </Typography>

            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Élève</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Note</TableCell>
                    <TableCell>Coef.</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Appréciation</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {grades.slice(0, 10).map((grade) => (
                    <TableRow key={grade.id}>
                      <TableCell>{grade.studentName}</TableCell>
                      <TableCell>{grade.evaluationType}</TableCell>
                      <TableCell>
                        <Chip
                          label={`${grade.value}/${grade.maxValue}`}
                          color={getGradeColor(grade.value, grade.maxValue)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{grade.coefficient}</TableCell>
                      <TableCell>
                        {new Date(grade.evaluationDate).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        {getAppreciation(grade.value, grade.maxValue)}
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="primary">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default GradeEntryForm;
