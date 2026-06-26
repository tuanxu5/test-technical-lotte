import { DOCUMENT_CATEGORY, DOCUMENT_STATUS, USER_ROLE } from '../types';
import type { Document, FetchDocumentsResponse } from '../types';

const STORAGE_KEY = 'sys_evd_documents';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

const INITIAL_DOCUMENTS: Document[] = [
  {
    id: 'doc-1',
    code: 'LOTT-EVD-001',
    title: 'Lotte Plaza Mall Lease Contract 2026',
    category: DOCUMENT_CATEGORY.CONTRACT,
    status: DOCUMENT_STATUS.APPROVED,
    createdBy: 'Admin User',
    createdDate: '2026-01-15T08:30:00.000Z',
  },
  {
    id: 'doc-2',
    code: 'LOTT-EVD-002',
    title: 'SYS Admin Dashboard Technical Architecture',
    category: DOCUMENT_CATEGORY.TECHNICAL,
    status: DOCUMENT_STATUS.APPROVED,
    createdBy: 'CMC Developer',
    createdDate: '2026-02-10T14:45:00.000Z',
  },
  {
    id: 'doc-3',
    code: 'LOTT-EVD-003',
    title: 'CMC Global Integration QA Test Plan v1.4',
    category: DOCUMENT_CATEGORY.TECHNICAL,
    status: DOCUMENT_STATUS.PENDING,
    createdBy: 'Staff Member',
    createdDate: '2026-06-25T10:15:00.000Z',
  },
  {
    id: 'doc-4',
    code: 'LOTT-EVD-004',
    title: 'Q1 Financial Performance Audit Report',
    category: DOCUMENT_CATEGORY.REPORT,
    status: DOCUMENT_STATUS.PENDING,
    createdBy: 'Admin User',
    createdDate: '2026-04-18T09:00:00.000Z',
  },
  {
    id: 'doc-5',
    code: 'LOTT-EVD-005',
    title: 'CMC Software License Invoice #INV-889',
    category: DOCUMENT_CATEGORY.INVOICE,
    status: DOCUMENT_STATUS.DRAFT,
    createdBy: 'Staff Member',
    createdDate: '2026-06-24T16:30:00.000Z',
  },
  {
    id: 'doc-6',
    code: 'LOTT-EVD-006',
    title: 'Lotte Duty Free Store Expansion Feasibility Study',
    category: DOCUMENT_CATEGORY.REPORT,
    status: DOCUMENT_STATUS.APPROVED,
    createdBy: 'Admin User',
    createdDate: '2026-03-05T11:00:00.000Z',
  },
  {
    id: 'doc-7',
    code: 'LOTT-EVD-007',
    title: 'EVD File Transfer Security Auditing Protocol',
    category: DOCUMENT_CATEGORY.TECHNICAL,
    status: DOCUMENT_STATUS.REJECTED,
    createdBy: 'CMC Lead Architect',
    createdDate: '2026-05-12T13:20:00.000Z',
  },
  {
    id: 'doc-8',
    code: 'LOTT-EVD-008',
    title: 'CMC Global Resource Deployment Contract',
    category: DOCUMENT_CATEGORY.CONTRACT,
    status: DOCUMENT_STATUS.APPROVED,
    createdBy: 'Admin User',
    createdDate: '2026-02-28T15:40:00.000Z',
  },
  {
    id: 'doc-9',
    code: 'LOTT-EVD-009',
    title: 'EVD Microservice Deployment Guidelines',
    category: DOCUMENT_CATEGORY.TECHNICAL,
    status: DOCUMENT_STATUS.DRAFT,
    createdBy: 'Staff Member',
    createdDate: '2026-06-26T02:00:00.000Z',
  },
  {
    id: 'doc-10',
    code: 'LOTT-EVD-010',
    title: 'Lotte Mart Supply Chain SLA Agreement',
    category: DOCUMENT_CATEGORY.CONTRACT,
    status: DOCUMENT_STATUS.PENDING,
    createdBy: 'Admin User',
    createdDate: '2026-05-30T10:00:00.000Z',
  },
  {
    id: 'doc-11',
    code: 'LOTT-EVD-011',
    title: 'Q2 Marketing Campaigns Budget Proposal',
    category: DOCUMENT_CATEGORY.REPORT,
    status: DOCUMENT_STATUS.DRAFT,
    createdBy: 'Staff Member',
    createdDate: '2026-06-14T09:12:00.000Z',
  },
  {
    id: 'doc-12',
    code: 'LOTT-EVD-012',
    title: 'CMC Global Hardware Procurement Invoice',
    category: DOCUMENT_CATEGORY.INVOICE,
    status: DOCUMENT_STATUS.APPROVED,
    createdBy: 'Admin User',
    createdDate: '2026-04-01T11:45:00.000Z',
  },
  {
    id: 'doc-13',
    code: 'LOTT-EVD-013',
    title: 'EVD File Storage Scalability Benchmarking',
    category: DOCUMENT_CATEGORY.TECHNICAL,
    status: DOCUMENT_STATUS.REJECTED,
    createdBy: 'Staff Member',
    createdDate: '2026-05-20T17:50:00.000Z',
  },
  {
    id: 'doc-14',
    code: 'LOTT-EVD-014',
    title: 'Lotte Cinema Digital Projector Maintenance Invoice',
    category: DOCUMENT_CATEGORY.INVOICE,
    status: DOCUMENT_STATUS.PENDING,
    createdBy: 'Admin User',
    createdDate: '2026-05-15T08:00:00.000Z',
  },
  {
    id: 'doc-15',
    code: 'LOTT-EVD-015',
    title: 'CMC Global Outsourcing Service Level Contract',
    category: DOCUMENT_CATEGORY.CONTRACT,
    status: DOCUMENT_STATUS.DRAFT,
    createdBy: 'Staff Member',
    createdDate: '2026-06-20T10:30:00.000Z',
  }
];

// Initialize localStorage if not present
const getStoredDocuments = (): Document[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DOCUMENTS));
    return INITIAL_DOCUMENTS;
  }
  return JSON.parse(data);
};

const saveStoredDocuments = (docs: Document[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
};

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
  getDocuments: async (params: {
    page: number;
    limit: number;
    search: string;
    category: DOCUMENT_CATEGORY | 'ALL';
    status: DOCUMENT_STATUS | 'ALL';
    userRole: USER_ROLE;
    currentUser: string;
  }): Promise<FetchDocumentsResponse> => {
    await delay(400); // 400ms latency simulation

    let documents = getStoredDocuments();

    // 1. Role-based Scope filtering:
    // If role is STAFF, display only documents created by this staff user
    if (params.userRole === USER_ROLE.STAFF) {
      documents = documents.filter((doc) => doc.createdBy === params.currentUser);
    }

    // Compute stats matching active role scope
    const statsTotal = documents.length;
    const statsPending = documents.filter((d) => d.status === DOCUMENT_STATUS.PENDING).length;
    const statsApproved = documents.filter((d) => d.status === DOCUMENT_STATUS.APPROVED).length;
    const uniqueCats = new Set(documents.map((d) => d.category));
    const stats = {
      total: statsTotal,
      pending: statsPending,
      approved: statsApproved,
      categoriesCount: uniqueCats.size,
    };

    // 2. Search filtering (Title or Code, case-insensitive)
    if (params.search.trim()) {
      const searchLower = params.search.toLowerCase().trim();
      documents = documents.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchLower) ||
          doc.code.toLowerCase().includes(searchLower)
      );
    }

    // 3. Category filtering
    if (params.category !== 'ALL') {
      documents = documents.filter((doc) => doc.category === params.category);
    }

    // 4. Status filtering
    if (params.status !== 'ALL') {
      documents = documents.filter((doc) => doc.status === params.status);
    }

    // Sort documents chronologically by created date (newest first)
    documents.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());

    // Pagination calculations
    const total = documents.length;
    const startIndex = (params.page - 1) * params.limit;
    const paginatedDocs = documents.slice(startIndex, startIndex + params.limit);
    const totalPages = Math.ceil(total / params.limit);

    return {
      data: paginatedDocs,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.max(1, totalPages),
      stats,
    };
  },

  createDocument: async (docData: Omit<Document, 'id' | 'createdDate'>): Promise<Document> => {
    await delay(300);
    const documents = getStoredDocuments();

    // Validate code uniqueness
    const codeExists = documents.some((d) => d.code.trim().toUpperCase() === docData.code.trim().toUpperCase());
    if (codeExists) {
      throw new Error(`Document code "${docData.code}" already exists in the system.`);
    }

    const newDoc: Document = {
      ...docData,
      id: `doc-${generateId()}`,
      createdDate: new Date().toISOString(),
    };

    documents.push(newDoc);
    saveStoredDocuments(documents);
    return newDoc;
  },

  updateDocument: async (id: string, updatedFields: Partial<Omit<Document, 'id' | 'createdBy' | 'createdDate'>>): Promise<Document> => {
    await delay(300);
    const documents = getStoredDocuments();
    const index = documents.findIndex((d) => d.id === id);

    if (index === -1) {
      throw new Error(`Document with ID "${id}" not found.`);
    }

    // If updating code, ensure uniqueness
    if (updatedFields.code) {
      const codeExists = documents.some(
        (d) => d.id !== id && d.code.trim().toUpperCase() === updatedFields.code!.trim().toUpperCase()
      );
      if (codeExists) {
        throw new Error(`Document code "${updatedFields.code}" is already in use by another document.`);
      }
    }

    const updatedDoc: Document = {
      ...documents[index],
      ...updatedFields,
    };

    documents[index] = updatedDoc;
    saveStoredDocuments(documents);
    return updatedDoc;
  },

  deleteDocument: async (id: string): Promise<boolean> => {
    await delay(300);
    const documents = getStoredDocuments();
    const filteredDocs = documents.filter((d) => d.id !== id);

    if (filteredDocs.length === documents.length) {
      throw new Error(`Document with ID "${id}" not found.`);
    }

    saveStoredDocuments(filteredDocs);
    return true;
  },

  // Bulk import documents
  bulkImport: async (newDocs: Omit<Document, 'id' | 'createdDate'>[]): Promise<{ importedCount: number }> => {
    await delay(600);
    const documents = getStoredDocuments();

    // Double check codes
    const existingCodes = new Set(documents.map((d) => d.code.trim().toUpperCase()));
    const docsToAdd: Document[] = [];

    for (const doc of newDocs) {
      const upperCode = doc.code.trim().toUpperCase();
      if (!existingCodes.has(upperCode)) {
        existingCodes.add(upperCode);
        docsToAdd.push({
          ...doc,
          id: `doc-${generateId()}`,
          createdDate: new Date().toISOString(),
        });
      }
    }

    if (docsToAdd.length === 0) {
      throw new Error('All uploaded documents have duplicate codes and were skipped.');
    }

    const updatedDocuments = [...documents, ...docsToAdd];
    saveStoredDocuments(updatedDocuments);

    return { importedCount: docsToAdd.length };
  },

  // Clear all mock storage data back to initial seed list
  resetStorage: (): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DOCUMENTS));
  }
};
