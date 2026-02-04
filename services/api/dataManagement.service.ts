import type {
  ImportBatch,
} from '../../types';

// Temporarily store batches in memory during session if needed, 
// but without initial mock data.
let mutableBatches: ImportBatch[] = [];

export const getImportBatches = async (): Promise<ImportBatch[]> => {
  // Return empty list as we don't have a backend history yet
  return [...mutableBatches].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
};

export const submitImportBatch = async (
  dataType: ImportBatch['dataType'],
  fileName: string,
  fileContent: string,
  submittedBy: string
): Promise<ImportBatch> => {
  // Simulate submission to a future backend
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
  const batchIndex = mutableBatches.findIndex(b => b.id === batchId);
  if (batchIndex === -1) return null;

  const batch = mutableBatches[batchIndex];
  if (batch.status !== 'pending') return null;

  try {
    // In a real API, this would send the file to the backend for processing
    console.log('Approuving batch:', batchId, 'for type:', batch.dataType);

    batch.status = 'applied';
    batch.reviewedBy = reviewedBy;
    batch.reviewedAt = new Date().toISOString();
    mutableBatches[batchIndex] = { ...batch };

  } catch (error) {
    console.error("Failed to approve batch:", error);
    batch.status = 'rejected';
    mutableBatches[batchIndex] = { ...batch };
    throw error;
  }

  return batch;
};

export const rejectImportBatch = async (batchId: string, reviewedBy: string): Promise<ImportBatch | null> => {
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