import { 
    importBatches, 
    schoolClasses,
    allStudents,
    allUsers,
    mockInventory,
    teacherDetails,
    grades,
    mockTransactions
} from '../../data/mockData';
import type { 
    ImportBatch, 
    SchoolClass,
    Student,
    User,
    InventoryItem,
    Teacher,
    Grade,
    FinancialTransaction
} from '../../types';
import { parseCSV } from '../../utils/csvImport';

// This is where we'll store our mutable data in the mock environment
let mutableBatches = [...importBatches];

const applyClassListUpdate = (csvContent: string): void => {
  try {
    const newOrUpdatedClasses = parseCSV<SchoolClass>(csvContent);
    
    newOrUpdatedClasses.forEach(uc => {
      const index = schoolClasses.findIndex(sc => sc.id === uc.id);
      if (index > -1) {
        // Update existing class
        schoolClasses[index] = { ...schoolClasses[index], ...uc };
      } else {
        // Add new class
        schoolClasses.push(uc);
      }
    });
    console.log('School classes updated:', schoolClasses);
  } catch(e) {
    console.error("Error parsing or applying class list update:", e);
    throw e; // re-throw to be caught by the calling function
  }
};

const applyStudentListUpdate = (csvContent: string): void => {
  try {
    const items = parseCSV<Student>(csvContent);
    items.forEach(item => {
      const index = allStudents.findIndex(i => i.id === item.id);
      if (index > -1) {
        allStudents[index] = { ...allStudents[index], ...item, documents: allStudents[index].documents }; // Keep existing complex objects
      } else {
        item.documents = item.documents || []; 
        allStudents.push(item);
      }
    });
    console.log('Students updated:', allStudents);
  } catch(e) {
    console.error("Error parsing or applying student list update:", e);
    throw e;
  }
};

const applyUserListUpdate = (csvContent: string): void => {
  try {
    const items = parseCSV<User>(csvContent);
    items.forEach(item => {
      const index = allUsers.findIndex(i => i.id === item.id);
      if (index > -1) allUsers[index] = { ...allUsers[index], ...item };
      else allUsers.push(item);
    });
    console.log('Users updated:', allUsers);
  } catch(e) {
    console.error("Error parsing or applying user list update:", e);
    throw e;
  }
};

const applyInventoryUpdate = (csvContent: string): void => {
  try {
    const items = parseCSV<InventoryItem>(csvContent);
    items.forEach(item => {
      item.quantity = Number(item.quantity);
      if (isNaN(item.quantity)) item.quantity = 0;
      const index = mockInventory.findIndex(i => i.id === item.id);
      if (index > -1) mockInventory[index] = { ...mockInventory[index], ...item };
      else mockInventory.push(item);
    });
    console.log('Inventory updated:', mockInventory);
  } catch(e) {
    console.error("Error parsing or applying inventory update:", e);
    throw e;
  }
};

const applyTeacherListUpdate = (csvContent: string): void => {
  try {
    const items = parseCSV<Teacher>(csvContent);
    items.forEach(item => {
      const index = teacherDetails.findIndex(i => i.id === item.id);
      if (index > -1) teacherDetails[index] = { ...teacherDetails[index], ...item };
      else teacherDetails.push(item);
    });
    console.log('Teachers updated:', teacherDetails);
  } catch(e) {
    console.error("Error parsing or applying teacher list update:", e);
    throw e;
  }
};

const applyGradesUpdate = (csvContent: string): void => {
  try {
    const items = parseCSV<Grade>(csvContent);
    items.forEach(item => {
      const scoreValue = String(item.score).trim();
      item.score = scoreValue === '' ? null : parseFloat(scoreValue);
      if (item.score !== null && isNaN(item.score)) item.score = null;

      const index = grades.findIndex(g => g.studentId === item.studentId && g.evaluationId === item.evaluationId);
      if (index > -1) grades[index] = { ...grades[index], ...item };
      else grades.push(item);
    });
    console.log('Grades updated:', grades);
  } catch(e) {
    console.error("Error parsing or applying grades update:", e);
    throw e;
  }
};

const applyFinancialTransactionsUpdate = (csvContent: string): void => {
  try {
    const items = parseCSV<FinancialTransaction>(csvContent);
    items.forEach(item => {
      item.amount = Number(item.amount);
      if (isNaN(item.amount)) item.amount = 0;
      const index = mockTransactions.findIndex(t => t.id === item.id);
      if (index > -1) mockTransactions[index] = { ...mockTransactions[index], ...item };
      else mockTransactions.push(item);
    });
    console.log('Financial transactions updated:', mockTransactions);
  } catch(e) {
    console.error("Error parsing or applying financial transactions update:", e);
    throw e;
  }
};


export const getImportBatches = async (): Promise<ImportBatch[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  // Return a sorted copy
  return [...mutableBatches].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
};

export const submitImportBatch = async (
  dataType: ImportBatch['dataType'],
  fileName: string,
  fileContent: string,
  submittedBy: string
): Promise<ImportBatch> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newBatch: ImportBatch = {
    id: `batch-${Date.now()}`,
    dataType,
    fileName,
    fileContent,
    submittedBy,
    submittedAt: new Date().toISOString(),
    status: 'pending',
  };
  mutableBatches.unshift(newBatch);
  return newBatch;
};

export const approveImportBatch = async (batchId: string, reviewedBy: string): Promise<ImportBatch | null> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const batchIndex = mutableBatches.findIndex(b => b.id === batchId);
  if (batchIndex === -1) return null;

  const batch = mutableBatches[batchIndex];
  if (batch.status !== 'pending') return null;

  try {
    // 1. Mark as approved while processing
    batch.status = 'approved';
    batch.reviewedBy = reviewedBy;
    batch.reviewedAt = new Date().toISOString();
    mutableBatches[batchIndex] = { ...batch };

    // 2. Process the data
    switch (batch.dataType) {
      case 'Liste des Classes':
        applyClassListUpdate(batch.fileContent);
        break;
      case 'Transactions Financières':
        applyFinancialTransactionsUpdate(batch.fileContent);
        break;
      case 'Liste des Élèves':
        applyStudentListUpdate(batch.fileContent);
        break;
      case 'Liste des Utilisateurs':
        applyUserListUpdate(batch.fileContent);
        break;
      case 'État de l\'Inventaire':
        applyInventoryUpdate(batch.fileContent);
        break;
      case 'Liste des Professeurs':
        applyTeacherListUpdate(batch.fileContent);
        break;
      case 'Saisie des Notes':
        applyGradesUpdate(batch.fileContent);
        break;
      default:
        console.warn(`Aucun gestionnaire d'importation pour le type: ${batch.dataType}`);
    }

    // 3. Mark as applied after successful processing
    batch.status = 'applied';
    mutableBatches[batchIndex] = { ...batch };
    
  } catch (error) {
    console.error("Failed to apply batch update:", error);
    // If processing fails, mark as rejected
    batch.status = 'rejected';
    mutableBatches[batchIndex] = { ...batch };
    throw error;
  }
  
  return batch;
};

export const rejectImportBatch = async (batchId: string, reviewedBy: string): Promise<ImportBatch | null> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const batchIndex = mutableBatches.findIndex(b => b.id === batchId);
  if (batchIndex === -1) return null;

  const batch = mutableBatches[batchIndex];
  if (batch.status !== 'pending') return null;
  
  batch.status = 'rejected';
  batch.reviewedBy = reviewedBy;
  batch.reviewedAt = new Date().toISOString();
  mutableBatches[batchIndex] = batch;
  
  return batch;
};