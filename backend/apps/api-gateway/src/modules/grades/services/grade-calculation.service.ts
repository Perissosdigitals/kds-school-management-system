import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade, EvaluationType, Trimester } from '../entities/grade.entity';
import { Student } from '../../students/entities/student.entity';
import { Subject } from '../../subjects/entities/subject.entity';

@Injectable()
export class GradeCalculationService {
  constructor(
    @InjectRepository(Grade)
    private gradesRepository: Repository<Grade>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Subject)
    private subjectRepository: Repository<Subject>,
  ) { }

  // 1. Calculate Student Average (Performance)
  async calculateStudentAverage(studentId: string, trimester?: string, academicYear?: string) {
    const grades = await this.gradesRepository.find({
      where: {
        studentId,
        trimester: trimester as Trimester,
        academicYear
      },
      relations: ['subject'],
    });

    if (!grades.length) {
      return {
        studentId,
        generalAverage: 0,
        subjects: [],
      };
    }

    const subjectStats = new Map<string, {
      subjectName: string;
      subjectCode: string;
      subjectCoefficient: number;
      totalWeightedScore: number;
      totalCoefficients: number;
      grades: any[];
    }>();

    for (const grade of grades) {
      if (!grade.subject) continue;

      const subjectId = grade.subject.id;
      if (!subjectStats.has(subjectId)) {
        subjectStats.set(subjectId, {
          subjectName: grade.subject.name,
          subjectCode: grade.subject.code,
          subjectCoefficient: Number(grade.subject.coefficient || 1),
          totalWeightedScore: 0,
          totalCoefficients: 0,
          grades: [],
        });
      }

      const stats = subjectStats.get(subjectId);
      const normalizedValue = (grade.value / grade.maxValue) * 20;
      const gradeCoefficient = Number(grade.coefficient || 1);

      stats.grades.push({
        id: grade.id,
        value: grade.value,
        maxValue: grade.maxValue,
        coefficient: gradeCoefficient,
        type: grade.evaluationType,
        date: grade.evaluationDate,
        normalizedValue: Number(normalizedValue.toFixed(2)),
      });

      stats.totalWeightedScore += normalizedValue * gradeCoefficient;
      stats.totalCoefficients += gradeCoefficient;
    }

    const subjects = [];
    let totalGeneralWeightedScore = 0;
    let totalGeneralCoefficients = 0;

    for (const [subjectId, stats] of subjectStats.entries()) {
      const subjectAverage = stats.totalCoefficients > 0
        ? stats.totalWeightedScore / stats.totalCoefficients
        : 0;

      subjects.push({
        subjectId,
        name: stats.subjectName,
        code: stats.subjectCode,
        coefficient: stats.subjectCoefficient,
        average: Number(subjectAverage.toFixed(2)),
        grades: stats.grades,
      });

      totalGeneralWeightedScore += subjectAverage * stats.subjectCoefficient;
      totalGeneralCoefficients += stats.subjectCoefficient;
    }

    const generalAverage = totalGeneralCoefficients > 0
      ? totalGeneralWeightedScore / totalGeneralCoefficients
      : 0;

    return {
      studentId,
      trimester,
      academicYear,
      generalAverage: Number(generalAverage.toFixed(2)),
      subjects,
    };
  }

  // 2. Calculate Class Ranking
  async calculateClassRanking(classId: string, trimester: string, academicYear: string) {
    // Get all students in the class
    const students = await this.studentRepository.find({
      where: { classId },
      select: ['id', 'firstName', 'lastName'],
    });

    const rankings = [];

    for (const student of students) {
      const performance = await this.calculateStudentAverage(student.id, trimester, academicYear);
      rankings.push({
        studentId: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        generalAverage: performance.generalAverage,
      });
    }

    // Sort by average descending
    rankings.sort((a, b) => b.generalAverage - a.generalAverage);

    // Add rank
    return rankings.map((item, index) => ({
      rank: index + 1,
      ...item,
    }));
  }

  // 3. Calculate Class Statistics
  async calculateClassStatistics(classId: string, trimester: string, academicYear: string) {
    const rankings = await this.calculateClassRanking(classId, trimester, academicYear);
    const averages = rankings.map(r => r.generalAverage);

    if (averages.length === 0) {
      return {
        average: 0,
        median: 0,
        min: 0,
        max: 0,
        standardDeviation: 0,
        passRate: 0,
      };
    }

    const sum = averages.reduce((a, b) => a + b, 0);
    const average = sum / averages.length;
    const min = Math.min(...averages);
    const max = Math.max(...averages);

    // Median
    const mid = Math.floor(averages.length / 2);
    const median = averages.length % 2 !== 0 ? averages[mid] : (averages[mid - 1] + averages[mid]) / 2;

    // Standard Deviation
    const squareDiffs = averages.map(value => {
      const diff = value - average;
      return diff * diff;
    });
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
    const stdDev = Math.sqrt(avgSquareDiff);

    // Pass Rate (>= 10)
    const passCount = averages.filter(a => a >= 10).length;
    const passRate = (passCount / averages.length) * 100;

    return {
      average: Number(average.toFixed(2)),
      median: Number(median.toFixed(2)),
      min: Number(min.toFixed(2)),
      max: Number(max.toFixed(2)),
      standardDeviation: Number(stdDev.toFixed(2)),
      passRate: Number(passRate.toFixed(2)),
    };
  }

  // 4. Detect Student Alerts
  async detectStudentAlerts(classId: string, trimester: string, academicYear: string) {
    const rankings = await this.calculateClassRanking(classId, trimester, academicYear);
    const alerts = [];

    for (const student of rankings) {
      if (student.generalAverage < 10) {
        alerts.push({
          studentId: student.studentId,
          firstName: student.firstName,
          lastName: student.lastName,
          type: 'DANGER',
          message: `Moyenne générale insuffisante (${student.generalAverage}/20)`,
          priority: 'HIGH',
        });
      } else if (student.generalAverage < 12) {
        alerts.push({
          studentId: student.studentId,
          firstName: student.firstName,
          lastName: student.lastName,
          type: 'WARNING',
          message: `Moyenne générale fragile (${student.generalAverage}/20)`,
          priority: 'MEDIUM',
        });
      }
    }

    return alerts;
  }

  // 5. Calculate Student Progression
  async calculateStudentProgression(studentId: string, fromTrimester: string, toTrimester: string, academicYear: string) {
    const prev = await this.calculateStudentAverage(studentId, fromTrimester, academicYear);
    const curr = await this.calculateStudentAverage(studentId, toTrimester, academicYear);

    const progression = curr.generalAverage - prev.generalAverage;
    const trend = progression > 0 ? 'UP' : progression < 0 ? 'DOWN' : 'STABLE';

    return {
      studentId,
      previousAverage: prev.generalAverage,
      currentAverage: curr.generalAverage,
      progression: Number(progression.toFixed(2)),
      trend,
    };
  }

  // 6. Compare Classes
  async compareClasses(classIds: string[], trimester: string, academicYear: string) {
    const results = [];

    for (const classId of classIds) {
      const stats = await this.calculateClassStatistics(classId, trimester, academicYear);
      results.push({
        classId,
        stats,
      });
    }

    return results;
  }

  // 7. Generate Report Card (Alias for calculateStudentAverage but can be extended)
  async generateReportCard(studentId: string, trimester: string, academicYear: string) {
    const performance = await this.calculateStudentAverage(studentId, trimester, academicYear);

    // Add appreciation based on general average
    let appreciation = '';
    const avg = performance.generalAverage;

    if (avg >= 16) appreciation = 'Excellent travail. Félicitations !';
    else if (avg >= 14) appreciation = 'Très bon travail. Continuez ainsi.';
    else if (avg >= 12) appreciation = 'Bon travail. Des efforts à poursuivre.';
    else if (avg >= 10) appreciation = 'Travail convenable mais peut mieux faire.';
    else if (avg >= 8) appreciation = 'Résultats insuffisants. Il faut se ressaisir.';
    else appreciation = 'Résultats très insuffisants. Risque de redoublement.';

    return {
      ...performance,
      appreciation,
    };
  }
}
