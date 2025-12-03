/**
 * 📥 Enhanced Import Template Generator
 * Creates CSV templates with relational data examples
 * Shows student names, classes for grades import etc.
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api/v1';

export interface ImportTemplate {
  filename: string;
  headers: string[];
  exampleRows: string[][];
  description: string;
  relationalInfo?: string;
}

export class ImportTemplateService {
  
  /**
   * Generate CSV template for students (simple table)
   */
  static async generateStudentsTemplate(): Promise<ImportTemplate> {
    return {
      filename: 'template_students.csv',
      headers: [
        'student_code',
        'first_name',
        'last_name',
        'birth_date',
        'gender',
        'nationality',
        'birth_place',
        'address',
        'class_id',
        'emergency_contact',
        'medical_info'
      ],
      exampleRows: [
        ['KDS24999', 'Marie', 'TRAORE', '2010-05-15', 'F', 'Ivoirienne', 'Abidjan', '123 Rue Example', '', '0712345678', 'RAS'],
        ['KDS25000', 'Kouadio', 'YAO', '2011-03-22', 'M', 'Ivoirienne', 'Bouaké', '456 Avenue Test', '', '0798765432', 'Allergies: Arachides'],
      ],
      description: 'Template pour import d\'élèves. Le class_id peut être laissé vide et assigné plus tard.',
    };
  }

  /**
   * Generate CSV template for grades (relational - needs student names + classes)
   */
  static async generateGradesTemplate(): Promise<ImportTemplate> {
    try {
      const token = localStorage.getItem('access_token');
      
      // Fetch some real students and classes for the template
      const studentsRes = await axios.get(`${API_BASE_URL}/students`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 5 }
      });

      const classesRes = await axios.get(`${API_BASE_URL}/classes`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const students = studentsRes.data.slice(0, 3);
      const classes = classesRes.data.slice(0, 2);

      // Build example rows with real data
      const exampleRows = students.map((student: any, index: number) => [
        student.student_code || `KDS24${String(index + 1).padStart(3, '0')}`,
        student.first_name || 'Prénom',
        student.last_name || 'Nom',
        classes[index % classes.length]?.name || 'CE2A',
        'Mathématiques',
        'Devoir 1',
        '15.5',
        '20',
        new Date().toISOString().split('T')[0],
      ]);

      return {
        filename: 'template_grades_avec_eleves.csv',
        headers: [
          'student_code',
          'student_first_name',
          'student_last_name',
          'class_name',
          'subject_name',
          'evaluation_name',
          'score',
          'max_score',
          'date',
        ],
        exampleRows: exampleRows.length > 0 ? exampleRows : [
          ['KDS24001', 'Jean', 'KOUASSI', 'CE2A', 'Mathématiques', 'Devoir 1', '15.5', '20', '2025-12-03'],
          ['KDS24002', 'Marie', 'TRAORE', 'CE2B', 'Français', 'Composition 1', '13', '20', '2025-12-03'],
        ],
        description: 'Template pour import de notes avec informations relationnelles. Les noms d\'élèves et classes sont utilisés pour identifier les enregistrements.',
        relationalInfo: '⚠️ Important: Ce template inclut les noms d\'élèves réels de votre base. Le système utilisera student_code pour faire la correspondance.',
      };
    } catch (error) {
      // Fallback if API fails
      return {
        filename: 'template_grades.csv',
        headers: [
          'student_code',
          'student_first_name',
          'student_last_name',
          'class_name',
          'subject_name',
          'evaluation_name',
          'score',
          'max_score',
          'date',
        ],
        exampleRows: [
          ['KDS24001', 'Jean', 'KOUASSI', 'CE2A', 'Mathématiques', 'Devoir 1', '15.5', '20', '2025-12-03'],
          ['KDS24002', 'Marie', 'TRAORE', 'CE2B', 'Français', 'Composition 1', '13', '20', '2025-12-03'],
        ],
        description: 'Template pour import de notes avec informations relationnelles.',
        relationalInfo: 'Les noms d\'élèves sont pour référence. Le student_code est utilisé pour la correspondance.',
      };
    }
  }

  /**
   * Generate CSV template for attendance (relational)
   */
  static async generateAttendanceTemplate(): Promise<ImportTemplate> {
    try {
      const token = localStorage.getItem('access_token');
      
      const studentsRes = await axios.get(`${API_BASE_URL}/students`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 5 }
      });

      const students = studentsRes.data.slice(0, 3);
      
      const exampleRows = students.map((student: any) => [
        student.student_code || 'KDS24001',
        student.first_name || 'Prénom',
        student.last_name || 'Nom',
        new Date().toISOString().split('T')[0],
        'present',
        '',
      ]);

      return {
        filename: 'template_attendance_avec_eleves.csv',
        headers: [
          'student_code',
          'student_first_name',
          'student_last_name',
          'date',
          'status',
          'remarks',
        ],
        exampleRows: exampleRows.length > 0 ? exampleRows : [
          ['KDS24001', 'Jean', 'KOUASSI', '2025-12-03', 'present', ''],
          ['KDS24002', 'Marie', 'TRAORE', '2025-12-03', 'absent', 'Malade'],
        ],
        description: 'Template pour import de présences. Status: present, absent, late, excused',
        relationalInfo: 'Les noms d\'élèves sont inclus pour faciliter la vérification. Le student_code fait la correspondance.',
      };
    } catch (error) {
      return {
        filename: 'template_attendance.csv',
        headers: [
          'student_code',
          'student_first_name',
          'student_last_name',
          'date',
          'status',
          'remarks',
        ],
        exampleRows: [
          ['KDS24001', 'Jean', 'KOUASSI', '2025-12-03', 'present', ''],
          ['KDS24002', 'Marie', 'TRAORE', '2025-12-03', 'absent', 'Malade'],
        ],
        description: 'Template pour import de présences. Status: present, absent, late, excused',
      };
    }
  }

  /**
   * Download template as CSV file
   */
  static downloadTemplate(template: ImportTemplate) {
    const csvContent = [
      template.headers.join(','),
      ...template.exampleRows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', template.filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Get available templates
   */
  static getAvailableTemplates(): Array<{
    id: string;
    name: string;
    description: string;
    hasRelations: boolean;
  }> {
    return [
      {
        id: 'students',
        name: 'Élèves',
        description: 'Import d\'élèves (table simple)',
        hasRelations: false,
      },
      {
        id: 'grades',
        name: 'Notes',
        description: 'Import de notes avec noms d\'élèves et classes',
        hasRelations: true,
      },
      {
        id: 'attendance',
        name: 'Présences',
        description: 'Import de présences avec noms d\'élèves',
        hasRelations: true,
      },
    ];
  }
}

export default ImportTemplateService;
