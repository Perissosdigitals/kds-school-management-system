// 📁 services/data-sources/mock-json-adapter.ts
import type { IDataSourceAdapter, DataQuery, DataSourceCapabilities } from '../../types/data-source.types';
import type { Student } from '../../types';
import { allStudents } from '../../data/mockData';

export class MockJsonAdapter implements IDataSourceAdapter<Student> {
  readonly id: string = 'mock-json-students';
  readonly name: string = 'Mock JSON Student Data';
  readonly type = 'rest'; // Represents in-memory JSON objects, similar to a REST API response.

  private students: Student[] = [...allStudents]; // Local copy to simulate persistence

  async find(query?: DataQuery): Promise<Student[]> {
    console.log(`[${this.name}] Finding students with query:`, query);
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate very fast in-memory access

    if (query?.where) {
        return this.students.filter(student => 
            Object.entries(query.where!).every(([key, value]) => (student as any)[key] === value)
        );
    }
    return this.students;
  }

  async findOne(id: string): Promise<Student | null> {
    console.log(`[${this.name}] Finding student with id: ${id}`);
    const student = this.students.find(s => s.id === id) || null;
    return Promise.resolve(student);
  }

  async create(data: Omit<Student, 'id'>): Promise<Student> {
    console.log(`[${this.name}] Creating student:`, data);
    const newStudent: Student = { ...data, id: `JSON-MOCK-${Date.now()}` } as Student;
    this.students.push(newStudent);
    return Promise.resolve(newStudent);
  }

  async update(id: string, data: Partial<Student>): Promise<Student> {
    console.log(`[${this.name}] Updating student ${id} with:`, data);
    const studentIndex = this.students.findIndex(s => s.id === id);
    if (studentIndex === -1) {
      throw new Error(`Student with id ${id} not found.`);
    }
    this.students[studentIndex] = { ...this.students[studentIndex], ...data };
    return Promise.resolve(this.students[studentIndex]);
  }

  async delete(id: string): Promise<boolean> {
    console.log(`[${this.name}] Deleting student ${id}`);
    const initialLength = this.students.length;
    this.students = this.students.filter(s => s.id === id);
    return Promise.resolve(this.students.length < initialLength);
  }

  getCapabilities(): DataSourceCapabilities {
    return {
      realtime: false,
      transactions: false,
      relations: true,
      fileAttachments: false,
      offlineSupport: true,
    };
  }

  async testConnection(): Promise<boolean> {
    console.log(`[${this.name}] Testing connection...`);
    return Promise.resolve(true); // It's always "connected"
  }
}