// 📁 services/data-sources/mock-csv-adapter.ts
import type { IDataSourceAdapter, DataQuery, DataSourceCapabilities } from '../../types/data-source.types';
import type { Student, DocumentType } from '../../types';
import { mockStudentCSVData } from '../../data/mockData';
import { parseCSV } from '../../utils/csvImport';

export class MockCsvAdapter implements IDataSourceAdapter<Student> {
  readonly id: string = 'mock-csv-students';
  readonly name: string = 'Mock CSV Student Data';
  readonly type = 'csv';

  async find(query?: DataQuery): Promise<Student[]> {
    console.log(`[${this.name}] Finding students with query:`, query);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay

    const documentTypes: DocumentType[] = ['Extrait de naissance', 'Carnet de vaccination', 'Autorisation parentale', 'Fiche scolaire'];
    
    const parsedData = parseCSV<{
        id: string;
        registrationDate: string;
        lastName: string;
        firstName: string;
        dob: string;
        gradeLevel: string;
        status: Student['status'];
    }>(mockStudentCSVData);

    const students: Student[] = parsedData.map(row => ({
      ...row,
      gender: 'Masculin',
      nationality: 'Ivoirienne',
      birthPlace: 'N/A',
      address: 'N/A',
      phone: 'N/A',
      email: `${row.firstName.toLowerCase()}.${row.lastName.toLowerCase()}@kds.mock`,
      previousSchool: 'N/A',
      emergencyContactName: 'N/A',
      emergencyContactPhone: 'N/A',
      medicalInfo: 'N/A',
      documents: documentTypes.map(type => ({ type, status: 'Manquant' })),
    }));
    
    // Basic filtering for demonstration
    if (query?.where) {
        return students.filter(student => 
            Object.entries(query.where!).every(([key, value]) => (student as any)[key] === value)
        );
    }

    return students;
  }

  async findOne(id: string): Promise<Student | null> {
    console.log(`[${this.name}] Finding student with id: ${id}`);
    const students = await this.find();
    return students.find(s => s.id === id) || null;
  }

  async create(data: Omit<Student, 'id'>): Promise<Student> {
    console.log(`[${this.name}] Creating student:`, data);
    await new Promise(resolve => setTimeout(resolve, 200));
    // NOTE: This doesn't persist in the mock data string, it just simulates a successful creation response.
    const newStudent: Student = { ...data, id: `CSV-MOCK-${Date.now()}` } as Student;
    return newStudent;
  }

  async update(id: string, data: Partial<Student>): Promise<Student> {
    console.log(`[${this.name}] Updating student ${id} with:`, data);
    throw new Error("Method not implemented for mock adapter.");
  }

  async delete(id: string): Promise<boolean> {
    console.log(`[${this.name}] Deleting student ${id}`);
    throw new Error("Method not implemented for mock adapter.");
  }

  getCapabilities(): DataSourceCapabilities {
    return {
      realtime: false,
      transactions: false,
      relations: false,
      fileAttachments: false,
      offlineSupport: true,
    };
  }

  async testConnection(): Promise<boolean> {
    console.log(`[${this.name}] Testing connection...`);
    return Promise.resolve(true); // It's always "connected"
  }
}
