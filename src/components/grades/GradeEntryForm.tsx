import React, { useState, useEffect } from 'react';
import { GradesService } from '../../services/api/grades.service';
import { ClassesService } from '../../services/api/classes.service';
import { SubjectsService } from '../../services/api/subjects.service';
import type { Student, Subject, SchoolClass, CreateGradeDto } from '../../types';

interface GradeEntryFormProps {
  teacherId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface GradeEntry {
  studentId: string;
  value: string;
  comments?: string;
}

export const GradeEntryForm: React.FC<GradeEntryFormProps> = ({
  teacherId,
  onSuccess,
  onError,
}) => {
  // State
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [gradeEntries, setGradeEntries] = useState<Record<string, GradeEntry>>({});
  
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTrimester, setSelectedTrimester] = useState<string>('Trimestre 1');
  const [evaluationType, setEvaluationType] = useState<string>('Devoir Surveillé');
  const [evaluationTitle, setEvaluationTitle] = useState<string>('');
  const [evaluationDate, setEvaluationDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [maxValue, setMaxValue] = useState<number>(20);
  const [coefficient, setCoefficient] = useState<number>(1);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Load teacher's classes
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const response = await ClassesService.getAll({ teacherId });
        setClasses(response);
      } catch (err) {
        setError('Erreur lors du chargement des classes');
        console.error(err);
      }
    };
    
    if (teacherId) {
      loadClasses();
    }
  }, [teacherId]);

  // Load subjects when class is selected
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        if (selectedClass) {
          const classData = classes.find(c => c.id === selectedClass);
          if (classData) {
            const response = await SubjectsService.getAll({ 
              gradeLevel: classData.level 
            });
            setSubjects(response);
          }
        }
      } catch (err) {
        setError('Erreur lors du chargement des matières');
        console.error(err);
      }
    };
    
    if (selectedClass) {
      loadSubjects();
    }
  }, [selectedClass, classes]);

  // Load students when class is selected
  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedClass) return;
      
      setLoadingStudents(true);
      try {
        const response = await ClassesService.getStudents(selectedClass);
        setStudents(response);
        
        // Initialize grade entries
        const entries: Record<string, GradeEntry> = {};
        response.forEach((student: Student) => {
          entries[student.id] = {
            studentId: student.id,
            value: '',
            comments: '',
          };
        });
        setGradeEntries(entries);
      } catch (err) {
        setError('Erreur lors du chargement des élèves');
        console.error(err);
      } finally {
        setLoadingStudents(false);
      }
    };
    
    loadStudents();
  }, [selectedClass]);

  // Handle grade value change
  const handleGradeChange = (studentId: string, field: keyof GradeEntry, value: string) => {
    setGradeEntries(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  // Validate grade value
  const validateGrade = (value: string): boolean => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return false;
    if (numValue < 0 || numValue > maxValue) return false;
    return true;
  };

  // Submit grades
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!selectedClass || !selectedSubject) {
      setError('Veuillez sélectionner une classe et une matière');
      return;
    }
    
    if (!evaluationTitle.trim()) {
      setError('Veuillez saisir un titre pour l\'évaluation');
      return;
    }

    // Filter valid grades
    const validGrades = Object.values(gradeEntries)
      .filter(entry => entry.value.trim() !== '')
      .map(entry => ({
        studentId: entry.studentId,
        subjectId: selectedSubject,
        teacherId: teacherId,
        evaluationType,
        value: parseFloat(entry.value),
        maxValue,
        coefficient,
        trimester: selectedTrimester,
        academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
        evaluationDate: new Date(evaluationDate).toISOString(),
        title: evaluationTitle,
        comments: entry.comments || undefined,
        visibleToParents: true,
      } as CreateGradeDto));

    // Validate all grades
    for (const grade of validGrades) {
      if (!validateGrade(grade.value.toString())) {
        setError(`Note invalide pour un élève: ${grade.value}. Doit être entre 0 et ${maxValue}`);
        return;
      }
    }

    if (validGrades.length === 0) {
      setError('Veuillez saisir au moins une note');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Bulk create grades
      await GradesService.createBulk(validGrades);
      
      setSuccess(`${validGrades.length} note(s) enregistrée(s) avec succès!`);
      
      // Reset form
      const entries: Record<string, GradeEntry> = {};
      students.forEach((student: Student) => {
        entries[student.id] = {
          studentId: student.id,
          value: '',
          comments: '',
        };
      });
      setGradeEntries(entries);
      setEvaluationTitle('');
      
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Erreur lors de l\'enregistrement des notes';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grade-entry-form bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Saisie des Notes
      </h2>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p className="font-medium">Erreur</p>
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
          <p className="font-medium">Succès</p>
          <p>{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Selection Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Class Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Classe *
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Sélectionner une classe</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} - {cls.level}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Matière *
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={!selectedClass}
            >
              <option value="">Sélectionner une matière</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} (Coef. {subject.coefficient})
                </option>
              ))}
            </select>
          </div>

          {/* Trimester Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trimestre *
            </label>
            <select
              value={selectedTrimester}
              onChange={(e) => setSelectedTrimester(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Trimestre 1">Trimestre 1</option>
              <option value="Trimestre 2">Trimestre 2</option>
              <option value="Trimestre 3">Trimestre 3</option>
            </select>
          </div>

          {/* Evaluation Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type d'évaluation *
            </label>
            <select
              value={evaluationType}
              onChange={(e) => setEvaluationType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Devoir Surveillé">Devoir Surveillé</option>
              <option value="Composition">Composition</option>
              <option value="Interrogation">Interrogation</option>
              <option value="Oral">Oral</option>
              <option value="Travail Pratique">Travail Pratique</option>
              <option value="Contrôle Continu">Contrôle Continu</option>
            </select>
          </div>

          {/* Evaluation Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre de l'évaluation *
            </label>
            <input
              type="text"
              value={evaluationTitle}
              onChange={(e) => setEvaluationTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: DS Équations du 1er degré"
              required
            />
          </div>

          {/* Evaluation Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={evaluationDate}
              onChange={(e) => setEvaluationDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Max Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note sur *
            </label>
            <input
              type="number"
              value={maxValue}
              onChange={(e) => setMaxValue(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="100"
              required
            />
          </div>

          {/* Coefficient */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coefficient *
            </label>
            <input
              type="number"
              value={coefficient}
              onChange={(e) => setCoefficient(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="10"
              required
            />
          </div>
        </div>

        {/* Students Grades Table */}
        {selectedClass && selectedSubject && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Notes des élèves ({students.length})
            </h3>
            
            {loadingStudents ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-600">Chargement des élèves...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nom & Prénom
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Note / {maxValue}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Commentaire
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student, index) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {student.lastName} {student.firstName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.registrationNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            value={gradeEntries[student.id]?.value || ''}
                            onChange={(e) =>
                              handleGradeChange(student.id, 'value', e.target.value)
                            }
                            className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                            step="0.25"
                            min="0"
                            max={maxValue}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={gradeEntries[student.id]?.comments || ''}
                            onChange={(e) =>
                              handleGradeChange(student.id, 'comments', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Commentaire (optionnel)"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-6 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              // Reset form
              const entries: Record<string, GradeEntry> = {};
              students.forEach((student: Student) => {
                entries[student.id] = {
                  studentId: student.id,
                  value: '',
                  comments: '',
                };
              });
              setGradeEntries(entries);
              setEvaluationTitle('');
              setError('');
              setSuccess('');
            }}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            Réinitialiser
          </button>
          
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !selectedClass || !selectedSubject || students.length === 0}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </span>
            ) : (
              'Enregistrer les notes'
            )}
          </button>
        </div>
      </form>

      {/* Helper Text */}
      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Astuce:</strong> Vous pouvez laisser vide les notes des élèves absents. 
          Seules les notes saisies seront enregistrées.
        </p>
      </div>
    </div>
  );
};
