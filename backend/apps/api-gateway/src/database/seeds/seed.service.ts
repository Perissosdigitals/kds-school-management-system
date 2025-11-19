import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../modules/auth/entities/user.entity';
import { Teacher, TeacherStatus } from '../../modules/teachers/entities/teacher.entity';
import { Student } from '../../modules/students/entities/student.entity';
import { SchoolClass } from '../../modules/classes/entities/class.entity';
import { Subject } from '../../modules/subjects/entities/subject.entity';
import { TimetableSlot, DayOfWeek } from '../../modules/timetable/entities/timetable-slot.entity';
import { Grade, EvaluationType, Trimester } from '../../modules/grades/entities/grade.entity';
import { Attendance, AttendanceStatus } from '../../modules/attendance/entities/attendance.entity';
import { Transaction, TransactionType, PaymentStatus, TransactionCategory } from '../../modules/finance/entities/transaction.entity';
import { Document, DocumentType, AccessLevel, EntityType } from '../../modules/documents/entities/document.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(SchoolClass)
    private classRepository: Repository<SchoolClass>,
    @InjectRepository(Subject)
    private subjectRepository: Repository<Subject>,
    @InjectRepository(TimetableSlot)
    private timetableRepository: Repository<TimetableSlot>,
    @InjectRepository(Grade)
    private gradeRepository: Repository<Grade>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
  ) {}

  async seed() {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await this.clearDatabase();

    // Seed in order of dependencies
    const adminUser = await this.seedUsers();
    const teachers = await this.seedTeachers(adminUser);
    const classes = await this.seedClasses(teachers);
    const subjects = await this.seedSubjects();
    const students = await this.seedStudents(classes, adminUser);
    const timetableSlots = await this.seedTimetable(classes, teachers, subjects);
    await this.seedGrades(students, subjects, teachers);
    await this.seedAttendance(students, classes, timetableSlots, adminUser);
    await this.seedFinance(students, adminUser);
    await this.seedDocuments(students, teachers, adminUser);

    console.log('✅ Database seeding completed successfully!');
    return {
      users: 1,
      teachers: teachers.length,
      classes: classes.length,
      subjects: subjects.length,
      students: students.length,
      timetableSlots: timetableSlots.length,
      grades: await this.gradeRepository.count(),
      attendance: await this.attendanceRepository.count(),
      transactions: await this.transactionRepository.count(),
      documents: await this.documentRepository.count(),
    };
  }

  private async clearDatabase() {
    console.log('🗑️  Clearing existing data...');
    // Use CASCADE to handle foreign key constraints
    await this.documentRepository.query('TRUNCATE TABLE documents CASCADE');
    await this.transactionRepository.query('TRUNCATE TABLE transactions CASCADE');
    await this.attendanceRepository.query('TRUNCATE TABLE attendance CASCADE');
    await this.gradeRepository.query('TRUNCATE TABLE grades CASCADE');
    await this.timetableRepository.query('TRUNCATE TABLE timetable_slots CASCADE');
    await this.studentRepository.query('TRUNCATE TABLE students CASCADE');
    await this.subjectRepository.query('TRUNCATE TABLE subjects CASCADE');
    await this.classRepository.query('TRUNCATE TABLE classes CASCADE');
    await this.teacherRepository.query('TRUNCATE TABLE teachers CASCADE');
    await this.userRepository.query('TRUNCATE TABLE users CASCADE');
    console.log('✅ Database cleared');
  }

  private async seedUsers() {
    console.log('👤 Seeding users with multiple roles...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const usersData = [
      { email: 'fondatrice@kds-school.com', role: 'fondatrice', firstName: 'Madame', lastName: 'Fondatrice' },
      { email: 'admin@kds-school.com', role: 'admin', firstName: 'Admin', lastName: 'KDS' },
      { email: 'directrice@kds-school.com', role: 'directrice', firstName: 'Mme', lastName: 'Directrice' },
      { email: 'comptable@kds-school.com', role: 'comptable', firstName: 'Mlle', lastName: 'Comptable' },
      { email: 'enseignant@kds-school.com', role: 'enseignant', firstName: 'M.', lastName: 'Enseignant' },
      { email: 'agent@kds-school.com', role: 'agent', firstName: 'Mlle', lastName: 'Administratif' },
    ];

    const users = [];
    for (const data of usersData) {
      const user = this.userRepository.create({
        ...data,
        passwordHash: hashedPassword,
      });
      const savedUser = await this.userRepository.save(user);
      users.push(savedUser);
      console.log(`  ✅ ${data.role}: ${data.email} (password: password123)`);
    }

    console.log(`✅ ${users.length} users seeded`);
    return users[0]; // return fondatrice as main user
  }

  private async seedTeachers(adminUser: User) {
    console.log('👨‍🏫 Seeding teachers...');
    
    const teachersData = [
      { firstName: 'Sarah', lastName: 'Cohen', email: 'sarah.cohen@kds.com', phone: '0612345678', subject: 'Mathématiques', status: 'Actif' as const },
      { firstName: 'David', lastName: 'Levy', email: 'david.levy@kds.com', phone: '0612345679', subject: 'Français', status: 'Actif' as const },
      { firstName: 'Rachel', lastName: 'Abitbol', email: 'rachel.abitbol@kds.com', phone: '0612345680', subject: 'Sciences', status: 'Actif' as const },
      { firstName: 'Michael', lastName: 'Benayoun', email: 'michael.benayoun@kds.com', phone: '0612345681', subject: 'Histoire', status: 'Actif' as const },
      { firstName: 'Esther', lastName: 'Azoulay', email: 'esther.azoulay@kds.com', phone: '0612345682', subject: 'Anglais', status: 'Actif' as const },
      { firstName: 'Yossef', lastName: 'Attias', email: 'yossef.attias@kds.com', phone: '0612345683', subject: 'Hébreu', status: 'Actif' as const },
      { firstName: 'Miriam', lastName: 'Toledano', email: 'miriam.toledano@kds.com', phone: '0612345684', subject: 'Torah', status: 'Actif' as const },
      { firstName: 'Benjamin', lastName: 'Elfassi', email: 'benjamin.elfassi@kds.com', phone: '0612345685', subject: 'Sport', status: 'Actif' as const },
    ];

    const teachers = [];
    for (const data of teachersData) {
      const teacher = this.teacherRepository.create({
        ...data,
        userId: adminUser.id,
      });
      teachers.push(await this.teacherRepository.save(teacher));
    }

    console.log(`✅ ${teachers.length} teachers seeded`);
    return teachers;
  }

  private async seedClasses(teachers: Teacher[]) {
    console.log('🏫 Seeding classes...');
    
    const classesData = [
      { name: 'CP-A', level: 'CP', academicYear: '2024-2025', classTeacher: teachers[0].id, capacity: 25 },
      { name: 'CE1-A', level: 'CE1', academicYear: '2024-2025', classTeacher: teachers[1].id, capacity: 28 },
      { name: 'CE2-A', level: 'CE2', academicYear: '2024-2025', classTeacher: teachers[2].id, capacity: 30 },
      { name: 'CM1-A', level: 'CM1', academicYear: '2024-2025', classTeacher: teachers[3].id, capacity: 30 },
      { name: 'CM2-A', level: 'CM2', academicYear: '2024-2025', classTeacher: teachers[4].id, capacity: 32 },
      { name: '6ème-A', level: '6ème', academicYear: '2024-2025', classTeacher: teachers[5].id, capacity: 30 },
    ];

    const classes = [];
    for (const data of classesData) {
      const schoolClass = this.classRepository.create(data);
      classes.push(await this.classRepository.save(schoolClass));
    }

    console.log(`✅ ${classes.length} classes seeded`);
    return classes;
  }

  private async seedSubjects() {
    console.log('📚 Seeding subjects...');
    
    const subjectsData = [
      { name: 'Mathématiques', code: 'MATH', gradeLevel: 'Primaire', weeklyHours: 5, coefficient: 3, status: 'Actif' },
      { name: 'Français', code: 'FR', gradeLevel: 'Primaire', weeklyHours: 5, coefficient: 3, status: 'Actif' },
      { name: 'Sciences', code: 'SCI', gradeLevel: 'Primaire', weeklyHours: 3, coefficient: 2, status: 'Actif' },
      { name: 'Histoire-Géographie', code: 'HIST', gradeLevel: 'Primaire', weeklyHours: 2, coefficient: 2, status: 'Actif' },
      { name: 'Anglais', code: 'ANG', gradeLevel: 'Primaire', weeklyHours: 2, coefficient: 2, status: 'Actif' },
      { name: 'Hébreu', code: 'HEB', gradeLevel: 'Primaire', weeklyHours: 4, coefficient: 3, status: 'Actif' },
      { name: 'Torah', code: 'TOR', gradeLevel: 'Primaire', weeklyHours: 6, coefficient: 3, status: 'Actif' },
      { name: 'Sport', code: 'EPS', gradeLevel: 'Primaire', weeklyHours: 2, coefficient: 1, status: 'Actif' },
    ];

    const subjects = [];
    for (const data of subjectsData) {
      const subject = this.subjectRepository.create(data);
      subjects.push(await this.subjectRepository.save(subject));
    }

    console.log(`✅ ${subjects.length} subjects seeded`);
    return subjects;
  }

  private async seedStudents(classes: SchoolClass[], adminUser: User) {
    console.log('👨‍🎓 Seeding students...');
    
    const firstNames = ['Yaakov', 'Moche', 'Avraham', 'Yitzhak', 'Shlomo', 'Chana', 'Sarah', 'Rivka', 'Rachel', 'Lea', 'Nathan', 'Daniel', 'Elie', 'Samuel', 'Noam'];
    const lastNames = ['Cohen', 'Levy', 'Abitbol', 'Benayoun', 'Azoulay', 'Attias', 'Toledano', 'Elfassi', 'Sibony', 'Kalfon'];
    
    const students = [];
    let regNumber = 2024001;

    for (const schoolClass of classes) {
      const studentsPerClass = 20 + Math.floor(Math.random() * 8);
      
      for (let i = 0; i < studentsPerClass; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const gender = Math.random() > 0.5 ? 'Masculin' : 'Féminin';
        
        const student = this.studentRepository.create({
          firstName,
          lastName,
          dob: new Date(2010 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          gender,
          classId: schoolClass.id,
          registrationNumber: `REG${regNumber++}`,
          registrationDate: new Date('2024-09-01'),
          nationality: 'Française',
          birthPlace: 'Paris, France',
          gradeLevel: schoolClass.level,
          phone: `06${Math.floor(Math.random() * 100000000)}`,
          address: `${Math.floor(Math.random() * 200)} Rue de Paris, 75001 Paris`,
          emergencyContactName: `Parent de ${firstName}`,
          emergencyContactPhone: `06${Math.floor(Math.random() * 100000000)}`,
          medicalInfo: Math.random() > 0.8 ? 'Allergie aux arachides' : undefined,
          status: 'Actif' as const,
          userId: adminUser.id,
        });
        
        students.push(await this.studentRepository.save(student));
      }
    }

    console.log(`✅ ${students.length} students seeded`);
    return students;
  }

  private async seedTimetable(classes: SchoolClass[], teachers: Teacher[], subjects: Subject[]) {
    console.log('📅 Seeding timetable...');
    
    const days: DayOfWeek[] = [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY];
    const timeSlots = [
      { start: '08:30', end: '09:30' },
      { start: '09:30', end: '10:30' },
      { start: '10:45', end: '11:45' },
      { start: '11:45', end: '12:45' },
      { start: '14:00', end: '15:00' },
      { start: '15:00', end: '16:00' },
    ];

    const timetableSlots = [];

    for (const schoolClass of classes) {
      for (const day of days) {
        for (let i = 0; i < Math.min(4, timeSlots.length); i++) {
          const slot = timeSlots[i];
          const subject = subjects[Math.floor(Math.random() * subjects.length)];
          const teacher = teachers[Math.floor(Math.random() * teachers.length)];

          const timetableSlot = this.timetableRepository.create({
            classId: schoolClass.id,
            subjectId: subject.id,
            teacherId: teacher.id,
            dayOfWeek: day,
            startTime: slot.start,
            endTime: slot.end,
            room: `Salle ${100 + Math.floor(Math.random() * 50)}`,
            academicYear: '2024-2025',
          });

          timetableSlots.push(await this.timetableRepository.save(timetableSlot));
        }
      }
    }

    console.log(`✅ ${timetableSlots.length} timetable slots seeded`);
    return timetableSlots;
  }

  private async seedGrades(students: Student[], subjects: Subject[], teachers: Teacher[]) {
    console.log('📊 Seeding grades...');
    
    const evaluationTypes: EvaluationType[] = [EvaluationType.DEVOIR, EvaluationType.INTERROGATION, EvaluationType.EXAMEN, EvaluationType.ORAL];
    let gradesCount = 0;

    for (const student of students.slice(0, 50)) { // First 50 students for performance
      const numGrades = 3 + Math.floor(Math.random() * 5);
      
      for (let i = 0; i < numGrades; i++) {
        const subject = subjects[Math.floor(Math.random() * subjects.length)];
        const teacher = teachers[Math.floor(Math.random() * teachers.length)];
        const score = 8 + Math.random() * 12; // Between 8 and 20
        
        const grade = this.gradeRepository.create({
          studentId: student.id,
          subjectId: subject.id,
          teacherId: teacher.id,
          evaluationType: evaluationTypes[Math.floor(Math.random() * evaluationTypes.length)],
          value: Math.round(score * 10) / 10,
          maxValue: 20,
          evaluationDate: new Date(2024, 9 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 28) + 1),
          comments: score < 10 ? 'Peut mieux faire' : score > 15 ? 'Excellent travail!' : 'Bon travail',
          visibleToParents: true,
          trimester: Trimester.FIRST,
          academicYear: '2024-2025',
        });
        
        await this.gradeRepository.save(grade);
        gradesCount++;
      }
    }

    console.log(`✅ ${gradesCount} grades seeded`);
  }

  private async seedAttendance(students: Student[], classes: SchoolClass[], timetableSlots: TimetableSlot[], adminUser: User) {
    console.log('✅ Seeding attendance...');
    
    const statuses = [AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.LATE, AttendanceStatus.ABSENT];
    let attendanceCount = 0;

    // Last 30 days
    for (let day = 0; day < 30; day++) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      for (const schoolClass of classes) {
        const classStudents = students.filter(s => s.classId === schoolClass.id).slice(0, 15);
        
        for (const student of classStudents) {
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          
          const attendance = this.attendanceRepository.create({
            studentId: student.id,
            classId: schoolClass.id,
            date,
            status,
            arrivalTime: status === AttendanceStatus.LATE ? '08:45' : null,
            isJustified: status === AttendanceStatus.ABSENT && Math.random() > 0.5,
            recordedBy: adminUser.id,
          });
          
          await this.attendanceRepository.save(attendance);
          attendanceCount++;
        }
      }
    }

    console.log(`✅ ${attendanceCount} attendance records seeded`);
  }

  private async seedFinance(students: Student[], adminUser: User) {
    console.log('💰 Seeding finance...');
    
    let transactionsCount = 0;

    // Tuition fees for students
    for (const student of students.slice(0, 50)) {
      // Annual tuition
      const tuition = this.transactionRepository.create({
        type: TransactionType.REVENUE,
        category: TransactionCategory.TUITION,
        amount: 5000,
        transactionDate: new Date('2024-09-01'),
        dueDate: new Date('2024-09-15'),
        status: Math.random() > 0.3 ? PaymentStatus.PAID : PaymentStatus.PENDING,
        studentId: student.id,
        description: `Frais de scolarité 2024-2025 - ${student.firstName} ${student.lastName}`,
        paymentMethod: 'Virement bancaire',
        amountPaid: Math.random() > 0.3 ? 5000 : 2500,
        amountRemaining: Math.random() > 0.3 ? 0 : 2500,
        recordedBy: adminUser.id,
      });
      await this.transactionRepository.save(tuition);
      transactionsCount++;

      // Registration fee
      if (Math.random() > 0.5) {
        const registration = this.transactionRepository.create({
          type: TransactionType.REVENUE,
          category: TransactionCategory.REGISTRATION,
          amount: 500,
          transactionDate: new Date('2024-08-15'),
          status: PaymentStatus.PAID,
          studentId: student.id,
          description: `Frais d'inscription - ${student.firstName} ${student.lastName}`,
          paymentMethod: 'Carte bancaire',
          amountPaid: 500,
          amountRemaining: 0,
          recordedBy: adminUser.id,
        });
        await this.transactionRepository.save(registration);
        transactionsCount++;
      }
    }

    // School expenses
    const expenses = [
      { category: TransactionCategory.SUPPLIES, amount: 1500, description: 'Fournitures scolaires - Septembre' },
      { category: TransactionCategory.MAINTENANCE, amount: 2000, description: 'Réparation climatisation' },
      { category: TransactionCategory.UTILITIES, amount: 800, description: 'Facture électricité - Octobre' },
      { category: TransactionCategory.SALARY, amount: 20000, description: 'Salaires enseignants - Octobre' },
    ];

    for (const expense of expenses) {
      const transaction = this.transactionRepository.create({
        type: TransactionType.EXPENSE,
        category: expense.category,
        amount: expense.amount,
        transactionDate: new Date('2024-10-01'),
        status: PaymentStatus.PAID,
        description: expense.description,
        paymentMethod: 'Virement bancaire',
        amountPaid: expense.amount,
        amountRemaining: 0,
        recordedBy: adminUser.id,
      });
      await this.transactionRepository.save(transaction);
      transactionsCount++;
    }

    console.log(`✅ ${transactionsCount} transactions seeded`);
  }

  private async seedDocuments(students: Student[], teachers: Teacher[], adminUser: User) {
    console.log('📄 Seeding documents...');
    
    let documentsCount = 0;

    // Student documents
    for (const student of students.slice(0, 30)) {
      const docs = [
        {
          title: `Acte de naissance - ${student.firstName} ${student.lastName}`,
          type: DocumentType.BIRTH_CERTIFICATE,
          accessLevel: AccessLevel.CONFIDENTIAL,
        },
        {
          title: `Certificat médical - ${student.firstName} ${student.lastName}`,
          type: DocumentType.MEDICAL_CERTIFICATE,
          accessLevel: AccessLevel.RESTRICTED,
        },
        {
          title: `Photo d'identité - ${student.firstName} ${student.lastName}`,
          type: DocumentType.PHOTO,
          accessLevel: AccessLevel.INTERNAL,
        },
      ];

      for (const docData of docs) {
        const document = this.documentRepository.create({
          ...docData,
          entityType: EntityType.STUDENT,
          studentId: student.id,
          filePath: `/uploads/students/${student.id}/${docData.type.toLowerCase().replace(/\s/g, '_')}.pdf`,
          fileName: `${docData.type.toLowerCase().replace(/\s/g, '_')}.pdf`,
          mimeType: 'application/pdf',
          fileSize: 50000 + Math.floor(Math.random() * 200000),
          description: `Document administratif pour ${student.firstName} ${student.lastName}`,
          isActive: true,
          uploadedBy: adminUser.id,
          downloadCount: Math.floor(Math.random() * 5),
        });
        await this.documentRepository.save(document);
        documentsCount++;
      }
    }

    // Teacher documents
    for (const teacher of teachers.slice(0, 5)) {
      const document = this.documentRepository.create({
        title: `Contrat de travail - ${teacher.firstName} ${teacher.lastName}`,
        type: DocumentType.CONTRACT,
        entityType: EntityType.TEACHER,
        teacherId: teacher.id,
        filePath: `/uploads/teachers/${teacher.id}/contract.pdf`,
        fileName: 'contrat_travail.pdf',
        mimeType: 'application/pdf',
        fileSize: 150000,
        accessLevel: AccessLevel.CONFIDENTIAL,
        description: `Contrat de travail pour ${teacher.firstName} ${teacher.lastName}`,
        isActive: true,
        uploadedBy: adminUser.id,
        downloadCount: 2,
      });
      await this.documentRepository.save(document);
      documentsCount++;
    }

    console.log(`✅ ${documentsCount} documents seeded`);
  }
}
